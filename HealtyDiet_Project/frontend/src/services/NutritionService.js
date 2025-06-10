/**
 * 营养素计算服务
 * 提供统一的营养素计算功能，包括单个食物、食谱项目和整个食谱的营养素计算
 * 以及营养素评分和建议功能
 */

import { getFoodById, getFoodsByIds, getFoodByIdSync, getFoodsByIdsSync } from './FoodService';

/**
 * 计算单个食物的营养素含量
 * @param {string} foodId - 食物ID
 * @param {number} amount - 食物重量(克)
 * @param {Array} nutrients - 需要计算的营养素列表，默认为所有基本营养素
 * @returns {Object} - 计算后的营养素含量
 */
export const calculateFoodNutrition = (foodId, amount, nutrients = ['calories', 'protein', 'carbs', 'fat', 'fiber']) => {
  if (!foodId) {
    throw new Error('食物ID不能为空');
  }
  
  if (!amount || amount <= 0) {
    throw new Error('食物重量必须大于0');
  }
  
  const food = getFoodByIdSync(foodId);
  
  if (!food) {
    throw new Error(`未找到ID为${foodId}的食物`);
  }
  
  const servingSize = food.servingSize || 100; // 默认以100g为标准份量
  const ratio = amount / servingSize;
  
  const result = {};
  
  // 计算基本营养素
  nutrients.forEach(nutrient => {
    // 如果食物没有该营养素数据，则默认为0
    result[nutrient] = (food[nutrient] || 0) * ratio;
  });
  
  // 四舍五入到一位小数
  Object.keys(result).forEach(key => {
    result[key] = Math.round(result[key] * 10) / 10;
  });
  
  return result;
};

/**
 * 计算食谱项目的营养素含量
 * @param {string} foodId - 食物ID
 * @param {number} amount - 食物重量(克)
 * @returns {Object} - 食谱项目对象，包含食物ID、名称、重量和营养素含量
 */
export const calculateRecipeItem = (foodId, amount) => {
  if (!foodId) {
    throw new Error('食物ID不能为空');
  }
  
  if (!amount || amount <= 0) {
    throw new Error('食物重量必须大于0');
  }
  
  
  const food = getFoodByIdSync(foodId);
  
  if (!food) {
    throw new Error(`未找到ID为${foodId}的食物`);
  }
  
  const nutrition = calculateFoodNutrition(foodId, amount);
  
  return {
    foodId: foodId,
    foodName: food.name,
    amount: amount,
    ...nutrition
  };
};

/**
 * 计算食谱的总营养成分
 * @param {Array} recipeItems - 食谱中的食物项目，简化格式为[{foodId, amount}]
 * @returns {Object} - 总营养成分
 */
export const calculateTotalNutrition = (recipeItems) => {
  console.log('calculateTotalNutrition 调用:', { recipeItemsLength: recipeItems?.length });
  
  // 检查参数
  if (!recipeItems || recipeItems.length === 0) {
    console.log('没有食谱项目，返回零值');
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    };
  }
  
  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0
  };

  console.log('计算总营养成分的recipeItems:', recipeItems);
  for(const item of recipeItems) {
    try {
      const nutrition = calculateFoodNutrition(item.foodId, item.amount);
      totals.calories += nutrition.calories;
      totals.protein += nutrition.protein;
      totals.carbs += nutrition.carbs;
      totals.fat += nutrition.fat;
      totals.fiber += nutrition.fiber;
    } catch (error) {
      console.error(`计算食物营养素失败:`, error);
    }
  }
  
  // 四舍五入到一位小数
  Object.keys(totals).forEach(key => {
    totals[key] = Math.round(totals[key] * 10) / 10;
  });
  
  console.log('计算结果:', totals);
  return totals;
};

/**
 * 计算三大营养素的能量占比
 * @param {Object} totalNutrition - 总营养成分
 * @returns {Array} - 能量占比数据
 */
export const calculateEnergyDistribution = (totalNutrition) => {
  // 蛋白质、碳水和脂肪的能量转换系数（千卡/克）
  const proteinFactor = 4;
  const carbsFactor = 4;
  const fatFactor = 9;
  
  // 计算各营养素提供的能量
  const proteinEnergy = totalNutrition.protein * proteinFactor;
  const carbsEnergy = totalNutrition.carbs * carbsFactor;
  const fatEnergy = totalNutrition.fat * fatFactor;
  
  // 计算总能量
  const totalEnergy = proteinEnergy + carbsEnergy + fatEnergy;
  
  // 防止除以0
  if (totalEnergy === 0) {
    return [
      { name: '蛋白质', value: 0, percent: 0 },
      { name: '碳水化合物', value: 0, percent: 0 },
      { name: '脂肪', value: 0, percent: 0 }
    ];
  }
  
  // 计算各营养素能量占比
  const proteinPercent = (proteinEnergy / totalEnergy) * 100;
  const carbsPercent = (carbsEnergy / totalEnergy) * 100;
  const fatPercent = (fatEnergy / totalEnergy) * 100;
  
  return [
    { name: '蛋白质', value: proteinEnergy, percent: proteinPercent },
    { name: '碳水化合物', value: carbsEnergy, percent: carbsPercent },
    { name: '脂肪', value: fatEnergy, percent: fatPercent }
  ];
};

