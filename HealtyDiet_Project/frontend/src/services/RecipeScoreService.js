/**
 * 食谱评分服务
 * 提供食谱评分相关的功能
 */

import { calculateTotalNutrition } from './NutritionService';


/**
 * 使用用户数据计算食谱得分
 * @param {Array} recipe - 要计算得分的食谱，简化的[{foodId, amount}]数组格式
 * @param {Object} user - 用户数据
 * @param {Object} standardNeeds - 标准需求数据
 * @returns {Promise<number>} - 食谱的总得分
 */
export const calculateRecipeScoreWithUserData = async (recipe, user, standardNeeds) => {
  console.log('开始计算食谱得分WithUserData...');
  console.log('recipe:',recipe);
  return calculateRecipeScore(recipe, {
    dci: user.dci,
    protein: user.protein,
    carbs: user.carbs,
    fat: user.fat,
    fiber: user.fiber || 25 // 默认纤维素需求
  }, standardNeeds);
};

/**
 * 计算食谱的得分
 * @param {Array} recipe - 要计算得分的食谱，简化的[{foodId, amount}]数组格式
 * @param {Object} targetValues - 目标营养值
 * @param {Object} standardNeeds - 标准需求数据
 * @returns {Promise<number>} - 食谱的总得分
 */
const calculateRecipeScore = async (recipe, targetValues, standardNeeds) => {
  console.log('开始计算食谱得分...');
  console.log('recipe:',recipe);
  console.log('目标值:', targetValues);
  
  // 使用简化格式的食谱数据（[{foodId, amount}]数组格式）
  console.log('食谱为简化数组格式，直接使用');
  const items = recipe;
  console.log('食谱项目数量:', items.length);
  
  
  // 计算总营养成分
  console.log('调用calculateTotalNutrition计算总营养成分...');
  const nutrition = await calculateTotalNutrition(recipe);
  console.log('计算得到的总营养成分:', nutrition);
  
  // 获取目标值
  const targetCalories = targetValues.dci || 2000; // 默认2000千卡
  const targetProtein = targetValues.protein || 75; // 默认75克
  const targetCarbs = targetValues.carbs || 250; // 默认250克
  const targetFat = targetValues.fat || 55; // 默认55克
  const targetFiber = targetValues.fiber || 25; // 默认25克纤维素
  
  console.log('目标营养值:', {
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFat,
    targetFiber
  });
  
  // 计算各项得分（越接近目标值，得分越高）
  // 能量得分（占比5%）
  const caloriesScore = 5 * (1 - Math.abs(nutrition.calories - targetCalories) / targetCalories);
  
  // 三大营养素和纤维素得分（各占比20%）
  const proteinScore = 20 * (1 - Math.abs(nutrition.protein - targetProtein) / targetProtein);
  const carbsScore = 20 * (1 - Math.abs(nutrition.carbs - targetCarbs) / targetCarbs);
  const fatScore = 20 * (1 - Math.abs(nutrition.fat - targetFat) / targetFat);
  const fiberScore = 5 * (1 - Math.abs(nutrition.fiber - targetFiber) / targetFiber);
  
  console.log('各项得分计算结果:', {
    caloriesScore,
    proteinScore,
    carbsScore,
    fatScore,
    fiberScore
  });
  
  // 类别重量限制得分（占比20%）
  let categoryLimitsScore = 0;
  let categoryViolations = 0;
  
  // 对于简化格式，给予默认得分
  categoryLimitsScore = 30; // 给一个中等得分
  
  // 对于简化格式的食谱数据，已经给了默认得分，不需要再调整
  // categoryLimitsScore = 30; // 已在上面设置
  
  console.log(`类别限制得分: ${categoryLimitsScore}, 违规数量: ${categoryViolations}`);
  
  // 计算总得分
  const totalScore = caloriesScore + proteinScore + carbsScore + fatScore + fiberScore;
  
  // 详细的调试输出
  console.log('===== 食谱评分详情 =====');
  console.log(`营养成分: 热量=${nutrition.calories}kcal, 蛋白质=${nutrition.protein}g, 碳水=${nutrition.carbs}g, 脂肪=${nutrition.fat}g, 纤维素=${nutrition.fiber}g`);
  console.log(`目标值: 热量=${targetCalories}kcal, 蛋白质=${targetProtein}g, 碳水=${targetCarbs}g, 脂肪=${targetFat}g, 纤维素=${targetFiber}g`);
  console.log(`热量得分: ${caloriesScore.toFixed(2)} (占比5%)`);
  console.log(`蛋白质得分: ${proteinScore.toFixed(2)} (占比20%)`);
  console.log(`碳水得分: ${carbsScore.toFixed(2)} (占比20%)`);
  console.log(`脂肪得分: ${fatScore.toFixed(2)} (占比20%)`);
  console.log(`纤维素得分: ${fiberScore.toFixed(2)} (占比5%)`);
  console.log(`类别限制得分: ${categoryLimitsScore.toFixed(2)} (占比30%)`);
  console.log(`总得分: ${totalScore.toFixed(2)}`);
  console.log('========================');
  
  return totalScore;
};
