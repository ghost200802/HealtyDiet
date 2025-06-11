import React, { useState, useEffect } from 'react';
import { getFoodsByIds } from '@/services/FoodService';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  ButtonGroup,
  Collapse,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Restaurant as RestaurantIcon,
  Info as InfoIcon,
  Add as AddIcon,
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

/**
 * 食谱卡片组件，显示单个食谱的信息
 */
const DietCard = ({ diet, weekday, onRemove, onSave, onAddFood, onViewDetail }) => {
  // 使用食谱对象中的nutrition属性获取营养成分
  const totalNutrition = diet?.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 };

  // 获取食材列表
  const [items, setItems] = useState([]);
  
  // 在组件挂载和diet变化时更新食材列表并获取食材名称
  useEffect(() => {
    const fetchFoodNames = async () => {
      if (diet?.items && diet.items.length > 0) {
        try {
          // 获取所有食材的ID
          const foodIds = diet.items.map(item => item.foodId);
          
          // 使用FoodService获取食材信息
          const foodsData = await getFoodsByIds(foodIds);
          
          // 将食材名称添加到items中
          const itemsWithNames = diet.items.map(item => {
            const food = foodsData.find(f => f.id === item.foodId);
            return {
              ...item,
              foodName: food ? food.name : `食材ID: ${item.foodId}`
            };
          });
          
          setItems(itemsWithNames);
        } catch (error) {
          console.error('获取食材名称失败:', error);
          // 如果获取失败，仍然使用原始items
          setItems(diet.items);
        }
      } else {
        setItems([]);
      }
    };
    
    fetchFoodNames();
  }, [diet]);
  
  // 展开/收起食材列表的状态
  const [expanded, setExpanded] = useState(false);
  
  // 处理食材数量变化
  const handleAmountChange = (index, newAmount) => {
    if (isNaN(newAmount) || newAmount <= 0) return;
    
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      amount: newAmount
    };
    setItems(updatedItems);
    
    // 如果有onUpdateItem回调，则调用它
    if (diet.onUpdateItem) {
      diet.onUpdateItem(index, newAmount);
    }
  };
  
  // 处理删除食材
  const handleRemoveItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
    
    // 如果有onRemoveItem回调，则调用它
    if (diet.onRemoveItem) {
      diet.onRemoveItem(index);
    }
  };
  
  // 处理保存食谱
  const handleSave = () => {
    if (onSave) {
      onSave(diet.id, items);
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        {/* 星期几标签 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Chip 
            label={weekday} 
            color="primary" 
            size="small" 
            icon={<RestaurantIcon />} 
          />
          <IconButton 
            size="small" 
            color="error" 
            onClick={onRemove}
            aria-label="删除食谱"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
        
        {/* 食谱名称 */}
        <Typography variant="h6" component="h2" gutterBottom>
          {diet?.name || '未命名食谱'}
        </Typography>
        
        {/* 营养信息 */}
        <Typography variant="body2" color="text.secondary" gutterBottom>
          热量: {Math.round(totalNutrition.calories)} 千卡
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          蛋白质: {Math.round(totalNutrition.protein)}g | 
          碳水: {Math.round(totalNutrition.carbs)}g | 
          脂肪: {Math.round(totalNutrition.fat)}g
        </Typography>
        
        <Divider sx={{ my: 1 }} />
        
        {/* 食材列表标题和展开/收起按钮 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body1" fontWeight="medium">
            食材列表
          </Typography>
          <IconButton 
            size="small" 
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        
        {/* 可展开的食材列表 */}
        <Collapse in={expanded}>
          {items && items.length > 0 ? (
            <List dense disablePadding>
              {items.map((item, index) => (
                <ListItem 
                  key={`${item.foodId}-${index}`}
                  disablePadding
                  sx={{ mb: 1 }}
                >
                  <ListItemText 
                    primary={item.foodName || `食材ID: ${item.foodId}`} 
                    sx={{ flexGrow: 1, mr: 1 }}
                  />
                  <TextField
                    type="number"
                    value={item.amount}
                    onChange={(e) => handleAmountChange(index, parseFloat(e.target.value))}
                    size="small"
                    sx={{ width: 70 }}
                    inputProps={{ min: 0, step: 0.1 }}
                  />
                  <Typography variant="body2" sx={{ mx: 1 }}>克</Typography>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
              暂无食材，请点击添加按钮添加食材
            </Typography>
          )}
        </Collapse>
        
        {/* 操作按钮组 */}
        <ButtonGroup variant="outlined" size="small" sx={{ mt: 2, width: '100%', justifyContent: 'space-between' }}>
          <Button 
            startIcon={<InfoIcon />} 
            onClick={() => onViewDetail && onViewDetail(diet)}
            component={Link}
            to={`/diet?id=${diet.id}`}
          >
            详情
          </Button>
          <Button 
            startIcon={<AddIcon />} 
            onClick={() => onAddFood && onAddFood(diet)}
          >
            添加
          </Button>
          <Button 
            startIcon={<SaveIcon />} 
            onClick={handleSave}
            color="primary"
          >
            保存
          </Button>
        </ButtonGroup>
      </CardContent>
    </Card>
  );
};

export default DietCard;