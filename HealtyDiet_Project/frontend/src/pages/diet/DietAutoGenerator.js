/**
 * 食谱生成工具
 * 根据每日营养需求标准生成合理的食谱
 * 支持按照食物类别和子类型分配合理的食物重量
 */

import axios from 'axios';
import { calculateFoodNutrition, calculateTotalNutrition } from '@/services/NutritionService';
import { calculateDietScoreWithUserData } from '@/services/DietScoreService';
import { saveDiet } from '@/pages/diet/DietService';
import { calculateHealthMetrics } from '@/services/HealthMetricsService';

/**
 * 将食物按类别分组
 * @param {Array} foods - 所有可用的食物列表
 * @returns {Object} - 按类别分组的食物
 */
export const groupFoodsByCategory = async (foods) => {
  if (!foods || foods.length === 0) {
    return {};
  }
  
  // 创建一个对象来存储按类别分组的食物
  const foodGroups = {};
  
  // 遍历所有食物
  foods.forEach(food => {
    // 获取食物的类别
    const category = food.type;
    
    // 如果该类别还没有在foodGroups中，则创建一个空数组
    if (!foodGroups[category]) {
      foodGroups[category] = [];
    }
    
    // 将食物添加到对应类别的数组中
    foodGroups[category].push(food);
  });
  
  return foodGroups;
};

/**
 * 根据每日标准需求生成随机食谱
 * @param {Array} foods - 所有可用的食物列表
 * @param {Object} dailyNeeds - 每日标准需求数据
 * @returns {Object} - 按类别分组的食谱项目，简化格式为[{foodId, amount}]
 */
export const generateDietByDailyNeeds = async (foods, dailyNeeds) => {
  if (!foods || foods.length === 0) {
    throw new Error('食物列表为空，无法生成食谱');
  }
  
  if (!dailyNeeds || !dailyNeeds.standardNeeds) {
    throw new Error('每日标准需求数据无效');
  }
  
  const standardNeeds = dailyNeeds.standardNeeds;
  const foodGroups = await groupFoodsByCategory(foods);
  const diet = {};
  
  // 为每个食物类别生成食谱项目
  for (const category of Object.keys(standardNeeds)) {
    if (!foodGroups[category] || foodGroups[category].length === 0) {
      console.warn(`没有找到${category}类别的食物，跳过此类别`);
      continue;
    }
    
    const needsData = standardNeeds[category];
    const subTypes = needsData.subTypes;
    const subTypeItems = [];
    
    // 第一步：为每个下限>0的子类别随机分配一个食物，并设置为随机下限
    for (const subType of Object.keys(subTypes)) {
      const subTypeRange = subTypes[subType];
      const minSubWeight = subTypeRange[0];
      
      // 只处理下限>0的子类别
      if (minSubWeight > 0) {
        // 从该类别中随机选择一个食物
        const availableFoods = foodGroups[category].filter(food => 
          food.subCategory === subType || !food.subCategory
        );
        
        if (availableFoods.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableFoods.length);
          const selectedFood = availableFoods[randomIndex];
          
          // 设置为随机下限（以10g为基准）
          const subTypeWeight = Math.floor(minSubWeight / 10) * 10;
          
          // 使用NutritionService计算营养成分
          const nutritionInfo = await calculateFoodNutrition(selectedFood.id, subTypeWeight);
          
          subTypeItems.push({
            food: selectedFood,
            amount: subTypeWeight,
            nutritionInfo,
            subType: subType
          });
        }
      }
    }
    
    // 第二步：随机生成该类别的总重量（以10g为基准）
    const totalRange = needsData.total;
    const minTotal = totalRange[0];
    const maxTotal = totalRange[1];
    const targetTotal = Math.floor((minTotal + Math.random() * (maxTotal - minTotal)) / 10) * 10;
    
    // 计算当前已分配的总重量
    let currentTotal = subTypeItems.reduce((sum, item) => sum + item.amount, 0);
    
    // 第三步：计算剩余可分配的重量
    let remainingWeight = targetTotal - currentTotal;
    
    // 第四步：将剩余重量随机分配给大类别下，还没有达到随机上限的子类别
    if (remainingWeight > 0 && subTypeItems.length > 0) {
      // 创建可以接收额外重量的子类别列表
      const eligibleItems = subTypeItems.filter(item => {
        const subTypeRange = subTypes[item.subType];
        const maxSubWeight = subTypeRange[1];
        return item.amount < maxSubWeight; // 只有未达到上限的子类别才能接收额外重量
      });
      
      // 如果有可以接收额外重量的子类别
      while (remainingWeight > 0 && eligibleItems.length > 0) {
        // 随机选择一个子类别
        const randomItemIndex = Math.floor(Math.random() * eligibleItems.length);
        const item = eligibleItems[randomItemIndex];
        
        // 计算该子类别还能接收的最大额外重量
        const subTypeRange = subTypes[item.subType];
        const maxSubWeight = subTypeRange[1];
        const maxAdditional = Math.min(maxSubWeight - item.amount, remainingWeight);
        
        // 随机分配10g的倍数的重量
        const additionalWeight = Math.min(maxAdditional, Math.floor(Math.random() * (maxAdditional / 10) + 1) * 10);
        
        if (additionalWeight > 0) {
          // 更新重量和营养成分
          const newAmount = item.amount + additionalWeight;
          item.amount = newAmount;
          item.nutritionInfo = await calculateFoodNutrition(item.food.id, newAmount);
          
          remainingWeight -= additionalWeight;
        }
        
        // 如果该子类别已达到上限，从列表中移除
        if (item.amount >= maxSubWeight) {
          const index = eligibleItems.indexOf(item);
          if (index > -1) {
            eligibleItems.splice(index, 1);
          }
        }
      }
      
      // 如果还有剩余重量且没有可接收的子类别，随机分配给任意子类别
      if (remainingWeight > 0 && subTypeItems.length > 0) {
        const randomItemIndex = Math.floor(Math.random() * subTypeItems.length);
        const item = subTypeItems[randomItemIndex];
        
        // 更新重量和营养成分
        const newAmount = item.amount + remainingWeight;
        item.amount = newAmount;
        item.nutritionInfo = await calculateFoodNutrition(item.food.id, newAmount);
      }
    }
    
    diet[category] = subTypeItems;
  }

  console.log('简化前的食谱数据:', diet);
  
  // 将复杂的diet对象转换为简化格式[{foodId, amount}]
  const simplifiedDiet = [];
  for (const category of Object.keys(diet)) {
    for (const item of diet[category]) {
      simplifiedDiet.push({
        foodId: item.food.id,
        amount: item.amount
      });
    }
  }
  
  // 输出简化后的食谱数据
  console.log('简化后的食谱数据:', simplifiedDiet);
  
  return simplifiedDiet;
};

