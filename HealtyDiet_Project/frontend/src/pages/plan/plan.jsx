import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  CircularProgress,
  Typography,
  Alert,
  Paper,
  Grid,
  Box,
} from '@mui/material';

// 导入营养相关组件
import CaloriesDisplay from '@/components/nutrition/CaloriesDisplay';
import EnergyDistribution from '@/components/nutrition/EnergyDistribution';

// 导入对话框组件
import DietDialog from '@/components/dialogs/DietDialog';
import ShoppingListDialog from '@/components/dialogs/ShoppingListDialog';
import FoodAddDialog from '@/components/dialogs/FoodAddDialog';
import PlanLoadDialog from '@/components/dialogs/PlanLoadDialog'; // 导入PlanLoadDialog

// 导入自定义组件
import PlanHeader from '@/pages/plan/PlanHeader';
import DietCardGroup from '@/components/diet/DietCardGroup';

// 导入工具函数和服务
import { calculateTotalNutrition } from '@/services/NutritionService';
import { getUserDiets } from '@/pages/diet/DietService';
import { savePlan, getUserPlans } from '@/pages/plan/PlanService'; // 导入PlanService
import { getFoodsByIds } from '@/services/FoodService'; // 导入FoodService

// 导入存储服务
import { PLAN_PAGE_STATE_KEY, saveToLocalStorage, getFromLocalStorage, removeFromLocalStorage } from '@/services/StorageService';

/**
 * 食谱规划页面组件
 */
