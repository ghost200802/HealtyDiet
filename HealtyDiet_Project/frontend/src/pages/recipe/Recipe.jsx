import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  CircularProgress,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  CloudDownload as CloudDownloadIcon
} from '@mui/icons-material';
import HorizontalBarChart from '../../components/charts/HorizontalBarChart';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [categories, setCategories] = useState(['全部']);
  const [filteredFoods, setFilteredFoods] = useState([]);
  
  // 对话框状态
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const [foodAddDialogOpen, setFoodAddDialogOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [foodAmount, setFoodAmount] = useState('');
  
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
  
  // 过滤食物列表
  useEffect(() => {
    let filtered = foods;
    
    // 按分类过滤
    if (selectedCategory !== '全部') {
      filtered = filtered.filter(food => food.category === selectedCategory);
    }
    
    // 按搜索词过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(food => 
        food.name.toLowerCase().includes(query) ||
        food.category.toLowerCase().includes(query)
      );
    }
    
    setFilteredFoods(filtered);
  }, [foods, selectedCategory, searchQuery]);
  
  // 添加食物到食谱
  const handleAddFood = () => {
    if (!selectedFood || !foodAmount || isNaN(foodAmount) || parseFloat(foodAmount) <= 0) {
      setError('请选择食物并输入有效的数量');
      return;
    }
    
    const newItem = {
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      amount: parseFloat(foodAmount),
      calories: selectedFood.calories * (parseFloat(foodAmount) / (selectedFood.servingSize || 100)),
      protein: selectedFood.protein * (parseFloat(foodAmount) / (selectedFood.servingSize || 100)),
      carbs: selectedFood.carbs * (parseFloat(foodAmount) / (selectedFood.servingSize || 100)),
      fat: selectedFood.fat * (parseFloat(foodAmount) / (selectedFood.servingSize || 100))
    };
    
    // 检查是否已存在该食物，如果存在则更新数量
    const existingItemIndex = recipeItems.findIndex(item => item.foodId === selectedFood.id);
    
    if (existingItemIndex !== -1) {
      const updatedItems = [...recipeItems];
      const oldAmount = updatedItems[existingItemIndex].amount;
      const newAmount = oldAmount + parseFloat(foodAmount);
      
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
    
    setSelectedFood(null);
    setFoodAmount('');
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
        nutrition: totalNutrition
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
  
  // 准备营养素数据用于图表显示
  const prepareNutritionData = (type) => {
    if (recipeItems.length === 0) return [];
    
    // 根据类型获取相应的营养素数据
    return recipeItems.map(item => ({
      name: item.foodName,
      value: item[type],
      percent: (item[type] / totalNutrition[type]) * 100
    }));
  };
  
  // 渲染食物卡片
  const renderFoodCard = (food) => (
    <Card 
      key={food.id} 
      sx={{ 
        mb: 2, 
        cursor: 'pointer',
        '&:hover': { boxShadow: 3 }
      }}
      onClick={() => {
        setSelectedFood(food);
        setFoodAmount('100');
      }}
    >
      <CardContent>
        <Typography variant="h6" component="div">
          {food.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          热量: {food.calories} 千卡/100g
        </Typography>
        <Typography variant="body2" color="text.secondary">
          蛋白质: {food.protein}g | 碳水: {food.carbs}g | 脂肪: {food.fat}g
        </Typography>
      </CardContent>
    </Card>
  );
  
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          食谱分析
        </Typography>
        <TextField
          fullWidth
          label="食谱名称"
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
        />
      </Box>
      
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
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          营养总览
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" color="primary">
                  总热量
                </Typography>
                <Typography variant="h4">
                  {totalNutrition.calories} 千卡
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" color="primary">
                  蛋白质
                </Typography>
                <Typography variant="h4">
                  {totalNutrition.protein} 克
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" color="primary">
                  碳水化合物
                </Typography>
                <Typography variant="h4">
                  {totalNutrition.carbs} 克
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" color="primary">
                  脂肪
                </Typography>
                <Typography variant="h4">
                  {totalNutrition.fat} 克
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      {/* 功能操作区 */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          食物列表
        </Typography>
        {recipeItems.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            食谱中还没有食物，请点击下方的添加按钮添加食物
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>食物名称</TableCell>
                  <TableCell align="right">数量 (克)</TableCell>
                  <TableCell align="right">热量 (千卡)</TableCell>
                  <TableCell align="right">蛋白质 (克)</TableCell>
                  <TableCell align="right">碳水 (克)</TableCell>
                  <TableCell align="right">脂肪 (克)</TableCell>
                  <TableCell align="right">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recipeItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.foodName}</TableCell>
                    <TableCell align="right">{item.amount}</TableCell>
                    <TableCell align="right">{item.calories.toFixed(1)}</TableCell>
                    <TableCell align="right">{item.protein.toFixed(1)}</TableCell>
                    <TableCell align="right">{item.carbs.toFixed(1)}</TableCell>
                    <TableCell align="right">{item.fat.toFixed(1)}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleRemoveFood(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      {/* 详情展示区 */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          营养详情
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="热量分布" />
              <CardContent>
                <HorizontalBarChart 
                  data={prepareNutritionData('calories')} 
                  unit="千卡" 
                  type="calories" 
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="蛋白质分布" />
              <CardContent>
                <HorizontalBarChart 
                  data={prepareNutritionData('protein')} 
                  unit="g" 
                  type="protein" 
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="碳水化合物分布" />
              <CardContent>
                <HorizontalBarChart 
                  data={prepareNutritionData('carbs')} 
                  unit="g" 
                  type="carbs" 
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="脂肪分布" />
              <CardContent>
                <HorizontalBarChart 
                  data={prepareNutritionData('fat')} 
                  unit="g" 
                  type="fat" 
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      {/* 底部操作区 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<InfoIcon />}
          onClick={() => setDetailsDialogOpen(true)}
        >
          详情
        </Button>
        <Box>
          <Button
            variant="outlined"
            startIcon={<CloudDownloadIcon />}
            onClick={() => setRecipeDialogOpen(true)}
            sx={{ mr: 2 }}
          >
            载入
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setFoodAddDialogOpen(true)}
            sx={{ mr: 2 }}
          >
            添加
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveRecipe}
          >
            保存
          </Button>
        </Box>
      </Box>
      
      {/* 详情对话框 */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>食谱详情</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>食物名称</TableCell>
                  <TableCell align="right">数量 (克)</TableCell>
                  <TableCell align="right">热量 (千卡)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recipeItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.foodName}</TableCell>
                    <TableCell align="right">{item.amount}</TableCell>
                    <TableCell align="right">{item.calories.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell><strong>总计</strong></TableCell>
                  <TableCell align="right"><strong>{recipeItems.reduce((sum, item) => sum + item.amount, 0)}</strong></TableCell>
                  <TableCell align="right"><strong>{totalNutrition.calories}</strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
      
      {/* 食谱选择对话框 */}
      <Dialog
        open={recipeDialogOpen}
        onClose={() => setRecipeDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>选择食谱</DialogTitle>
        <DialogContent>
          {recipes.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              没有保存的食谱
            </Typography>
          ) : (
            <List>
              {recipes.map(recipe => (
                <ListItem 
                  key={recipe.id} 
                  button 
                  onClick={() => handleLoadRecipe(recipe)}
                  divider
                >
                  <ListItemText
                    primary={recipe.name}
                    secondary={`热量: ${recipe.nutrition?.calories || 0} 千卡 | 蛋白质: ${recipe.nutrition?.protein || 0}g | 碳水: ${recipe.nutrition?.carbs || 0}g | 脂肪: ${recipe.nutrition?.fat || 0}g`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecipeDialogOpen(false)}>取消</Button>
        </DialogActions>
      </Dialog>
      
      {/* 食物添加对话框 */}
      <Dialog
        open={foodAddDialogOpen}
        onClose={() => setFoodAddDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>添加食物</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="搜索食物"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />
          </Box>
          
          <Grid container spacing={2}>
            {/* 左侧分类列表 */}
            <Grid item xs={12} md={3}>
              <Typography variant="h6" gutterBottom>
                食物分类
              </Typography>
              <List>
                {categories.map(category => (
                  <ListItem 
                    key={category} 
                    button 
                    selected={selectedCategory === category}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <ListItemText primary={category} />
                  </ListItem>
                ))}
              </List>
            </Grid>
            
            {/* 右侧食物列表 */}
            <Grid item xs={12} md={9}>
              <Typography variant="h6" gutterBottom>
                食物列表
              </Typography>
              {filteredFoods.length === 0 ? (
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  没有找到匹配的食物
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {filteredFoods.map(food => (
                    <Grid item xs={12} sm={6} md={4} key={food.id}>
                      {renderFoodCard(food)}
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>
          </Grid>
          
          {selectedFood && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                已选择: {selectedFood.name}
              </Typography>
              <TextField
                label="数量 (克)"
                type="number"
                value={foodAmount}
                onChange={(e) => setFoodAmount(e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">克</InputAdornment>,
                }}
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                热量: {selectedFood.calories * (parseFloat(foodAmount) / 100 || 0).toFixed(1)} 千卡 | 
                蛋白质: {selectedFood.protein * (parseFloat(foodAmount) / 100 || 0).toFixed(1)}g | 
                碳水: {selectedFood.carbs * (parseFloat(foodAmount) / 100 || 0).toFixed(1)}g | 
                脂肪: {selectedFood.fat * (parseFloat(foodAmount) / 100 || 0).toFixed(1)}g
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFoodAddDialogOpen(false)}>取消</Button>
          <Button 
            onClick={handleAddFood} 
            variant="contained" 
            disabled={!selectedFood || !foodAmount}
          >
            添加到食谱
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Recipe;