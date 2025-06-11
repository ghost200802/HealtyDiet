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
import RecipeDialog from '@/components/dialogs/RecipeDialog';
import ShoppingListDialog from '@/components/dialogs/ShoppingListDialog';
import FoodAddDialog from '@/components/dialogs/FoodAddDialog';
import PlanLoadDialog from '@/components/dialogs/PlanLoadDialog'; // 导入PlanLoadDialog

// 导入自定义组件
import PlanHeader from '@/components/recipe/PlanHeader';
import RecipeCardGroup from '@/components/recipe/RecipeCardGroup';

// 导入工具函数和服务
import { calculateTotalNutrition } from '@/services/NutritionService';
import { getUserRecipes } from '@/pages/recipe/RecipeService';
import { savePlan, getUserPlans } from '@/pages/plan/PlanService'; // 导入PlanService

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
  const [recipes, setRecipes] = useState([]);
  const [savedPlans, setSavedPlans] = useState([]);
  
  // 对话框状态
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const [foodAddDialogOpen, setFoodAddDialogOpen] = useState(false);
  const [shoppingListDialogOpen, setShoppingListDialogOpen] = useState(false);
  const [planLoadDialogOpen, setPlanLoadDialogOpen] = useState(false); // 添加PlanLoadDialog状态
  
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
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // 获取用户已保存的食谱列表
        if (user && user.id) {
          const userRecipes = await getUserRecipes(user);
          console.log('获取到用户食谱:', userRecipes);
          setSavedPlans(userRecipes);
        } else {
          setSavedPlans([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('获取数据失败:', err);
        setError(err.message || '获取数据失败，请重试');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  // 计算一周食谱的总营养成分
  useEffect(() => {
    const calculateWeeklyNutrition = () => {
      try {
        // 将所有食谱中的食物项目合并
        const allRecipeItems = recipes.flatMap(recipe => recipe.items || []);
        
        // 计算总营养成分
        const totals = calculateTotalNutrition(allRecipeItems);
        
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
  }, [recipes]);
  
  // 保存食谱规划
  const handleSavePlan = async () => {
    try {
      // 检查是否有食谱
      if (recipes.length === 0) {
        setError('规划中没有食谱，请先添加食谱');
        return;
      }
      
      // 保存食谱规划
      await savePlan({
        name: planName,
        user,
        recipes
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
      // 注意：plan.recipes只包含食谱ID数组，需要获取完整的食谱数据
      if (plan.recipes && plan.recipes.length > 0) {
        setLoading(true);
        
        // 获取完整的食谱数据
        const token = localStorage.getItem('token');
        const recipePromises = plan.recipes.map(recipeId => 
          axios.get(`/api/recipes/${recipeId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        );
        
        const recipeResponses = await Promise.all(recipePromises);
        const fullRecipes = recipeResponses.map(response => response.data);
        
        console.log('获取到完整食谱数据:', fullRecipes);
        setRecipes(fullRecipes);
        setLoading(false);
      } else {
        // 如果没有食谱，设置为空数组
        setRecipes([]);
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
  const handleLoadRecipe = (recipe) => {
    try {
      console.log('加载食谱:', recipe);
      // 将选中的食谱添加到当前食谱列表中
      const newRecipe = {
        ...recipe,
        // 确保items属性存在
        items: recipe.items || []
      };
      
      // 添加到当前食谱列表
      setRecipes([...recipes, newRecipe]);
      setRecipeDialogOpen(false);
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
  const handleGenerateShoppingList = () => {
    if (recipes.length === 0) {
      setError('食谱规划为空，无法生成购物清单');
      return;
    }
    
    // 打开购物清单对话框
    setShoppingListDialogOpen(true);
  };
  
  // 添加食谱到规划
  const handleAddRecipe = (recipe) => {
    setRecipes([...recipes, recipe]);
    setSuccess('食谱已添加到规划');
    
    // 3秒后清除成功消息
    setTimeout(() => setSuccess(''), 3000);
  };
  
  // 从规划中移除食谱
  const handleRemoveRecipe = (index) => {
    const updatedRecipes = [...recipes];
    updatedRecipes.splice(index, 1);
    setRecipes(updatedRecipes);
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
      <RecipeCardGroup 
        recipes={recipes}
        onAddRecipe={() => setRecipeDialogOpen(true)}
        onRemoveRecipe={handleRemoveRecipe}
      />
      
      {/* 食谱选择对话框 */}
      <RecipeDialog 
        open={recipeDialogOpen}
        onClose={() => setRecipeDialogOpen(false)}
        recipes={savedPlans}
        onLoadRecipe={handleLoadRecipe}
        onDeleteRecipe={() => {}}
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
        items={recipes.flatMap(recipe => recipe.items || [])}
      />
    </Container>
  );
};

export default Plan;