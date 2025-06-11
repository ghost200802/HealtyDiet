const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { recipesData, foodsData } = require('@services/index');


// 获取所有食谱
router.get('/', (req, res) => {
  try {
    const recipes = recipesData.getAll();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: '获取食谱数据失败', error: error.message });
  }
});

// 根据用户ID获取食谱
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const userRecipes = recipesData.getByUserId(userId);
    res.json(userRecipes);
  } catch (error) {
    res.status(500).json({ message: '获取用户食谱失败', error: error.message });
  }
});

// 根据ID获取食谱
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const recipe = recipesData.getById(id);
    
    if (!recipe) {
      return res.status(404).json({ message: '食谱不存在' });
    }
    
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: '获取食谱数据失败', error: error.message });
  }
});

// 创建新食谱
router.post('/', (req, res) => {
  try {
    console.log('收到创建食谱请求:', JSON.stringify(req.body, null, 2));
    const { name, userId, items, description, nutrition, saveAsFile, mainIngredients } = req.body;
    
    if (!name || !userId || !items || !Array.isArray(items)) {
      return res.status(400).json({ message: '必须提供食谱名称、用户ID和食物项目' });
    }
    
    // 验证食物项目
    for (const item of items) {
      if (!item.foodId || !item.amount) {
        return res.status(400).json({ message: '每个食物项目必须包含foodId和amount' });
      }
      
      // 检查食物是否存在
      const food = foodsData.getById(item.foodId);
      if (!food) {
        return res.status(400).json({ message: `ID为${item.foodId}的食物不存在` });
      }
    }
    
    // 使用传入的营养成分或计算营养成分
    const recipeNutrition = nutrition || calculateNutrition(items);
    
    const newRecipe = {
      id: uuidv4(),
      name,
      userId,
      items,
      nutrition: recipeNutrition,
      mainIngredients: mainIngredients || [],
      description: description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      saveAsFile: saveAsFile === false ? false : true // 默认按文件保存
    };
    
    console.log('准备添加食谱:', JSON.stringify(newRecipe, null, 2));
    recipesData.add(newRecipe);
    
    res.status(201).json(newRecipe);
  } catch (error) {
    console.error('创建食谱失败:', error);
    res.status(500).json({ message: '创建食谱失败', error: error.message });
  }
});

// 更新食谱
router.put('/:id', (req, res) => {
  try {
    console.log('收到更新食谱请求:', JSON.stringify(req.body, null, 2));
    const { id } = req.params;
    const updates = req.body;
    const recipe = recipesData.getById(id);
    
    if (!recipe) {
      return res.status(404).json({ message: '食谱不存在' });
    }
    
    // 如果更新包含食物项目，重新计算营养成分
    let recipeNutrition = recipe.nutrition;
    if (updates.items && Array.isArray(updates.items)) {
      // 验证食物项目
      for (const item of updates.items) {
        if (!item.foodId || !item.amount) {
          return res.status(400).json({ message: '每个食物项目必须包含foodId和amount' });
        }
        
        // 检查食物是否存在
        const food = foodsData.getById(item.foodId);
        if (!food) {
          return res.status(400).json({ message: `ID为${item.foodId}的食物不存在` });
        }
      }
      
      // 如果提供了nutrition则使用，否则计算
      recipeNutrition = updates.nutrition || calculateNutrition(updates.items);
    } else if (updates.nutrition) {
      // 如果只提供了nutrition但没有items，直接使用提供的nutrition
      recipeNutrition = updates.nutrition;
    }
    
    // 更新食谱信息
    const updatedRecipe = {
      ...recipe,
      ...updates,
      nutrition: recipeNutrition,
      // 确保ID不变
      id,
      updatedAt: new Date().toISOString(),
      saveAsFile: updates.saveAsFile === false ? false : true // 尊重传入的saveAsFile值，默认为true
    };
    
    console.log('准备更新食谱:', JSON.stringify(updatedRecipe, null, 2));
    const result = recipesData.update(id, updatedRecipe);
    
    res.json(result);
  } catch (error) {
    console.error('更新食谱失败:', error);
    res.status(500).json({ message: '更新食谱失败', error: error.message });
  }
});

// 删除食谱
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deletedRecipe = recipesData.delete(id);
    
    if (!deletedRecipe) {
      return res.status(404).json({ message: '食谱不存在' });
    }
    
    res.json({ message: '食谱已删除', deletedRecipe });
  } catch (error) {
    res.status(500).json({ message: '删除食谱失败', error: error.message });
  }
});

