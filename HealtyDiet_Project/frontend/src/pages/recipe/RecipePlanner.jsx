import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

const RecipePlanner = ({ user }) => {
  console.log('RecipePlanner user对象:', user);
  const [foods, setFoods] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState([null]);
  
  // 新食谱状态
  const [recipeName, setRecipeName] = useState('');
  const [recipeDescription, setRecipeDescription] = useState('');
  const [recipeItems, setRecipeItems] = useState([]);
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
  
  // 确保周计划中的食谱有正确的营养成分数据
  useEffect(() => {
    if (!weeklyPlan.some(recipe => recipe) || foods.length === 0) return;
    
    const updatedPlan = weeklyPlan.map(recipe => {
      if (!recipe) return null;
      
      // 如果食谱已经有营养成分数据，则不需要重新计算
      if (recipe.nutrition && recipe.nutrition.calories > 0) return recipe;
      
      // 计算食谱的营养成分
      const nutrition = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      };
      
      recipe.items.forEach(item => {
        const food = foods.find(f => f.id === item.foodId);
        if (food) {
          const ratio = item.amount / (food.servingSize || 100);
          nutrition.calories += food.calories * ratio;
          nutrition.protein += food.protein * ratio;
          nutrition.carbs += food.carbs * ratio;
          nutrition.fat += food.fat * ratio;
        }
      });
      
      // 四舍五入到一位小数
      Object.keys(nutrition).forEach(key => {
        nutrition[key] = Math.round(nutrition[key] * 10) / 10;
      });
      
      return { ...recipe, nutrition };
    });
    
    setWeeklyPlan(updatedPlan);
  }, [weeklyPlan, foods]);
  
  // 处理标签切换
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // 添加食物到食谱
  const handleAddFoodToRecipe = () => {
    if (!selectedFood || !foodAmount || isNaN(foodAmount) || parseFloat(foodAmount) <= 0) {
      setError('请选择食物并输入有效的数量');
      return;
    }
    
    setError('');
    
    const newItem = {
      foodId: selectedFood.id,
      name: selectedFood.name,
      amount: parseFloat(foodAmount),
      unit: selectedFood.unit
    };
    
    setRecipeItems([...recipeItems, newItem]);
    setSelectedFood(null);
    setFoodAmount('');
  };
  
  // 从食谱中移除食物
  const handleRemoveFoodFromRecipe = (index) => {
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
    
    if (!recipeName.trim()) {
      setError('请输入食谱名称');
      return;
    }
    
    if (recipeItems.length === 0) {
      setError('请至少添加一种食物');
      return;
    }
    
    try {
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      const recipeData = {
        name: recipeName,
        userId: user.id,
        items: recipeItems,
        description: recipeDescription
      };
      
      const response = await axios.post(
        'http://localhost:5000/api/recipes',
        recipeData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // 添加新食谱到列表
      setRecipes([...recipes, response.data]);
      
      // 重置表单
      setRecipeName('');
      setRecipeDescription('');
      setRecipeItems([]);
      setSuccess('食谱保存成功！');
      
      // 切换到我的食谱标签
      setTabValue(1);
      
      // 3秒后清除成功消息
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || '保存食谱失败，请重试');
      } else {
        setError('保存食谱失败，请检查网络连接');
      }
    }
  };
  
  // 查看食谱详情
  const handleViewRecipe = (recipe) => {
    setRecipeName(recipe.name);
    setRecipeDescription(recipe.description || '');
    
    // 转换食谱项目格式
    const items = recipe.items.map(item => {
      const food = foods.find(f => f.id === item.foodId);
      return {
        foodId: item.foodId,
        name: food ? food.name : item.foodId,
        amount: item.amount,
        unit: food ? food.unit : 'g'
      };
    });
    
    setRecipeItems(items);
    setTabValue(0); // 切换到创建食谱标签
  };
  
  // 删除食谱
  const handleDeleteRecipe = async (recipeId) => {
    if (!user || !user.id) {
      setError('请先登录');
      return;
    }
    
    try {
      setError('');
      
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/recipes/${recipeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // 从列表中移除已删除的食谱
      setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
      setSuccess('食谱删除成功！');
      
      // 3秒后清除成功消息
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || '删除食谱失败，请重试');
      } else {
        setError('删除食谱失败，请检查网络连接');
      }
    }
  };
  
  // 选择食谱添加到周计划中
  const handleSelectRecipeForPlan = (selectedRecipe, planIndex) => {
    const newPlan = [...weeklyPlan];
    newPlan[planIndex] = selectedRecipe;
    if (planIndex === weeklyPlan.length - 1) {
      newPlan.push(null);
    }
    setWeeklyPlan(newPlan);
    setShowRecipeSelector(false);
  };

  // 打开食谱选择器
  const handleOpenRecipeSelector = (index) => {
    // 记录当前要修改的计划索引
    setCurrentPlanIndex(index);
    setShowRecipeSelector(true);
  };

  // 当前正在编辑的计划索引
  const [currentPlanIndex, setCurrentPlanIndex] = useState(null);

  // 渲染食谱卡片
  const renderRecipeCard = (recipe, index) => {
    if (!recipe) {
      return (
        <Card 
          sx={{ 
            height: 500,  // 调整卡片高度为500
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            cursor: 'pointer'
          }}
          onClick={() => handleOpenRecipeSelector(index)}
        >
          <AddIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
        </Card>
      );
    }

    // 计算食物占比数据
    const calculateFoodPercentages = (recipe) => {
      const foodPercentages = {};
      
      // 计算每种食物的热量贡献
      recipe.items.forEach(item => {
        const food = foods.find(f => f.id === item.foodId);
        if (food) {
          const ratio = item.amount / food.servingSize;
          const calories = food.calories * ratio;
          foodPercentages[food.name] = (foodPercentages[food.name] || 0) + calories;
        }
      });
      
      // 转换为饼图数据格式
      return Object.keys(foodPercentages).map(name => ({
        name,
        value: foodPercentages[name]
      }));
    };

    const foodPercentages = calculateFoodPercentages(recipe);

    return (
      <Card sx={{ height: 350, display: 'flex', flexDirection: 'column' }}>
        <CardHeader 
          title={recipe.name} 
          titleTypographyProps={{ variant: 'h6' }}
          action={
            <IconButton onClick={() => {
              const newPlan = [...weeklyPlan];
              newPlan[index] = null;
              setWeeklyPlan(newPlan);
            }}>
              <DeleteIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', p: 1 }}>
          {/* 食物清单模块 */}
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', pl: 1 }}>
            食物清单:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2, mt: 0 }}>
            {recipe.items.map((item, idx) => {
              const food = foods.find(f => f.id === item.foodId);
              return (
                <Box component="li" key={idx} sx={{ fontSize: '0.8rem' }}>
                  <Typography variant="body2" noWrap>
                    {food ? food.name : item.foodId} - {item.amount} {food ? food.unit : 'g'}
                  </Typography>
                </Box>
              );
            })}
          </Box>
          
          {/* 营养成分模块 */}
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', pl: 1 }}>
            营养成分:
          </Typography>
          <Grid container spacing={1} sx={{ mb: 2, px: 1 }}>
            <Grid item xs={4}>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                热量: {recipe.nutrition?.calories || 0} 千卡
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: user?.protein ? (recipe.nutrition?.protein > user.protein ? 'error.main' : 'success.main') : 'inherit' }}>
                蛋白质: {recipe.nutrition?.protein || 0} / {user?.protein || '--'} g
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: user?.carbs ? (recipe.nutrition?.carbs > user.carbs ? 'error.main' : 'success.main') : 'inherit' }}>
                碳水: {recipe.nutrition?.carbs || 0} / {user?.carbs || '--'} g
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: user?.fat ? (recipe.nutrition?.fat > user.fat ? 'error.main' : 'success.main') : 'inherit' }}>
                脂肪: {recipe.nutrition?.fat || 0} / {user?.fat || '--'} g
              </Typography>
            </Grid>
          </Grid>
          
          {/* 食物占比模块 - 简化版，实际项目中可以使用饼图组件 */}
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', pl: 1 }}>
            食物热量占比:
          </Typography>
          <Box sx={{ px: 1 }}>
            {foodPercentages.map((item, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Box 
                  sx={{ 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    bgcolor: `hsl(${idx * 137.5 % 360}, 70%, 50%)`,
                    mr: 1 
                  }} 
                />
                <Typography variant="caption" noWrap sx={{ flex: 1 }}>
                  {item.name}
                </Typography>
                <Typography variant="caption">
                  {Math.round(item.value / recipe.nutrition?.calories * 100)}%
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          食谱规划
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {!showRecipeSelector ? (
              // 显示周计划视图
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom>
                  本周食谱规划
                </Typography>
                <Grid container spacing={2}>
                  {weeklyPlan
                    .filter((recipe, idx) => recipe || idx === weeklyPlan.length - 1)
                    .map((recipe, index) => (
                      <Grid item xs={12} sm={4} md={4} lg={4} key={index}>
                        {index === weeklyPlan.length - 1 ? (
                          <Card 
                            sx={{ 
                              height: 500,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              cursor: 'pointer'
                            }}
                            onClick={() => handleOpenRecipeSelector(index)}
                          >
                            <AddIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
                          </Card>
                        ) : renderRecipeCard(recipe, index)}
                      </Grid>
                    ))}
                </Grid>
              </Box>
            ) : (
              // 显示食谱选择器
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5">
                    选择食谱
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setTabValue(0);
                      setShowRecipeSelector(false);
                    }}
                  >
                    创建新食谱
                  </Button>
                </Box>
                <List>
                  {recipes.map((recipe) => (
                    <ListItem 
                      key={recipe.id}
                      button
                      onClick={() => handleSelectRecipeForPlan(recipe, currentPlanIndex)}
                    >
                      <ListItemText 
                        primary={recipe.name}
                        secondary={`热量: ${recipe.nutrition?.calories || 0} 千卡 | 蛋白质: ${recipe.nutrition?.protein || 0}g | 碳水: ${recipe.nutrition?.carbs || 0}g | 脂肪: ${recipe.nutrition?.fat || 0}g`}
                      />
                    </ListItem>
                  ))}
                </List>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => setShowRecipeSelector(false)}
                  >
                    返回
                  </Button>
                </Box>
              </Box>
            )}
            
            <Paper sx={{ mb: 4 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                centered
              >
                <Tab label="创建食谱" />
                <Tab label="我的食谱" />
              </Tabs>
            </Paper>
            
            {tabValue === 0 ? (
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  创建新食谱
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      label="食谱名称"
                      value={recipeName}
                      onChange={(e) => setRecipeName(e.target.value)}
                      margin="normal"
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="食谱描述"
                      value={recipeDescription}
                      onChange={(e) => setRecipeDescription(e.target.value)}
                      margin="normal"
                      multiline
                      rows={2}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    添加食物
                  </Typography>
                  
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        options={foods}
                        getOptionLabel={(option) => option.name}
                        value={selectedFood}
                        onChange={(event, newValue) => {
                          setSelectedFood(newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="选择食物"
                            variant="outlined"
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="数量"
                        type="number"
                        value={foodAmount}
                        onChange={(e) => setFoodAmount(e.target.value)}
                        variant="outlined"
                        InputProps={{
                          endAdornment: selectedFood ? selectedFood.unit : 'g',
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleAddFoodToRecipe}
                        fullWidth
                      >
                        添加
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" gutterBottom>
                  食谱内容
                </Typography>
                
                {recipeItems.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>食物名称</TableCell>
                          <TableCell align="right">数量</TableCell>
                          <TableCell align="right">操作</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recipeItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell align="right">
                              <TextField
                                type="number"
                                value={item.amount}
                                onChange={(e) => {
                                  const newItems = [...recipeItems];
                                  newItems[index].amount = parseFloat(e.target.value) || 0;
                                  setRecipeItems(newItems);
                                }}
                                size="small"
                                sx={{ width: 80 }}
                              /> {item.unit}
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveFoodFromRecipe(index)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary" sx={{ mb: 3 }}>
                    暂无食物，请添加食物到食谱中
                  </Typography>
                )}
                
                <Card sx={{ mb: 3 }}>
                  <CardHeader title="营养成分总计" />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          热量
                        </Typography>
                        <Typography variant="h6">
                          {totalNutrition.calories} 千卡
                          <Typography variant="caption" display="block" color="text.secondary">
                            推荐: {user?.dci || 0} 千卡
                          </Typography>
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          蛋白质
                        </Typography>
                        <Typography variant="h6">
                          {totalNutrition.protein} g
                          <Typography variant="caption" display="block" color="text.secondary">
                            推荐: {user?.protein || 0} g
                          </Typography>
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          碳水化合物
                        </Typography>
                        <Typography variant="h6">
                          {totalNutrition.carbs} g
                          <Typography variant="caption" display="block" color="text.secondary">
                            推荐: {user?.carbs || 0} g
                          </Typography>
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          脂肪
                        </Typography>
                        <Typography variant="h6">
                          {totalNutrition.fat} g
                          <Typography variant="caption" display="block" color="text.secondary">
                            推荐: {user?.fat || 0} g
                          </Typography>
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveRecipe}
                    disabled={!user || recipeItems.length === 0 || !recipeName.trim()}
                  >
                    保存食谱
                  </Button>
                </Box>
              </Paper>
            ) : (
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  我的食谱
                </Typography>
                
                {!user ? (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    请登录以查看您的食谱
                  </Alert>
                ) : recipes.length === 0 ? (
                  <Typography color="text.secondary">
                    您还没有创建任何食谱
                  </Typography>
                ) : (
                  <Grid container spacing={3}>
                    {recipes.map((recipe) => (
                      <Grid item xs={12} md={6} key={recipe.id}>
                        <Card>
                          <CardHeader
                            title={recipe.name}
                            subheader={`创建于: ${new Date(recipe.createdAt).toLocaleDateString()}`}
                          />
                          <CardContent>
                            {recipe.description && (
                              <Typography variant="body2" color="text.secondary" paragraph>
                                {recipe.description}
                              </Typography>
                            )}
                            
                            <Typography variant="subtitle2" gutterBottom>
                              食物清单:
                            </Typography>
                            
                            <Box component="ul" sx={{ pl: 2 }}>
                              {recipe.items.map((item, index) => {
                                const food = foods.find(f => f.id === item.foodId);
                                return (
                                  <Box component="li" key={index}>
                                    <Typography variant="body2">
                                      {food ? food.name : item.foodId} - {item.amount} {food ? food.unit : 'g'}
                                    </Typography>
                                  </Box>
                                );
                              })}
                            </Box>
                            
                            <Divider sx={{ my: 1 }} />
                            
                            <Typography variant="subtitle2" gutterBottom>
                              营养成分:
                            </Typography>
                            
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  热量: {recipe.nutrition.calories} 千卡
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  蛋白质: {recipe.nutrition.protein} g
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  碳水: {recipe.nutrition.carbs} g
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  脂肪: {recipe.nutrition.fat} g
                                </Typography>
                              </Grid>
                            </Grid>
                          </CardContent>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                            <Button
                              size="small"
                              onClick={() => handleViewRecipe(recipe)}
                              sx={{ mr: 1 }}
                            >
                              编辑
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleDeleteRecipe(recipe.id)}
                            >
                              删除
                            </Button>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default RecipePlanner;