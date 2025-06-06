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
  recipesDir,
  usersDir,
  foodTypesFile,
  recipesFile,
  usersFile,
  getFoodTypeFilePath,
  getAllFoodTypeFilePaths
};