/**
 * 根据用户数据优化食谱中食物的重量
 * @param {Object} diet - 初始生成的食谱
 * @param {Object} userData - 用户数据，包含能量和营养素需求
 * @param {Object} dailyNeeds - 每日标准需求数据
 * @returns {Promise<Object>} - 优化后的食谱
 */
export const optimizeDietByUserData = async (diet, userData, dailyNeeds) => {
  console.log(`my input: `, diet);
  if (!diet || Object.keys(diet).length === 0) {
    throw new Error('食谱为空，无法进行优化');
  }
  
  // 检查用户数据是否完整，如果不完整则使用HealthMetricsService补全
  if (!userData) {
    throw new Error('用户数据无效，无法进行优化');
  }
  
  // 如果用户数据不包含dci等营养素需求，则使用HealthMetricsService计算
  if (!userData.dci || !userData.protein || !userData.fat || !userData.carbs) {
    // 使用头部导入的服务
    
    // 计算健康指标
    const healthMetrics = calculateHealthMetrics(userData);
    
    // 如果计算结果有效，则补充到用户数据中
    if (healthMetrics) {
      userData = {
        ...userData,
        dci: healthMetrics.dci || userData.dci,
        protein: healthMetrics.protein || userData.protein,
        fat: healthMetrics.fat || userData.fat,
        carbs: healthMetrics.carbs || userData.carbs
      };
      console.log('用户数据已补全:', userData);
    } else {
      throw new Error('无法计算用户健康指标，请完善用户资料');
    }
  }
  
  if (!dailyNeeds || !dailyNeeds.standardNeeds) {
    throw new Error('每日标准需求数据无效');
  }
  
  // 创建食谱的深拷贝，避免修改原始数据
  let optimizedDiet = JSON.parse(JSON.stringify(diet));
  const standardNeeds = dailyNeeds.standardNeeds;
  
  
  // 优化迭代次数
  const maxIterations = 100;
  let currentIteration = 0;
  
  // 最佳得分和对应的食谱
  let bestScore = -Infinity;
  let bestDiet = JSON.parse(JSON.stringify(optimizedDiet));
  
  console.log(`my input: `, diet);
  // 优化循环
  while (currentIteration < maxIterations) {
    // 计算当前食谱的得分
    let hasImprovement = false;
    let currentScoreResult = calculateDietScoreWithUserData(diet, userData, standardNeeds);
    let currentScore = currentScoreResult.score;      

    // 遍历该类别中的每个食物
    for (const item of optimizedDiet)  {
      // 保存原始重量
      const originalAmount = item.amount;
      
      // 尝试增加10g
      item.amount += 10;
      
      const increaseScoreResult = calculateDietScoreWithUserData(optimizedDiet, userData, standardNeeds);
      const increaseScore = increaseScoreResult.score;
      
      // 恢复原始重量
      item.amount = originalAmount;
      
      // 尝试减少10g（只有当原始重量大于等于20g时才尝试减少）
      let decreaseScore = -Infinity;
      if (originalAmount >= 20) {
        item.amount -= 10;
        const decreaseScoreResult = calculateDietScoreWithUserData(optimizedDiet, userData, standardNeeds);
        decreaseScore = decreaseScoreResult.score;
        
        // 恢复原始重量
        item.amount = originalAmount;
      }
      
      // 比较增加和减少的得分，选择更高的一个
      // 只有当得分真正提高时才考虑变化
      let maxScore = -Infinity;
      let changeAmount = 0;
      
      // 只有当增加得分大于当前得分时，才考虑增加
      if (increaseScore > currentScore) {
        maxScore = increaseScore;
        changeAmount = 10;
      }
      
      // 只有当减少得分大于当前得分且大于增加得分时，才考虑减少
      if (decreaseScore > currentScore && decreaseScore > maxScore) {
        maxScore = decreaseScore;
        changeAmount = -10;
      }
      
      // 只有当找到了能提高得分的变化时，才应用变化
      if (maxScore > currentScore) {
        console.log(`找到更好的变化: ${item.foodId} ${changeAmount > 0 ? '增加' : '减少'} ${Math.abs(changeAmount)}g, 得分从 ${currentScore.toFixed(3)} 提高到 ${maxScore.toFixed(3)}`);
        // 应用变化
        item.amount += changeAmount;
        
        // 更新当前得分
        currentScore = maxScore;
        hasImprovement = true;

        bestScore = currentScore;
        bestDiet = JSON.parse(JSON.stringify(optimizedDiet));
      }
    }
    
    // 如果没有找到能提高得分的变化，则退出优化循环
    if (!hasImprovement) {
      console.log(`优化在第${currentIteration}次迭代后停止，没有找到更好的解决方案`);
      break;
    }
    
    // 在每次迭代结束时，将optimizedDiet重置为bestDiet的副本
    // 这样我们总是从最佳状态开始下一次迭代
    optimizedDiet = JSON.parse(JSON.stringify(bestDiet));
    
    currentIteration++;
  }
  
  console.log(`优化完成，最佳得分: ${bestScore.toFixed(2)}，迭代次数: ${currentIteration}`);
  const finalScoreResult = calculateDietScoreWithUserData(optimizedDiet, userData, standardNeeds);
  console.log(`最终返回最佳食谱，而不是当前食谱。最佳得分: ${bestScore.toFixed(2)}，当前得分: ${finalScoreResult.score.toFixed(2)}`);
  console.log('当前食谱得分详情:', finalScoreResult.detail);
  
  // 返回优化后的最佳食谱
  return bestDiet;
};

