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
  
  // 食谱营养成分总计
  const [totalNutrition, setTotalNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  
  // 获取所有食物和用户的食谱
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // 获取所有食物
        const foodsResponse = await axios.get('http://localhost:5000/api/foods');
        setFoods(foodsResponse.data);
        
        // 提取食物分类
        const uniqueCategories = ['全部', ...new Set(foodsResponse.data.map(food => food.category))];
        setCategories(uniqueCategories);
        setFilteredFoods(foodsResponse.data);
        
        // 如果用户已登录，获取用户的食谱
        if (user && user.id) {
          const token = localStorage.getItem('token');
          const recipesResponse = await axios.get(
            `http://localhost:5000/api/recipes/user/${user.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          setRecipes(recipesResponse.data);
        }
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('获取数据失败，请重试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  // 计算食谱的总营养成分
  useEffect(() => {
    if (recipeItems.length === 0) {
      setTotalNutrition({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      });
      return;
    }
    
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
    
    recipeItems.forEach(item => {
      const food = foods.find(f => f.id === item.foodId);
      if (food) {
        const ratio = item.amount / (food.servingSize || 100); // 默认以100g为标准份量
        totals.calories += food.calories * ratio;
        totals.protein += food.protein * ratio;
        totals.carbs += food.carbs * ratio;
        totals.fat += food.fat * ratio;
      }
    });
    
    // 四舍五入到一位小数
    Object.keys(totals).forEach(key => {
      totals[key] = Math.round(totals[key] * 10) / 10;
    });
    
    setTotalNutrition(totals);
  }, [recipeItems, foods]);
  
  // 添加食物到食谱
  const handleAddFood = (selectedFood, amount) => {
    if (!selectedFood || !amount || isNaN(amount) || amount <= 0) {
      setError('请选择食物并输入有效的数量');
      return;
    }
    
    const newItem = {
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      amount: amount,
      calories: selectedFood.calories * (amount / (selectedFood.servingSize || 100)),
      protein: selectedFood.protein * (amount / (selectedFood.servingSize || 100)),
      carbs: selectedFood.carbs * (amount / (selectedFood.servingSize || 100)),
      fat: selectedFood.fat * (amount / (selectedFood.servingSize || 100))
    };
    
    // 检查是否已存在该食物，如果存在则更新数量
    const existingItemIndex = recipeItems.findIndex(item => item.foodId === selectedFood.id);
    
    if (existingItemIndex !== -1) {
      const updatedItems = [...recipeItems];
      const oldAmount = updatedItems[existingItemIndex].amount;
      const newAmount = oldAmount + amount;
      
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        amount: newAmount,
        calories: selectedFood.calories * (newAmount / (selectedFood.servingSize || 100)),
        protein: selectedFood.protein * (newAmount / (selectedFood.servingSize || 100)),
        carbs: selectedFood.carbs * (newAmount / (selectedFood.servingSize || 100)),
        fat: selectedFood.fat * (newAmount / (selectedFood.servingSize || 100))
      };
      
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
      updatedItems[index] = {
        ...updatedItems[index],
        amount: newAmount,
        calories: food.calories * (newAmount / (food.servingSize || 100)),
        protein: food.protein * (newAmount / (food.servingSize || 100)),
        carbs: food.carbs * (newAmount / (food.servingSize || 100)),
        fat: food.fat * (newAmount / (food.servingSize || 100))
      };
      setRecipeItems(updatedItems);
    }
  };
  
  // 保存食谱
  const handleSaveRecipe = async () => {
    if (!user || !user.id) {
      setError('请先登录');
      return;
    }
    
    if (recipeItems.length === 0) {
      setError('食谱中没有食物，请先添加食物');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const recipeData = {
        name: recipeName,
        userId: user.id,
        items: recipeItems.map(item => ({
          foodId: item.foodId,
          amount: item.amount
        })),
        nutrition: {
          calories: totalNutrition.calories,
          protein: totalNutrition.protein,
          carbs: totalNutrition.carbs,
          fat: totalNutrition.fat
        },
        mainIngredients: getMainIngredients()
      };
      
      // 检查是否已存在同名食谱
      const existingRecipe = recipes.find(r => r.name === recipeName);
      
      if (existingRecipe) {
        // 更新现有食谱
        await axios.put(
          `http://localhost:5000/api/recipes/${existingRecipe.id}`,
          recipeData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      } else {
        // 创建新食谱
        await axios.post(
          'http://localhost:5000/api/recipes',
          recipeData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }
      
      setSuccess('食谱保存成功');
      
      // 重新获取用户的食谱
      const recipesResponse = await axios.get(
        `http://localhost:5000/api/recipes/user/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setRecipes(recipesResponse.data);
      
      // 3秒后清除成功消息
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('保存食谱失败:', err);
      setError('保存食谱失败，请重试');
    }
  };
  
  // 加载食谱
  const handleLoadRecipe = (recipe) => {
    setRecipeName(recipe.name);
    
    // 转换食谱项目格式
    const items = recipe.items.map(item => {
      const food = foods.find(f => f.id === item.foodId);
      if (!food) return null;
      
      return {
        foodId: food.id,
        foodName: food.name,
        amount: item.amount,
        calories: food.calories * (item.amount / (food.servingSize || 100)),
        protein: food.protein * (item.amount / (food.servingSize || 100)),
        carbs: food.carbs * (item.amount / (food.servingSize || 100)),
        fat: food.fat * (item.amount / (food.servingSize || 100))
      };
    }).filter(Boolean);
    
    setRecipeItems(items);
    setRecipeDialogOpen(false);
    setSuccess('食谱加载成功');
    
    // 3秒后清除成功消息
    setTimeout(() => setSuccess(''), 3000);
  };
  
  // 删除食谱
  const handleDeleteRecipe = async (recipeId) => {
    if (!user || !user.id) {
      setError('请先登录');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/recipes/${recipeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // 更新本地食谱列表
      setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
      setSuccess('食谱删除成功');
      
      // 3秒后清除成功消息
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('删除食谱失败:', err);
      setError('删除食谱失败，请重试');
    }
  };
  
  // 准备营养素数据用于图表显示
  const prepareNutritionData = (type) => {
    if (recipeItems.length === 0) return [];
    
    // 根据类型获取相应的营养素数据并按照占比从大到小排序
    return recipeItems
      .map(item => ({
        name: item.foodName,
        value: item[type],
        percent: (item[type] / totalNutrition[type]) * 100
      }))
      .sort((a, b) => b.percent - a.percent);
  };
  
  // 获取食谱的主要食材
  const getMainIngredients = () => {
    if (recipeItems.length === 0) return [];
    
    // 获取能量最多的食材
    const caloriesTop = [...recipeItems].sort((a, b) => b.calories - a.calories)[0];
    
    // 获取蛋白质最多的食材
    const proteinTop = [...recipeItems].sort((a, b) => b.protein - a.protein)[0];
    
    // 获取碳水最多的食材
    const carbsTop = [...recipeItems].sort((a, b) => b.carbs - a.carbs)[0];
    
    // 获取脂肪最多的食材
    const fatTop = [...recipeItems].sort((a, b) => b.fat - a.fat)[0];
    
    // 合并并去重
    const mainIngredients = [];
    const addedIds = new Set();
    
    [caloriesTop, proteinTop, carbsTop, fatTop].forEach(item => {
      if (item && !addedIds.has(item.foodId)) {
        mainIngredients.push({
          foodId: item.foodId,
          foodName: item.foodName
        });
        addedIds.add(item.foodId);
      }
    });
    
    return mainIngredients;
  };
  
  // 处理食物详情更新
  const handleFoodUpdate = (updatedFood) => {
    // 更新本地食物列表中的食物数据
    setFoods(prevFoods => {
      return prevFoods.map(food => {
        if (food.id === updatedFood.id) {
          return updatedFood;
        }
        return food;
      });
    });
    
    // 如果更新的食物在食谱中，也需要更新食谱项目
    const foodInRecipe = recipeItems.find(item => item.foodId === updatedFood.id);
    if (foodInRecipe) {
      setRecipeItems(prevItems => {
        return prevItems.map(item => {
          if (item.foodId === updatedFood.id) {
            const ratio = item.amount / (updatedFood.servingSize || 100);
            return {
              ...item,
              calories: updatedFood.calories * ratio,
              protein: updatedFood.protein * ratio,
              carbs: updatedFood.carbs * ratio,
              fat: updatedFood.fat * ratio
            };
          }
          return item;
        });
      });
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
      <NutritionOverview totalNutrition={totalNutrition} user={user} />
      
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
      <NutritionDetails prepareNutritionData={prepareNutritionData} />
      
      {/* 食谱选择对话框 */}
      <RecipeDialog 
        open={recipeDialogOpen}
        onClose={() => setRecipeDialogOpen(false)}
        recipes={recipes}
        onLoadRecipe={handleLoadRecipe}
        onDeleteRecipe={handleDeleteRecipe}
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
