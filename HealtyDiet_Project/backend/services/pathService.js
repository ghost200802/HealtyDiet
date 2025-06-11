const path = require('path');

// 数据目录路径
const dataDir = path.join(__dirname, '..', '..', 'data');
const foodsDir = path.join(dataDir, 'foods');
const dietsDir = path.join(dataDir, 'diets');
const usersDir = path.join(dataDir, 'users');
const plansDir = path.join(dataDir, 'plan'); // 添加plans目录路径

// 食物类型文件路径
const foodTypesFile = path.join(__dirname, '..', '..', '..', 'Docs', 'FoodsTypes');

// 数据文件路径
const dietsFile = path.join(dietsDir, 'diets.json');
const usersFile = path.join(usersDir, 'users.json');

// 获取食物类型文件路径
const getFoodTypeFilePath = (type) => {
  return path.join(foodsDir, `${type}.json`);
};

// 获取所有食物类型文件路径
const getAllFoodTypeFilePaths = (foodTypes) => {
  const filePaths = {};
  
  Object.keys(foodTypes).forEach(type => {
    filePaths[type] = getFoodTypeFilePath(type);
  });
  
  return filePaths;
};

module.exports = {
  dataDir,
  foodsDir,
  dietsDir,
  usersDir,
  plansDir, // 导出plans目录路径
  foodTypesFile,
  dietsFile,
  usersFile,
  getFoodTypeFilePath,
  getAllFoodTypeFilePaths
};