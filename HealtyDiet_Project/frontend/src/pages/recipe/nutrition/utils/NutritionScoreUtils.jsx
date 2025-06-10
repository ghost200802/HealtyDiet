import React from 'react';

/**
 * 计算营养素得分（越接近目标值，得分越高）
 * @param {number} currentValue - 当前值
 * @param {number} targetValue - 目标值
 * @returns {number} - 得分（0-1之间）
 */
export const calculateNutrientScore = (currentValue, targetValue) => {
  return 1 - Math.abs(currentValue - targetValue) / targetValue;
};

/**
 * 根据得分生成营养素建议
 * @param {number} score - 得分（0-100之间）
 * @param {string} nutrientName - 营养素名称
 * @param {number} currentValue - 当前值
 * @param {number} targetValue - 目标值
 * @returns {Object} - 包含建议文本和颜色的对象
 */
export const getSuggestionByScore = (score, nutrientName, currentValue, targetValue) => {
  // 计算当前值与目标值的差距
  const difference = currentValue - targetValue;
  
  // 根据得分返回不同的建议和颜色
  if (score >= 95) {
    return {
      text: `${nutrientName}摄入非常理想，继续保持！`,
      color: 'success.main'
    };
  } else if (score >= 70) {
    if (difference > 0) {
      return {
        text: `${nutrientName}摄入略高，可以适当减少。`,
        color: 'warning.main'
      };
    } else {
      return {
        text: `${nutrientName}摄入略低，可以适当增加。`,
        color: 'warning.main'
      };
    }
  } else {
    if (difference > 0) {
      return {
        text: `${nutrientName}摄入过高，建议大幅减少。`,
        color: 'error.main'
      };
    } else {
      return {
        text: `${nutrientName}摄入不足，建议大幅增加。`,
        color: 'error.main'
      };
    }
  }
};

/**
 * 获取热量状态评价
 * @param {Object} totalNutrition - 总营养数据
 * @param {Object} user - 用户数据
 * @returns {Object} - 包含状态文本和颜色的对象
 */
export const getCaloriesStatus = (totalNutrition, user) => {
  if (!user || !user.dci) return { text: '未设置推荐摄入量', color: 'text.secondary' };
  
  const percentage = totalNutrition.calories / user.dci * 100;
  
  if (percentage > 110) return { text: '热量偏高', color: 'error.main' };
  if (percentage < 90) return { text: '热量偏低', color: 'warning.main' };
  return { text: '热量适中', color: 'success.main' };
};

/**
 * 计算热量百分比
 * @param {Object} totalNutrition - 总营养数据
 * @param {Object} user - 用户数据
 * @returns {number} - 热量百分比
 */
export const calculateCaloriesPercentage = (totalNutrition, user) => {
  return user && user.dci ? Math.round(totalNutrition.calories / user.dci * 100) : 0;
};