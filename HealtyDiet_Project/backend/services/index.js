const pathService = require('@services/pathService');
const foodTypeService = require('@services/foodTypeService');
const foodService = require('@services/foodService');
const recipeService = require('@services/recipeService');
const planService = require('@services/planService'); // 添加planService
const initService = require('@services/initService');

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
  recipesData: recipeService,
  
  // 食谱规划服务
  plansData: planService
};