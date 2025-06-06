/**
 * 营养素计算服务
 * 提供统一的营养素计算功能，包括单个食物、食谱项目和整个食谱的营养素计算
 */

/**
 * 计算单个食物的营养素含量
 * @param {string} foodId - 食物ID
 * @param {number} amount - 食物重量(克)
 * @param {Array} nutrients - 需要计算的营养素列表，默认为所有基本营养素
 * @returns {Object} - 计算后的营养素含量
 */
export const calculateFoodNutrition = async (foodId, amount, nutrients = ['calories', 'protein', 'carbs', 'fat', 'fiber']) => {
  if (!foodId) {
    throw new Error('食物ID不能为空');
  }
  
  if (!amount || amount <= 0) {
    throw new Error('食物重量必须大于0');
  }
  
  // 从FoodService获取食物信息
  const { getFoodById } = await import('./FoodService');
  const food = await getFoodById(foodId);
  
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
 * @returns {Promise<Object>} - 食谱项目对象，包含食物ID、名称、重量和营养素含量
 */
export const calculateRecipeItem = async (foodId, amount) => {
  if (!foodId) {
    throw new Error('食物ID不能为空');
  }
  
  if (!amount || amount <= 0) {
    throw new Error('食物重量必须大于0');
  }
  
  // 从FoodService获取食物信息以获取名称
  const { getFoodById } = await import('./FoodService');
  const food = await getFoodById(foodId);
  
  if (!food) {
    throw new Error(`未找到ID为${foodId}的食物`);
  }
  
  const nutrition = await calculateFoodNutrition(foodId, amount);
  
  return {
    foodId: foodId,
    foodName: food.name,
    amount: amount,
    ...nutrition
  };
};

/**
 * 计算食谱的总营养成分
 * @param {Array} recipeItems - 食谱中的食物项目
 * @param {Array} foods - 所有食物数据（可选，如果recipeItems中已包含完整营养信息则不需要）
 * @returns {Promise<Object>} - 总营养成分
 */
export const calculateTotalNutrition = async (recipeItems, foods = []) => {
  console.log('calculateTotalNutrition 调用:', { recipeItemsLength: recipeItems?.length, foodsLength: foods?.length });
  
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
  
  // 收集需要从服务器获取的食物ID
  const foodIdsToFetch = [];
  const itemsWithoutNutrition = [];
  
  // 先处理已有营养信息的项目，并收集需要获取的食物ID
  for (let index = 0; index < recipeItems.length; index++) {
    const item = recipeItems[index];
    console.log(`处理食谱项目 ${index}:`, item);
    // 如果recipeItems中已包含完整营养信息，直接使用
    if (item.calories !== undefined && item.protein !== undefined && 
        item.carbs !== undefined && item.fat !== undefined) {
      totals.calories += item.calories || 0;
      totals.protein += item.protein || 0;
      totals.carbs += item.carbs || 0;
      totals.fat += item.fat || 0;
      totals.fiber += item.fiber || 0;
      console.log(`项目 ${index} 已有营养信息，直接累加`);
    } 
    // 否则，需要获取食物信息
    else if (item.foodId) {
      // 先检查传入的foods中是否有该食物
      const food = foods.length > 0 ? foods.find(f => f.id === item.foodId) : null;
      
      if (food) {
        console.log(`项目 ${index} 在传入的foods中找到食物:`, food.name);
        try {
          const nutrition = await calculateFoodNutrition(food.id, item.amount);
          totals.calories += nutrition.calories;
          totals.protein += nutrition.protein;
          totals.carbs += nutrition.carbs;
          totals.fat += nutrition.fat;
          totals.fiber += nutrition.fiber;
        } catch (error) {
          console.error(`计算食物营养素失败:`, error);
        }
      } else {
        // 需要从服务器获取的食物
        console.log(`项目 ${index} 需要从服务器获取食物信息，ID:`, item.foodId);
        foodIdsToFetch.push(item.foodId);
        itemsWithoutNutrition.push(item);
      }
    } else {
      console.warn(`项目 ${index} 没有营养信息也没有foodId:`, item);
    }
  }
  
  // 如果有需要获取的食物，从服务器批量获取
  if (foodIdsToFetch.length > 0) {
    console.log('需要从服务器获取的食物IDs:', foodIdsToFetch);
    try {
      // 动态导入FoodService，避免循环依赖
      const { getFoodsByIds } = await import('./FoodService');
      const fetchedFoods = await getFoodsByIds(foodIdsToFetch);
      console.log('获取到的食物数据:', fetchedFoods);
      
      // 处理获取到的食物
      for (const item of itemsWithoutNutrition) {
        const food = fetchedFoods.find(f => f.id === item.foodId);
        if (food) {
          try {
            const nutrition = await calculateFoodNutrition(item.foodId, item.amount);
            totals.calories += nutrition.calories;
            totals.protein += nutrition.protein;
            totals.carbs += nutrition.carbs;
            totals.fat += nutrition.fat;
            totals.fiber += nutrition.fiber;
          } catch (error) {
            console.error(`计算食物营养素失败:`, error);
          }
        } else {
          console.warn(`未找到ID为${item.foodId}的食物数据`);
        }
      }
    } catch (error) {
      console.error('获取食物数据失败:', error);
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
 * 计算食谱的总营养成分（异步版本）
 * @param {Array} recipeItems - 食谱中的食物项目
 * @param {Array} foods - 所有食物数据（可选，如果recipeItems中已包含完整营养信息则不需要）
 * @returns {Promise<Object>} - 总营养成分
 */
export const calculateTotalNutritionAsync = async (recipeItems, foods = []) => {
  console.log('calculateTotalNutritionAsync 调用:', { recipeItemsLength: recipeItems?.length, foodsLength: foods?.length });
  
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
  
  // 收集需要从服务器获取的食物ID
  const foodIdsToFetch = [];
  const itemsWithoutNutrition = [];
  
  // 先处理已有营养信息的项目，并收集需要获取的食物ID
  for (let index = 0; index < recipeItems.length; index++) {
    const item = recipeItems[index];
    console.log(`处理食谱项目 ${index}:`, item);
    // 如果recipeItems中已包含完整营养信息，直接使用
    if (item.calories !== undefined && item.protein !== undefined && 
        item.carbs !== undefined && item.fat !== undefined) {
      totals.calories += item.calories || 0;
      totals.protein += item.protein || 0;
      totals.carbs += item.carbs || 0;
      totals.fat += item.fat || 0;
      totals.fiber += item.fiber || 0;
      console.log(`项目 ${index} 已有营养信息，直接累加`);
    } 
    // 否则，需要获取食物信息
    else if (item.foodId) {
      // 先检查传入的foods中是否有该食物
      const food = foods.length > 0 ? foods.find(f => f.id === item.foodId) : null;
      
      if (food) {
        console.log(`项目 ${index} 在传入的foods中找到食物:`, food.name);
        try {
          const nutrition = await calculateFoodNutrition(food.id, item.amount);
          totals.calories += nutrition.calories;
          totals.protein += nutrition.protein;
          totals.carbs += nutrition.carbs;
          totals.fat += nutrition.fat;
          totals.fiber += nutrition.fiber;
        } catch (error) {
          console.error(`计算食物营养素失败:`, error);
        }
      } else {
        // 需要从服务器获取的食物
        console.log(`项目 ${index} 需要从服务器获取食物信息，ID:`, item.foodId);
        foodIdsToFetch.push(item.foodId);
        itemsWithoutNutrition.push(item);
      }
    } else {
      console.warn(`项目 ${index} 没有营养信息也没有foodId:`, item);
    }
  }
  
  // 如果有需要获取的食物，从服务器批量获取
  if (foodIdsToFetch.length > 0) {
    try {
      console.log('从服务器获取食物数据:', foodIdsToFetch);
      // 动态导入FoodService，避免循环依赖
      const { getFoodsByIds } = await import('./FoodService');
      const fetchedFoods = await getFoodsByIds(foodIdsToFetch);
      console.log('获取到的食物数据:', fetchedFoods);
      
      // 处理获取到的食物
      for (const item of itemsWithoutNutrition) {
        const food = fetchedFoods.find(f => f.id === item.foodId);
        if (food) {
          try {
            const nutrition = await calculateFoodNutrition(item.foodId, item.amount);
            totals.calories += nutrition.calories;
            totals.protein += nutrition.protein;
            totals.carbs += nutrition.carbs;
            totals.fat += nutrition.fat;
            totals.fiber += nutrition.fiber;
          } catch (error) {
            console.error(`计算食物营养素失败:`, error);
          }
        } else {
          console.warn(`未找到ID为${item.foodId}的食物数据`);
        }
      }
    } catch (error) {
      console.error('获取食物数据失败:', error);
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
 * @param {Array} recipeItems - 食谱中的食物项目
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
  
  // 根据类型获取相应的营养素数据并按照占比从大到小排序
  return recipeItems
    .map(item => ({
      name: item.foodName,
      value: item[type] || 0, // 确保值存在，如果不存在则默认为0
      percent: ((item[type] || 0) / totalNutrition[type]) * 100
    }))
    .sort((a, b) => b.percent - a.percent);
};