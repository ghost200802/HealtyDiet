const pathService = require('./pathService');
const foodTypeService = require('./foodTypeService');
const foodService = require('./foodService');
const recipeService = require('./recipeService');
const initService = require('./initService');

module.exports = {
  // 路径服务
  paths: pathService,
  
  // 食物类型服务
  foodTypeService,
  readFoodTypes: foodTypeService.readFoodTypes,
  
  // 初始化服务
  ensureDataFilesExist: initService.ensureDataFilesExist,
  
  // 食物数据服务
  foodsData: foodService,
  
  // 食谱数据服务
  recipesData: recipeService
};