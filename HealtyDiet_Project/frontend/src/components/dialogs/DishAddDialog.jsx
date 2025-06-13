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
import { Visibility as VisibilityIcon, Close as CloseIcon } from '@mui/icons-material';
import { 
  getAllDishes, 
  getDishesByType, 
  searchDishes, 
  searchDishesByName, 
  searchDishesByFood 
} from '@/services/DishService';
import { getFoodsByIds } from '@/services/FoodService';

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
  const [foodsData, setFoodsData] = useState({});
  const [foodAmounts, setFoodAmounts] = useState({});
  
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
        
        // 收集所有菜肴的食物ID
        const allFoodIds = new Set();
        dishesData.forEach(dish => {
          if (dish.foods && Array.isArray(dish.foods)) {
            dish.foods.forEach(foodId => allFoodIds.add(foodId));
          }
        });
        
        // 获取所有食物数据
        if (allFoodIds.size > 0) {
          const foodsArray = await getFoodsByIds(Array.from(allFoodIds));
          const foodsMap = {};
          foodsArray.forEach(food => {
            if (food && food.id) {
              foodsMap[food.id] = food;
            }
          });
          setFoodsData(foodsMap);
        }
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
    if (!selectedDish) {
      return;
    }
    
    // 确保selectedDish.foods存在且是数组
    if (!selectedDish.foods || !Array.isArray(selectedDish.foods)) {
      console.error('菜肴的foods不是数组格式');
      return;
    }
    
    // 准备食物列表，使用简化格式 [{foodId, amount}]
    const foodsList = selectedDish.foods.map(foodId => {
      return {
        foodId: foodId,
        amount: foodAmounts[foodId] || 100 // 使用用户设置的数量，默认为100克
      };
    }).filter(item => item !== null);
    
    // 调用父组件的onAddDish函数，传递菜肴和食物列表
    onAddDish(selectedDish, foodsList);
    
    // 重置状态
    setSelectedDish(null);
    setFoodAmounts({});
  };

  // 计算选中菜肴的总营养成分
  const calculateTotalNutrition = () => {
    const totalNutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
    
    if (selectedDish && selectedDish.foods && Array.isArray(selectedDish.foods)) {
      selectedDish.foods.forEach(foodId => {
        const food = foodsData[foodId];
        if (food) {
          const amount = foodAmounts[foodId] || 100;
          totalNutrition.calories += (food.calories || 0) * amount / 100;
          totalNutrition.protein += (food.protein || 0) * amount / 100;
          totalNutrition.carbs += (food.carbs || 0) * amount / 100;
          totalNutrition.fat += (food.fat || 0) * amount / 100;
        }
      });
    }
    
    return totalNutrition;
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
    
    // 使用foods字段获取食物信息并计算营养成分
    if (dish.foods && Array.isArray(dish.foods)) {
      dish.foods.forEach(foodId => {
        const food = foodsData[foodId];
        if (food) {
          // 假设每种食物默认100克
          const amount = 100;
          totalNutrition.calories += (food.calories || 0) * amount / 100;
          totalNutrition.protein += (food.protein || 0) * amount / 100;
          totalNutrition.carbs += (food.carbs || 0) * amount / 100;
          totalNutrition.fat += (food.fat || 0) * amount / 100;
        }
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
          
          // 初始化每种食材的数量为100克
          if (dish.foods && Array.isArray(dish.foods)) {
            const initialAmounts = {};
            dish.foods.forEach(foodId => {
              initialAmounts[foodId] = 100; // 默认每种食材100克
            });
            setFoodAmounts(initialAmounts);
          }
        }}
      >
        <CardContent>
          <Typography variant="h6" component="div">
            {dish.name}
          </Typography>
          {totalNutrition.calories === 0 && totalNutrition.protein === 0 && totalNutrition.carbs === 0 && totalNutrition.fat === 0 ? (
            <Typography variant="body2" color="text.secondary">
              暂无营养信息
            </Typography>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary">
                热量: {totalNutrition.calories.toFixed(1)} 千卡
              </Typography>
              <Typography variant="body2" color="text.secondary">
                蛋白质: {totalNutrition.protein.toFixed(1)}g | 碳水: {totalNutrition.carbs.toFixed(1)}g | 脂肪: {totalNutrition.fat.toFixed(1)}g
              </Typography>
            </>
          )}
          {dish.foods && dish.foods.length > 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              主要食材: {
                dish.foods.map(foodId => {
                  const food = foodsData[foodId];
                  return food ? food.name : '未知食材';
                }).join(', ')
              }
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              暂无食材信息
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

  // 自定义关闭处理函数
  const handleClose = () => {
    // 重置所有选择状态
    setSelectedDish(null);
    setFoodAmounts({});
    setSearchQuery('');
    setSelectedType('全部');
    
    // 调用原始的 onClose 函数
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle>添加菜肴</DialogTitle>
      <DialogContent sx={{ 
        position: 'relative', 
        overflow: 'auto',
        flex: 1,
        pb: 10 
      }}>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="搜索菜肴"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedDish(null); // 清除选中的菜肴
              setFoodAmounts({});
            }}
            onClick={() => {
              if (selectedDish) {
                setSelectedDish(null); // 点击搜索框时清除选中的菜肴
                setFoodAmounts({});
              }
            }}
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
                    onClick={() => {
                      setSelectedType(type);
                      setSelectedDish(null); // 选择分类时清除选中的菜肴
                      setFoodAmounts({});
                    }}
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
            <Box 
              sx={{ height: '600px', overflow: 'auto' }}
            >
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
      <Box sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: '#f5f5f5',
        borderTop: '1px solid #e0e0e0',
        p: 2,
        boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        '& > :not(:first-of-type)': { mt: 2 }
      }}>
        {selectedDish && (
          <Box sx={{ 
            bgcolor: '#ffffff', 
            borderRadius: 2, 
            p: 3, 
            mb: 2,
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',  // 添加阴影
            border: '1px solid #e0e0e0',  // 添加边框
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                已选择: {selectedDish.name}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => {
                  setSelectedDish(null);
                  setFoodAmounts({});
                }}
                sx={{ 
                  color: '#757575',
                  '&:hover': { color: '#f44336', backgroundColor: '#f5f5f5' }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            {selectedDish.foods && selectedDish.foods.length > 0 ? (
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ color: '#555', fontWeight: 500, mt: 2 }}>
                  主要食材列表:
                </Typography>
                <List dense sx={{ 
                  border: '1px solid #f0f0f0', 
                  borderRadius: 1, 
                  p: 1,
                  backgroundColor: '#fafafa'
                }}>
                  {selectedDish.foods.map(foodId => {
                    const food = foodsData[foodId];
                    if (!food) return null;
                    
                    return (
                      <ListItem key={`food-${foodId}`} sx={{ py: 1 }}>
                        <Grid container alignItems="center" spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>{food.name}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              type="number"
                              size="small"
                              label="克数"
                              value={foodAmounts[foodId] || 100}
                              onChange={(e) => {
                                const newValue = parseInt(e.target.value) || 0;
                                setFoodAmounts(prev => ({
                                  ...prev,
                                  [foodId]: newValue
                                }));
                              }}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">克</InputAdornment>,
                              }}
                              fullWidth
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 1,
                                  backgroundColor: '#ffffff'
                                }
                              }}
                            />
                          </Grid>
                        </Grid>
                      </ListItem>
                    );
                  })}
                </List>
                
                {/* 营养成分总计 */}
                <Box sx={{ 
                  mt: 3, 
                  p: 2, 
                  borderTop: '1px solid #e0e0e0',
                  backgroundColor: '#f0f7ff',
                  borderRadius: '0 0 8px 8px'
                }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    营养成分总计:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">热量:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#ff6d00' }}>
                        {calculateTotalNutrition().calories.toFixed(1)} 千卡
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">蛋白质:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                        {calculateTotalNutrition().protein.toFixed(1)} 克
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">碳水化合物:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                        {calculateTotalNutrition().carbs.toFixed(1)} 克
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">脂肪:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                        {calculateTotalNutrition().fat.toFixed(1)} 克
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary">
                该菜肴没有食材信息
              </Typography>
            )}
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button 
            onClick={handleClose} 
            sx={{ 
              border: '1px solid #e0e0e0',
              '&:hover': { backgroundColor: '#f5f5f5' },
              mr: 2
            }}
          >
            取消
          </Button>
          <Button 
            onClick={handleAddDish} 
            variant="contained" 
            color="primary" 
            disabled={!selectedDish}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' },
              '&.Mui-disabled': { backgroundColor: '#e0e0e0', color: '#9e9e9e' }
            }}
          >
            添加到食谱
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default DishAddDialog;