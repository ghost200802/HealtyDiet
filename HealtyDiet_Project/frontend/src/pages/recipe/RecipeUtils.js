/**
 * 食谱相关工具函数
 */

/**
 * 准备营养素数据用于图表显示
 * @param {Array} recipeItems - 食谱中的食物项目
 * @param {Object} totalNutrition - 食谱的总营养成分
 * @param {string} type - 营养素类型 (calories, protein, carbs, fat)
 * @returns {Array} 排序后的营养素数据
 */
export const prepareNutritionData = (recipeItems, totalNutrition, type) => {
  if (recipeItems.length === 0) return [];
  
  // 根据类型获取相应的营养素数据并按照占比从大到小排序
  return recipeItems
    .map(item => ({
      name: item.foodName,
      value: item[type],
      percent: (item[type] / totalNutrition[type]) * 100
    }))
    .sort((a, b) => b.percent - a.percent);
};

/**
 * 获取食谱的主要食材
 * @param {Array} recipeItems - 食谱中的食物项目
 * @returns {Array} 主要食材列表
 */
export const getMainIngredients = (recipeItems) => {
  if (recipeItems.length === 0) return [];
  
  // 获取能量最多的食材
  const caloriesTop = [...recipeItems].sort((a, b) => b.calories - a.calories)[0];
  
  // 获取蛋白质最多的食材
  const proteinTop = [...recipeItems].sort((a, b) => b.protein - a.protein)[0];
  
  // 获取碳水最多的食材
  const carbsTop = [...recipeItems].sort((a, b) => b.carbs - a.carbs)[0];
  
  // 获取脂肪最多的食材
  const fatTop = [...recipeItems].sort((a, b) => b.fat - a.fat)[0];
  
  // 合并并去重
  const mainIngredients = [];
  const addedIds = new Set();
  
  [caloriesTop, proteinTop, carbsTop, fatTop].forEach(item => {
    if (item && !addedIds.has(item.foodId)) {
      mainIngredients.push({
        foodId: item.foodId,
        foodName: item.foodName
      });
      addedIds.add(item.foodId);
    }
  });
  
  return mainIngredients;
};

/**
 * 计算食谱的总营养成分
 * @param {Array} recipeItems - 食谱中的食物项目
 * @param {Array} foods - 所有食物数据
 * @returns {Object} 总营养成分
 */
export const calculateTotalNutrition = (recipeItems, foods) => {
  if (recipeItems.length === 0) {
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
  }
  
  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };
  
  recipeItems.forEach(item => {
    const food = foods.find(f => f.id === item.foodId);
    if (food) {
      const ratio = item.amount / (food.servingSize || 100); // 默认以100g为标准份量
      totals.calories += food.calories * ratio;
      totals.protein += food.protein * ratio;
      totals.carbs += food.carbs * ratio;
      totals.fat += food.fat * ratio;
    }
  });
  
  // 四舍五入到一位小数
  Object.keys(totals).forEach(key => {
    totals[key] = Math.round(totals[key] * 10) / 10;
  });
  
  return totals;
};