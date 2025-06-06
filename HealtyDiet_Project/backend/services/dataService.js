const fs = require('fs-extra');
const path = require('path');

// 数据目录路径
const dataDir = path.join(__dirname, '..', '..', 'data');
const foodsDir = path.join(dataDir, 'foods');
const recipesDir = path.join(dataDir, 'recipes');
const usersDir = path.join(dataDir, 'users');

// 数据文件路径
const foodsFile = path.join(foodsDir, 'foods.json');
const recipesFile = path.join(recipesDir, 'recipes.json');
const usersFile = path.join(usersDir, 'users.json');

// 确保数据目录和文件存在
const ensureDataFilesExist = () => {
  // 确保目录存在
  fs.ensureDirSync(dataDir);
  fs.ensureDirSync(foodsDir);
  fs.ensureDirSync(recipesDir);
  fs.ensureDirSync(usersDir);

  // 确保食物数据文件存在
  if (!fs.existsSync(foodsFile)) {
    fs.writeJsonSync(foodsFile, {
      foods: [
        {
          id: '1',
          name: '鸡胸肉',
          calories: 165,
          protein: 31,
          carbs: 0,
          fat: 3.6,
          vitamins: { A: 0, C: 0, D: 0, E: 0.3 },
          minerals: { calcium: 15, iron: 1, magnesium: 29, potassium: 256 },
          servingSize: 100,
          unit: 'g',
          description: '去皮鸡胸肉，富含蛋白质，低脂肪'
        },
        {
          id: '2',
          name: '糙米',
          calories: 112,
          protein: 2.6,
          carbs: 23.5,
          fat: 0.9,
          vitamins: { A: 0, C: 0, D: 0, E: 0.1 },
          minerals: { calcium: 10, iron: 0.5, magnesium: 43, potassium: 79 },
          servingSize: 100,
          unit: 'g',
          description: '全谷物，富含纤维和矿物质'
        },
        {
          id: '3',
          name: '西兰花',
          calories: 34,
          protein: 2.8,
          carbs: 6.6,
          fat: 0.4,
          vitamins: { A: 623, C: 89.2, D: 0, E: 0.8 },
          minerals: { calcium: 47, iron: 0.7, magnesium: 21, potassium: 316 },
          servingSize: 100,
          unit: 'g',
          description: '十字花科蔬菜，富含维生素C和抗氧化物'
        }
      ]
    });
  }

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
  // 获取所有食物
  getAll: () => {
    try {
      const data = fs.readJsonSync(foodsFile);
      return data.foods;
    } catch (error) {
      throw new Error(`获取食物数据失败: ${error.message}`);
    }
  },

  // 根据ID获取食物
  getById: (id) => {
    try {
      const data = fs.readJsonSync(foodsFile);
      return data.foods.find(food => food.id === id);
    } catch (error) {
      throw new Error(`获取食物数据失败: ${error.message}`);
    }
  },

  // 搜索食物
  search: (query) => {
    try {
      const data = fs.readJsonSync(foodsFile);
      return data.foods.filter(food => 
        food.name.toLowerCase().includes(query.toLowerCase()) ||
        (food.description && food.description.toLowerCase().includes(query.toLowerCase()))
      );
    } catch (error) {
      throw new Error(`搜索食物失败: ${error.message}`);
    }
  },

  // 添加食物
  add: (food) => {
    try {
      const data = fs.readJsonSync(foodsFile);
      data.foods.push(food);
      fs.writeJsonSync(foodsFile, data);
      return food;
    } catch (error) {
      throw new Error(`添加食物失败: ${error.message}`);
    }
  },

  // 更新食物
  update: (id, updates) => {
    try {
      const data = fs.readJsonSync(foodsFile);
      const foodIndex = data.foods.findIndex(food => food.id === id);
      
      if (foodIndex === -1) {
        return null;
      }
      
      data.foods[foodIndex] = {
        ...data.foods[foodIndex],
        ...updates,
        id // 确保ID不变
      };
      
      fs.writeJsonSync(foodsFile, data);
      return data.foods[foodIndex];
    } catch (error) {
      throw new Error(`更新食物失败: ${error.message}`);
    }
  },

  // 删除食物
  delete: (id) => {
    try {
      const data = fs.readJsonSync(foodsFile);
      const foodIndex = data.foods.findIndex(food => food.id === id);
      
      if (foodIndex === -1) {
        return null;
      }
      
      const deletedFood = data.foods[foodIndex];
      data.foods.splice(foodIndex, 1);
      
      fs.writeJsonSync(foodsFile, data);
      return deletedFood;
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
  foodsData,
  recipesData,
  paths: {
    dataDir,
    foodsDir,
    recipesDir,
    usersDir,
    foodsFile,
    recipesFile,
    usersFile
  }
};