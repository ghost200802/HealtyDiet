const fs = require('fs-extra');
const path = require('path');
const pathService = require('./pathService');

// 食谱数据操作
const recipesData = {
  // 获取所有食谱
  getAll: () => {
    try {
      const data = fs.readJsonSync(pathService.recipesFile);
      
      // 检查单独保存的食谱文件
      const recipeFiles = fs.readdirSync(pathService.recipesDir)
        .filter(file => file !== 'recipes.json' && file.endsWith('.json'));
      
      // 读取单独保存的食谱文件
      const individualRecipes = recipeFiles.map(file => {
        try {
          const filePath = path.join(pathService.recipesDir, file);
          return fs.readJsonSync(filePath);
        } catch (err) {
          console.error(`读取食谱文件 ${file} 失败:`, err);
          return null;
        }
      }).filter(Boolean);
      
      // 合并所有食谱
      return [...data.recipes, ...individualRecipes];
    } catch (error) {
      throw new Error(`获取食谱数据失败: ${error.message}`);
    }
  },

  // 根据ID获取食谱
  getById: (id) => {
    try {
      // 首先在主文件中查找
      const data = fs.readJsonSync(pathService.recipesFile);
      const recipe = data.recipes.find(recipe => recipe.id === id);
      
      if (recipe) return recipe;
      
      // 如果主文件中没有找到，尝试在单独的文件中查找
      const recipeFilePath = path.join(pathService.recipesDir, `${id}.json`);
      if (fs.existsSync(recipeFilePath)) {
        return fs.readJsonSync(recipeFilePath);
      }
      
      return null;
    } catch (error) {
      throw new Error(`获取食谱数据失败: ${error.message}`);
    }
  },

  // 根据用户ID获取食谱
  getByUserId: (userId) => {
    try {
      // 从主文件中获取食谱
      const data = fs.readJsonSync(pathService.recipesFile);
      const recipesFromMainFile = data.recipes.filter(recipe => recipe.userId === userId);
      
      // 检查单独保存的食谱文件
      const recipeFiles = fs.readdirSync(pathService.recipesDir)
        .filter(file => file !== 'recipes.json' && file.endsWith('.json'));
      
      // 读取单独保存的食谱文件
      const individualRecipes = recipeFiles.map(file => {
        try {
          const filePath = path.join(pathService.recipesDir, file);
          const recipe = fs.readJsonSync(filePath);
          return recipe.userId === userId ? recipe : null;
        } catch (err) {
          console.error(`读取食谱文件 ${file} 失败:`, err);
          return null;
        }
      }).filter(Boolean);
      
      // 合并所有食谱
      return [...recipesFromMainFile, ...individualRecipes];
    } catch (error) {
      throw new Error(`获取用户食谱失败: ${error.message}`);
    }
  },

  // 添加食谱
  add: (recipe) => {
    try {
      // 检查是否需要按文件保存
      if (recipe.saveAsFile) {
        // 按文件保存食谱
        const recipeFilePath = path.join(pathService.recipesDir, `${recipe.id}.json`);
        fs.writeJsonSync(recipeFilePath, recipe);
      } else {
        // 保存到主文件
        const data = fs.readJsonSync(pathService.recipesFile);
        data.recipes.push(recipe);
        fs.writeJsonSync(pathService.recipesFile, data);
      }
      
      return recipe;
    } catch (error) {
      throw new Error(`添加食谱失败: ${error.message}`);
    }
  },

  // 更新食谱
  update: (id, updates) => {
    try {
      // 检查食谱是否存在于单独的文件中
      const recipeFilePath = path.join(pathService.recipesDir, `${id}.json`);
      const saveAsFile = updates.saveAsFile;
      
      // 删除saveAsFile属性，不需要保存到数据中
      if (updates.hasOwnProperty('saveAsFile')) {
        delete updates.saveAsFile;
      }
      
      if (fs.existsSync(recipeFilePath)) {
        // 如果食谱存在于单独的文件中，直接更新该文件
        const existingRecipe = fs.readJsonSync(recipeFilePath);
        fs.writeJsonSync(recipeFilePath, {
          ...existingRecipe,
          ...updates,
          id, // 确保ID不变
        });
        return {
          ...existingRecipe,
          ...updates,
          id
        };
      } else {
        // 检查主文件中是否存在该食谱
        const data = fs.readJsonSync(pathService.recipesFile);
        const recipeIndex = data.recipes.findIndex(recipe => recipe.id === id);
        
        if (recipeIndex === -1) {
          return null;
        }
        
        // 如果需要按文件保存，则从主文件中移除并创建单独的文件
        if (saveAsFile) {
          const recipeToMove = {
            ...data.recipes[recipeIndex],
            ...updates,
            id, // 确保ID不变
          };
          
          // 从主文件中移除
          data.recipes.splice(recipeIndex, 1);
          fs.writeJsonSync(pathService.recipesFile, data);
          
          // 创建单独的文件
          fs.writeJsonSync(recipeFilePath, recipeToMove);
          return recipeToMove;
        } else {
          // 更新主文件中的食谱
          data.recipes[recipeIndex] = {
            ...data.recipes[recipeIndex],
            ...updates,
            id, // 确保ID不变
          };
          
          fs.writeJsonSync(pathService.recipesFile, data);
          return data.recipes[recipeIndex];
        }
      }
    } catch (error) {
      throw new Error(`更新食谱失败: ${error.message}`);
    }
  },

  // 删除食谱
  delete: (id) => {
    try {
      // 检查食谱是否存在于单独的文件中
      const recipeFilePath = path.join(pathService.recipesDir, `${id}.json`);
      
      if (fs.existsSync(recipeFilePath)) {
        // 如果食谱存在于单独的文件中，读取它然后删除文件
        const deletedRecipe = fs.readJsonSync(recipeFilePath);
        fs.removeSync(recipeFilePath);
        return deletedRecipe;
      } else {
        // 检查主文件中是否存在该食谱
        const data = fs.readJsonSync(pathService.recipesFile);
        const recipeIndex = data.recipes.findIndex(recipe => recipe.id === id);
        
        if (recipeIndex === -1) {
          return null;
        }
        
        const deletedRecipe = data.recipes[recipeIndex];
        data.recipes.splice(recipeIndex, 1);
        
        fs.writeJsonSync(pathService.recipesFile, data);
        return deletedRecipe;
      }
    } catch (error) {
      throw new Error(`删除食谱失败: ${error.message}`);
    }
  }
};

module.exports = recipesData;