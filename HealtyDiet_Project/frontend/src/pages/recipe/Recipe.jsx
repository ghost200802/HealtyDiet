import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  CircularProgress,
  Typography,
  Alert,
} from '@mui/material';

// 导入拆分后的组件
import RecipeHeader from './RecipeHeader';
import NutritionOverview from './NutritionOverview';
import RecipeItemsTable from './RecipeItemsTable';
import NutritionDetails from './NutritionDetails';
import RecipeDialog from './RecipeDialog';

// 导入对话框组件
import FoodDetailDialog from '../../components/food/FoodDetailDialog';
import FoodAddDialog from '../../components/food/FoodAddDialog';

// 导入工具函数和服务
import { calculateTotalNutrition, calculateRecipeItem } from '../../services/NutritionService';
import { saveRecipe, deleteRecipe, getUserRecipes, getAllFoods, updateFoodInRecipe } from './RecipeService';
import { generateRecipeByDailyNeeds, flattenCategoryRecipe, optimizeRecipeByUserData } from './RecipeAutoGenerator';
import dailyNeeds from '../../../../data/needs/DailyNeeds.json';
import { calculateRecipeScoreWithUserData } from '../../services/RecipeScoreService';

const Recipe = ({ user }) => {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 食谱状态
  const [recipeName, setRecipeName] = useState(`${new Date().toLocaleDateString()}食谱`);
  const [recipeItems, setRecipeItems] = useState([]);
  
  // 食物添加状态
  const [categories, setCategories] = useState(['全部']);
  const [filteredFoods, setFilteredFoods] = useState([]);
  
  // 对话框状态
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const [foodAddDialogOpen, setFoodAddDialogOpen] = useState(false);
  const [foodDetailDialogOpen, setFoodDetailDialogOpen] = useState(false);
  const [foodToView, setFoodToView] = useState(null);
  
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
  
  // 获取所有食物和用户的食谱
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // 获取所有食物
        const foodsData = await getAllFoods();
        setFoods(foodsData);
        
        // 提取食物分类
        const uniqueCategories = ['全部', ...new Set(foodsData.map(food => food.category))];
        setCategories(uniqueCategories);
        setFilteredFoods(foodsData);
        
        // 如果用户已登录，获取用户的食谱
        if (user && user.id) {
          const userRecipes = await getUserRecipes(user);
          setRecipes(userRecipes);
        }
      } catch (err) {
        console.error('获取数据失败:', err);
        setError(err.message || '获取数据失败，请重试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  // 计算食谱的总营养成分
  useEffect(() => {
    const totals = calculateTotalNutrition(recipeItems, foods);
    setTotalNutrition(totals);
  }, [recipeItems, foods]);
  
  // 添加食物到食谱
  const handleAddFood = (selectedFood, amount) => {
    if (!selectedFood || !amount || isNaN(amount) || amount <= 0) {
      setError('请选择食物并输入有效的数量');
      return;
    }
    
    // 使用NutritionService计算食谱项目的营养素含量
    const { calculateRecipeItem } = require('../../services/NutritionService');
    const newItem = calculateRecipeItem(selectedFood, amount);
    
    // 检查是否已存在该食物，如果存在则更新数量
    const existingItemIndex = recipeItems.findIndex(item => item.foodId === selectedFood.id);
    
    if (existingItemIndex !== -1) {
      const updatedItems = [...recipeItems];
      const oldAmount = updatedItems[existingItemIndex].amount;
      const newAmount = oldAmount + amount;
      
      // 使用NutritionService计算更新后的营养素含量
      updatedItems[existingItemIndex] = calculateRecipeItem(selectedFood, newAmount);
      
      setRecipeItems(updatedItems);
    } else {
      setRecipeItems([...recipeItems, newItem]);
    }
    
    setFoodAddDialogOpen(false);
    setSuccess('食物已添加到食谱');
    
    // 3秒后清除成功消息
    setTimeout(() => setSuccess(''), 3000);
  };
  
  // 从食谱中移除食物
  const handleRemoveFood = (index) => {
    const updatedItems = [...recipeItems];
    updatedItems.splice(index, 1);
    setRecipeItems(updatedItems);
  };
  
  // 更新食物数量
  const handleAmountChange = (index, newAmount) => {
    const updatedItems = [...recipeItems];
    const food = foods.find(f => f.id === updatedItems[index].foodId);
    if (food) {
      // 使用NutritionService计算更新后的营养素含量
      updatedItems[index] = calculateRecipeItem(food, newAmount);
      setRecipeItems(updatedItems);
    }
  };
  
  // 保存食谱
  const handleSaveRecipe = async () => {
    try {
      const updatedRecipes = await saveRecipe({
        name: recipeName,
        user,
        recipeItems,
        totalNutrition,
        recipes,
        saveAsFile
      });
      
      setRecipes(updatedRecipes);
      setSuccess('食谱保存成功');
      
      // 3秒后清除成功消息
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('保存食谱失败:', err);
      setError(err.message || '保存食谱失败，请重试');
    }
  };
  
  // 加载食谱
  const handleLoadRecipe = (recipe) => {
    setRecipeName(recipe.name);
    
    // 转换食谱项目格式
    const items = recipe.items.map(item => {
      const food = foods.find(f => f.id === item.foodId);
      if (!food) return null;
      
      // 使用NutritionService计算营养素含量
      return calculateRecipeItem(food, item.amount);
    }).filter(Boolean);
    
    setRecipeItems(items);
    setRecipeDialogOpen(false);
    setSuccess('食谱加载成功');
    
    // 3秒后清除成功消息
    setTimeout(() => setSuccess(''), 3000);
  };
  
  // 删除食谱
  const handleDeleteRecipe = async (recipeId) => {
    try {
      await deleteRecipe(recipeId, user);
      
      // 更新本地食谱列表
      setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
      setSuccess('食谱删除成功');
      
      // 3秒后清除成功消息
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('删除食谱失败:', err);
      setError(err.message || '删除食谱失败，请重试');
    }
  };
  
  // 这些函数已移至RecipeUtils.js中
  
  // 处理食物详情更新
  const handleFoodUpdate = (updatedFood) => {
    const { updatedFoods, updatedRecipeItems } = updateFoodInRecipe(updatedFood, foods, recipeItems);
    setFoods(updatedFoods);
    setRecipeItems(updatedRecipeItems);
  };
  
  // 自动生成食谱
  const handleAutoGenerate = async () => {
    try {
      // 清空当前食物列表
      setRecipeItems([]);
      
      // 根据每日标准需求生成食谱
      const categoryRecipe = await generateRecipeByDailyNeeds(foods, dailyNeeds);
      
      // 根据用户数据优化食谱中食物的重量
      const optimizedRecipe = optimizeRecipeByUserData(categoryRecipe, user, dailyNeeds);
      
      // 添加日志输出，列出优化后食谱中的食物和数量
      console.log('优化后的食谱食物列表:');
      Object.keys(optimizedRecipe).forEach(category => {
        console.log(`类别: ${category}`);
        optimizedRecipe[category].forEach(item => {
          console.log(`  - ${item.food.name}: ${item.amount}g`);
        });
      });
      
      // 添加日志输出，检查优化后的食谱得分
      console.log('优化后的食谱得分:', calculateRecipeScoreWithUserData(optimizedRecipe, user, dailyNeeds.standardNeeds));
      
      // 将分类食谱转换为扁平列表
      const flatRecipe = flattenCategoryRecipe(optimizedRecipe);
      
      // 转换为食谱项目格式
      const newItems = flatRecipe.map(item => ({
        foodId: item.food.id,
        foodName: item.food.name,
        amount: item.amount,
        calories: item.nutritionInfo.calories,
        protein: item.nutritionInfo.protein,
        carbs: item.nutritionInfo.carbs,
        fat: item.nutritionInfo.fat,
        fiber: item.nutritionInfo.fiber || 0, // 添加纤维素，如果没有则默认为0
        category: item.category,
        subType: item.subType
      }));
      
      // 添加到食谱中
      setRecipeItems(newItems);
      setSuccess('已根据每日营养需求标准生成食谱');
      
      // 3秒后清除成功消息
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('自动生成食谱失败:', err);
      setError(err.message || '自动生成食谱失败，请重试');
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
      <RecipeHeader 
        recipeName={recipeName}
        setRecipeName={setRecipeName}
        onSave={handleSaveRecipe}
        onLoad={() => setRecipeDialogOpen(true)}
        onAdd={() => setFoodAddDialogOpen(true)}
        onAutoGenerate={handleAutoGenerate}
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
      <NutritionOverview totalNutrition={totalNutrition} user={user} recipeItems={recipeItems} />
      
      {/* 食物列表区 */}
      <RecipeItemsTable 
        recipeItems={recipeItems}
        foods={foods}
        onAmountChange={handleAmountChange}
        onRemoveFood={handleRemoveFood}
        onViewFoodDetail={(food) => {
          setFoodToView(food);
          setFoodDetailDialogOpen(true);
        }}
      />
      
      {/* 营养详情区 */}
      <NutritionDetails recipeItems={recipeItems} totalNutrition={totalNutrition} />
      
      {/* 食谱选择对话框 */}
      <RecipeDialog 
        open={recipeDialogOpen}
        onClose={() => setRecipeDialogOpen(false)}
        recipes={recipes}
        onLoadRecipe={handleLoadRecipe}
        onDeleteRecipe={handleDeleteRecipe}
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
    </Container>
  );
};

export default Recipe;
