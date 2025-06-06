const fs = require('fs-extra');
const pathService = require('./pathService');
const foodTypeService = require('./foodTypeService');

// 内存缓存
let foodCache = {
  // ID到食物的映射
  idToFood: {},
  // 类型到ID列表的映射
  typeToIds: {},
  // 类型到子类型到ID列表的映射
  typeToSubtypeToIds: {},
  // 缓存是否已初始化
  initialized: false
};

// 初始化缓存
const initializeCache = () => {
  if (foodCache.initialized) return;
  
  try {
    const types = foodTypeService.getAllTypes();
    
    types.forEach(type => {
      try {
        const typeFilePath = pathService.getFoodTypeFilePath(type);
        if (!fs.existsSync(typeFilePath)) return;
        
        const data = fs.readJsonSync(typeFilePath);
        
        // 初始化该类型的映射
        if (!foodCache.typeToIds[type]) {
          foodCache.typeToIds[type] = [];
        }
        
        if (!foodCache.typeToSubtypeToIds[type]) {
          foodCache.typeToSubtypeToIds[type] = {};
        }
        
        // 处理该类型的所有食物
        if (data[type]) {
          Object.entries(data[type]).forEach(([id, food]) => {
            // 更新ID到食物的映射
            foodCache.idToFood[id] = food;
            
            // 更新类型到ID的映射
            if (!foodCache.typeToIds[type].includes(id)) {
              foodCache.typeToIds[type].push(id);
            }
            
            // 如果食物有子类型，更新类型到子类型到ID的映射
            if (food.subtype) {
              if (!foodCache.typeToSubtypeToIds[type][food.subtype]) {
                foodCache.typeToSubtypeToIds[type][food.subtype] = [];
              }
              
              if (!foodCache.typeToSubtypeToIds[type][food.subtype].includes(id)) {
                foodCache.typeToSubtypeToIds[type][food.subtype].push(id);
              }
            }
          });
        }
      } catch (error) {
        console.error(`初始化${type}类食物缓存失败: ${error.message}`);
      }
    });
    
    foodCache.initialized = true;
    console.log('食物缓存初始化完成');
  } catch (error) {
    console.error(`初始化食物缓存失败: ${error.message}`);
  }
};

// 清除缓存
const clearCache = () => {
  foodCache = {
    idToFood: {},
    typeToIds: {},
    typeToSubtypeToIds: {},
    initialized: false
  };
  console.log('食物缓存已清除');
};

// 更新缓存中的食物
const updateFoodInCache = (food, type) => {
  if (!food || !food.id || !type) return;
  
  // 更新ID到食物的映射
  foodCache.idToFood[food.id] = food;
  
  // 更新类型到ID的映射
  if (!foodCache.typeToIds[type]) {
    foodCache.typeToIds[type] = [];
  }
  
  if (!foodCache.typeToIds[type].includes(food.id)) {
    foodCache.typeToIds[type].push(food.id);
  }
  
  // 如果食物有子类型，更新类型到子类型到ID的映射
  if (food.subtype) {
    if (!foodCache.typeToSubtypeToIds[type]) {
      foodCache.typeToSubtypeToIds[type] = {};
    }
    
    if (!foodCache.typeToSubtypeToIds[type][food.subtype]) {
      foodCache.typeToSubtypeToIds[type][food.subtype] = [];
    }
    
    if (!foodCache.typeToSubtypeToIds[type][food.subtype].includes(food.id)) {
      foodCache.typeToSubtypeToIds[type][food.subtype].push(food.id);
    }
  }
};

// 从缓存中删除食物
const removeFoodFromCache = (id, type, subtype) => {
  if (!id) return;
  
  // 从ID到食物的映射中删除
  delete foodCache.idToFood[id];
  
  // 从类型到ID的映射中删除
  if (type && foodCache.typeToIds[type]) {
    foodCache.typeToIds[type] = foodCache.typeToIds[type].filter(foodId => foodId !== id);
  }
  
  // 从类型到子类型到ID的映射中删除
  if (type && subtype && foodCache.typeToSubtypeToIds[type] && foodCache.typeToSubtypeToIds[type][subtype]) {
    foodCache.typeToSubtypeToIds[type][subtype] = foodCache.typeToSubtypeToIds[type][subtype].filter(foodId => foodId !== id);
  }
};

// 检查缓存是否已初始化，如果未初始化则抛出错误
const checkCacheInitialized = () => {
  if (!foodCache.initialized) {
    throw new Error('食物缓存未初始化，请先调用initializeCache()初始化缓存');
  }
};

