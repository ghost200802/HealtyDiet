const pathService = require('@services/pathService');
const foodTypeService = require('@services/foodTypeService');
const foodService = require('@services/foodService');
const dietService = require('@services/dietService');
const planService = require('@services/planService'); // 添加planService
const dishService = require('@services/dishService'); // 添加dishService
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
  dietsData: dietService,
  
  // 食谱规划服务
  plansData: planService,
  
  // 菜谱数据服务
  dishesData: dishService
};