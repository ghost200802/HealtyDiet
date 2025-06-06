const fs = require('fs-extra');
const path = require('path');

// 数据目录路径
const dataDir = path.join(__dirname, '..', '..', 'data');
const foodsDir = path.join(dataDir, 'foods');
const recipesDir = path.join(dataDir, 'recipes');
const usersDir = path.join(dataDir, 'users');

// 食物类型文件路径
const foodTypesFile = path.join(__dirname, '..', '..', '..', 'Docs', 'FoodsTypes');

// 数据文件路径
const recipesFile = path.join(recipesDir, 'recipes.json');
const usersFile = path.join(usersDir, 'users.json');

// 读取食物类型
const readFoodTypes = () => {
  try {
    const content = fs.readFileSync(foodTypesFile, 'utf8');
    const typeLines = content.split('\n');
    const foodTypes = {};
    
    typeLines.forEach(line => {
      if (line.trim() === '') return;
      
      const [type, foods] = line.split('：');
      if (type && foods) {
        foodTypes[type] = foods.split('、').map(food => {
          // 处理带括号的食物名称，只取括号前的主名称
          const mainName = food.split('（')[0];
          return mainName.trim();
        });
      }
    });
    
    return foodTypes;
  } catch (error) {
    console.error(`读取食物类型失败: ${error.message}`);
    return {};
  }
};

// 获取食物类型文件路径
const getFoodTypeFilePath = (type) => {
  return path.join(foodsDir, `${type}.json`);
};

// 获取所有食物类型文件路径
const getAllFoodTypeFilePaths = () => {
  const foodTypes = readFoodTypes();
  const filePaths = {};
  
  Object.keys(foodTypes).forEach(type => {
    filePaths[type] = getFoodTypeFilePath(type);
  });
  
  return filePaths;
};

// 确保数据目录和文件存在
const ensureDataFilesExist = () => {
  // 确保目录存在
  fs.ensureDirSync(dataDir);
  fs.ensureDirSync(foodsDir);
  fs.ensureDirSync(recipesDir);
  fs.ensureDirSync(usersDir);

  // 读取食物类型
  const foodTypes = readFoodTypes();
  
  // 为每种食物类型创建对应的JSON文件
  Object.keys(foodTypes).forEach(type => {
    const typeFilePath = getFoodTypeFilePath(type);
    
    if (!fs.existsSync(typeFilePath)) {
      // 如果有默认数据就使用，否则创建空数组
      const foods = [];
      fs.writeJsonSync(typeFilePath, { foods });
    }
  });

  // 确保食谱数据文件存在
  if (!fs.existsSync(recipesFile)) {
    fs.writeJsonSync(recipesFile, { recipes: [] });
  }

  // 确保用户数据文件存在
  if (!fs.existsSync(usersFile)) {
    fs.writeJsonSync(usersFile, { users: [] });
  }
};

