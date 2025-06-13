import axios from 'axios';

// 菜谱缓存对象
const dishCache = {
  // 菜谱ID到菜谱对象的映射
  dishes: {},
  // 缓存过期时间（毫秒）
  expirationTime: 60 * 60 * 1000, // 默认60分钟
  // 缓存时间戳
  timestamp: Date.now()
};

/**
 * 添加单个菜谱到缓存
 * @param {Object} dish 菜谱对象
 */
const addDishToCache = (dish) => {
  if (!dish || !dish.id) return;
  dishCache.dishes[dish.id] = dish;
};

/**
 * 批量添加菜谱到缓存
 * @param {Array} dishes 菜谱对象数组
 */
const addDishesToCache = (dishes) => {
  if (!dishes || !Array.isArray(dishes)) return;
  dishes.forEach(dish => {
    if (dish && dish.id) {
      dishCache.dishes[dish.id] = dish;
    }
  });
};

/**
 * 从缓存中获取菜谱
 * @param {string|number} id 菜谱ID
 * @returns {Object|null} 菜谱对象或null
 */
const getDishFromCache = (id) => {
  // 检查缓存是否过期
  if (Date.now() - dishCache.timestamp > dishCache.expirationTime) {
    // 清空缓存
    dishCache.dishes = {};
    dishCache.timestamp = Date.now();
    return null;
  }
  
  return dishCache.dishes[id] || null;
};

/**
 * 清空缓存
 */
const clearCache = () => {
  dishCache.dishes = {};
  dishCache.timestamp = Date.now();
};

/**
 * 设置缓存过期时间
 * @param {number} timeInMs 过期时间（毫秒）
 */
const setCacheExpirationTime = (timeInMs) => {
  if (typeof timeInMs === 'number' && timeInMs > 0) {
    dishCache.expirationTime = timeInMs;
  }
};

/**
 * 根据ID获取菜谱信息
 * @param {string|number} id 菜谱ID
 * @returns {Promise<Object>} 菜谱对象
 */
const getDishById = async (id) => {
  try {
    // 先从缓存中获取
    const cachedDish = getDishFromCache(id);
    if (cachedDish) {
      return cachedDish;
    }
    
    // 缓存中没有，从服务器获取
    const response = await axios.get(`/api/dishes/${id}`);
    const dish = response.data;
    
    // 添加到缓存
    addDishToCache(dish);
    
    return dish;
  } catch (error) {
    console.error(`获取菜谱信息失败: ${error.message}`);
    throw error;
  }
};

/**
 * 批量获取菜谱信息
 * @param {Array<string|number>} ids 菜谱ID数组
 * @returns {Promise<Array<Object>>} 菜谱对象数组
 */
const getDishesByIds = async (ids) => {
  try {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return [];
    }
    
    // 区分缓存中有的和没有的
    const cachedDishes = [];
    const uncachedIds = [];
    
    ids.forEach(id => {
      const cachedDish = getDishFromCache(id);
      if (cachedDish) {
        cachedDishes.push(cachedDish);
      } else {
        uncachedIds.push(id);
      }
    });
    
    // 如果所有菜谱都在缓存中，直接返回
    if (uncachedIds.length === 0) {
      return cachedDishes;
    }
    
    // 从服务器批量获取未缓存的菜谱
    const response = await axios.post('/api/dishes/batch', { ids: uncachedIds });
    const fetchedDishes = response.data;
    
    // 添加到缓存
    addDishesToCache(fetchedDishes);
    
    // 合并缓存的和新获取的菜谱
    return [...cachedDishes, ...fetchedDishes];
  } catch (error) {
    console.error(`批量获取菜谱信息失败: ${error.message}`);
    throw error;
  }
};

/**
 * 获取所有菜谱
 * @returns {Promise<Array<Object>>} 菜谱对象数组
 */
const getAllDishes = async () => {
  try {
    const response = await axios.get('/api/dishes');
    const dishes = response.data;
    
    // 添加到缓存
    addDishesToCache(dishes);
    
    return dishes;
  } catch (error) {
    console.error(`获取所有菜谱失败: ${error.message}`);
    throw error;
  }
};

/**
 * 根据类型获取菜谱
 * @param {string} type 菜谱类型
 * @returns {Promise<Array<Object>>} 菜谱对象数组
 */
const getDishesByType = async (type) => {
  try {
    const response = await axios.get(`/api/dishes/type/${type}`);
    const dishes = response.data;
    
    // 添加到缓存
    addDishesToCache(dishes);
    
    return dishes;
  } catch (error) {
    console.error(`获取${type}类菜谱失败: ${error.message}`);
    throw error;
  }
};

/**
 * 搜索菜谱
 * @param {string} query 搜索关键词
 * @returns {Promise<Array<Object>>} 菜谱对象数组
 */
const searchDishes = async (query) => {
  try {
    if (!query) {
      return getAllDishes();
    }
    
    const response = await axios.get(`/api/dishes/search/${query}`);
    const dishes = response.data;
    
    // 添加到缓存
    addDishesToCache(dishes);
    
    return dishes;
  } catch (error) {
    console.error(`搜索菜谱失败: ${error.message}`);
    throw error;
  }
};

/**
 * 根据ID获取菜谱信息（同步版本）
 * @param {string|number} id 菜谱ID
 * @returns {Object} 菜谱对象
 * @throws {Error} 如果缓存中找不到菜谱则抛出错误
 */
const getDishByIdSync = (id) => {
  // 从缓存中获取
  const cachedDish = getDishFromCache(id);
  if (cachedDish) {
    return cachedDish;
  }
  
  // 缓存中没有，直接抛出错误
  throw new Error(`菜谱ID为${id}的数据不在缓存中，请先使用异步方法获取`);
};

/**
 * 批量获取菜谱信息（同步版本）
 * @param {Array<string|number>} ids 菜谱ID数组
 * @returns {Array<Object>} 菜谱对象数组
 * @throws {Error} 如果任何菜谱ID不在缓存中则抛出错误
 */
const getDishesByIdsSync = (ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return [];
  }
  
  // 检查所有ID是否都在缓存中
  const missingIds = [];
  const cachedDishes = [];
  
  ids.forEach(id => {
    const cachedDish = getDishFromCache(id);
    if (cachedDish) {
      cachedDishes.push(cachedDish);
    } else {
      missingIds.push(id);
    }
  });
  
  // 如果有任何ID不在缓存中，抛出错误
  if (missingIds.length > 0) {
    throw new Error(`以下菜谱ID不在缓存中: ${missingIds.join(', ')}，请先使用异步方法获取`);
  }
  
  return cachedDishes;
};

export {
  getDishById,
  getDishesByIds,
  getAllDishes,
  getDishesByType,
  searchDishes,
  getDishByIdSync,
  getDishesByIdsSync,
  clearCache,
  setCacheExpirationTime
};