/**
 * 食谱随机生成工具
 * 用于随机从食物库中选择食物并生成随机重量
 */

/**
 * 随机生成一个食谱项目
 * @param {Array} foods - 所有可用的食物列表
 * @returns {Object} - 包含随机选择的食物和重量的对象
 */
export const generateRandomRecipeItem = (foods) => {
  if (!foods || foods.length === 0) {
    throw new Error('食物列表为空，无法生成随机食谱');
  }
  
  // 随机选择一个食物
  const randomIndex = Math.floor(Math.random() * foods.length);
  const selectedFood = foods[randomIndex];
  
  // 根据食物类型生成合理的随机重量
  let minWeight = 50; // 默认最小重量50克
  let maxWeight = 200; // 默认最大重量200克
  
  // 根据食物类别调整重量范围
  switch (selectedFood.category) {
    case '肉类':
    case '禽类':
      minWeight = 50;
      maxWeight = 150;
      break;
    case '蔬菜':
    case '水果':
      minWeight = 100;
      maxWeight = 300;
      break;
    case '谷物':
    case '豆类':
      minWeight = 30;
      maxWeight = 100;
      break;
    case '坚果':
    case '种子':
      minWeight = 10;
      maxWeight = 50;
      break;
    case '调味品':
      minWeight = 5;
      maxWeight = 20;
      break;
    default:
      // 使用默认值
      break;
  }
  
  // 生成随机重量，四舍五入到整数
  const randomWeight = Math.round(minWeight + Math.random() * (maxWeight - minWeight));
  
  // 计算营养成分
  const servingSize = selectedFood.servingSize || 100;
  const ratio = randomWeight / servingSize;
  
  return {
    food: selectedFood,
    amount: randomWeight,
    nutritionInfo: {
      calories: selectedFood.calories * ratio,
      protein: selectedFood.protein * ratio,
      carbs: selectedFood.carbs * ratio,
      fat: selectedFood.fat * ratio
    }
  };
};

/**
 * 生成随机食谱
 * @param {Array} foods - 所有可用的食物列表
 * @param {number} itemCount - 要生成的食物项目数量
 * @returns {Array} - 随机生成的食谱项目列表
 */
export const generateRandomRecipe = (foods, itemCount = 1) => {
  if (!foods || foods.length === 0) {
    throw new Error('食物列表为空，无法生成随机食谱');
  }
  
  const recipeItems = [];
  
  for (let i = 0; i < itemCount; i++) {
    try {
      const randomItem = generateRandomRecipeItem(foods);
      recipeItems.push(randomItem);
    } catch (error) {
      console.error('生成随机食谱项目失败:', error);
    }
  }
  
  return recipeItems;
};