const fs = require('fs-extra');
const pathService = require('./pathService');
const foodTypeService = require('./foodTypeService');

// 食物数据操作
const foodsData = {
  // 获取所有食物类型
  getAllTypes: () => foodTypeService.getAllTypes(),
  
  // 获取指定类型的所有食物
  getByType: (type) => {
    try {
      // 尝试从类型对应的JSON文件读取
      const foodTypesJsonPath = pathService.getFoodTypeFilePath('foodTypes');
      let typeFileName = `${type}.json`;
      
      // 如果存在foodTypes.json，尝试获取正确的文件名
      if (fs.existsSync(foodTypesJsonPath)) {
        try {
          const data = fs.readJsonSync(foodTypesJsonPath);
          if (data.foodTypes && data.foodTypes[type] && data.foodTypes[type].fileName) {
            typeFileName = data.foodTypes[type].fileName;
          }
        } catch (error) {
          console.error(`读取foodTypes.json失败: ${error.message}`);
        }
      }
      
      const typeFilePath = pathService.getFoodTypeFilePath(type);
      if (!fs.existsSync(typeFilePath)) {
        return [];
      }
      
      const data = fs.readJsonSync(typeFilePath);
      // 新格式：{"主食": {"11001": {...}, "11002": {...}}} 
      if (data[type]) {
        // 将对象值转换为数组返回
        return Object.values(data[type]) || [];
      }
      return [];
    } catch (error) {
      throw new Error(`获取${type}类食物数据失败: ${error.message}`);
    }
  },
  
  // 获取所有食物
  getAll: () => {
    try {
      // 尝试从各个类型文件中读取
      const allFoods = [];
      const types = foodsData.getAllTypes();
      
      types.forEach(type => {
        try {
          const typeFoods = foodsData.getByType(type);
          if (typeFoods && typeFoods.length > 0) {
            allFoods.push(...typeFoods);
          }
        } catch (error) {
          console.error(`读取${type}类食物失败: ${error.message}`);
        }
      });
      
      return allFoods;
    } catch (error) {
      throw new Error(`获取食物数据失败: ${error.message}`);
    }
  },

  // 根据ID获取食物
  getById: (id) => {
    try {
      // 先尝试从各个类型文件中查找
      const types = foodsData.getAllTypes();
      for (const type of types) {
        try {
          const typeFilePath = pathService.getFoodTypeFilePath(type);
          if (!fs.existsSync(typeFilePath)) continue;
          
          const data = fs.readJsonSync(typeFilePath);
          // 新格式：{"主食": {"11001": {...}, "11002": {...}}}
          if (data[type] && data[type][id]) {
            return data[type][id];
          }
        } catch (error) {
          console.error(`在${type}类中查找食物失败: ${error.message}`);
        }
      }
      
      return null;
    } catch (error) {
      throw new Error(`获取食物数据失败: ${error.message}`);
    }
  },

  // 搜索食物
  search: (query) => {
    try {
      const allFoods = foodsData.getAll();
      return allFoods.filter(food => 
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
      }
      
      return food;
    } catch (error) {
      throw new Error(`添加食物失败: ${error.message}`);
    }
  },

  // 更新食物
  update: (id, updates) => {
    try {
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
            data[type][id] = {
              ...data[type][id],
              ...updates,
              id // 确保ID不变
            };
            
            fs.writeJsonSync(typeFilePath, data);
            updated = true;
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
            // 删除该食物
            delete data[type][id];
            fs.writeJsonSync(typeFilePath, data);
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
  }
};

module.exports = foodsData;