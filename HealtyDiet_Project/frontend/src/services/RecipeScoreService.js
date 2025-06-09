/**
 * 食谱评分服务
 * 提供食谱评分相关的功能
 */

import { calculateTotalNutrition } from './NutritionService';

/**
 * 根据得分生成建议
 * @param {number} score - 得分（0-100）
 * @param {string} nutrientName - 营养素名称
 * @param {number} currentValue - 当前值
 * @param {number} targetValue - 目标值
 * @returns {Object} - 包含建议文本和颜色的对象
 */
const getSuggestionByScore = (score, nutrientName, currentValue, targetValue) => {
  // 计算当前值与目标值的差距百分比
  const difference = currentValue - targetValue;
  const percentDiff = Math.round((difference / targetValue) * 100);
  
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
 * 使用用户数据计算食谱得分
 * @param {Array} recipe - 要计算得分的食谱，简化的[{foodId, amount}]数组格式
 * @param {Object} user - 用户数据
 * @param {Object} standardNeeds - 标准需求数据
 * @returns {Promise<Object>} - 包含总得分和各项得分详情的对象
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
 * @returns {Promise<Object>} - 包含总得分和各项得分详情的对象
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
  // 能量得分
  const caloriesScore = (1 - Math.abs(nutrition.calories - targetCalories) / targetCalories);
  
  // 三大营养素和纤维素得分
  const proteinScore = (1 - Math.abs(nutrition.protein - targetProtein) / targetProtein);
  const carbsScore = (1 - Math.abs(nutrition.carbs - targetCarbs) / targetCarbs);
  const fatScore = (1 - Math.abs(nutrition.fat - targetFat) / targetFat);
  const fiberScore = (1 - Math.abs(nutrition.fiber - targetFiber) / targetFiber);
  
  // 类别重量限制得分
  let categoryLimitsScore = 0;
  let categoryViolations = 0;
  
  // 对于简化格式，给予默认得分
  categoryLimitsScore = 30; // 给一个中等得分
  
  console.log('各项得分计算结果:', {
    caloriesScore,
    proteinScore,
    carbsScore,
    fatScore,
    fiberScore,
    categoryLimitsScore
  });
  
  console.log(`类别限制得分: ${categoryLimitsScore}, 违规数量: ${categoryViolations}`);
  
  // 将各项得分换算成满分100分
  const detail = {
    calories: Math.max(0, Math.min(100, 100*caloriesScore)),
    protein: Math.max(0, Math.min(100, 100*proteinScore)),
    carbs: Math.max(0, Math.min(100, 100*carbsScore)), 
    fat: Math.max(0, Math.min(100, 100*fatScore)),
    fiber: Math.max(0, Math.min(100, 100*fiberScore)),
    categoryLimits: Math.max(0, Math.min(100, 100*categoryLimitsScore))
  };
  
  // 计算总得分（根据各项占比）
  const totalScore = 
    detail.calories * 0.10 + // 能量占比5%
    detail.protein * 0.30 + // 蛋白质占比20%
    detail.carbs * 0.30 + // 碳水占比20%
    detail.fat * 0.10 + // 脂肪占比20%
    detail.fiber * 0.20;// 纤维素占比5%
  
  // 详细的调试输出
  console.log('===== 食谱评分详情 =====');
  console.log(`营养成分: 热量=${nutrition.calories}kcal, 蛋白质=${nutrition.protein}g, 碳水=${nutrition.carbs}g, 脂肪=${nutrition.fat}g, 纤维素=${nutrition.fiber}g`);
  console.log(`目标值: 热量=${targetCalories}kcal, 蛋白质=${targetProtein}g, 碳水=${targetCarbs}g, 脂肪=${targetFat}g, 纤维素=${targetFiber}g`);
  console.log(`热量得分: ${detail.calories.toFixed(2)} (占比5%)`);
  console.log(`蛋白质得分: ${detail.protein.toFixed(2)} (占比20%)`);
  console.log(`碳水得分: ${detail.carbs.toFixed(2)} (占比20%)`);
  console.log(`脂肪得分: ${detail.fat.toFixed(2)} (占比20%)`);
  console.log(`纤维素得分: ${detail.fiber.toFixed(2)} (占比5%)`);
  console.log(`类别限制得分: ${detail.categoryLimits.toFixed(2)} (占比30%)`);
  console.log(`总得分: ${totalScore.toFixed(2)}`);
  console.log('========================');
  
  // 根据各项得分生成改进建议
  const suggestions = {
    calories: getSuggestionByScore(detail.calories, '热量', nutrition.calories, targetCalories),
    protein: getSuggestionByScore(detail.protein, '蛋白质', nutrition.protein, targetProtein),
    carbs: getSuggestionByScore(detail.carbs, '碳水化合物', nutrition.carbs, targetCarbs),
    fat: getSuggestionByScore(detail.fat, '脂肪', nutrition.fat, targetFat),
    fiber: getSuggestionByScore(detail.fiber, '膳食纤维', nutrition.fiber, targetFiber)
  };

  return {
    score: totalScore,
    detail: detail,
    suggestions: suggestions
  };
};
