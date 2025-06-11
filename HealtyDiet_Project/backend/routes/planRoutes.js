const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { plansData, recipesData } = require('@services/index');

// 获取所有食谱规划
router.get('/', (req, res) => {
  try {
    const plans = plansData.getAll();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: '获取规划数据失败', error: error.message });
  }
});

// 根据用户ID获取食谱规划
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const userPlans = plansData.getByUserId(userId);
    res.json(userPlans);
  } catch (error) {
    res.status(500).json({ message: '获取用户规划失败', error: error.message });
  }
});

// 根据ID获取食谱规划
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const plan = plansData.getById(id);
    
    if (!plan) {
      return res.status(404).json({ message: '规划不存在' });
    }
    
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: '获取规划失败', error: error.message });
  }
});

// 创建新的食谱规划
router.post('/', (req, res) => {
  try {
    const { name, userId, recipes } = req.body;
    
    if (!name || !userId || !recipes || !Array.isArray(recipes)) {
      return res.status(400).json({ message: '必须提供规划名称、用户ID和食谱列表' });
    }
    
    // 创建新的规划对象
    const newPlan = {
      id: uuidv4(),
      name,
      userId,
      recipes, // 包含不同天的recipeId数组
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 保存规划
    const savedPlan = plansData.add(newPlan);
    res.status(201).json(savedPlan);
  } catch (error) {
    res.status(500).json({ message: '创建规划失败', error: error.message });
  }
});

// 更新食谱规划
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // 检查规划是否存在
    const existingPlan = plansData.getById(id);
    if (!existingPlan) {
      return res.status(404).json({ message: '规划不存在' });
    }
    
    // 更新规划
    const updatedPlan = plansData.update(id, updates);
    res.json(updatedPlan);
  } catch (error) {
    res.status(500).json({ message: '更新规划失败', error: error.message });
  }
});

// 删除食谱规划
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查规划是否存在
    const existingPlan = plansData.getById(id);
    if (!existingPlan) {
      return res.status(404).json({ message: '规划不存在' });
    }
    
    // 删除规划
    const deletedPlan = plansData.delete(id);
    res.json(deletedPlan);
  } catch (error) {
    res.status(500).json({ message: '删除规划失败', error: error.message });
  }
});

module.exports = router;