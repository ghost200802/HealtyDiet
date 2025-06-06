import axios from 'axios';
import { getMainIngredients } from './RecipeUtils';

/**
 * 保存食谱（创建新食谱或更新现有食谱）
 */
export const saveRecipe = async ({ name, user, recipeItems, totalNutrition, recipes, saveAsFile = false }) => {
  if (!user || !user.id) {
    throw new Error('请先登录');
  }
  
  if (recipeItems.length === 0) {
    throw new Error('食谱中没有食物，请先添加食物');
  }
  
  const token = localStorage.getItem('token');
  
  const recipeData = {
    name: name,
    userId: user.id,
    items: recipeItems.map(item => ({
      foodId: item.foodId,
      amount: item.amount
    })),
    nutrition: {
      calories: totalNutrition.calories,
      protein: totalNutrition.protein,
      carbs: totalNutrition.carbs,
      fat: totalNutrition.fat
    },
    mainIngredients: getMainIngredients(recipeItems),
    saveAsFile: saveAsFile // 添加按文件保存选项
  };
  
  // 检查是否已存在同名食谱
  const existingRecipe = recipes.find(r => r.name === name);
  
  if (existingRecipe) {
    // 更新现有食谱
    await axios.put(
      `http://localhost:5000/api/recipes/${existingRecipe.id}`,
      recipeData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  } else {
    // 创建新食谱
    await axios.post(
      'http://localhost:5000/api/recipes',
      recipeData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }
  
  // 重新获取用户的食谱
  const recipesResponse = await axios.get(
    `http://localhost:5000/api/recipes/user/${user.id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  
  return recipesResponse.data;
};

/**
 * 删除食谱
 */
export const deleteRecipe = async (recipeId, user) => {
  if (!user || !user.id) {
    throw new Error('请先登录');
  }
  
  const token = localStorage.getItem('token');
  await axios.delete(
    `http://localhost:5000/api/recipes/${recipeId}`,
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
export const getUserRecipes = async (user) => {
  if (!user || !user.id) {
    return [];
  }
  
  const token = localStorage.getItem('token');
  const response = await axios.get(
    `http://localhost:5000/api/recipes/user/${user.id}`,
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
    const response = await axios.get('http://localhost:5000/api/foods');
    return response.data;
  } catch (error) {
    console.error('获取食物数据失败:', error);
    throw new Error('读取数据出错了');
  }
};

/**
 * 处理食物详情更新
 */
export const updateFoodInRecipe = (updatedFood, foods, recipeItems) => {
  // 更新本地食物列表中的食物数据
  const updatedFoods = foods.map(food => {
    if (food.id === updatedFood.id) {
      return updatedFood;
    }
    return food;
  });
  
  // 如果更新的食物在食谱中，也需要更新食谱项目
  const foodInRecipe = recipeItems.find(item => item.foodId === updatedFood.id);
  let updatedRecipeItems = recipeItems;
  
  if (foodInRecipe) {
    updatedRecipeItems = recipeItems.map(item => {
      if (item.foodId === updatedFood.id) {
        const ratio = item.amount / (updatedFood.servingSize || 100);
        return {
          ...item,
          calories: updatedFood.calories * ratio,
          protein: updatedFood.protein * ratio,
          carbs: updatedFood.carbs * ratio,
          fat: updatedFood.fat * ratio
        };
      }
      return item;
    });
  }
  
  return {
    updatedFoods,
    updatedRecipeItems
  };
};