/**
 * 将生成的食谱保存到食物列表
 * @param {Object} diet - 优化后的食谱
 * @param {Object} userData - 用户数据
 * @param {Array} diets - 现有的食谱列表
 * @returns {Promise<Array>} - 更新后的食谱列表
 */
export const saveGeneratedDiet = async (diet, userData, diets) => {
  if (!diet || Object.keys(diet).length === 0) {
    throw new Error('食谱为空，无法保存');
  }
  
  if (!userData || !userData.id) {
    throw new Error('用户数据无效，无法保存食谱');
  }
  
  // 将分类食谱转换为扁平列表
  const dietItems = [];
  
  // 遍历每个类别
  for (const category of Object.keys(diet)) {
    // 遍历该类别中的每个食物
    for (const item of diet[category]) {
      dietItems.push({
        foodId: item.food.id,
        foodName: item.food.name,
        amount: item.amount,
        calories: item.nutritionInfo.calories,
        protein: item.nutritionInfo.protein,
        carbs: item.nutritionInfo.carbs,
        fat: item.nutritionInfo.fat,
        fiber: item.nutritionInfo.fiber || 0,
        category: category,
        subType: item.subType
      });
    }
  }
  
  // 计算总营养成分
  console.log('准备计算总营养成分的diet:', diet);
  // 计算总营养成分
  const totalNutrition = calculateTotalNutrition(diet);
  
  // 生成食谱名称
  const dietName = `${new Date().toLocaleDateString()}自动生成食谱`;
  
  // 保存食谱
  try {
    const updatedDiets = await saveDiet({
      name: dietName,
      user: userData,
      dietItems: dietItems,
      totalNutrition: totalNutrition,
      diets: diets,
      saveAsFile: true
    });
    
    console.log('自动生成的食谱已保存');
    return updatedDiets;
  } catch (error) {
    console.error('保存自动生成的食谱失败:', error);
    throw error;
  }
};
