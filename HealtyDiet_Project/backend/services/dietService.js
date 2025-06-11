const fs = require('fs-extra');
const path = require('path');
const pathService = require('@services/pathService');

// 食谱数据操作
const dietsData = {
  // 获取所有食谱
  getAll: () => {
    try {
      const data = fs.readJsonSync(pathService.dietsFile);
      
      // 检查单独保存的食谱文件
      const dietFiles = fs.readdirSync(pathService.dietsDir)
        .filter(file => file !== 'diets.json' && file.endsWith('.json'));
      
      // 读取单独保存的食谱文件
      const individualDiets = dietFiles.map(file => {
        try {
          const filePath = path.join(pathService.dietsDir, file);
          return fs.readJsonSync(filePath);
        } catch (err) {
          console.error(`读取食谱文件 ${file} 失败:`, err);
          return null;
        }
      }).filter(Boolean);
      
      // 合并所有食谱
      return [...data.diets, ...individualDiets];
    } catch (error) {
      throw new Error(`获取食谱数据失败: ${error.message}`);
    }
  },

  // 根据ID获取食谱
  getById: (id) => {
    try {
      // 首先在主文件中查找
      const data = fs.readJsonSync(pathService.dietsFile);
      const diet = data.diets.find(diet => diet.id === id);
      
      if (diet) return diet;
      
      // 如果主文件中没有找到，尝试在单独的文件中查找
      const dietFilePath = path.join(pathService.dietsDir, `${id}.json`);
      if (fs.existsSync(dietFilePath)) {
        return fs.readJsonSync(dietFilePath);
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
      const data = fs.readJsonSync(pathService.dietsFile);
      const dietsFromMainFile = data.diets.filter(diet => diet.userId === userId);
      
      // 检查单独保存的食谱文件
      const dietFiles = fs.readdirSync(pathService.dietsDir)
        .filter(file => file !== 'diets.json' && file.endsWith('.json'));
      
      // 读取单独保存的食谱文件
      const individualDiets = dietFiles.map(file => {
        try {
          const filePath = path.join(pathService.dietsDir, file);
          const diet = fs.readJsonSync(filePath);
          return diet.userId === userId ? diet : null;
        } catch (err) {
          console.error(`读取食谱文件 ${file} 失败:`, err);
          return null;
        }
      }).filter(Boolean);
      
      // 合并所有食谱
      return [...dietsFromMainFile, ...individualDiets];
    } catch (error) {
      throw new Error(`获取用户食谱失败: ${error.message}`);
    }
  },

  // 添加食谱
  add: (diet) => {
    try {
      // 检查是否需要按文件保存
      if (diet.saveAsFile) {
        // 按文件保存食谱
        const dietFilePath = path.join(pathService.dietsDir, `${diet.id}.json`);
        fs.writeJsonSync(dietFilePath, diet);
      } else {
        // 保存到主文件
        const data = fs.readJsonSync(pathService.dietsFile);
        data.diets.push(diet);
        fs.writeJsonSync(pathService.dietsFile, data);
      }
      
      return diet;
    } catch (error) {
      throw new Error(`添加食谱失败: ${error.message}`);
    }
  },

  // 更新食谱
  update: (id, updates) => {
    try {
      // 检查食谱是否存在于单独的文件中
      const dietFilePath = path.join(pathService.dietsDir, `${id}.json`);
      const saveAsFile = updates.saveAsFile;
      
      // 删除saveAsFile属性，不需要保存到数据中
      if (updates.hasOwnProperty('saveAsFile')) {
        delete updates.saveAsFile;
      }
      
      if (fs.existsSync(dietFilePath)) {
        // 如果食谱存在于单独的文件中，直接更新该文件
        const existingDiet = fs.readJsonSync(dietFilePath);
        fs.writeJsonSync(dietFilePath, {
          ...existingDiet,
          ...updates,
          id, // 确保ID不变
        });
        return {
          ...existingDiet,
          ...updates,
          id
        };
      } else {
        // 检查主文件中是否存在该食谱
        const data = fs.readJsonSync(pathService.dietsFile);
        const dietIndex = data.diets.findIndex(diet => diet.id === id);
        
        if (dietIndex === -1) {
          return null;
        }
        
        // 如果需要按文件保存，则从主文件中移除并创建单独的文件
        if (saveAsFile) {
          const dietToMove = {
            ...data.diets[dietIndex],
            ...updates,
            id, // 确保ID不变
          };
          
          // 从主文件中移除
          data.diets.splice(dietIndex, 1);
          fs.writeJsonSync(pathService.dietsFile, data);
          
          // 创建单独的文件
          fs.writeJsonSync(dietFilePath, dietToMove);
          return dietToMove;
        } else {
          // 更新主文件中的食谱
          data.diets[dietIndex] = {
            ...data.diets[dietIndex],
            ...updates,
            id, // 确保ID不变
          };
          
          fs.writeJsonSync(pathService.dietsFile, data);
          return data.diets[dietIndex];
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
      const dietFilePath = path.join(pathService.dietsDir, `${id}.json`);
      
      if (fs.existsSync(dietFilePath)) {
        // 如果食谱存在于单独的文件中，读取它然后删除文件
        const deletedDiet = fs.readJsonSync(dietFilePath);
        fs.removeSync(dietFilePath);
        return deletedDiet;
      } else {
        // 检查主文件中是否存在该食谱
        const data = fs.readJsonSync(pathService.dietsFile);
        const dietIndex = data.diets.findIndex(diet => diet.id === id);
        
        if (dietIndex === -1) {
          return null;
        }
        
        const deletedDiet = data.diets[dietIndex];
        data.diets.splice(dietIndex, 1);
        
        fs.writeJsonSync(pathService.dietsFile, data);
        return deletedDiet;
      }
    } catch (error) {
      throw new Error(`删除食谱失败: ${error.message}`);
    }
  }
};

module.exports = dietsData;