// 食物数据操作
const foodsData = {
  // 获取所有食物类型
  getAllTypes: () => foodTypeService.getAllTypes(),
  
  // 获取指定类型的所有食物
  getByType: (type) => {
    try {
      // 检查缓存是否已初始化
      checkCacheInitialized();
      
      // 如果缓存中有该类型的食物，直接返回
      if (foodCache.typeToIds[type] && foodCache.typeToIds[type].length > 0) {
        return foodCache.typeToIds[type].map(id => foodCache.idToFood[id]);
      }
      
      // 如果缓存中没有该类型的食物，返回空数组
      return [];
    } catch (error) {
      throw new Error(`获取${type}类食物数据失败: ${error.message}`);
    }
  },
  
  // 获取所有食物
  getAll: () => {
    try {
      // 检查缓存是否已初始化
      checkCacheInitialized();
      
      // 直接返回缓存中的所有食物
      return Object.values(foodCache.idToFood);
    } catch (error) {
      throw new Error(`获取食物数据失败: ${error.message}`);
    }
  },

  // 根据ID获取食物
  getById: (id) => {
    try {
      // 检查缓存是否已初始化
      checkCacheInitialized();
      
      // 如果缓存中有该ID的食物，直接返回
      if (foodCache.idToFood[id]) {
        return foodCache.idToFood[id];
      }
      
      // 如果缓存中没有该ID的食物，返回null
      return null;
    } catch (error) {
      throw new Error(`获取食物数据失败: ${error.message}`);
    }
  },

  // 搜索食物
  search: (query) => {
    try {
      // 检查缓存是否已初始化
      checkCacheInitialized();
      
      // 在缓存中搜索食物
      return Object.values(foodCache.idToFood).filter(food => 
        food.name.toLowerCase().includes(query.toLowerCase()) ||
        (food.description && food.description.toLowerCase().includes(query.toLowerCase()))
      );
    } catch (error) {
      throw new Error(`搜索食物失败: ${error.message}`);
    }
  },

  // 添加食物
  add: (food, type) => {
    try {
      // 检查缓存是否已初始化
      checkCacheInitialized();
      
      // 如果指定了类型，则添加到对应类型文件中
      if (type) {
        const typeFilePath = pathService.getFoodTypeFilePath(type);
        let data = { [type]: {} };
        
        if (fs.existsSync(typeFilePath)) {
          data = fs.readJsonSync(typeFilePath);
          if (!data[type]) {
            data[type] = {};
          }
        }
        
        // 确保食物有ID
        if (!food.id) {
          throw new Error('食物必须有ID');
        }
        
        // 将食物添加到对应类型的对象中，以ID为键
        data[type][food.id] = food;
        fs.writeJsonSync(typeFilePath, data);
        
        // 更新缓存
        updateFoodInCache(food, type);
      }
      
      return food;
    } catch (error) {
      throw new Error(`添加食物失败: ${error.message}`);
    }
  },

  // 更新食物
  update: (id, updates) => {
    try {
      // 检查缓存是否已初始化
      checkCacheInitialized();
      
      let updated = false;
      const types = foodsData.getAllTypes();
      
      // 尝试在各个类型文件中更新
      for (const type of types) {
        try {
          const typeFilePath = pathService.getFoodTypeFilePath(type);
          if (!fs.existsSync(typeFilePath)) continue;
          
          const data = fs.readJsonSync(typeFilePath);
          
          // 检查该类型中是否存在此ID的食物
          if (data[type] && data[type][id]) {
            // 更新食物数据
            const oldFood = data[type][id];
            const oldSubtype = oldFood.subtype;
            
            data[type][id] = {
              ...data[type][id],
              ...updates,
              id // 确保ID不变
            };
            
            fs.writeJsonSync(typeFilePath, data);
            updated = true;
            
            // 更新缓存
            if (oldSubtype !== data[type][id].subtype) {
              // 如果子类型发生变化，需要先从旧子类型中删除
              removeFoodFromCache(id, type, oldSubtype);
            }
            updateFoodInCache(data[type][id], type);
            
            return data[type][id];
          }
        } catch (error) {
          console.error(`在${type}类中更新食物失败: ${error.message}`);
        }
      }
      
      return null;
    } catch (error) {
      throw new Error(`更新食物失败: ${error.message}`);
    }
  },

  // 删除食物
  delete: (id) => {
    try {
      // 检查缓存是否已初始化
      checkCacheInitialized();
      
      let deleted = null;
      const types = foodsData.getAllTypes();
      
      // 尝试在各个类型文件中删除
      for (const type of types) {
        try {
          const typeFilePath = pathService.getFoodTypeFilePath(type);
          if (!fs.existsSync(typeFilePath)) continue;
          
          const data = fs.readJsonSync(typeFilePath);
          
          // 检查该类型中是否存在此ID的食物
          if (data[type] && data[type][id]) {
            // 保存要删除的食物数据
            deleted = data[type][id];
            const subtype = deleted.subtype;
            
            // 删除该食物
            delete data[type][id];
            fs.writeJsonSync(typeFilePath, data);
            
            // 从缓存中删除
            removeFoodFromCache(id, type, subtype);
            
            break;
          }
        } catch (error) {
          console.error(`在${type}类中删除食物失败: ${error.message}`);
        }
      }
      
      return deleted;
    } catch (error) {
      throw new Error(`删除食物失败: ${error.message}`);
    }
  },
  
  // 导出缓存相关函数，方便外部调用
  initializeCache,
  clearCache
};

module.exports = foodsData;