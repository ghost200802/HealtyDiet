/**
 * 食谱评分服务
 * 提供食谱评分相关的功能
 */

import { calculateTotalNutrition } from '@/services/NutritionService';
import { getFoodByIdSync } from '@/services/FoodService';

/**
 * 计算食谱中各类型和子类型的食物重量
 * @param {Array} items - 食谱项目，格式为[{foodId, amount}]
 * @param {Object} standardNeeds - 标准需求数据
 * @returns {Object} - 包含类型和子类型重量统计的对象
 */
const calculateFoodTypeWeights = (items, standardNeeds) => {
  // 按类型和子类型统计食物重量
  const typeWeights = {};
  const subtypeWeights = {};
  
  // 初始化类型和子类型的重量统计
  Object.keys(standardNeeds).forEach(type => {
    if (standardNeeds[type]) {
      typeWeights[type] = 0;
      subtypeWeights[type] = {};
      
      if (standardNeeds[type]?.subTypes) {
        Object.keys(standardNeeds[type].subTypes).forEach(subType => {
          subtypeWeights[type][subType] = 0;
        });
      }
    }
  });
  
  // 统计各类型和子类型的食物重量
  for (const item of items) {
    try {
      const food = getFoodByIdSync(item.foodId);
      if (food && food.type) {
        // 累加类型重量
        if (typeWeights[food.type] !== undefined) {
          typeWeights[food.type] += item.amount;
        } else {
          console.log(`警告: 食物类型 ${food.type} 不在标准需求中`);
        }
        
        // 累加子类型重量
        if (food.subType && subtypeWeights[food.type]) {
          if (subtypeWeights[food.type][food.subType] !== undefined) {
            subtypeWeights[food.type][food.subType] += item.amount;
          } else {
            console.log(`警告: 食物子类型 ${food.type}/${food.subType} 不在标准需求中`);
          }
        }
      }
    } catch (error) {
      console.error(`获取食物信息失败:`, error);
    }
  }
  
  return { typeWeights, subtypeWeights };
};


/**
 * 使用用户数据计算食谱得分
 * @param {Array} diet - 要计算得分的食谱，简化的[{foodId, amount}]数组格式
 * @param {Object} user - 用户数据
 * @param {Object} standardNeeds - 标准需求数据
 * @returns {Object} - 包含总得分和各项得分详情的对象
 */
export const calculateDietScoreWithUserData = (diet, user, standardNeeds) => {
  console.log('开始计算食谱得分WithUserData...');
  console.log('diet:',diet);
  return calculateDietScore(diet, {
    dci: user.dci,
    protein: user.protein,
    carbs: user.carbs,
    fat: user.fat,
    fiber: user.fiber || 25 // 默认纤维素需求
  }, standardNeeds);
};

/**
 * 计算食谱的得分
 * @param {Array} diet - 要计算得分的食谱，简化的[{foodId, amount}]数组格式
 * @param {Object} targetValues - 目标营养值
 * @param {Object} standardNeeds - 标准需求数据
 * @returns {Object} - 包含总得分和各项得分详情的对象
 */
