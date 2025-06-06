/**
 * 食谱生成工具
 * 根据每日营养需求标准生成合理的食谱
 * 支持按照食物类别和子类型分配合理的食物重量
 */

import axios from 'axios';
import { calculateFoodNutrition, calculateTotalNutrition } from '../../services/NutritionService';
import { calculateRecipeScoreWithUserData } from '../../services/RecipeScoreService';
import { saveRecipe } from './RecipeService';

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
export const generateRecipeByDailyNeeds = async (foods, dailyNeeds) => {
  if (!foods || foods.length === 0) {
    throw new Error('食物列表为空，无法生成食谱');
  }
  
  if (!dailyNeeds || !dailyNeeds.standardNeeds) {
    throw new Error('每日标准需求数据无效');
  }
  
  const standardNeeds = dailyNeeds.standardNeeds;
  const foodGroups = await groupFoodsByCategory(foods);
  const recipe = {};
  
  // 为每个食物类别生成食谱项目
  for (const category of Object.keys(standardNeeds)) {
    if (!foodGroups[category] || foodGroups[category].length === 0) {
      console.warn(`没有找到${category}类别的食物，跳过此类别`);
      continue;
    }
    
    const needsData = standardNeeds[category];
    const totalRange = needsData.total;
    
    // 确定该类别的总重量范围
    const minTotal = totalRange[0];
    const maxTotal = totalRange[1];
    
    // 随机生成该类别的总重量（以10g为基准）
    const targetTotal = Math.floor((minTotal + Math.random() * (maxTotal - minTotal)) / 10) * 10;
    
    // 根据子类型的比例分配重量
    const subTypes = needsData.subTypes;
    const subTypeItems = [];
    let remainingWeight = targetTotal;
    
    // 为每个子类型选择食物
    for (const subType of Object.keys(subTypes)) {
      if (remainingWeight <= 0) continue;
      
      const subTypeRange = subTypes[subType];
      const minSubWeight = Math.min(subTypeRange[0], remainingWeight);
      const maxSubWeight = Math.min(subTypeRange[1], remainingWeight);
      
      // 如果最小值为0且最大值也为0，则跳过此子类型
      if (minSubWeight === 0 && maxSubWeight === 0) continue;
      
      // 随机生成该子类型的重量（以10g为基准）
      const subTypeWeight = Math.floor((minSubWeight + Math.random() * (maxSubWeight - minSubWeight)) / 10) * 10;
      if (subTypeWeight <= 0) continue;
      
      // 从该类别中随机选择一个食物
      const availableFoods = foodGroups[category].filter(food => 
        food.subCategory === subType || !food.subCategory
      );
      
      if (availableFoods.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableFoods.length);
        const selectedFood = availableFoods[randomIndex];
        
        // 使用NutritionService计算营养成分
        const nutritionInfo = await calculateFoodNutrition(selectedFood.id, subTypeWeight);
        
        subTypeItems.push({
          food: selectedFood,
          amount: subTypeWeight,
          nutritionInfo,
          subType: subType
        });
        
        remainingWeight -= subTypeWeight;
      }
    }
    
    // 如果还有剩余重量，随机分配给已有的食物项目
    if (remainingWeight > 0 && subTypeItems.length > 0) {
      const randomItemIndex = Math.floor(Math.random() * subTypeItems.length);
      const item = subTypeItems[randomItemIndex];
      
      // 更新重量和营养成分
      const newAmount = item.amount + remainingWeight;
      
      item.amount = newAmount;
      item.nutritionInfo = await calculateFoodNutrition(item.food.id, newAmount);
    }
    
    recipe[category] = subTypeItems;
  }

  console.log('简化前的食谱数据:', recipe);
  
  // 将复杂的recipe对象转换为简化格式[{foodId, amount}]
  const simplifiedRecipe = [];
  for (const category of Object.keys(recipe)) {
    for (const item of recipe[category]) {
      simplifiedRecipe.push({
        foodId: item.food.id,
        amount: item.amount
      });
    }
  }
  
  // 输出简化后的食谱数据
  console.log('简化后的食谱数据:', simplifiedRecipe);
  
  return simplifiedRecipe;
};

/**
 * 根据用户数据优化食谱中食物的重量
 * @param {Object} recipe - 初始生成的食谱
 * @param {Object} userData - 用户数据，包含能量和营养素需求
 * @param {Object} dailyNeeds - 每日标准需求数据
 * @returns {Promise<Object>} - 优化后的食谱
 */
