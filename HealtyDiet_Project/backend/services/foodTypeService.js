const fs = require('fs-extra');
const pathService = require('@services/pathService');

// 读取食物类型
const readFoodTypes = () => {
  try {
    const content = fs.readFileSync(pathService.foodTypesFile, 'utf8');
    const typeLines = content.split('\n');
    const foodTypes = {};
    
    typeLines.forEach(line => {
      if (line.trim() === '') return;
      
      const [type, foods] = line.split('：');
      if (type && foods) {
        foodTypes[type] = foods.split('、').map(food => {
          // 处理带括号的食物名称，只取括号前的主名称
          const mainName = food.split('（')[0];
          return mainName.trim();
        });
      }
    });
    
    return foodTypes;
  } catch (error) {
    console.error(`读取食物类型失败: ${error.message}`);
    return {};
  }
};

// 获取所有食物类型
const getAllTypes = () => {
  try {
    // 尝试从foodTypes.json读取食物类型
    const foodTypesJsonPath = pathService.getFoodTypeFilePath('foodTypes');
    if (fs.existsSync(foodTypesJsonPath)) {
      const data = fs.readJsonSync(foodTypesJsonPath);
      return Object.keys(data.foodTypes || {});
    }
    // 如果不存在，则从旧的FoodsTypes文件读取
    return Object.keys(readFoodTypes());
  } catch (error) {
    console.error(`获取食物类型失败: ${error.message}`);
    return Object.keys(readFoodTypes());
  }
};

module.exports = {
  readFoodTypes,
  getAllTypes
};