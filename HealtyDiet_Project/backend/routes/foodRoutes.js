const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const foodsDir = path.join(__dirname, '..', '..', 'data', 'foods');
const foodsFile = path.join(foodsDir, 'foods.json');

// 确保食物数据文件存在
if (!fs.existsSync(foodsFile)) {
  fs.writeJsonSync(foodsFile, { foods: [] });
}

// 获取所有食物
router.get('/', (req, res) => {
  try {
    const foodData = fs.readJsonSync(foodsFile);
    res.json(foodData.foods);
  } catch (error) {
    res.status(500).json({ message: '获取食物数据失败', error: error.message });
  }
});

// 根据ID获取食物
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const foodData = fs.readJsonSync(foodsFile);
    const food = foodData.foods.find(food => food.id === id);
    
    if (!food) {
      return res.status(404).json({ message: '食物不存在' });
    }
    
    res.json(food);
  } catch (error) {
    res.status(500).json({ message: '获取食物数据失败', error: error.message });
  }
});

// 搜索食物
router.get('/search/:query', (req, res) => {
  try {
    const { query } = req.params;
    const foodData = fs.readJsonSync(foodsFile);
    
    // 根据名称或描述搜索食物
    const results = foodData.foods.filter(food => 
      food.name.toLowerCase().includes(query.toLowerCase()) ||
      (food.description && food.description.toLowerCase().includes(query.toLowerCase()))
    );
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: '搜索食物失败', error: error.message });
  }
});

// 添加新食物
router.post('/', (req, res) => {
  try {
    const {
      name,
      calories,
      protein,
      carbs,
      fat,
      vitamins,
      minerals,
      servingSize,
      unit,
      description
    } = req.body;
    
    if (!name || calories === undefined || protein === undefined || 
        carbs === undefined || fat === undefined) {
      return res.status(400).json({ message: '必须提供食物的基本营养信息' });
    }
    
    const foodData = fs.readJsonSync(foodsFile);
    
    // 创建新食物
    const newFood = {
      id: uuidv4(),
      name,
      calories,
      protein,
      carbs,
      fat,
      vitamins: vitamins || { A: 0, C: 0, D: 0, E: 0 },
      minerals: minerals || { calcium: 0, iron: 0, magnesium: 0, potassium: 0 },
      servingSize: servingSize || 100,
      unit: unit || 'g',
      description: description || ''
    };
    
    foodData.foods.push(newFood);
    fs.writeJsonSync(foodsFile, foodData);
    
    res.status(201).json(newFood);
  } catch (error) {
    res.status(500).json({ message: '添加食物失败', error: error.message });
  }
});

// 更新食物
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const foodData = fs.readJsonSync(foodsFile);
    
    const foodIndex = foodData.foods.findIndex(food => food.id === id);
    
    if (foodIndex === -1) {
      return res.status(404).json({ message: '食物不存在' });
    }
    
    // 更新食物信息
    foodData.foods[foodIndex] = {
      ...foodData.foods[foodIndex],
      ...updates,
      // 确保ID不变
      id
    };
    
    fs.writeJsonSync(foodsFile, foodData);
    
    res.json(foodData.foods[foodIndex]);
  } catch (error) {
    res.status(500).json({ message: '更新食物失败', error: error.message });
  }
});

// 删除食物
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const foodData = fs.readJsonSync(foodsFile);
    
    const foodIndex = foodData.foods.findIndex(food => food.id === id);
    
    if (foodIndex === -1) {
      return res.status(404).json({ message: '食物不存在' });
    }
    
    // 删除食物
    const deletedFood = foodData.foods[foodIndex];
    foodData.foods.splice(foodIndex, 1);
    
    fs.writeJsonSync(foodsFile, foodData);
    
    res.json({ message: '食物已删除', deletedFood });
  } catch (error) {
    res.status(500).json({ message: '删除食物失败', error: error.message });
  }
});

module.exports = router;