export const optimizeRecipeByUserData = async (recipe, userData, dailyNeeds) => {
  console.log(`my input: `, recipe);
  if (!recipe || Object.keys(recipe).length === 0) {
    throw new Error('食谱为空，无法进行优化');
  }
  
  if (!userData || !userData.dci) {
    throw new Error('用户数据无效，无法进行优化');
  }
  
  if (!dailyNeeds || !dailyNeeds.standardNeeds) {
    throw new Error('每日标准需求数据无效');
  }
  
  // 创建食谱的深拷贝，避免修改原始数据
  let optimizedRecipe = JSON.parse(JSON.stringify(recipe));
  const standardNeeds = dailyNeeds.standardNeeds;
  
  
  // 优化迭代次数
  const maxIterations = 100;
  let currentIteration = 0;
  
  // 最佳得分和对应的食谱
  let bestScore = -Infinity;
  let bestRecipe = JSON.parse(JSON.stringify(optimizedRecipe));
  
  console.log(`my input: `, recipe);
  // 优化循环
  while (currentIteration < maxIterations) {
    // 计算当前食谱的得分
    let hasImprovement = false;
    let currentScore = await calculateRecipeScoreWithUserData(recipe, userData, standardNeeds);      

    // 遍历该类别中的每个食物
    for (const item of optimizedRecipe)  {
      // 保存原始重量
      const originalAmount = item.amount;
      
      // 尝试增加10g
      item.amount += 10;
      
      const increaseScore = await calculateRecipeScoreWithUserData(optimizedRecipe, userData, standardNeeds);
      
      // 恢复原始重量
      item.amount = originalAmount;
      
      // 尝试减少10g（只有当原始重量大于等于20g时才尝试减少）
      let decreaseScore = -Infinity;
      if (originalAmount >= 20) {
        item.amount -= 10;
        decreaseScore = await calculateRecipeScoreWithUserData(optimizedRecipe, userData, standardNeeds);
        
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
        bestRecipe = JSON.parse(JSON.stringify(optimizedRecipe));
      }
    }
    
    // 如果没有找到能提高得分的变化，则退出优化循环
    if (!hasImprovement) {
      console.log(`优化在第${currentIteration}次迭代后停止，没有找到更好的解决方案`);
      break;
    }
    
    // 在每次迭代结束时，将optimizedRecipe重置为bestRecipe的副本
    // 这样我们总是从最佳状态开始下一次迭代
    optimizedRecipe = JSON.parse(JSON.stringify(bestRecipe));
    
    currentIteration++;
  }
  
  console.log(`优化完成，最佳得分: ${bestScore.toFixed(2)}，迭代次数: ${currentIteration}`);
  console.log(`最终返回最佳食谱，而不是当前食谱。最佳得分: ${bestScore.toFixed(2)}，当前得分: ${(await calculateRecipeScoreWithUserData(optimizedRecipe, userData, standardNeeds)).toFixed(2)}`);
  
  // 返回优化后的最佳食谱
  return bestRecipe;
};

/**
 * 将生成的食谱保存到食物列表
 * @param {Object} recipe - 优化后的食谱
 * @param {Object} userData - 用户数据
 * @param {Array} recipes - 现有的食谱列表
 * @returns {Promise<Array>} - 更新后的食谱列表
 */
export const saveGeneratedRecipe = async (recipe, userData, recipes) => {
  if (!recipe || Object.keys(recipe).length === 0) {
    throw new Error('食谱为空，无法保存');
  }
  
  if (!userData || !userData.id) {
    throw new Error('用户数据无效，无法保存食谱');
  }
  
  // 将分类食谱转换为扁平列表
  const recipeItems = [];
  
  // 遍历每个类别
  for (const category of Object.keys(recipe)) {
    // 遍历该类别中的每个食物
    for (const item of recipe[category]) {
      recipeItems.push({
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
  console.log('准备计算总营养成分的recipe:', recipe);
  // 计算总营养成分
  const totalNutrition = await calculateTotalNutrition(recipe);
  
  // 生成食谱名称
  const recipeName = `${new Date().toLocaleDateString()}自动生成食谱`;
  
  // 保存食谱
  try {
    const updatedRecipes = await saveRecipe({
      name: recipeName,
      user: userData,
      recipeItems: recipeItems,
      totalNutrition: totalNutrition,
      recipes: recipes,
      saveAsFile: true
    });
    
    console.log('自动生成的食谱已保存');
    return updatedRecipes;
  } catch (error) {
    console.error('保存自动生成的食谱失败:', error);
    throw error;
  }
};
