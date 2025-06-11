const fs = require('fs-extra');
const path = require('path');
const pathService = require('@services/pathService');

// 食谱规划数据操作
const plansData = {
  // 获取所有食谱规划
  getAll: () => {
    try {
      // 确保plan目录存在
      fs.ensureDirSync(pathService.plansDir);
      
      // 检查plan目录中的所有JSON文件
      const planFiles = fs.readdirSync(pathService.plansDir)
        .filter(file => file.endsWith('.json'));
      
      // 读取所有plan文件
      const plans = planFiles.map(file => {
        try {
          const filePath = path.join(pathService.plansDir, file);
          return fs.readJsonSync(filePath);
        } catch (err) {
          console.error(`读取规划文件 ${file} 失败:`, err);
          return null;
        }
      }).filter(plan => plan !== null); // 过滤掉读取失败的文件
      
      return plans;
    } catch (error) {
      throw new Error(`获取规划数据失败: ${error.message}`);
    }
  },

  // 根据用户ID获取食谱规划
  getByUserId: (userId) => {
    try {
      // 获取所有规划
      const plans = plansData.getAll();
      
      // 过滤出指定用户的规划
      return plans.filter(plan => plan.userId === userId);
    } catch (error) {
      throw new Error(`获取用户规划失败: ${error.message}`);
    }
  },

  // 根据ID获取食谱规划
  getById: (id) => {
    try {
      const planFilePath = path.join(pathService.plansDir, `${id}.json`);
      
      if (fs.existsSync(planFilePath)) {
        return fs.readJsonSync(planFilePath);
      }
      
      return null;
    } catch (error) {
      throw new Error(`获取规划数据失败: ${error.message}`);
    }
  },

  // 添加食谱规划
  add: (plan) => {
    try {
      // 确保plan目录存在
      fs.ensureDirSync(pathService.plansDir);
      
      // 保存规划到文件
      const planFilePath = path.join(pathService.plansDir, `${plan.id}.json`);
      fs.writeJsonSync(planFilePath, plan);
      
      return plan;
    } catch (error) {
      throw new Error(`添加规划失败: ${error.message}`);
    }
  },

  // 更新食谱规划
  update: (id, updates) => {
    try {
      const planFilePath = path.join(pathService.plansDir, `${id}.json`);
      
      // 检查规划是否存在
      if (!fs.existsSync(planFilePath)) {
        throw new Error(`规划 ${id} 不存在`);
      }
      
      // 读取现有规划
      const existingPlan = fs.readJsonSync(planFilePath);
      
      // 更新规划
      const updatedPlan = {
        ...existingPlan,
        ...updates,
        // 确保ID不变
        id,
        updatedAt: new Date().toISOString()
      };
      
      // 保存更新后的规划
      fs.writeJsonSync(planFilePath, updatedPlan);
      
      return updatedPlan;
    } catch (error) {
      throw new Error(`更新规划失败: ${error.message}`);
    }
  },

  // 删除食谱规划
  delete: (id) => {
    try {
      const planFilePath = path.join(pathService.plansDir, `${id}.json`);
      
      if (fs.existsSync(planFilePath)) {
        // 如果规划存在，读取它然后删除文件
        const deletedPlan = fs.readJsonSync(planFilePath);
        fs.removeSync(planFilePath);
        return deletedPlan;
      }
      
      return null;
    } catch (error) {
      throw new Error(`删除规划失败: ${error.message}`);
    }
  }
};

module.exports = plansData;