const fs = require('fs-extra');
const pathService = require('@services/pathService');
const foodTypeService = require('@services/foodTypeService');

// 确保数据目录和文件存在
const ensureDataFilesExist = () => {
  // 确保目录存在
  fs.ensureDirSync(pathService.dataDir);
  fs.ensureDirSync(pathService.foodsDir);
  fs.ensureDirSync(pathService.dietsDir);
  fs.ensureDirSync(pathService.usersDir);
  fs.ensureDirSync(pathService.plansDir); // 确保plans目录存在

  // 读取食物类型
  const foodTypes = foodTypeService.readFoodTypes();
  
  // 为每种食物类型创建对应的JSON文件
  Object.keys(foodTypes).forEach(type => {
    const typeFilePath = pathService.getFoodTypeFilePath(type);
    
    if (!fs.existsSync(typeFilePath)) {
      // 创建空的食物类型对象，使用新的格式（以ID为键的对象）
      fs.writeJsonSync(typeFilePath, { [type]: {} });
    }
  });
  
  // 确保食谱文件存在
  if (!fs.existsSync(pathService.dietsFile)) {
    fs.writeJsonSync(pathService.dietsFile, { diets: [] });
  }
  
  // 确保用户文件存在
  if (!fs.existsSync(pathService.usersFile)) {
    fs.writeJsonSync(pathService.usersFile, { users: [] });
  }
};

module.exports = {
  ensureDataFilesExist
};