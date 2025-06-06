/**
 * 数据服务模块 - 已重构
 * 
 * 此文件已被拆分为多个模块，为保持向后兼容性而保留。
 * 建议直接使用新的模块：
 * - pathService.js - 路径相关
 * - foodTypeService.js - 食物类型相关
 * - foodService.js - 食物数据操作
 * - recipeService.js - 食谱数据操作
 * - initService.js - 数据初始化
 * - index.js - 主模块导出
 */

// 导入重构后的模块
const services = require('./index');

// 导出所有服务，保持向后兼容性
module.exports = services;