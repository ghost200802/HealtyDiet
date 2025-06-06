/**
 * 食谱评分服务
 * 提供食谱评分相关的功能
 */

import { calculateTotalNutrition } from './NutritionService';
import { flattenCategoryRecipe } from '../pages/recipe/RecipeAutoGenerator';

/**
 * 使用用户数据计算食谱得分
 * @param {Object} recipe - 要计算得分的食谱
 * @param {Object} user - 用户数据
 * @param {Object} standardNeeds - 标准需求数据
 * @returns {number} - 食谱的总得分
 */
export const calculateRecipeScoreWithUserData = (recipe, user, standardNeeds) => {
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
 * @param {Object} recipe - 要计算得分的食谱
 * @param {Object} targetValues - 目标营养值
 * @param {Object} standardNeeds - 标准需求数据
 * @returns {number} - 食谱的总得分
 */
export const calculateRecipeScore = (recipe, targetValues, standardNeeds) => {
  // 将食谱转换为扁平列表，便于计算总营养成分
  const items = flattenCategoryRecipe(recipe);
  const nutrition = calculateTotalNutrition(items.map(item => ({
    ...item,
    calories: item.nutritionInfo.calories,
    protein: item.nutritionInfo.protein,
    carbs: item.nutritionInfo.carbs,
    fat: item.nutritionInfo.fat,
    fiber: item.nutritionInfo.fiber
  })));
  
  // 获取目标值
  const targetCalories = targetValues.dci || 2000; // 默认2000千卡
  const targetProtein = targetValues.protein || 75; // 默认75克
  const targetCarbs = targetValues.carbs || 250; // 默认250克
  const targetFat = targetValues.fat || 55; // 默认55克
  const targetFiber = targetValues.fiber || 25; // 默认25克纤维素
  
  // 计算各项得分（越接近目标值，得分越高）
  // 能量得分（占比5%）
  const caloriesScore = 5 * (1 - Math.abs(nutrition.calories - targetCalories) / targetCalories);
  
  // 三大营养素和纤维素得分（各占比20%）
  const proteinScore = 20 * (1 - Math.abs(nutrition.protein - targetProtein) / targetProtein);
  const carbsScore = 20 * (1 - Math.abs(nutrition.carbs - targetCarbs) / targetCarbs);
  const fatScore = 20 * (1 - Math.abs(nutrition.fat - targetFat) / targetFat);
  const fiberScore = 5 * (1 - Math.abs(nutrition.fiber - targetFiber) / targetFiber);
  
  // 类别重量限制得分（占比20%）
  let categoryLimitsScore = 0;
  let categoryViolations = 0;
  
  // 检查每个类别的总重量是否在限制范围内
  Object.keys(recipe).forEach(category => {
    if (standardNeeds[category]) {
      const totalRange = standardNeeds[category].total;
      const minTotal = totalRange[0];
      const maxTotal = totalRange[1];
      
      // 计算该类别的总重量
      const categoryTotal = recipe[category].reduce((sum, item) => sum + item.amount, 0);
      
      // 如果超出范围，减少得分
      if (categoryTotal < minTotal || categoryTotal > maxTotal) {
        categoryViolations++;
      }
    }
  });
  
  // 根据违反类别限制的数量调整得分
  if (categoryViolations > 0) {
    categoryLimitsScore = Math.max(0, 50 - (categoryViolations * 20));
  }
  
  // 计算总得分
  const totalScore = caloriesScore + proteinScore + carbsScore + fatScore + fiberScore + categoryLimitsScore;
  
  // 调试输出 - 显示各项得分和总得分
  // console.log('===== 食谱评分详情 =====');
  // console.log(`营养成分: 热量=${nutrition.calories.toFixed(3)}kcal, 蛋白质=${nutrition.protein.toFixed(2)}g, 碳水=${nutrition.carbs.toFixed(2)}g, 脂肪=${nutrition.fat.toFixed(2)}g, 纤维素=${nutrition.fiber.toFixed(2)}g`);
  // console.log(`目标值: 热量=${targetCalories}kcal, 蛋白质=${targetProtein}g, 碳水=${targetCarbs}g, 脂肪=${targetFat}g, 纤维素=${targetFiber}g`);
  // console.log(`热量得分: ${caloriesScore.toFixed(3)} (占比5%)`);
  // console.log(`蛋白质得分: ${proteinScore.toFixed(3)} (占比20%)`);
  // console.log(`碳水得分: ${carbsScore.toFixed(3)} (占比20%)`);
  // console.log(`脂肪得分: ${fatScore.toFixed(3)} (占比20%)`);
  // console.log(`纤维素得分: ${fiberScore.toFixed(3)} (占比5%)`);
  // console.log(`类别限制得分: ${categoryLimitsScore.toFixed(3)} (占比30%)`);
  // console.log(`类别违规数量: ${categoryViolations}`);
  console.log(`总得分: ${totalScore.toFixed(3)}`);
  // console.log('========================');
  
  return totalScore;
};

/**
 * 获取食谱评分的详细信息
 * @param {Object} recipe - 要计算得分的食谱
 * @param {Object} targetValues - 目标营养值
 * @param {Object} standardNeeds - 标准需求数据
 * @returns {Object} - 包含各项得分和总得分的对象
 */
export const getRecipeScoreDetails = (recipe, targetValues, standardNeeds) => {
  // 将食谱转换为扁平列表，便于计算总营养成分
  const items = flattenCategoryRecipe(recipe);
  const nutrition = calculateTotalNutrition(items.map(item => ({
    ...item,
    calories: item.nutritionInfo.calories,
    protein: item.nutritionInfo.protein,
    carbs: item.nutritionInfo.carbs,
    fat: item.nutritionInfo.fat,
    fiber: item.nutritionInfo.fiber
  })));
  
  // 获取目标值
  const targetCalories = targetValues.dci || 2000; // 默认2000千卡
  const targetProtein = targetValues.protein || 75; // 默认75克
  const targetCarbs = targetValues.carbs || 250; // 默认250克
  const targetFat = targetValues.fat || 55; // 默认55克
  const targetFiber = targetValues.fiber || 25; // 默认25克纤维素
  
  // 计算各项得分（越接近目标值，得分越高）
  // 能量得分（占比5%）
  const caloriesScore = 5 * (1 - Math.abs(nutrition.calories - targetCalories) / targetCalories);
  
  // 三大营养素和纤维素得分（各占比20%）
  const proteinScore = 20 * (1 - Math.abs(nutrition.protein - targetProtein) / targetProtein);
  const carbsScore = 20 * (1 - Math.abs(nutrition.carbs - targetCarbs) / targetCarbs);
  const fatScore = 20 * (1 - Math.abs(nutrition.fat - targetFat) / targetFat);
  const fiberScore = 5 * (1 - Math.abs(nutrition.fiber - targetFiber) / targetFiber);
  
  // 类别重量限制得分（占比20%）
  let categoryLimitsScore = 0;
  let categoryViolations = 0;
  
  // 检查每个类别的总重量是否在限制范围内
  Object.keys(recipe).forEach(category => {
    if (standardNeeds[category]) {
      const totalRange = standardNeeds[category].total;
      const minTotal = totalRange[0];
      const maxTotal = totalRange[1];
      
      // 计算该类别的总重量
      const categoryTotal = recipe[category].reduce((sum, item) => sum + item.amount, 0);
      
      // 如果超出范围，减少得分
      if (categoryTotal < minTotal || categoryTotal > maxTotal) {
        categoryViolations++;
      }
    }
  });
  
  // 根据违反类别限制的数量调整得分
  if (categoryViolations > 0) {
    categoryLimitsScore = Math.max(0, 50 - (categoryViolations * 20));
  }
  
  // 计算总得分
  const totalScore = caloriesScore + proteinScore + carbsScore + fatScore + fiberScore + categoryLimitsScore;
  
  return {
    nutrition,
    targetValues: {
      calories: targetCalories,
      protein: targetProtein,
      carbs: targetCarbs,
      fat: targetFat,
      fiber: targetFiber
    },
    scores: {
      calories: caloriesScore,
      protein: proteinScore,
      carbs: carbsScore,
      fat: fatScore,
      fiber: fiberScore,
      categoryLimits: categoryLimitsScore
    },
    categoryViolations,
    totalScore
  };
};