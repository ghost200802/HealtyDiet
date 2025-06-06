const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { foodsData } = require('../services/dataService');
const path = require('path');
const fs = require('fs-extra');

// 数据目录路径
const dataDir = path.join(__dirname, '..', '..', 'data');
const foodsDir = path.join(dataDir, 'foods');

// 获取所有食物类型
router.get('/types', (req, res) => {
  try {
    const types = foodsData.getAllTypes();
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: '获取食物类型失败', error: error.message });
  }
});

// 获取指定类型的所有食物
router.get('/type/:type', (req, res) => {
  try {
    const { type } = req.params;
    const foods = foodsData.getByType(type);
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: `获取${type}类食物失败`, error: error.message });
  }
});

// 获取所有食物
router.get('/', (req, res) => {
  try {
    const foods = foodsData.getAll();
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: '获取食物数据失败', error: error.message });
  }
});

// 根据ID获取食物
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const food = foodsData.getById(id);
    
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
    const results = foodsData.search(query);
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
      description,
      type // 新增食物类型参数
    } = req.body;
    
    if (!name || calories === undefined || protein === undefined || 
        carbs === undefined || fat === undefined) {
      return res.status(400).json({ message: '必须提供食物的基本营养信息' });
    }
    
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
    
    // 如果指定了类型，则添加到对应类型文件中
    foodsData.add(newFood, type);
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
    
    const updatedFood = foodsData.update(id, updates);
    
    if (!updatedFood) {
      return res.status(404).json({ message: '食物不存在' });
    }
    
    res.json(updatedFood);
  } catch (error) {
    res.status(500).json({ message: '更新食物失败', error: error.message });
  }
});

// 删除食物
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedFood = foodsData.delete(id);
    
    if (!deletedFood) {
      return res.status(404).json({ message: '食物不存在' });
    }
    
    res.json({ message: '食物已删除', deletedFood });
  } catch (error) {
    res.status(500).json({ message: '删除食物失败', error: error.message });
  }
});

// 获取所有食物类型（完整信息，包含子类型）
router.get('/types/full', (req, res) => {
  try {
    const foodTypesJsonPath = path.join(foodsDir, 'foodTypes.json');
    if (fs.existsSync(foodTypesJsonPath)) {
      const data = fs.readJsonSync(foodTypesJsonPath);
      res.json(data);
    } else {
      // 如果不存在完整的foodTypes.json，则返回简化版本
      const types = foodsData.getAllTypes();
      const simplifiedData = {
        foodTypes: {}
      };
      
      types.forEach(type => {
        simplifiedData.foodTypes[type] = {
          subTypes: []
        };
      });
      
      res.json(simplifiedData);
    }
  } catch (error) {
    res.status(500).json({ message: '获取完整食物类型数据失败', error: error.message });
  }
});
module.exports = router;