/**
 * 准备营养素数据用于图表显示
 * @param {Array} recipeItems - 食谱中的食物项目，格式为[{foodId, amount}]
 * @param {Object} totalNutrition - 食谱的总营养成分
 * @param {string} type - 营养素类型 (calories, protein, carbs, fat, fiber)
 * @returns {Array} 排序后的营养素数据
 */
export const prepareNutritionData = (recipeItems, totalNutrition, type) => {
  if (recipeItems.length === 0) return [];
  
  // 防止除以0的情况
  if (!totalNutrition[type] || totalNutrition[type] === 0) {
    return [];
  }
  
  // 收集所有foodId
  const foodIds = recipeItems.map(item => item.foodId);
  
  // 获取食物数据
  const foods = getFoodsByIdsSync(foodIds);
  
  // 创建foodId到食物的映射
  const foodMap = {};
  foods.forEach(food => {
    foodMap[food.id] = food;
  });
  
  // 根据类型获取相应的营养素数据并按照占比从大到小排序
  const result = [];
  
  for (const item of recipeItems) {
    const food = foodMap[item.foodId];
    if (!food) continue; // 如果找不到食物数据，跳过
    
    // 计算营养素值
    const servingSize = food.servingSize || 100;
    const ratio = item.amount / servingSize;
    const value = (food[type] || 0) * ratio;
    
    result.push({
      name: food.name,
      value: value,
      percent: (value / totalNutrition[type]) * 100
    });
  }
  
  return result.sort((a, b) => b.percent - a.percent);
};

/**
 * 计算营养素得分（越接近目标值，得分越高）
 * @param {number} currentValue - 当前值
 * @param {number} targetValue - 目标值
 * @returns {number} - 得分（0-1之间）
 */
export const calculateNutrientScore = (currentValue, targetValue) => {
  return 1 - Math.abs(currentValue - targetValue) / targetValue;
};

/**
 * 根据得分生成营养素建议
 * @param {number} score - 得分（0-100之间）
 * @param {string} nutrientName - 营养素名称
 * @param {number} currentValue - 当前值
 * @param {number} targetValue - 目标值
 * @returns {Object} - 包含建议文本和颜色的对象
 */
export const getSuggestionByScore = (score, nutrientName, currentValue, targetValue) => {
  // 计算当前值与目标值的差距
  const difference = currentValue - targetValue;
  
  // 根据得分返回不同的建议和颜色
  if (score >= 95) {
    return {
      text: `${nutrientName}摄入非常理想，继续保持！`,
      color: 'success.main'
    };
  } else if (score >= 70) {
    if (difference > 0) {
      return {
        text: `${nutrientName}摄入略高，可以适当减少。`,
        color: 'warning.main'
      };
    } else {
      return {
        text: `${nutrientName}摄入略低，可以适当增加。`,
        color: 'warning.main'
      };
    }
  } else {
    if (difference > 0) {
      return {
        text: `${nutrientName}摄入过高，建议大幅减少。`,
        color: 'error.main'
      };
    } else {
      return {
        text: `${nutrientName}摄入不足，建议大幅增加。`,
        color: 'error.main'
      };
    }
  }
};

/**
 * 获取热量状态评价
 * @param {Object} totalNutrition - 总营养数据
 * @param {Object} user - 用户数据
 * @returns {Object} - 包含状态文本和颜色的对象
 */
export const getCaloriesStatus = (totalNutrition, user) => {
  if (!user || !user.dci) return { text: '未设置推荐摄入量', color: 'text.secondary' };
  
  const percentage = totalNutrition.calories / user.dci * 100;
  
  if (percentage > 110) return { text: '热量偏高', color: 'error.main' };
  if (percentage < 90) return { text: '热量偏低', color: 'warning.main' };
  return { text: '热量适中', color: 'success.main' };
};

/**
 * 计算热量百分比
 * @param {Object} totalNutrition - 总营养数据
 * @param {Object} user - 用户数据
 * @returns {number} - 热量百分比
 */
export const calculateCaloriesPercentage = (totalNutrition, user) => {
  return user && user.dci ? Math.round(totalNutrition.calories / user.dci * 100) : 0;
};