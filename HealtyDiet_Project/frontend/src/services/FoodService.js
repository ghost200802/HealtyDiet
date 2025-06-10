import axios from 'axios';

// 食物缓存对象
const foodCache = {
  // 食物ID到食物对象的映射
  foods: {},
  // 缓存过期时间（毫秒）
  expirationTime: 60 * 60 * 1000, // 默认60分钟
  // 缓存时间戳
  timestamp: Date.now()
};

/**
 * 添加单个食物到缓存
 * @param {Object} food 食物对象
 */
const addFoodToCache = (food) => {
  if (!food || !food.id) return;
  foodCache.foods[food.id] = food;
};

/**
 * 批量添加食物到缓存
 * @param {Array} foods 食物对象数组
 */
const addFoodsToCache = (foods) => {
  if (!foods || !Array.isArray(foods)) return;
  foods.forEach(food => {
    if (food && food.id) {
      foodCache.foods[food.id] = food;
    }
  });
};

/**
 * 从缓存中获取食物
 * @param {string} id 食物ID
 * @returns {Object|null} 食物对象或null
 */
const getFoodFromCache = (id) => {
  // // 检查缓存是否过期
  // if (Date.now() - foodCache.timestamp > foodCache.expirationTime) {
  //   // 清空缓存
  //   foodCache.foods = {};
  //   foodCache.timestamp = Date.now();
  //   return null;
  // }
  
  return foodCache.foods[id] || null;
};

/**
 * 清空缓存
 */
const clearCache = () => {
  foodCache.foods = {};
  foodCache.timestamp = Date.now();
};

/**
 * 设置缓存过期时间
 * @param {number} timeInMs 过期时间（毫秒）
 */
const setCacheExpirationTime = (timeInMs) => {
  if (typeof timeInMs === 'number' && timeInMs > 0) {
    foodCache.expirationTime = timeInMs;
  }
};

/**
 * 根据ID获取食物信息
 * @param {string} id 食物ID
 * @returns {Promise<Object>} 食物对象
 */
const getFoodById = async (id) => {
  try {
    // 先从缓存中获取
    const cachedFood = getFoodFromCache(id);
    if (cachedFood) {
      return cachedFood;
    }
    
    // 缓存中没有，从服务器获取
    const response = await axios.get(`/api/foods/${id}`);
    const food = response.data;
    
    // 添加到缓存
    addFoodToCache(food);
    
    return food;
  } catch (error) {
    console.error(`获取食物信息失败: ${error.message}`);
    throw error;
  }
};

/**
 * 批量获取食物信息
 * @param {Array<string>} ids 食物ID数组
 * @returns {Promise<Array<Object>>} 食物对象数组
 */
const getFoodsByIds = async (ids) => {
  try {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return [];
    }
    
    // 区分缓存中有的和没有的
    const cachedFoods = [];
    const uncachedIds = [];
    
    ids.forEach(id => {
      const cachedFood = getFoodFromCache(id);
      if (cachedFood) {
        cachedFoods.push(cachedFood);
      } else {
        uncachedIds.push(id);
      }
    });
    
    // 如果所有食物都在缓存中，直接返回
    if (uncachedIds.length === 0) {
      return cachedFoods;
    }
    
    // 从服务器批量获取未缓存的食物
    const response = await axios.post('/api/foods/batch', { ids: uncachedIds });
    const fetchedFoods = response.data;
    
    // 添加到缓存
    addFoodsToCache(fetchedFoods);
    
    // 合并缓存的和新获取的食物
    return [...cachedFoods, ...fetchedFoods];
  } catch (error) {
    console.error(`批量获取食物信息失败: ${error.message}`);
    throw error;
  }
};

/**
 * 获取所有食物
 * @returns {Promise<Array<Object>>} 食物对象数组
 */
const getAllFoods = async () => {
  try {
    const response = await axios.get('/api/foods');
    const foods = response.data;
    
    // 添加到缓存
    addFoodsToCache(foods);
    
    return foods;
  } catch (error) {
    console.error(`获取所有食物失败: ${error.message}`);
    throw error;
  }
};

/**
 * 搜索食物
 * @param {string} query 搜索关键词
 * @returns {Promise<Array<Object>>} 食物对象数组
 */
const searchFoods = async (query) => {
  try {
    if (!query) {
      return getAllFoods();
    }
    
    const response = await axios.get(`/api/foods/search/${query}`);
    const foods = response.data;
    
    // 添加到缓存
    addFoodsToCache(foods);
    
    return foods;
  } catch (error) {
    console.error(`搜索食物失败: ${error.message}`);
    throw error;
  }
};

/**
 * 根据ID获取食物信息（同步版本）
 * @param {string} id 食物ID
 * @returns {Object} 食物对象
 * @throws {Error} 如果缓存中找不到食物则抛出错误
 */
const getFoodByIdSync = (id) => {
  // 从缓存中获取
  const cachedFood = getFoodFromCache(id);
  if (cachedFood) {
    return cachedFood;
  }
  
  // 缓存中没有，直接抛出错误
  throw new Error(`食物ID为${id}的数据不在缓存中，请先使用异步方法获取`);
};

/**
 * 批量获取食物信息（同步版本）
 * @param {Array<string>} ids 食物ID数组
 * @returns {Array<Object>} 食物对象数组
 * @throws {Error} 如果任何食物ID不在缓存中则抛出错误
 */
const getFoodsByIdsSync = (ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return [];
  }
  
  // 检查所有ID是否都在缓存中
  const missingIds = [];
  const cachedFoods = [];
  
  ids.forEach(id => {
    const cachedFood = getFoodFromCache(id);
    if (cachedFood) {
      cachedFoods.push(cachedFood);
    } else {
      missingIds.push(id);
    }
  });
  
  // 如果有任何ID不在缓存中，抛出错误
  if (missingIds.length > 0) {
    throw new Error(`以下食物ID不在缓存中: ${missingIds.join(', ')}，请先使用异步方法获取`);
  }
  
  return cachedFoods;
};

export {
  getFoodById,
  getFoodsByIds,
  getAllFoods,
  searchFoods,
  getFoodByIdSync,
  getFoodsByIdsSync,
  clearCache,
  setCacheExpirationTime
};