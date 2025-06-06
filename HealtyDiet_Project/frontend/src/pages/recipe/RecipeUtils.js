/**
 * 食谱相关工具函数
 */

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