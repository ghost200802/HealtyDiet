import axios from 'axios';
import { getMainIngredients } from '@/pages/diet/DietUtils';
import { calculateDietItem } from '@/services/NutritionService';

/**
 * 保存食谱（创建新食谱或更新现有食谱）
 */
export const saveDiet = async ({ name, user, dietItems, totalNutrition, diets, saveAsFile = false }) => {
  if (!user || !user.id) {
    throw new Error('请先登录');
  }
  
  if (dietItems.length === 0) {
    throw new Error('食谱中没有食物，请先添加食物');
  }
  
  const token = localStorage.getItem('token');
  
  const dietData = {
    name: name,
    userId: user.id,
    items: dietItems.map(item => ({
      foodId: item.foodId,
      amount: item.amount
    })),
    nutrition: {
      calories: totalNutrition.calories,
      protein: totalNutrition.protein,
      carbs: totalNutrition.carbs,
      fat: totalNutrition.fat,
      fiber: totalNutrition.fiber // 添加纤维素
    },
    mainIngredients: getMainIngredients(dietItems),
    saveAsFile: saveAsFile // 添加按文件保存选项
  };
  
  console.log('准备保存食谱数据:', JSON.stringify(dietData, null, 2));
  
  // 检查是否已存在同名食谱
  const existingDiet = diets.find(r => r.name === name);
  
  try {
    if (existingDiet) {
      // 更新现有食谱
      console.log(`更新现有食谱 ID: ${existingDiet.id}`);
      await axios.put(
        `/api/diets/${existingDiet.id}`,
        dietData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    } else {
      // 创建新食谱
      console.log('创建新食谱');
      await axios.post(
        '/api/diets',
        dietData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    }
    
    // 重新获取用户的食谱
    console.log(`获取用户 ${user.id} 的食谱列表`);
    const dietsResponse = await axios.get(
      `/api/diets/user/${user.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return dietsResponse.data;
  } catch (error) {
    console.error('保存食谱请求失败:', error.response ? error.response.data : error.message);
    throw error;
  }
};

/**
 * 删除食谱
 */
export const deleteDiet = async (dietId, user) => {
  if (!user || !user.id) {
    throw new Error('请先登录');
  }
  
  const token = localStorage.getItem('token');
  await axios.delete(
    `/api/diets/${dietId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};

/**
 * 获取用户的食谱列表
 */
export const getUserDiets = async (user) => {
  if (!user || !user.id) {
    return [];
  }
  
  const token = localStorage.getItem('token');
  const response = await axios.get(
    `/api/diets/user/${user.id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  
  return response.data;
};

/**
 * 获取所有食物
 */
export const getAllFoods = async () => {
  try {
    const response = await axios.get('/api/foods');
    return response.data;
  } catch (error) {
    console.error('获取食物数据失败:', error);
    throw new Error('读取数据出错了');
  }
};

/**
 * 处理食物详情更新
 */
export const updateFoodInDiet = (updatedFood, foods, dietItems) => {
  
  // 更新本地食物列表中的食物数据
  const updatedFoods = foods.map(food => {
    if (food.id === updatedFood.id) {
      return updatedFood;
    }
    return food;
  });
  
  // 如果更新的食物在食谱中，也需要更新食谱项目
  const foodInDiet = dietItems.find(item => item.foodId === updatedFood.id);
  let updatedDietItems = dietItems;
  
  if (foodInDiet) {
    updatedDietItems = dietItems.map(item => {
      if (item.foodId === updatedFood.id) {
        // 使用NutritionService计算更新后的营养素含量
        return calculateDietItem(updatedFood, item.amount);
      }
      return item;
    });
  }
  
  return {
    updatedFoods,
    updatedDietItems
  };
};