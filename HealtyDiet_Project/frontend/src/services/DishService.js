import axios from 'axios';
import { getFoodsByIds } from './FoodService';

// 菜谱缓存对象
const dishCache = {
  // 菜谱ID到菜谱对象的映射
  dishes: {},
  // 菜谱名称索引 - 用于模糊匹配菜谱名称
  nameIndex: {},
  // 食物名称索引 - 用于通过食物名称查找菜谱
  foodIndex: {},
  // 食物ID到食物对象的映射 - 用于通过食物ID获取食物名称
  foodsData: {},
  // 缓存过期时间（毫秒）
  expirationTime: 60 * 60 * 1000, // 默认60分钟
  // 缓存时间戳
  timestamp: Date.now()
};

/**
 * 将字符串转换为小写并移除空格，用于索引
 * @param {string} str 输入字符串
 * @returns {string} 处理后的字符串
 */
const normalizeString = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.toLowerCase().replace(/\s+/g, '');
};

/**
 * 更新名称索引
 * @param {Object} dish 菜谱对象
 */
const updateNameIndex = (dish) => {
  if (!dish || !dish.id || !dish.name) return;
  
  const normalizedName = normalizeString(dish.name);
  
  // 将菜谱名称的每个字符作为索引
  for (let i = 0; i < normalizedName.length; i++) {
    const char = normalizedName.substring(i);
    if (!dishCache.nameIndex[char]) {
      dishCache.nameIndex[char] = new Set();
    }
    dishCache.nameIndex[char].add(dish.id);
  }
};

/**
 * 更新食物索引
 * @param {Object} dish 菜谱对象
 */
const updateFoodIndex = (dish) => {
  if (!dish || !dish.id) return;
  
  // 检查dish.foods是否存在且为数组
  if (dish.foods && Array.isArray(dish.foods)) {
    // 遍历foods数组（存储的是食物ID）
    dish.foods.forEach(foodId => {
      // 从foodsData中获取食物名称
      const food = dishCache.foodsData && dishCache.foodsData[foodId];
      if (food && food.name) {
        const normalizedFoodName = normalizeString(food.name);
        
        // 将食物名称的每个字符作为索引
        for (let i = 0; i < normalizedFoodName.length; i++) {
          const char = normalizedFoodName.substring(i);
          if (!dishCache.foodIndex[char]) {
            dishCache.foodIndex[char] = new Set();
          }
          dishCache.foodIndex[char].add(dish.id);
        }
      }
    });
  }
  
  // 兼容旧版本：检查dish.ingredients是否存在且为数组
  if (dish.ingredients && Array.isArray(dish.ingredients)) {
    dish.ingredients.forEach(ingredient => {
      if (!ingredient || !ingredient.name) return;
      
      const normalizedFoodName = normalizeString(ingredient.name);
      
      // 将食物名称的每个字符作为索引
      for (let i = 0; i < normalizedFoodName.length; i++) {
        const char = normalizedFoodName.substring(i);
        if (!dishCache.foodIndex[char]) {
          dishCache.foodIndex[char] = new Set();
        }
        dishCache.foodIndex[char].add(dish.id);
      }
    });
  }
};

/**
 * 添加单个菜谱到缓存
 * @param {Object} dish 菜谱对象
 */
