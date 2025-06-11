import axios from 'axios';

/**
 * 保存食谱规划
 */
export const savePlan = async ({ name, user, recipes }) => {
  if (!user || !user.id) {
    throw new Error('请先登录');
  }
  
  if (recipes.length === 0) {
    throw new Error('规划中没有食谱，请先添加食谱');
  }
  
  const token = localStorage.getItem('token');
  
  // 准备规划数据
  const planData = {
    name: name,
    userId: user.id,
    recipes: recipes.map(recipe => recipe.id) // 只保存食谱ID
  };
  
  // 发送请求保存规划
  const response = await axios.post(
    '/api/plans',
    planData,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  
  return response.data;
};

/**
 * 获取用户的所有食谱规划
 */
export const getUserPlans = async (user) => {
  if (!user || !user.id) {
    return [];
  }
  
  const token = localStorage.getItem('token');
  const response = await axios.get(
    `/api/plans/user/${user.id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  
  return response.data;
};

/**
 * 根据ID获取食谱规划
 */
export const getPlanById = async (planId) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(
    `/api/plans/${planId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  
  return response.data;
};

/**
 * 更新食谱规划
 */
export const updatePlan = async (planId, updates) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(
    `/api/plans/${planId}`,
    updates,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  
  return response.data;
};

/**
 * 删除食谱规划
 */
export const deletePlan = async (planId) => {
  const token = localStorage.getItem('token');
  const response = await axios.delete(
    `/api/plans/${planId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  
  return response.data;
};