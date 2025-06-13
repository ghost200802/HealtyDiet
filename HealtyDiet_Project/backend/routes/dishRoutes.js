const express = require('express');
const router = express.Router();
const { dishesData } = require('@services/index');
const path = require('path');
const fs = require('fs-extra');

// 获取所有菜谱
router.get('/', (req, res) => {
  try {
    const dishes = dishesData.getAll();
    res.json(dishes);
  } catch (error) {
    res.status(500).json({ message: '获取菜谱数据失败', error: error.message });
  }
});

// 根据ID获取菜谱
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const dish = dishesData.getById(id);
    
    if (!dish) {
      return res.status(404).json({ message: '菜谱不存在' });
    }
    
    res.json(dish);
  } catch (error) {
    res.status(500).json({ message: '获取菜谱数据失败', error: error.message });
  }
});

// 获取所有菜谱类型
router.get('/types', (req, res) => {
  try {
    const types = dishesData.getAllTypes();
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: '获取菜谱类型失败', error: error.message });
  }
});

// 获取指定类型的所有菜谱
router.get('/type/:type', (req, res) => {
  try {
    const { type } = req.params;
    const dishes = dishesData.getByType(type);
    res.json(dishes);
  } catch (error) {
    res.status(500).json({ message: `获取${type}类菜谱失败`, error: error.message });
  }
});

// 搜索菜谱
router.get('/search/:query', (req, res) => {
  try {
    const { query } = req.params;
    const results = dishesData.search(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: '搜索菜谱失败', error: error.message });
  }
});

// 批量获取菜谱信息
router.post('/batch', (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: '请提供有效的菜谱ID数组' });
    }
    
    // 批量获取菜谱信息
    const dishes = ids.map(id => {
      const dish = dishesData.getById(id);
      return dish || { id, error: '菜谱不存在' };
    });
    
    res.json(dishes);
  } catch (error) {
    res.status(500).json({ message: '批量获取菜谱信息失败', error: error.message });
  }
});

module.exports = router;