// 计算食谱的营养成分
function calculateNutrition(items) {
  const nutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0, // 添加纤维素
    vitamins: { A: 0, C: 0, D: 0, E: 0 },
    minerals: { calcium: 0, iron: 0, magnesium: 0, potassium: 0 }
  };
  
  for (const item of items) {
    const food = foodsData.getById(item.foodId);
    if (food) {
      // 使用默认值100作为标准份量，避免除以0或undefined
      const servingSize = food.servingSize || 100;
      const ratio = item.amount / servingSize;
      
      // 确保各营养素值存在，如果不存在则默认为0
      const calories = food.calories || 0;
      const protein = food.protein || 0;
      const carbs = food.carbs || 0;
      const fat = food.fat || 0;
      const fiber = food.fiber || 0; // 添加纤维素
      
      nutrition.calories += calories * ratio;
      nutrition.protein += protein * ratio;
      nutrition.carbs += carbs * ratio;
      nutrition.fat += fat * ratio;
      nutrition.fiber += fiber * ratio; // 添加纤维素计算
      
      // 累加维生素
      for (const vitamin in food.vitamins) {
        if (nutrition.vitamins[vitamin] !== undefined) {
          const vitaminValue = food.vitamins[vitamin] || 0;
          nutrition.vitamins[vitamin] += vitaminValue * ratio;
        }
      }
      
      // 累加矿物质
      for (const mineral in food.minerals) {
        if (nutrition.minerals[mineral] !== undefined) {
          const mineralValue = food.minerals[mineral] || 0;
          nutrition.minerals[mineral] += mineralValue * ratio;
        }
      }
    }
  }
  
  // 四舍五入到两位小数
  nutrition.calories = Math.round(nutrition.calories * 100) / 100;
  nutrition.protein = Math.round(nutrition.protein * 100) / 100;
  nutrition.carbs = Math.round(nutrition.carbs * 100) / 100;
  nutrition.fat = Math.round(nutrition.fat * 100) / 100;
  nutrition.fiber = Math.round(nutrition.fiber * 100) / 100; // 添加纤维素四舍五入
  
  for (const vitamin in nutrition.vitamins) {
    nutrition.vitamins[vitamin] = Math.round(nutrition.vitamins[vitamin] * 100) / 100;
  }
  
  for (const mineral in nutrition.minerals) {
    nutrition.minerals[mineral] = Math.round(nutrition.minerals[mineral] * 100) / 100;
  }
  
  return nutrition;
}

// 计算每日营养需求
router.post('/daily-needs', (req, res) => {
  try {
    const { bmr, activityLevel, goal } = req.body;
    
    if (!bmr || !activityLevel) {
      return res.status(400).json({ message: '必须提供基础代谢率(BMR)和活动水平' });
    }
    
    // 活动水平系数
    const activityFactors = {
      'sedentary': 1.2,      // 久坐不动
      'light': 1.375,        // 轻度活动（每周1-3天）
      'moderate': 1.55,      // 中度活动（每周3-5天）
      'active': 1.725,       // 积极活动（每周6-7天）
      'very_active': 1.9     // 非常活跃（每天高强度运动）
    };
    
    // 目标系数
    const goalFactors = {
      'lose': 0.8,           // 减重（每周减少0.5-1kg）
      'maintain': 1,         // 维持体重
      'gain': 1.15           // 增重（每周增加0.5kg）
    };
    
    const activityFactor = activityFactors[activityLevel] || 1.2;
    const goalFactor = goalFactors[goal] || 1;
    
    // 计算每日总能量需求
    const dailyCalories = Math.round(bmr * activityFactor * goalFactor);
    
    // 计算宏量营养素分配（蛋白质、碳水、脂肪）
    // 蛋白质：每公斤体重1.6-2.2g（这里使用中间值1.9g）
    // 脂肪：总热量的25-35%（这里使用30%）
    // 碳水：剩余热量
    const weight = req.body.weight || 70; // 默认体重70kg
    
    const proteinGrams = Math.round(weight * 1.9);
    const proteinCalories = proteinGrams * 4; // 蛋白质每克4卡路里
    
    const fatCalories = Math.round(dailyCalories * 0.3);
    const fatGrams = Math.round(fatCalories / 9); // 脂肪每克9卡路里
    
    const carbsCalories = dailyCalories - proteinCalories - fatCalories;
    const carbsGrams = Math.round(carbsCalories / 4); // 碳水每克4卡路里
    
    // 计算微量营养素需求（简化版）
    const micronutrients = {
      vitamins: {
        A: 900, // 单位：μg
        C: 90,  // 单位：mg
        D: 15,  // 单位：μg
        E: 15   // 单位：mg
      },
      minerals: {
        calcium: 1000,    // 单位：mg
        iron: 8,         // 单位：mg
        magnesium: 400,  // 单位：mg
        potassium: 3500  // 单位：mg
      }
    };
    
    const dailyNeeds = {
      calories: dailyCalories,
      macronutrients: {
        protein: proteinGrams,
        carbs: carbsGrams,
        fat: fatGrams
      },
      micronutrients
    };
    
    res.json(dailyNeeds);
  } catch (error) {
    res.status(500).json({ message: '计算每日营养需求失败', error: error.message });
  }
});

module.exports = router;