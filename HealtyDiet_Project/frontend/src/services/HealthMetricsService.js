/**
 * 健康指标计算服务
 * 提供统一的健康和营养指标计算功能，包括BMI、BMR、TDEE和宏量营养素需求
 */

/**
 * 计算年龄
 * @param {Date|string} birthDate - 出生日期
 * @returns {number} - 年龄
 */
export const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * 计算BMI (体重指数)
 * @param {number} weight - 体重(kg)
 * @param {number} height - 身高(cm)
 * @returns {number} - BMI值，保留一位小数
 */
export const calculateBMI = (weight, height) => {
  // 身高从厘米转换为米
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  return Math.round(bmi * 10) / 10; // 四舍五入到一位小数
};

/**
 * 获取BMI分类
 * @param {number} bmi - BMI值
 * @returns {Object} - 包含分类和颜色的对象
 */
export const getBMICategory = (bmi) => {
  if (bmi < 18.5) return { category: '体重过轻', color: '#2196f3' };
  if (bmi < 24) return { category: '正常体重', color: '#4caf50' };
  if (bmi < 28) return { category: '超重', color: '#ff9800' };
  return { category: '肥胖', color: '#f44336' };
};

/**
 * 计算基础代谢率 (BMR)
 * @param {number} weight - 体重(kg)
 * @param {number} height - 身高(cm)
 * @param {number} age - 年龄
 * @param {string} gender - 性别 ('male'或'female')
 * @returns {number} - 基础代谢率(千卡)
 */
export const calculateBMR = (weight, height, age, gender) => {
  // 使用Mifflin-St Jeor公式
  if (gender === 'male') {
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  } else {
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  }
};

/**
 * 活动水平定义
 */
export const activityLevels = [
  { value: 'sedentary', label: '久坐不动 (几乎不运动)', multiplier: 1.2},
  { value: 'light', label: '轻度活动 (每周运动1-3天)', multiplier: 1.375},
  { value: 'moderate', label: '中度活动 (每周运动3-5天)', multiplier: 1.55},
  { value: 'active', label: '积极活动 (每周运动6-7天)', multiplier: 1.725},
  { value: 'very_active', label: '非常活跃 (每天高强度运动)', multiplier: 1.9}
];

/**
 * 计算所有健康和营养指标
 * @param {Object} profileData - 用户资料数据
 * @returns {Object} - 计算后的健康和营养指标
 */
export const calculateHealthMetrics = (profileData) => {
  if (!profileData) return null;
  
  // 计算年龄
  const calculatedAge = calculateAge(profileData.birthDate);
  
  // 计算BMI
  const calculatedBMI = profileData.weight && profileData.height ? 
    calculateBMI(profileData.weight, profileData.height) : 0;
  
  const bmiCategory = getBMICategory(calculatedBMI || 0);
  
  // 计算BMR
  const calculatedBMR = profileData.weight && profileData.height && profileData.gender ? 
    calculateBMR(
      profileData.weight,
      profileData.height,
      calculatedAge,
      profileData.gender
    ) : 0;
  
  // 查找活动水平乘数
  const activityLevel = activityLevels.find(level => level.value === profileData.activityLevel);
  const multiplier = activityLevel ? activityLevel.multiplier : 1.2;
  const proteinCoefficient = activityLevel ? activityLevel.proteinCoefficient : 1.0;
  
  // 计算TDEE (总能量消耗)
  const tdeeValue = calculatedBMR ? Math.round(calculatedBMR * multiplier) : 0;
  
  // 获取热量缺口值
  const calorieDeficit = profileData.calorieDeficit || 0;
  const dciValue = Math.max(tdeeValue - calorieDeficit, 1200); // 确保不低于基础代谢
  
  // 计算蛋白质需求
  const proteinValue = Math.round(profileData.weight * 1.2);
  
  // 脂肪(25% TDEE, 9千卡/克)
  const fatValue = Math.round(dciValue * 0.25 / 9);
  
  // 计算碳水化合物需求 (TDEE - (蛋白质*4 + 脂肪*9)) / 4
  const proteinCalories = proteinValue * 4;
  const fatCalories = fatValue * 9;
  const carbsValue = Math.round((dciValue - proteinCalories - fatCalories) / 4);
  
  return {
    age: calculatedAge,
    bmi: calculatedBMI,
    bmiCategory,
    bmr: calculatedBMR,
    tdee: tdeeValue,
    dci: dciValue,
    protein: proteinValue,
    fat: fatValue,
    carbs: carbsValue
  };
};