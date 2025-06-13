import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  CircularProgress,
  Typography,
  Alert,
} from '@mui/material';

// 导入拆分后的组件
import DietHeader from '@/pages/diet/DietHeader';
import NutritionOverview from '@/pages/diet/NutritionOverview';
import DietItemsTable from '@/pages/diet/DietItemsTable';
import NutritionDetails from '@/pages/diet/NutritionDetails';

// 导入对话框组件
import DietDialog from '@/components/dialogs/DietDialog';
import ShoppingListDialog from '@/components/dialogs/ShoppingListDialog';
import FoodDetailDialog from '@/components/dialogs/FoodDetailDialog';
import FoodAddDialog from '@/components/dialogs/FoodAddDialog';
import DishAddDialog from '@/components/dialogs/DishAddDialog';

// 导入工具函数和服务
import { calculateTotalNutrition, calculateDietItem, calculateFoodNutrition } from '@/services/NutritionService';
import { saveDiet, deleteDiet, getUserDiets, updateFoodInDiet } from '@/pages/diet/DietService';
import { generateDietByDailyNeeds, optimizeDietByUserData, saveGeneratedDiet } from '@/pages/diet/DietAutoGenerator';
import dailyNeeds from '@data/needs/DailyNeeds.json';
import { calculateDietScoreWithUserData } from '@/services/DietScoreService';
// 导入FoodService
import { getAllFoods as getFoodsFromService, getFoodById } from '@/services/FoodService';
// 导入DishService
import { getAllDishes as getDishesFromService } from '@/services/DishService';

// 导入存储服务
import { DIET_PAGE_STATE_KEY, saveToLocalStorage, getFromLocalStorage } from '@/services/StorageService';

