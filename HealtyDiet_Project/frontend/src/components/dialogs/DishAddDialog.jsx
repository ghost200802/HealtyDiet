import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { 
  getAllDishes, 
  getDishesByType, 
  searchDishes, 
  searchDishesByName, 
  searchDishesByFood 
} from '../../services/DishService';

/**
 * 添加菜肴到食谱的弹出式对话框组件
 */
const DishAddDialog = ({
  open,
  onClose,
  onAddDish,
  onViewDishDetail
}) => {
  // 状态
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('全部');
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [selectedDish, setSelectedDish] = useState(null);
  const [dishAmount, setDishAmount] = useState('');
  const [dishTypes, setDishTypes] = useState(['全部']);
  const [loading, setLoading] = useState(false);
  
  // 初始化菜谱数据和类型
  useEffect(() => {
    const fetchDishData = async () => {
      setLoading(true);
      try {
        // 使用 DishService 中的异步方法获取所有菜谱
        const dishesData = await getAllDishes();
        setDishes(dishesData);
        setFilteredDishes(dishesData);
        
        // 提取所有菜谱的类型并去重
        const types = new Set();
        types.add('全部'); // 添加"全部"选项
        
        dishesData.forEach(dish => {
          if (dish.type && Array.isArray(dish.type)) {
            dish.type.forEach(t => types.add(t));
          }
        });
        
        setDishTypes(Array.from(types));
      } catch (error) {
        console.error('获取菜谱数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDishData();
  }, []);

  // 过滤菜谱列表
  useEffect(() => {
    const filterDishes = async () => {
      setLoading(true);
      try {
        let filtered = [];
        
        if (searchQuery) {
          // 使用 DishService 的同步方法搜索菜肴名称和食材
          const nameMatches = searchDishesByName(searchQuery);
          const foodMatches = searchDishesByFood(searchQuery);
          
          // 合并结果并去重
          const allMatches = [...nameMatches];
          foodMatches.forEach(dish => {
            if (!allMatches.some(d => d.id === dish.id)) {
              allMatches.push(dish);
            }
          });
          
          filtered = allMatches;
        } else {
          // 如果没有搜索词，使用所有菜谱
          filtered = dishes;
        }
        
        // 按类型过滤
        if (selectedType !== '全部' && filtered.length > 0) {
          filtered = filtered.filter(dish => 
            dish.type && Array.isArray(dish.type) && dish.type.includes(selectedType)
          );
        } else if (selectedType !== '全部' && !searchQuery) {
          // 如果只选择了类型但没有搜索词，从服务获取
          filtered = await getDishesByType(selectedType);
        }
        
        setFilteredDishes(filtered);
      } catch (error) {
        console.error('过滤菜谱失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    filterDishes();
  }, [dishes, selectedType, searchQuery]);

  // 处理添加菜肴
  const handleAddDish = () => {
    if (!selectedDish || !dishAmount || isNaN(dishAmount) || parseFloat(dishAmount) <= 0) {
      return;
    }
    
    onAddDish(selectedDish, parseFloat(dishAmount));
    
    // 重置状态
    setSelectedDish(null);
    setDishAmount('');
  };

  // 渲染菜肴卡片
  const renderDishCard = (dish) => {
    // 计算菜肴的总营养成分
    const totalNutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
    
    if (dish.ingredients && Array.isArray(dish.ingredients)) {
      dish.ingredients.forEach(ingredient => {
        totalNutrition.calories += (ingredient.calories || 0) * (ingredient.amount || 0) / 100;
        totalNutrition.protein += (ingredient.protein || 0) * (ingredient.amount || 0) / 100;
        totalNutrition.carbs += (ingredient.carbs || 0) * (ingredient.amount || 0) / 100;
        totalNutrition.fat += (ingredient.fat || 0) * (ingredient.amount || 0) / 100;
      });
    }
    
    return (
      <Card 
        key={`dish-card-${dish.id}`} 
        sx={{ 
          mb: 2, 
          cursor: 'pointer',
          '&:hover': { boxShadow: 3 }
        }}
        onClick={() => {
          setSelectedDish(dish);
          setDishAmount('1'); // 默认份数为1
        }}
      >
        <CardContent>
          <Typography variant="h6" component="div">
            {dish.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            热量: {totalNutrition.calories.toFixed(1)} 千卡
          </Typography>
          <Typography variant="body2" color="text.secondary">
            蛋白质: {totalNutrition.protein.toFixed(1)}g | 碳水: {totalNutrition.carbs.toFixed(1)}g | 脂肪: {totalNutrition.fat.toFixed(1)}g
          </Typography>
          {dish.ingredients && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              主要食材: {dish.ingredients.slice(0, 3).map(ing => ing.name).join(', ')}
              {dish.ingredients.length > 3 ? '...' : ''}
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <IconButton 
              size="small" 
              color="primary"
              onClick={(e) => {
                e.stopPropagation(); // 阻止事件冒泡，避免触发卡片的点击事件
                onViewDishDetail && onViewDishDetail(dish);
              }}
            >
              <VisibilityIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>添加菜肴</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="搜索菜肴"
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
              菜肴分类
            </Typography>
            <Box sx={{ height: '600px', overflow: 'auto' }}>
              <List>
                {dishTypes.map((type) => (
                  <ListItem 
                    key={type}
                    button 
                    selected={selectedType === type}
                    onClick={() => setSelectedType(type)}
                  >
                    <ListItemText primary={type} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>
          
          {/* 右侧菜肴列表 */}
          <Grid item xs={12} md={9}>
            <Typography variant="h6" gutterBottom>
              菜肴列表
            </Typography>
            <Box sx={{ height: '600px', overflow: 'auto' }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : filteredDishes.length === 0 ? (
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  没有找到匹配的菜肴
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {filteredDishes.map(dish => (
                    <Grid item xs={12} sm={6} md={4} key={dish.id}>
                      {renderDishCard(dish)}
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ 
        flexDirection: 'column', 
        alignItems: 'stretch',
        p: 2,
        '& > :not(:first-of-type)': { mt: 2 }
      }}>
        {selectedDish ? (
          <Box sx={{ bgcolor: 'background.paper', borderRadius: 1, p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              已选择: {selectedDish.name}
            </Typography>
            <TextField
              label="份数"
              type="number"
              value={dishAmount}
              onChange={(e) => setDishAmount(e.target.value)}
              InputProps={{
                endAdornment: <InputAdornment position="end">份</InputAdornment>,
              }}
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
            />
            {selectedDish.ingredients && (
              <Typography variant="body2" color="text.secondary">
                包含食材: {selectedDish.ingredients.map(ing => `${ing.name} ${ing.amount}克`).join(', ')}
              </Typography>
            )}
          </Box>
        ) : null}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>取消</Button>
          <Button 
            onClick={handleAddDish} 
            variant="contained" 
            disabled={!selectedDish || !dishAmount}
          >
            添加到食谱
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default DishAddDialog;