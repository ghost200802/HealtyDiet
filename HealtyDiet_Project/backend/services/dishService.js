const fs = require('fs-extra');
const path = require('path');
const pathService = require('@services/pathService');

// 菜谱数据目录和文件路径
const dishesDir = path.join(pathService.dataDir, 'dishs');
const dishesFile = path.join(dishesDir, 'dishs.json');

// 菜谱数据缓存
let dishesCache = null;
let dishesByTypeCache = {};

// 菜谱数据操作
const dishesData = {
  // 初始化缓存
  initializeCache: () => {
    try {
      if (!fs.existsSync(dishesFile)) {
        throw new Error(`菜谱数据文件不存在: ${dishesFile}`);
      }
      
      const data = fs.readJsonSync(dishesFile);
      dishesCache = data;
      
      // 按类型分类菜谱
      dishesByTypeCache = {};
      
      Object.values(data).forEach(dish => {
        if (dish.type && Array.isArray(dish.type)) {
          dish.type.forEach(type => {
            if (!dishesByTypeCache[type]) {
              dishesByTypeCache[type] = [];
            }
            dishesByTypeCache[type].push(dish);
          });
        }
      });
      
      console.log('菜谱缓存初始化成功');
    } catch (error) {
      console.error('菜谱缓存初始化失败:', error.message);
      throw error;
    }
  },
  
  // 获取所有菜谱
  getAll: () => {
    try {
      // 如果缓存未初始化，则初始化缓存
      if (!dishesCache) {
        dishesData.initializeCache();
      }
      
      return Object.values(dishesCache);
    } catch (error) {
      throw new Error(`获取菜谱数据失败: ${error.message}`);
    }
  },
  
  // 根据ID获取菜谱
  getById: (id) => {
    try {
      // 如果缓存未初始化，则初始化缓存
      if (!dishesCache) {
        dishesData.initializeCache();
      }
      
      // 将id转换为字符串，因为JSON对象的键是字符串
      const stringId = id.toString();
      return dishesCache[stringId] || null;
    } catch (error) {
      throw new Error(`获取菜谱数据失败: ${error.message}`);
    }
  },
  
  // 根据类型获取菜谱
  getByType: (type) => {
    try {
      // 如果缓存未初始化，则初始化缓存
      if (!dishesCache) {
        dishesData.initializeCache();
      }
      
      return dishesByTypeCache[type] || [];
    } catch (error) {
      throw new Error(`获取${type}类菜谱失败: ${error.message}`);
    }
  },
  
  // 获取所有菜谱类型
  getAllTypes: () => {
    try {
      // 如果缓存未初始化，则初始化缓存
      if (!dishesCache) {
        dishesData.initializeCache();
      }
      
      return Object.keys(dishesByTypeCache);
    } catch (error) {
      throw new Error(`获取菜谱类型失败: ${error.message}`);
    }
  },
  
  // 搜索菜谱
  search: (query) => {
    try {
      // 如果缓存未初始化，则初始化缓存
      if (!dishesCache) {
        dishesData.initializeCache();
      }
      
      if (!query) {
        return Object.values(dishesCache);
      }
      
      const lowerQuery = query.toLowerCase();
      
      return Object.values(dishesCache).filter(dish => {
        // 搜索菜谱名称
        if (dish.name && dish.name.toLowerCase().includes(lowerQuery)) {
          return true;
        }
        
        // 搜索菜谱类型
        if (dish.type && Array.isArray(dish.type)) {
          for (const type of dish.type) {
            if (type.toLowerCase().includes(lowerQuery)) {
              return true;
            }
          }
        }
        
        return false;
      });
    } catch (error) {
      throw new Error(`搜索菜谱失败: ${error.message}`);
    }
  }
};

module.exports = dishesData;