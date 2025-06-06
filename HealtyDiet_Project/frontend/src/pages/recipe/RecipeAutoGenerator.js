/**
 * 食谱生成工具
 * 根据每日营养需求标准生成合理的食谱
 * 支持按照食物类别和子类型分配合理的食物重量
 */

import axios from 'axios';
import { calculateFoodNutrition } from '../../services/NutritionService';

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
 * @returns {Object} - 按类别分组的食谱项目
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
  Object.keys(standardNeeds).forEach(category => {
    if (!foodGroups[category] || foodGroups[category].length === 0) {
      console.warn(`没有找到${category}类别的食物，跳过此类别`);
      return;
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
    Object.keys(subTypes).forEach(subType => {
      if (remainingWeight <= 0) return;
      
      const subTypeRange = subTypes[subType];
      const minSubWeight = Math.min(subTypeRange[0], remainingWeight);
      const maxSubWeight = Math.min(subTypeRange[1], remainingWeight);
      
      // 如果最小值为0且最大值也为0，则跳过此子类型
      if (minSubWeight === 0 && maxSubWeight === 0) return;
      
      // 随机生成该子类型的重量（以10g为基准）
      const subTypeWeight = Math.floor((minSubWeight + Math.random() * (maxSubWeight - minSubWeight)) / 10) * 10;
      if (subTypeWeight <= 0) return;
      
      // 从该类别中随机选择一个食物
      const availableFoods = foodGroups[category].filter(food => 
        food.subCategory === subType || !food.subCategory
      );
      
      if (availableFoods.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableFoods.length);
        const selectedFood = availableFoods[randomIndex];
        
        // 使用NutritionService计算营养成分
        const nutritionInfo = calculateFoodNutrition(selectedFood, subTypeWeight);
        
        subTypeItems.push({
          food: selectedFood,
          amount: subTypeWeight,
          nutritionInfo,
          subType: subType
        });
        
        remainingWeight -= subTypeWeight;
      }
    });
    
    // 如果还有剩余重量，随机分配给已有的食物项目
    if (remainingWeight > 0 && subTypeItems.length > 0) {
      const randomItemIndex = Math.floor(Math.random() * subTypeItems.length);
      const item = subTypeItems[randomItemIndex];
      
      // 更新重量和营养成分
      const newAmount = item.amount + remainingWeight;
      
      item.amount = newAmount;
      item.nutritionInfo = calculateFoodNutrition(item.food, newAmount);
    }
    
    recipe[category] = subTypeItems;
  });
  
  return recipe;
};

/**
 * 将按类别分组的食谱转换为扁平列表
 * @param {Object} categoryRecipe - 按类别分组的食谱
 * @returns {Array} - 食谱项目列表
 */
export const flattenCategoryRecipe = (categoryRecipe) => {
  if (!categoryRecipe) {
    return [];
  }
  
  const flatRecipe = [];
  
  Object.keys(categoryRecipe).forEach(category => {
    const items = categoryRecipe[category] || [];
    items.forEach(item => {
      flatRecipe.push({
        ...item,
        category: category
      });
    });
  });
  
  return flatRecipe;
};