const Plan = ({ user }) => {
  // 状态
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 食谱规划状态
  const [planName, setPlanName] = useState(`${new Date().toLocaleDateString()}食谱规划`);
  const [diets, setDiets] = useState([]);
  const [savedPlans, setSavedPlans] = useState([]);
  
  // 对话框状态
  const [dietDialogOpen, setDietDialogOpen] = useState(false);
  const [foodAddDialogOpen, setFoodAddDialogOpen] = useState(false);
  const [shoppingListDialogOpen, setShoppingListDialogOpen] = useState(false);
  const [planLoadDialogOpen, setPlanLoadDialogOpen] = useState(false); // 添加PlanLoadDialog状态
  
  // 购物清单数据
  const [groupedShoppingItems, setGroupedShoppingItems] = useState({});
  
  // 营养成分总计
  const [totalNutrition, setTotalNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0
  });
  
  // 初始化数据
  useEffect(() => {
    console.log('Plan组件初始化useEffect触发，user状态:', user);
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('开始获取Plan数据，当前user:', user);
        
        // 获取用户已保存的食谱列表
        if (user && user.id) {
          console.log('用户已登录，ID:', user.id, '开始获取用户食谱');
          const userDiets = await getUserDiets(user);
          console.log('获取到用户食谱:', userDiets);
          setSavedPlans(userDiets);
        } else {
          console.log('用户未登录或ID不存在，设置空食谱列表');
          setSavedPlans([]);
        }
        
        // 尝试从localStorage恢复之前的Plan状态
        // 使用用户ID获取存储数据，防止不同用户数据混淆
        const userId = user?.id;
        const parsedState = getFromLocalStorage(PLAN_PAGE_STATE_KEY, null, userId);
        console.log('从localStorage获取的Plan状态:', parsedState);
        
        if (parsedState) {
          try {
            console.log('从localStorage恢复Plan状态:', parsedState);
            
            // 恢复Plan名称
            if (parsedState.planName) {
              console.log('恢复Plan名称:', parsedState.planName);
              setPlanName(parsedState.planName);
            }
            
            // 恢复食谱列表
            if (parsedState.diets && Array.isArray(parsedState.diets) && parsedState.diets.length > 0) {
              console.log('恢复食谱列表，数量:', parsedState.diets.length);
              setDiets(parsedState.diets);
            } else {
              console.log('没有可恢复的食谱列表或列表为空');
            }
          } catch (parseError) {
            console.error('解析保存的Plan状态失败:', parseError);
            // 清除可能损坏的数据
            // 使用用户ID删除存储数据，防止删除其他用户的数据
            const userId = user?.id;
            removeFromLocalStorage(PLAN_PAGE_STATE_KEY, userId);
          }
        } else {
          console.log('localStorage中没有保存的Plan状态');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('获取数据失败:', err);
        setError(err.message || '获取数据失败，请重试');
        setLoading(false);
      }
    };
    
    // 确保只有当user对象可用时才执行fetchData
    if (user) {
      console.log('用户对象可用，开始获取数据');
      fetchData();
    } else {
      console.log('用户对象不可用，等待user状态更新');
      setLoading(false);
    }
    
    // 组件卸载时的清理函数
    return () => {
      console.log('Plan组件useEffect清理函数执行');
    };
  }, [user]);
  
  // 保存当前Plan状态到localStorage
  useEffect(() => {
    // 只有当diets或planName变化且不为空时才保存
    if ((diets.length > 0 || planName !== `${new Date().toLocaleDateString()}食谱规划`)) {
      const planState = {
        planName,
        diets
      };
      
      try {
        // 使用用户ID保存存储数据，防止不同用户数据混淆
        const userId = user?.id;
        saveToLocalStorage(PLAN_PAGE_STATE_KEY, planState, userId);
        console.log('Plan状态已保存到localStorage');
      } catch (error) {
        console.error('保存Plan状态到localStorage失败:', error);
      }
    }
  }, [diets, planName, user]);
  
  // 计算一周食谱的总营养成分
  useEffect(() => {
    const calculateWeeklyNutrition = () => {
      try {
        // 将所有食谱中的食物项目合并
        const allDietItems = diets.flatMap(diet => diet.items || []);
        
        // 计算总营养成分
        const totals = calculateTotalNutrition(allDietItems);
        
        // 计算每日平均值（除以7天）
        const dailyAverage = {
          calories: Math.round((totals.calories / 7) * 10) / 10,
          protein: Math.round((totals.protein / 7) * 10) / 10,
          carbs: Math.round((totals.carbs / 7) * 10) / 10,
          fat: Math.round((totals.fat / 7) * 10) / 10,
          fiber: Math.round((totals.fiber / 7) * 10) / 10
        };
        
        setTotalNutrition(dailyAverage);
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
    
    calculateWeeklyNutrition();
  }, [diets]);
  
  // 保存食谱规划
  const handleSavePlan = async () => {
    try {
      // 检查是否有食谱
      if (diets.length === 0) {
        setError('规划中没有食谱，请先添加食谱');
        return;
      }
      
      // 保存食谱规划
      await savePlan({
        name: planName,
        user,
        diets
      });
      
      setSuccess('食谱规划保存成功');
      
      // 3秒后清除成功消息
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('保存食谱规划失败:', err);
      setError(err.message || '保存食谱规划失败，请重试');
    }
  };
  
  // 加载食谱规划
  const handleLoadPlan = async (plan) => {
    try {
      console.log('加载规划:', plan);
      
      // 设置规划名称
      setPlanName(plan.name);
      
      // 加载规划中的食谱
      // 注意：plan.diets只包含食谱ID数组，需要获取完整的食谱数据
      if (plan.diets && plan.diets.length > 0) {
        setLoading(true);
        
        // 获取完整的食谱数据
        const token = localStorage.getItem('token');
        const dietPromises = plan.diets.map(dietId => 
          axios.get(`/api/diets/${dietId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        );
        
        const dietResponses = await Promise.all(dietPromises);
        const fullDiets = dietResponses.map(response => response.data);
        
        console.log('获取到完整食谱数据:', fullDiets);
        setDiets(fullDiets);
        setLoading(false);
      } else {
        // 如果没有食谱，设置为空数组
        setDiets([]);
      }
      
      // 关闭对话框
      setPlanLoadDialogOpen(false);
      
      setSuccess('规划已加载');
      
      // 3秒后清除成功消息
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('加载规划时出错:', error);
      setError(`加载规划时出错: ${error.message}`);
      setLoading(false);
    }
  };
  
  // 加载食谱
  const handleLoadDiet = (diet) => {
    try {
      console.log('加载食谱:', diet);
      // 将选中的食谱添加到当前食谱列表中
      const newDiet = {
        ...diet,
        // 确保items属性存在
        items: diet.items || []
      };
      
      // 添加到当前食谱列表
      setDiets([...diets, newDiet]);
      setDietDialogOpen(false);
      setSuccess('食谱已添加到规划');
      
      // 3秒后清除成功消息
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('加载食谱时出错:', error);
      setError(`加载食谱时出错: ${error.message}`);
    }
  };
  
  // 自动生成食谱规划
  const handleAutoGenerate = async () => {
    try {
      // 这里添加自动生成食谱规划的逻辑
      // 暂时只显示成功消息
      setSuccess('已自动生成食谱规划');
      
      // 3秒后清除成功消息
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('自动生成食谱规划失败:', err);
      setError(err.message || '自动生成食谱规划失败，请重试');
    }
  };
  
  // 生成购物清单
  const handleGenerateShoppingList = async () => {
    if (diets.length === 0) {
      setError('食谱规划为空，无法生成购物清单');
      return;
    }
    
    try {
      setLoading(true);
      
      // 收集所有食材ID
      const allFoodIds = new Set();
      diets.forEach(diet => {
        if (diet.items && diet.items.length > 0) {
          diet.items.forEach(item => {
            if (item.foodId) {
              allFoodIds.add(item.foodId);
            }
          });
        }
      });
      
      // 获取所有食材信息
      const foodsData = await getFoodsByIds([...allFoodIds]);
      
      // 星期几的中文名称
      const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      
      // 按周几分组食材
      const groupedItems = {};
      
      diets.forEach((diet, index) => {
        const weekday = WEEKDAYS[index % 7];
        if (!groupedItems[weekday]) {
          groupedItems[weekday] = [];
        }
        
        if (diet.items && diet.items.length > 0) {
          // 添加食材名称
          const itemsWithNames = diet.items.map(item => {
            const food = foodsData.find(f => f.id === item.foodId);
            return {
              ...item,
              foodName: food ? food.name : `食材ID: ${item.foodId}`
            };
          });
          
          groupedItems[weekday] = [...groupedItems[weekday], ...itemsWithNames];
        }
      });
      
      // 设置分组后的食材数据
      setGroupedShoppingItems(groupedItems);
      
      // 打开购物清单对话框
      setShoppingListDialogOpen(true);
      
    } catch (error) {
      console.error('生成购物清单失败:', error);
      setError('生成购物清单失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 添加食谱到规划
  const handleAddDiet = (diet) => {
    setDiets([...diets, diet]);
    setSuccess('食谱已添加到规划');
    
    // 3秒后清除成功消息
    setTimeout(() => setSuccess(''), 3000);
  };
  
  // 从规划中移除食谱
  const handleRemoveDiet = (index) => {
    const updatedDiets = [...diets];
    updatedDiets.splice(index, 1);
    setDiets(updatedDiets);
  };
  
  // 清除当前Plan状态
  const handleClearPlanState = () => {
    // 清除localStorage中的Plan状态
    // 使用用户ID删除存储数据，防止删除其他用户的数据
    const userId = user?.id;
    removeFromLocalStorage(PLAN_PAGE_STATE_KEY, userId);
    // 重置状态
    setPlanName(`${new Date().toLocaleDateString()}食谱规划`);
    setDiets([]);
    setSuccess('已清除当前规划');
    setTimeout(() => setSuccess(''), 3000);
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
      <PlanHeader 
        planName={planName}
        setPlanName={setPlanName}
        onSave={handleSavePlan}
        onLoad={() => setPlanLoadDialogOpen(true)} // 修改为打开PlanLoadDialog
        onAutoGenerate={handleAutoGenerate}
        onGenerateShoppingList={handleGenerateShoppingList}
        onClearPlan={handleClearPlanState} // 添加清除Plan状态的回调
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
      
      {/* 营养总览区 */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          营养总览
        </Typography>
        
        {/* 第一排：总热量、营养素能量占比 */}
        <Grid container spacing={3}>
          {/* 总热量 */}
          <Grid item xs={12} md={6}>
            <CaloriesDisplay totalNutrition={totalNutrition} user={user} />
          </Grid>
          
          {/* 营养素能量占比 */}
          <Grid item xs={12} md={6}>
            <EnergyDistribution totalNutrition={totalNutrition} />
          </Grid>
        </Grid>
      </Paper>
      
      {/* 食谱卡片展示区 */}
      <DietCardGroup 
        diets={diets}
        onAddDiet={() => setDietDialogOpen(true)}
        onRemoveDiet={handleRemoveDiet}
      />
      
      {/* 食谱选择对话框 */}
      <DietDialog 
        open={dietDialogOpen}
        onClose={() => setDietDialogOpen(false)}
        diets={savedPlans}
        onLoadDiet={handleLoadDiet}
        onDeleteDiet={() => {}}
      />
      
      {/* 食谱规划加载对话框 */}
      <PlanLoadDialog 
        open={planLoadDialogOpen}
        onClose={() => setPlanLoadDialogOpen(false)}
        onLoadPlan={handleLoadPlan}
        onDeletePlan={() => {}}
      />
      
      {/* 食物添加对话框 */}
      <FoodAddDialog
        open={foodAddDialogOpen}
        onClose={() => setFoodAddDialogOpen(false)}
        foods={[]}
        categories={[]}
        onAddFood={() => {}}
        onViewFoodDetail={() => {}}
      />
      
      {/* 购物清单对话框 */}
      <ShoppingListDialog
        open={shoppingListDialogOpen}
        onClose={() => setShoppingListDialogOpen(false)}
        items={Object.values(groupedShoppingItems).flat()} // 使用处理过的带有foodName的数据
        groupedItems={groupedShoppingItems}
      />
    </Container>
  );
};

export default Plan;