const addDishToCache = (dish) => {
  if (!dish || !dish.id) return;
  dishCache.dishes[dish.id] = dish;
  
  // 更新名称索引和食物索引
  updateNameIndex(dish);
  updateFoodIndex(dish);
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
      
      // 更新名称索引和食物索引
      updateNameIndex(dish);
      updateFoodIndex(dish);
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
  dishCache.nameIndex = {};
  dishCache.foodIndex = {};
  dishCache.foodsData = {};
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
    
    // 收集所有菜肴的食物ID
    const allFoodIds = new Set();
    dishes.forEach(dish => {
      if (dish.foods && Array.isArray(dish.foods)) {
        dish.foods.forEach(foodId => allFoodIds.add(foodId));
      }
    });
    
    // 获取所有食物数据
    if (allFoodIds.size > 0) {
      const foodsArray = await getFoodsByIds(Array.from(allFoodIds));
      foodsArray.forEach(food => {
        if (food && food.id) {
          dishCache.foodsData[food.id] = food;
        }
      });
    }
    
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
    
    // 收集所有菜肴的食物ID
    const allFoodIds = new Set();
    dishes.forEach(dish => {
      if (dish.foods && Array.isArray(dish.foods)) {
        dish.foods.forEach(foodId => allFoodIds.add(foodId));
      }
    });
    
    // 获取所有食物数据
    if (allFoodIds.size > 0) {
      const foodsArray = await getFoodsByIds(Array.from(allFoodIds));
      foodsArray.forEach(food => {
        if (food && food.id) {
          dishCache.foodsData[food.id] = food;
        }
      });
    }
    
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
    
    // 收集所有菜肴的食物ID
    const allFoodIds = new Set();
    dishes.forEach(dish => {
      if (dish.foods && Array.isArray(dish.foods)) {
        dish.foods.forEach(foodId => allFoodIds.add(foodId));
      }
    });
    
    // 获取所有食物数据
    if (allFoodIds.size > 0) {
      const foodsArray = await getFoodsByIds(Array.from(allFoodIds));
      foodsArray.forEach(food => {
        if (food && food.id) {
          dishCache.foodsData[food.id] = food;
        }
      });
    }
    
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

/**
 * 通过名称模糊匹配菜谱
 * @param {string} query 搜索关键词
 * @returns {Array<Object>} 匹配的菜谱对象数组
 */
const searchDishesByName = (query) => {
  if (!query || typeof query !== 'string') {
    return [];
  }
  
  // 检查缓存是否过期
  if (Date.now() - dishCache.timestamp > dishCache.expirationTime) {
    clearCache();
    return [];
  }
  
  const normalizedQuery = normalizeString(query);
  if (!normalizedQuery) return [];
  
  // 获取所有匹配的菜谱ID
  const matchedIds = new Set();
  
  // 遍历所有索引键，查找包含搜索词的键
  Object.keys(dishCache.nameIndex).forEach(key => {
    if (key.includes(normalizedQuery)) {
      // 将匹配键对应的所有菜谱ID添加到结果集
      dishCache.nameIndex[key].forEach(id => matchedIds.add(id));
    }
  });
  
  // 转换为菜谱对象数组
  return Array.from(matchedIds).map(id => dishCache.dishes[id]).filter(Boolean);
};

/**
 * 通过食物名称模糊匹配菜谱
 * @param {string} foodName 食物名称
 * @returns {Array<Object>} 包含该食物的菜谱对象数组
 */
const searchDishesByFood = (foodName) => {
  if (!foodName || typeof foodName !== 'string') {
    return [];
  }
  
  // 检查缓存是否过期
  if (Date.now() - dishCache.timestamp > dishCache.expirationTime) {
    clearCache();
    return [];
  }
  
  const normalizedFoodName = normalizeString(foodName);
  if (!normalizedFoodName) return [];
  
  // 获取所有匹配的菜谱ID
  const matchedIds = new Set();
  
  // 遍历所有索引键，查找包含搜索词的键
  Object.keys(dishCache.foodIndex).forEach(key => {
    if (key.includes(normalizedFoodName)) {
      // 将匹配键对应的所有菜谱ID添加到结果集
      dishCache.foodIndex[key].forEach(id => matchedIds.add(id));
    }
  });
  
  // 转换为菜谱对象数组
  return Array.from(matchedIds).map(id => dishCache.dishes[id]).filter(Boolean);
};

export {
  getDishById,
  getDishesByIds,
  getAllDishes,
  getDishesByType,
  searchDishes,
  getDishByIdSync,
  getDishesByIdsSync,
  searchDishesByName,
  searchDishesByFood,
  clearCache,
  setCacheExpirationTime
};