const Diet = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [foods, setFoods] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [diets, setDiets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 食谱状态
  const [dietName, setDietName] = useState(`${new Date().toLocaleDateString()}食谱`);
  const [dietItems, setDietItems] = useState([]);
  
  // 食物添加状态
  const [categories, setCategories] = useState(['全部']);
  const [filteredFoods, setFilteredFoods] = useState([]);
  
  // 对话框状态
  const [dietDialogOpen, setDietDialogOpen] = useState(false);
  const [foodAddDialogOpen, setFoodAddDialogOpen] = useState(false);
  const [dishAddDialogOpen, setDishAddDialogOpen] = useState(false);
  const [foodDetailDialogOpen, setFoodDetailDialogOpen] = useState(false);
  const [foodToView, setFoodToView] = useState(null);
  const [dishToView, setDishToView] = useState(null);
  const [shoppingListDialogOpen, setShoppingListDialogOpen] = useState(false);
  
  // 按文件保存食谱选项 - 默认为true，始终按文件保存
  const [saveAsFile, setSaveAsFile] = useState(true);
  
  // 食谱营养成分总计
  const [totalNutrition, setTotalNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0
  });
  
  // 从localStorage恢复状态
  useEffect(() => {
    try {
      console.log('尝试从localStorage恢复Diet状态');
      // 使用用户ID获取存储数据，防止不同用户数据混淆
      const userId = user?.id;
      const savedState = getFromLocalStorage(DIET_PAGE_STATE_KEY, null, userId);
      
      if (savedState) {
        const { dietName: savedName, dietItems: savedItems } = savedState;
        console.log('从localStorage恢复的数据:', { savedName, savedItemsLength: savedItems.length });
        console.log('恢复的dietItems详情:', JSON.stringify(savedItems));
        
        if (savedName) setDietName(savedName);
        if (savedItems && Array.isArray(savedItems) && savedItems.length > 0) {
          console.log('设置dietItems状态为恢复的数据');
          setDietItems(savedItems);
        } else {
          console.log('恢复的dietItems为空或无效，使用默认空数组');
        }
      } else {
        console.log('localStorage中没有保存的Diet状态');
      }
    } catch (error) {
      console.error('从localStorage恢复Diet状态失败:', error);
    }
  }, [user]);

  // 当dietItems或dietName变化时，保存状态到localStorage
  useEffect(() => {
    try {
      console.log('保存Diet状态到localStorage');
      console.log('当前dietItems长度:', dietItems.length);
      
      const stateToSave = {
        dietName,
        dietItems
      };
      
      // 使用用户ID保存存储数据，防止不同用户数据混淆
      const userId = user?.id;
      saveToLocalStorage(DIET_PAGE_STATE_KEY, stateToSave, userId);
      console.log('Diet状态已保存到localStorage');
    } catch (error) {
      console.error('保存Diet状态失败:', error);
    }
  }, [dietItems, dietName, user]);
  
  // 获取所有食物和菜谱数据以及用户的食谱
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // 获取食物数据
        let foodsData;
        try {
          foodsData = await getFoodsFromService();
          console.log('成功从FoodService获取食物数据:', foodsData.length);
        } catch (foodServiceError) {
          console.error('从FoodService获取数据失败，尝试从DietService获取:', foodServiceError);
          foodsData = await getAllFoods();
        }
        setFoods(foodsData);
        
        // 提取食物分类
        const uniqueCategories = ['全部', ...new Set(foodsData.map(food => food.category))];
        setCategories(uniqueCategories);
        setFilteredFoods(foodsData);
        
        // 获取菜谱数据
        try {
          const dishesData = await getDishesFromService();
          console.log('成功从DishService获取菜谱数据:', dishesData.length);
          setDishes(dishesData);
        } catch (dishServiceError) {
          console.error('获取菜谱数据失败:', dishServiceError);
        }
        
        // 如果用户已登录，获取用户的食谱
        if (user && user.id) {
          const userDiets = await getUserDiets(user);
          setDiets(userDiets);
          
          // 检查URL参数中是否有dietId
          const params = new URLSearchParams(location.search);
          const dietId = params.get('id');
          
          if (dietId) {
            // 查找对应的diet
            const targetDiet = userDiets.find(diet => diet.id === dietId);
            if (targetDiet) {
              // 加载找到的diet
              handleLoadDiet(targetDiet);
              setSuccess(`已加载食谱: ${targetDiet.name}`);
            } else {
              setError(`未找到ID为${dietId}的食谱`);
            }
          }
        }
      } catch (err) {
        console.error('获取数据失败:', err);
        setError(err.message || '获取数据失败，请重试');
      } finally {
        setLoading(false);
        console.log('数据加载完成，设置loading为false');
      }
    };
    
    fetchData();
  }, [user]);
  
  // 计算食谱的总营养成分
  useEffect(() => {
    console.log('Diet.jsx - 计算食谱总营养成分');
    console.log('dietItems长度:', dietItems.length);
    console.log('dietItems内容:', JSON.stringify(dietItems));
    console.log('foods长度:', foods.length);
    
    // 使用异步版本的calculateTotalNutrition
    const calculateNutrition = async () => {
      try {
        const totals = calculateTotalNutrition(dietItems);
        console.log('计算得到的总营养成分:', totals);
        setTotalNutrition(totals);
      } catch (error) {
        console.error('计算总营养成分时出错:', error);
        // 设置默认值，避免UI显示NaN
        setTotalNutrition({
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0
        });
      }
    };
    
    calculateNutrition();
  }, [dietItems, foods]);
  
  // 添加食物到食谱
  const handleAddFood = (selectedFood, amount) => {
    if (!selectedFood || !amount || isNaN(amount) || amount <= 0) {
      setError('请选择食物并输入有效的数量');
      return;
    }
    
    try {
      // 使用已导入的calculateDietItem函数计算食谱项目的营养素含量（同步调用）
      const newItem = calculateDietItem(selectedFood.id, amount);
      
      // 检查是否已存在该食物，如果存在则更新数量
      const existingItemIndex = dietItems.findIndex(item => item.foodId === selectedFood.id);
      
      if (existingItemIndex !== -1) {
        const updatedItems = [...dietItems];
        const oldAmount = updatedItems[existingItemIndex].amount;
        const newAmount = oldAmount + amount;
        
        // 使用NutritionService计算更新后的营养素含量（同步调用）
        const updatedItem = calculateDietItem(selectedFood.id, newAmount);
        updatedItems[existingItemIndex] = updatedItem;
        setDietItems(updatedItems);
        
        setFoodAddDialogOpen(false);
        setSuccess('食物已添加到食谱');
        
        // 3秒后清除成功消息
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setDietItems([...dietItems, newItem]);
        
        setFoodAddDialogOpen(false);
        setSuccess('食物已添加到食谱');
        
        // 3秒后清除成功消息
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError(`添加食物失败: ${error.message}`);
    }
  };
  
  // 添加菜肴到食谱
  const handleAddDish = (selectedDish, dishFoods) => {
    try {
      if (!selectedDish || !dishFoods || !Array.isArray(dishFoods)) {
        throw new Error('菜肴数据无效');
      }
      
      console.log('添加菜肴:', selectedDish.name);
      console.log('菜肴食物:', dishFoods);
      
      // 新的食谱项目
      const newItems = [];
      
      // 遍历菜肴中的食物
      dishFoods.forEach(({ foodId, amount }) => {
        // 检查食物是否已存在于食谱中
        const existingItemIndex = dietItems.findIndex(item => 
          item.foodId === foodId && item.dishId === selectedDish.id
        );
        
        if (existingItemIndex >= 0) {
          // 如果食物已存在，更新数量
          const updatedItems = [...dietItems];
          const newAmount = updatedItems[existingItemIndex].amount + amount;
          
          // 使用NutritionService计算更新后的营养素含量
          const updatedItem = calculateDietItem(foodId, newAmount, selectedDish.id);
          updatedItems[existingItemIndex] = updatedItem;
          
          setDietItems(updatedItems);
        } else {
          // 如果食物不存在，添加新项目
          try {
            // 使用NutritionService计算营养素含量
            const newItem = calculateDietItem(foodId, amount, selectedDish.id);
            newItems.push(newItem);
          } catch (error) {
            console.error(`添加食物(ID:${foodId})失败:`, error);
          }
        }
      });
      
      // 将新项目添加到食谱中
      if (newItems.length > 0) {
        setDietItems([...dietItems, ...newItems]);
      }
      
      setDishAddDialogOpen(false);
      setSuccess(`菜肴 ${selectedDish.name} 已添加到食谱`);
      
      // 3秒后清除成功消息
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(`添加菜肴失败: ${error.message}`);
    }
  };
  
  // 从食谱中移除食物
  const handleRemoveFood = (index) => {
    const updatedItems = [...dietItems];
    updatedItems.splice(index, 1);
    setDietItems(updatedItems);
  };
  
  // 更新食物数量
  const handleAmountChange = (index, newAmount) => {
    try {
      const updatedItems = [...dietItems];
      const foodId = updatedItems[index].foodId;
      
      // 使用NutritionService计算更新后的营养素含量（同步调用）
      const updatedItem = calculateDietItem(foodId, newAmount);
      updatedItems[index] = updatedItem;
      setDietItems(updatedItems);
    } catch (error) {
      console.error('更新食物数量时出错:', error);
      setError(`更新食物数量时出错: ${error.message}`);
    }
  };
  
  // 保存食谱
  const handleSaveDiet = async () => {
    try {
      const updatedDiets = await saveDiet({
        name: dietName,
        user,
        dietItems,
        totalNutrition,
        diets: diets,
        saveAsFile
      });
      
      setDiets(updatedDiets);
      setSuccess('食谱保存成功');
      
      // 3秒后清除成功消息
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('保存食谱失败:', err);
      setError(err.message || '保存食谱失败，请重试');
    }
  };
  
  // 加载食谱
  const handleLoadDiet = (diet) => {
    setDietName(diet.name);
    
    try {
      // 处理所有食谱项目（同步调用）
      const items = diet.items.map(item => {
        return calculateDietItem(item.foodId, item.amount, item.dishId);
      });
      
      // 过滤掉null值
      const validItems = items.filter(Boolean);
      
      setDietItems(validItems);
      setDietDialogOpen(false);
      setSuccess('食谱加载成功');
      
      // 3秒后清除成功消息
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('加载食谱时出错:', error);
      setError(`加载食谱时出错: ${error.message}`);
    }
  };
  
  // 删除食谱
  const handleDeleteDiet = async (dietId) => {
    try {
      await deleteDiet(dietId, user);
      
      // 更新本地食谱列表
      setDiets(diets.filter(diet => diet.id !== dietId));
      setSuccess('食谱删除成功');
      
      // 3秒后清除成功消息
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('删除食谱失败:', err);
      setError(err.message || '删除食谱失败，请重试');
    }
  };
  
  // 这些函数已移至DietUtils.js中
  
  // 处理食物详情更新
  const handleFoodUpdate = (updatedFood) => {
    const { updatedFoods, updatedDietItems } = updateFoodInDiet(updatedFood, foods, dietItems);
    setFoods(updatedFoods);
    setDietItems(updatedDietItems);
  };
  
  // 自动生成食谱
  const handleAutoGenerate = async () => {
    try {
      // 清空当前食物列表
      setDietItems([]);
      
      // 根据每日标准需求生成食谱
      const categoryDiet = await generateDietByDailyNeeds(foods, dailyNeeds);
      
      // 根据用户数据优化食谱中食物的重量
      const optimizedDiet = await optimizeDietByUserData(categoryDiet, user, dailyNeeds);
      
      // 添加日志输出，列出优化后食谱中的食物和数量
      console.log('优化后的食谱食物列表:', optimizedDiet);
      
      // 添加日志输出，检查优化后的食谱得分
      // 将分类食谱转换为扁平列表，以便计算得分
      const scoreResult = calculateDietScoreWithUserData(optimizedDiet, user, dailyNeeds.standardNeeds);
      console.log('优化后的食谱得分:', scoreResult.score);
      console.log('优化后的食谱得分详情:', scoreResult.detail);
      
      // 转换为食谱项目格式
      const newItems = [];
      
      // 使用Promise.all并行处理所有食物项
      const processItems = async () => {
        try {
          // 使用头部导入的服务
          
          // 并行处理所有项目
          const itemPromises = optimizedDiet.map(async (item) => {
            // 获取食物详细信息
            const food = await getFoodById(item.foodId);
            // 计算营养信息
            const nutritionInfo = await calculateFoodNutrition(item.foodId, item.amount);
            
            return {
              foodId: item.foodId,
              foodName: food.name,
              amount: item.amount,
              calories: nutritionInfo.calories,
              protein: nutritionInfo.protein,
              carbs: nutritionInfo.carbs,
              fat: nutritionInfo.fat,
              fiber: nutritionInfo.fiber || 0,
              category: food.category || food.type,
              subType: food.subCategory || food.subType
            };
          });
          
          // 等待所有项目处理完成
          const processedItems = await Promise.all(itemPromises);
          setDietItems(processedItems);
        } catch (error) {
          console.error('处理食谱项目时出错:', error);
          setError('处理食谱项目时出错: ' + error.message);
        }
      };
      
      // 执行处理
      processItems();
      
      // 添加到食谱中
      setDietItems(newItems);
      
      setSuccess('已根据每日营养需求标准生成食谱');
      
      // 3秒后清除成功消息
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('自动生成食谱失败:', err);
      setError(err.message || '自动生成食谱失败，请重试');
    }
  };

  // 自动优化食谱
  const handleAutoOptimize = async () => {
    try {
      if (dietItems.length === 0) {
        setError('食谱为空，无法进行优化');
        return;
      }

      // 将dietItems转换为optimizeDietByUserData函数所需的格式
      const simplifiedDiet = dietItems.map(item => ({
        foodId: item.foodId,
        amount: item.amount
      }));

      // 调用优化函数
      const optimizedDiet = await optimizeDietByUserData(simplifiedDiet, user, dailyNeeds);

      // 添加日志输出，列出优化后食谱中的食物和数量
      console.log('优化后的食谱食物列表:', optimizedDiet);
      
      // 添加日志输出，检查优化后的食谱得分
      const scoreResult = await calculateDietScoreWithUserData(optimizedDiet, user, dailyNeeds.standardNeeds);
      console.log('优化后的食谱得分:', scoreResult.score);
      console.log('优化后的食谱得分详情:', scoreResult.detail);
      
      // 转换为食谱项目格式
      const processItems = async () => {
        try {
          // 使用头部导入的服务
          
          // 并行处理所有项目
          const itemPromises = optimizedDiet.map(async (item) => {
            // 获取食物详细信息
            const food = await getFoodById(item.foodId);
            // 计算营养信息
            const nutritionInfo = await calculateFoodNutrition(item.foodId, item.amount);
            
            return {
              foodId: item.foodId,
              foodName: food.name,
              amount: item.amount,
              calories: nutritionInfo.calories,
              protein: nutritionInfo.protein,
              carbs: nutritionInfo.carbs,
              fat: nutritionInfo.fat,
              fiber: nutritionInfo.fiber || 0,
              category: food.category || food.type,
              subType: food.subCategory || food.subType
            };
          });
          
          // 等待所有项目处理完成
          const processedItems = await Promise.all(itemPromises);
          setDietItems(processedItems);
        } catch (error) {
          console.error('处理食谱项目时出错:', error);
          setError('处理食谱项目时出错: ' + error.message);
        }
      };
      
      // 执行处理
      processItems();
      
      setSuccess('已根据用户数据优化食谱');
      
      // 3秒后清除成功消息
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('自动优化食谱失败:', err);
      setError(err.message || '自动优化食谱失败，请重试');
    }
  };

  // 生成购物清单
  const handleGenerateShoppingList = () => {
    if (dietItems.length === 0) {
      setError('食谱为空，无法生成购物清单');
      return;
    }
    
    // 打开购物清单对话框
    setShoppingListDialogOpen(true);
  };

  // 清除Diet状态
  const handleClearDietState = () => {
    try {
      console.log('开始清除Diet状态');
      localStorage.removeItem(DIET_PAGE_STATE_KEY);
      setDietName(`${new Date().toLocaleDateString()}食谱`);
      setDietItems([]);
      console.log('Diet状态已清除，重置dietItems为空数组');
      
      // 重新加载食物数据
      const reloadFoods = async () => {
        try {
          const foodsData = await getFoodsFromService();
          console.log('重新加载食物数据成功:', foodsData.length);
          setFoods(foodsData);
          
          // 提取食物分类
          const uniqueCategories = ['全部', ...new Set(foodsData.map(food => food.category))];
          setCategories(uniqueCategories);
          setFilteredFoods(foodsData);
        } catch (error) {
          console.error('重新加载食物数据失败:', error);
        }
      };
      
      reloadFoods();
      
      setSuccess('已清除食谱状态');
      
      // 3秒后清除成功消息
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('清除Diet状态失败:', error);
      setError('清除Diet状态失败: ' + error.message);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          加载中...
        </Typography>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 标题区 */}
      <DietHeader 
        dietName={dietName}
        setDietName={setDietName}
        onSave={handleSaveDiet}
        onLoad={() => setDietDialogOpen(true)}
        onAdd={() => setFoodAddDialogOpen(true)}
        onAddDish={() => setDishAddDialogOpen(true)}
        onAutoGenerate={handleAutoGenerate}
        onAutoOptimize={handleAutoOptimize}
        onGenerateShoppingList={handleGenerateShoppingList}
        onClearDiet={handleClearDietState}
      />
      
      {/* 消息提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      
      {/* 食谱总览区 */}
      <NutritionOverview totalNutrition={totalNutrition} user={user} dietItems={dietItems} />
      
      {/* 食物列表区 */}
      <DietItemsTable 
        dietItems={dietItems}
        foods={foods}
        dishes={dishes} // 传递dishes参数
        onAmountChange={handleAmountChange}
        onRemoveFood={handleRemoveFood}
        onViewFoodDetail={(food) => {
          setFoodToView(food);
          setFoodDetailDialogOpen(true);
        }}
      />
      
      {/* 营养详情区 */}
      <NutritionDetails dietItems={dietItems} totalNutrition={totalNutrition} />
      
      {/* 食谱选择对话框 */}
      <DietDialog 
        open={dietDialogOpen}
        onClose={() => setDietDialogOpen(false)}
        diets={diets}
        onLoadDiet={handleLoadDiet}
        onDeleteDiet={handleDeleteDiet}
        saveAsFile={saveAsFile}
        onSaveAsFileChange={setSaveAsFile}
      />
      
      {/* 食物添加对话框 */}
      <FoodAddDialog
        open={foodAddDialogOpen}
        onClose={() => setFoodAddDialogOpen(false)}
        foods={foods}
        categories={categories}
        onAddFood={handleAddFood}
        onViewFoodDetail={(food) => {
          setFoodToView(food);
          setFoodDetailDialogOpen(true);
        }}
      />
      
      {/* 食物详情对话框 */}
      <FoodDetailDialog
        open={foodDetailDialogOpen}
        onClose={() => setFoodDetailDialogOpen(false)}
        food={foodToView}
        onFoodUpdate={handleFoodUpdate}
      />
      
      {/* 购物清单对话框 */}
      <ShoppingListDialog
        open={shoppingListDialogOpen}
        onClose={() => setShoppingListDialogOpen(false)}
        items={dietItems}
      />
      
      {/* 菜肴添加对话框 */}
      <DishAddDialog
        open={dishAddDialogOpen}
        onClose={() => setDishAddDialogOpen(false)}
        onAddDish={handleAddDish}
        onViewDishDetail={(dish) => {
          setDishToView(dish);
          // 这里可以添加查看菜肴详情的逻辑
        }}
        initialDishes={dishes} // 传递已获取的菜谱数据
      />
    </Container>
  );
};

export default Diet;
