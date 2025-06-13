import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Collapse,
  CircularProgress
} from '@mui/material';
import { Visibility as VisibilityIcon, ExpandLess, ExpandMore, Close as CloseIcon } from '@mui/icons-material';

/**
 * 添加食物到食谱的弹出式对话框组件
 */
const FoodAddDialog = ({
  open,
  onClose,
  foods,
  categories,
  onAddFood,
  onViewFoodDetail
}) => {
  // 状态
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [foodAmount, setFoodAmount] = useState('');
  const [foodTypes, setFoodTypes] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // 从后端API获取食物分类数据
  useEffect(() => {
    const fetchFoodTypes = async () => {
      try {
        // 直接获取完整的食物类型数据
        const response = await axios.get('/api/foods/types/full');
        
        if (response.data && response.data.foodTypes) {
          setFoodTypes(response.data.foodTypes);
          
          // 初始化展开状态
          const initialExpandedState = {};
          Object.keys(response.data.foodTypes).forEach(category => {
            initialExpandedState[category] = false;
          });
          setExpandedCategories(initialExpandedState);
        } else {
          console.error('食物类型数据格式不正确');
          throw new Error('食物类型数据格式不正确');
        }
      } catch (error) {
        console.error('获取食物分类数据失败:', error);
      }
    };
    
    fetchFoodTypes();
  }, []);

  // 过滤食物列表
  useEffect(() => {
    let filtered = foods;
    
    // 按主分类过滤
    if (selectedCategory !== '全部') {
      filtered = filtered.filter(food => food.type === selectedCategory);
      
      // 按子分类过滤
      if (selectedSubCategory) {
        filtered = filtered.filter(food => food.subType === selectedSubCategory);
      }
    }
    
    // 按搜索词过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(food => 
        food?.name?.toLowerCase()?.includes(query) ||
        food?.type?.toLowerCase()?.includes(query) ||
        food?.subType?.toLowerCase()?.includes(query)
      );
    }
    
    setFilteredFoods(filtered);
  }, [foods, selectedCategory, selectedSubCategory, searchQuery]);

  // 处理添加食物
  const handleAddFood = () => {
    if (!selectedFood || !foodAmount || isNaN(foodAmount) || parseFloat(foodAmount) <= 0) {
      return;
    }
    
    onAddFood(selectedFood, parseFloat(foodAmount));
    
    // 重置状态
    setSelectedFood(null);
    setFoodAmount('');
  };

  // 自定义关闭处理函数
  const handleClose = () => {
    // 重置所有选择状态
    setSelectedFood(null);
    setFoodAmount('');
    setSearchQuery('');
    setSelectedCategory('全部');
    setSelectedSubCategory(null);
    
    // 调用原始的 onClose 函数
    onClose();
  };

  // 渲染食物卡片
  const renderFoodCard = (food) => (
    <Card 
      key={`food-card-${food.id}`} 
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
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <IconButton 
            size="small" 
            color="primary"
            onClick={(e) => {
              e.stopPropagation(); // 阻止事件冒泡，避免触发卡片的点击事件
              onViewFoodDetail(food);
            }}
          >
            <VisibilityIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

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
      <DialogTitle>添加食物</DialogTitle>
      <DialogContent sx={{ 
        position: 'relative', 
        overflow: 'auto',
        flex: 1,
        pb: 10 
      }}>
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
            <Box sx={{ height: '600px', overflow: 'auto' }}>
              <List>
                <ListItem 
                  button 
                  selected={selectedCategory === '全部'}
                  onClick={() => {
                    setSelectedCategory('全部');
                    setSelectedSubCategory(null);
                  }}
                >
                  <ListItemText primary="全部" />
                </ListItem>
                
                {Object.keys(foodTypes).map((type) => {
                  const isExpanded = expandedCategories[type] || false;
                  
                  return (
                    <React.Fragment key={type}>
                      <ListItem 
                        button 
                        selected={selectedCategory === type && !selectedSubCategory}
                        onClick={() => {
                          setSelectedCategory(type);
                          setSelectedSubCategory(null);
                          setExpandedCategories(prev => ({
                            ...prev,
                            [type]: !isExpanded
                          }));
                        }}
                      >
                        <ListItemText primary={type} />
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                      </ListItem>
                      
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          {foodTypes[type] && foodTypes[type].subTypes && foodTypes[type].subTypes.map((subType) => (
                            <ListItem 
                              key={`${type}-${subType}`} 
                              button 
                              selected={selectedCategory === type && selectedSubCategory === subType}
                              sx={{ pl: 4 }}
                              onClick={() => {
                                setSelectedCategory(type);
                                setSelectedSubCategory(subType);
                              }}
                            >
                              <ListItemText primary={subType} />
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                    </React.Fragment>
                  );
                })}
              </List>
            </Box>
          </Grid>
          
          {/* 右侧食物列表 */}
          <Grid item xs={12} md={9}>
            <Typography variant="h6" gutterBottom>
              食物列表
            </Typography>
            <Box sx={{ height: '600px', overflow: 'auto' }}>
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
        {selectedFood && (
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
                已选择: {selectedFood.name}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => {
                  setSelectedFood(null);
                  setFoodAmount('');
                }}
                sx={{ 
                  color: '#757575',
                  '&:hover': { color: '#f44336', backgroundColor: '#f5f5f5' }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
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
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#1976d2',
                  },
                }
              }}
            />
            <Box sx={{ 
              p: 2, 
              bgcolor: '#f8f8f8', 
              borderRadius: 1,
              border: '1px solid #e0e0e0'
            }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: '#555' }}>
                营养成分:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">热量:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                    {(selectedFood.calories * (parseFloat(foodAmount) / 100 || 0)).toFixed(1)} 千卡
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">蛋白质:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                    {(selectedFood.protein * (parseFloat(foodAmount) / 100 || 0)).toFixed(1)} 克
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">碳水:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                    {(selectedFood.carbs * (parseFloat(foodAmount) / 100 || 0)).toFixed(1)} 克
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">脂肪:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                    {(selectedFood.fat * (parseFloat(foodAmount) / 100 || 0)).toFixed(1)} 克
                  </Typography>
                </Grid>
              </Grid>
            </Box>
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
            onClick={handleAddFood} 
            variant="contained" 
            disabled={!selectedFood || !foodAmount}
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

export default FoodAddDialog;