// 食物数据操作
const foodsData = {
  // 获取所有食物类型
  getAllTypes: () => {
    try {
      // 尝试从foodTypes.json读取食物类型
      const foodTypesJsonPath = path.join(foodsDir, 'foodTypes.json');
      if (fs.existsSync(foodTypesJsonPath)) {
        const data = fs.readJsonSync(foodTypesJsonPath);
        return Object.keys(data.foodTypes || {});
      }
      // 如果不存在，则从旧的FoodsTypes文件读取
      return Object.keys(readFoodTypes());
    } catch (error) {
      console.error(`获取食物类型失败: ${error.message}`);
      return Object.keys(readFoodTypes());
    }
  },
  
  // 获取指定类型的所有食物
  getByType: (type) => {
    try {
      // 尝试从类型对应的JSON文件读取
      const foodTypesJsonPath = path.join(foodsDir, 'foodTypes.json');
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
      
      const typeFilePath = path.join(foodsDir, typeFileName);
      if (!fs.existsSync(typeFilePath)) {
        return [];
      }
      
      const data = fs.readJsonSync(typeFilePath);
      // 检查数据格式，支持两种格式：{foods: [...]} 或 {"主食": [...]} 格式
      if (data.foods) {
        return data.foods || [];
      } else if (data[type]) {
        return data[type] || [];
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
          const typeFoods = foodsData.getByType(type);
          const food = typeFoods.find(food => food.id === id);
          if (food) return food;
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
        const typeFilePath = getFoodTypeFilePath(type);
        let data = { foods: [] };
        
        if (fs.existsSync(typeFilePath)) {
          data = fs.readJsonSync(typeFilePath);
        }
        
        data.foods.push(food);
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
          const typeFilePath = getFoodTypeFilePath(type);
          if (!fs.existsSync(typeFilePath)) continue;
          
          const data = fs.readJsonSync(typeFilePath);
          const foodIndex = data.foods.findIndex(food => food.id === id);
          
          if (foodIndex !== -1) {
            data.foods[foodIndex] = {
              ...data.foods[foodIndex],
              ...updates,
              id // 确保ID不变
            };
            
            fs.writeJsonSync(typeFilePath, data);
            updated = true;
            return data.foods[foodIndex];
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
          const typeFilePath = getFoodTypeFilePath(type);
          if (!fs.existsSync(typeFilePath)) continue;
          
          const data = fs.readJsonSync(typeFilePath);
          const foodIndex = data.foods.findIndex(food => food.id === id);
          
          if (foodIndex !== -1) {
            deleted = data.foods[foodIndex];
            data.foods.splice(foodIndex, 1);
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

// 食谱数据操作
const recipesData = {
  // 获取所有食谱
  getAll: () => {
    try {
      const data = fs.readJsonSync(recipesFile);
      return data.recipes;
    } catch (error) {
      throw new Error(`获取食谱数据失败: ${error.message}`);
    }
  },

  // 根据ID获取食谱
  getById: (id) => {
    try {
      const data = fs.readJsonSync(recipesFile);
      return data.recipes.find(recipe => recipe.id === id);
    } catch (error) {
      throw new Error(`获取食谱数据失败: ${error.message}`);
    }
  },

  // 根据用户ID获取食谱
  getByUserId: (userId) => {
    try {
      const data = fs.readJsonSync(recipesFile);
      return data.recipes.filter(recipe => recipe.userId === userId);
    } catch (error) {
      throw new Error(`获取用户食谱失败: ${error.message}`);
    }
  },

  // 添加食谱
  add: (recipe) => {
    try {
      const data = fs.readJsonSync(recipesFile);
      data.recipes.push(recipe);
      fs.writeJsonSync(recipesFile, data);
      return recipe;
    } catch (error) {
      throw new Error(`添加食谱失败: ${error.message}`);
    }
  },

  // 更新食谱
  update: (id, updates) => {
    try {
      const data = fs.readJsonSync(recipesFile);
      const recipeIndex = data.recipes.findIndex(recipe => recipe.id === id);
      
      if (recipeIndex === -1) {
        return null;
      }
      
      data.recipes[recipeIndex] = {
        ...data.recipes[recipeIndex],
        ...updates,
        id, // 确保ID不变
        updatedAt: new Date().toISOString()
      };
      
      fs.writeJsonSync(recipesFile, data);
      return data.recipes[recipeIndex];
    } catch (error) {
      throw new Error(`更新食谱失败: ${error.message}`);
    }
  },

  // 删除食谱
  delete: (id) => {
    try {
      const data = fs.readJsonSync(recipesFile);
      const recipeIndex = data.recipes.findIndex(recipe => recipe.id === id);
      
      if (recipeIndex === -1) {
        return null;
      }
      
      const deletedRecipe = data.recipes[recipeIndex];
      data.recipes.splice(recipeIndex, 1);
      
      fs.writeJsonSync(recipesFile, data);
      return deletedRecipe;
    } catch (error) {
      throw new Error(`删除食谱失败: ${error.message}`);
    }
  }
};

module.exports = {
  ensureDataFilesExist,
  readFoodTypes,
  getFoodTypeFilePath,
  getAllFoodTypeFilePaths,
  foodsData,
  recipesData,
  paths: {
    dataDir,
    foodsDir,
    recipesDir,
    usersDir,
    recipesFile,
    usersFile,
    foodTypesFile
  }
};