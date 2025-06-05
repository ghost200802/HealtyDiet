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
  InputAdornment
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';

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
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [foodAmount, setFoodAmount] = useState('');

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
        food?.name?.toLowerCase()?.includes(query) ||
        food?.category?.toLowerCase()?.includes(query)
      );
    }
    
    setFilteredFoods(filtered);
  }, [foods, selectedCategory, searchQuery]);

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
      onClose={onClose}
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
              {categories.map((category, index) => (
                <ListItem 
                  key={`${category}-${index}`} 
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
        <Button onClick={onClose}>取消</Button>
        <Button 
          onClick={handleAddFood} 
          variant="contained" 
          disabled={!selectedFood || !foodAmount}
        >
          添加到食谱
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FoodAddDialog;