const calculateDietScore = (diet, targetValues, standardNeeds) => {
  console.log('开始计算食谱得分...');
  console.log('diet:',diet);
  console.log('目标值:', targetValues);
  
  // 使用简化格式的食谱数据（[{foodId, amount}]数组格式）
  console.log('食谱为简化数组格式，直接使用');
  const items = diet;
  console.log('食谱项目数量:', items.length);
  
  
  // 计算总营养成分
  console.log('调用calculateTotalNutrition计算总营养成分...');
  const nutrition = calculateTotalNutrition(diet);
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
  const calculateNutrientScore = (currentValue, targetValue) => {
    return 1 - Math.abs(currentValue - targetValue) / targetValue;
  };
  
  // 能量得分
  const caloriesScore = calculateNutrientScore(nutrition.calories, targetCalories);
  
  // 三大营养素和纤维素得分
  const proteinScore = calculateNutrientScore(nutrition.protein, targetProtein);
  const carbsScore = calculateNutrientScore(nutrition.carbs, targetCarbs);
  const fatScore = calculateNutrientScore(nutrition.fat, targetFat);
  const fiberScore = calculateNutrientScore(nutrition.fiber, targetFiber);
  
  // 类别重量限制得分
  let categoryLimitsScore = 0;
  let categoryViolations = 0;
  
  // // 根据食物类型和子类型计算重量限制得分
  // if (standardNeeds && typeof standardNeeds === 'object') {
  //   // 计算各类型和子类型的食物重量
  //   const { typeWeights, subtypeWeights } = calculateFoodTypeWeights(items, standardNeeds);
    
  //   console.log('类型重量统计:', typeWeights);
  //   console.log('子类型重量统计:', subtypeWeights);
    
  //   // 检查各类型和子类型是否满足标准需求
  //   Object.keys(standardNeeds).forEach(type => {
  //     const typeRange = standardNeeds[type]?.total;
  //     const typeWeight = typeWeights[type];
      
  //     // 检查类型重量是否在范围内
  //     if (typeRange && (typeWeight < typeRange[0] || typeWeight > typeRange[1])) {
  //       categoryViolations++;
  //       // 类型不满足扣15分
  //       categoryLimitsScore -= 15;
  //       console.log(`${type}类别重量不满足要求: ${typeWeight}g, 应为${typeRange[0]}-${typeRange[1]}g`);
  //     }
      
  //     // 检查子类型重量
  //     if (standardNeeds[type]?.subTypes) {
  //       Object.keys(standardNeeds[type].subTypes).forEach(subType => {
  //         const subTypeRange = standardNeeds[type].subTypes[subType];
  //         const subTypeWeight = subtypeWeights[type]?.[subType];
          
  //         // 检查子类型重量是否在范围内
  //         if (subTypeRange && subTypeWeight !== undefined && (subTypeWeight < subTypeRange[0] || subTypeWeight > subTypeRange[1])) {
  //           categoryViolations++;
  //           // 子类型不满足扣5分
  //           categoryLimitsScore -= 5;
  //           console.log(`${type}类别的${subType}子类别重量不满足要求: ${subTypeWeight}g, 应为${subTypeRange[0]}-${subTypeRange[1]}g`);
  //         }
  //       });
  //     }
  //   });
  // }
  
  // // 确保得分不会低于-100
  // categoryLimitsScore = Math.max(categoryLimitsScore, -100);
  
  console.log('各项得分计算结果:', {
    caloriesScore,
    proteinScore,
    carbsScore,
    fatScore,
    fiberScore,
    categoryLimitsScore
  });
  
  console.log(`类别限制得分: ${categoryLimitsScore}, 违规数量: ${categoryViolations}`);

  // 计算总得分（根据各项占比）
  const totalScore = 
    caloriesScore * 20 + // 能量占比20%
    proteinScore * 30 + // 蛋白质占比30%
    carbsScore * 30 + // 碳水占比30%
    fatScore * 10 + // 脂肪占比10%
    fiberScore * 10 + // 纤维素占比10%
    categoryLimitsScore * 0.3; // 类别限制得分占比30%
  
  // 详细的调试输出
  console.log('===== 食谱评分详情 =====');
  console.log(`营养成分: 热量=${nutrition.calories}kcal, 蛋白质=${nutrition.protein}g, 碳水=${nutrition.carbs}g, 脂肪=${nutrition.fat}g, 纤维素=${nutrition.fiber}g`);
  console.log(`目标值: 热量=${targetCalories}kcal, 蛋白质=${targetProtein}g, 碳水=${targetCarbs}g, 脂肪=${targetFat}g, 纤维素=${targetFiber}g`);
  console.log(`热量得分: ${caloriesScore.toFixed(2)} (占比10%)`);
  console.log(`蛋白质得分: ${proteinScore.toFixed(2)} (占比20%)`);
  console.log(`碳水得分: ${carbsScore.toFixed(2)} (占比20%)`);
  console.log(`脂肪得分: ${fatScore.toFixed(2)} (占比10%)`);
  console.log(`纤维素得分: ${fiberScore.toFixed(2)} (占比10%)`);
  console.log(`类别限制得分: ${categoryLimitsScore.toFixed(2)} (占比30%), 违规数量: ${categoryViolations}`);
  console.log(`总得分: ${totalScore.toFixed(2)}`);
  console.log('========================');

  return {
    score: totalScore,
    nutrition: nutrition
  };
};
