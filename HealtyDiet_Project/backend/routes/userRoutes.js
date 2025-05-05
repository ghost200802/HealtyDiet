const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const usersDir = path.join(__dirname, '..', '..', 'data', 'users');
const usersFile = path.join(usersDir, 'users.json');

// 确保用户数据文件存在
if (!fs.existsSync(usersFile)) {
  fs.writeJsonSync(usersFile, { users: [] });
}

// 获取所有用户
router.get('/', (req, res) => {
  try {
    const userData = fs.readJsonSync(usersFile);
    // 返回用户数据时排除密码字段
    const safeUsers = userData.users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ message: '获取用户数据失败', error: error.message });
  }
});

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password || !email) {
      return res.status(400).json({ message: '所有字段都是必填的' });
    }
    
    const userData = fs.readJsonSync(usersFile);
    
    // 检查用户名或邮箱是否已存在
    const userExists = userData.users.some(
      user => user.username === username || user.email === email
    );
    
    if (userExists) {
      return res.status(400).json({ message: '用户名或邮箱已被使用' });
    }
    
    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 创建新用户
    const newUser = {
      id: uuidv4(),
      username,
      password: hashedPassword,
      email,
      createdAt: new Date().toISOString(),
      profile: {
        birthDate: null,
        gender: null,
        height: null,
        weight: null,
        bodyFatPercentage: null,
        calorieDeficit: null
      }
    };
    
    userData.users.push(newUser);
    fs.writeJsonSync(usersFile, userData);
    
    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: '注册失败', error: error.message });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码都是必填的' });
    }
    
    const userData = fs.readJsonSync(usersFile);
    const user = userData.users.find(user => user.username === username);
    
    if (!user) {
      return res.status(400).json({ message: '用户名或密码不正确' });
    }
    
    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: '用户名或密码不正确' });
    }
    
    // 创建JWT令牌
    const token = jwt.sign(
      { id: user.id },
      'cleaneats_jwt_secret', // 在实际应用中应使用环境变量
      { expiresIn: '1d' }
    );
    
    // 返回用户信息和令牌（不包含密码）
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    res.status(500).json({ message: '登录失败', error: error.message });
  }
});

// 获取用户个人资料
router.get('/profile/:id', (req, res) => {
  try {
    const { id } = req.params;
    const userData = fs.readJsonSync(usersFile);
    const user = userData.users.find(user => user.id === id);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 返回用户信息（不包含密码）
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: '获取用户资料失败', error: error.message });
  }
});

// 更新用户个人资料
router.put('/profile/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // 验证必填字段
    if (!updates.profile || 
        !updates.profile.birthDate || 
        !updates.profile.gender || 
        !updates.profile.height || 
        !updates.profile.weight) {
      return res.status(400).json({ 
        message: '更新失败', 
        error: '出生日期、性别、身高和体重都是必填项'
      });
    }
    
    const userData = fs.readJsonSync(usersFile);
    
    const userIndex = userData.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ 
        message: '更新失败', 
        error: '用户不存在'
      });
    }
    
    // 不允许直接更新密码和ID
    const { password, id: userId, ...allowedUpdates } = updates;
    
    // 更新用户信息
    userData.users[userIndex] = {
      ...userData.users[userIndex],
      ...allowedUpdates,
      // 如果更新包含profile字段，则合并而不是替换
      profile: {
        ...userData.users[userIndex].profile,
        ...(updates.profile || {})
      }
    };
    
    fs.writeJsonSync(usersFile, userData);
    
    // 返回更新后的用户信息（不包含密码）
    const { password: _, ...updatedUser } = userData.users[userIndex];
    res.json(updatedUser);
  } catch (error) {
    console.error('更新用户资料错误:', error);
    res.status(500).json({ 
      message: '更新失败', 
      error: '服务器内部错误，请稍后再试'
    });
  }
});

// 计算BMR（基础代谢率）
router.get('/bmr/:id', (req, res) => {
  try {
    const { id } = req.params;
    const userData = fs.readJsonSync(usersFile);
    const user = userData.users.find(user => user.id === id);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    const { profile } = user;
    
    // 检查是否有足够的数据计算BMR
    if (!profile.birthDate || !profile.gender || !profile.height || !profile.weight) {
      return res.status(400).json({ message: '缺少计算BMR所需的用户数据' });
    }
    
    // 计算年龄
    const birthDate = new Date(profile.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // 使用Mifflin-St Jeor公式计算BMR
    let bmr;
    if (profile.gender === 'male') {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * age + 5;
    } else {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * age - 161;
    }
    
    res.json({ bmr: Math.round(bmr) });
  } catch (error) {
    res.status(500).json({ message: '计算BMR失败', error: error.message });
  }
});

module.exports = router;