/**
 * 存储服务
 * 提供统一的localStorage键名管理
 * 支持用户ID区分不同用户的数据
 */

// 食谱页面状态键名
export const DIET_PAGE_STATE_KEY = 'DietPageState';

// 食谱规划页面状态键名
export const PLAN_PAGE_STATE_KEY = 'PlanPageState';

/**
 * 保存数据到localStorage
 * @param {string} key - 存储键名
 * @param {any} data - 要存储的数据
 * @param {string} [userId] - 用户ID，用于区分不同用户的数据
 */
export const saveToLocalStorage = (key, data, userId = null) => {
  try {
    // 如果提供了userId，则在键名中加入用户ID
    const storageKey = userId ? `${userId}_${key}` : key;
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (error) {
    console.error('保存到localStorage失败:', error);
  }
};

/**
 * 从localStorage获取数据
 * @param {string} key - 存储键名
 * @param {any} defaultValue - 默认值，当没有找到数据时返回
 * @param {string} [userId] - 用户ID，用于区分不同用户的数据
 * @returns {any} 解析后的数据或默认值
 */
export const getFromLocalStorage = (key, defaultValue = null, userId = null) => {
  try {
    // 如果提供了userId，则在键名中加入用户ID
    const storageKey = userId ? `${userId}_${key}` : key;
    const item = localStorage.getItem(storageKey);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('从localStorage获取数据失败:', error);
    return defaultValue;
  }
};

/**
 * 从localStorage删除数据
 * @param {string} key - 存储键名
 * @param {string} [userId] - 用户ID，用于区分不同用户的数据
 */
export const removeFromLocalStorage = (key, userId = null) => {
  try {
    // 如果提供了userId，则在键名中加入用户ID
    const storageKey = userId ? `${userId}_${key}` : key;
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('从localStorage删除数据失败:', error);
  }
};