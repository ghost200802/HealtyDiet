import React, { useMemo, useState } from 'react';
import {
  Paper,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  IconButton,
  Collapse,
  Box,
  Divider,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Restaurant as RestaurantIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

/**
 * 食谱中的食物列表表格组件
 */
const DietItemsTable = ({ 
  dietItems, 
  foods, 
  onAmountChange, 
  onRemoveFood, 
  onViewFoodDetail,
  dishes, // 添加dishes参数，用于获取菜肴名称
  onRemoveDish // 添加删除整个菜肴的回调函数
}) => {
  // 添加折叠状态管理
  const [collapsedDishes, setCollapsedDishes] = useState({});
  
  // 切换菜肴的折叠状态
  const toggleDishCollapse = (dishId) => {
    setCollapsedDishes(prev => ({
      ...prev,
      [dishId]: !prev[dishId]
    }));
  };
  
  // 按菜肴分组食物
  const groupedItems = useMemo(() => {
    // 初始化分组
    const groups = {
      null: { // 未分组的食物
        items: [],
        name: '未分组食物',
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0
      }
    };
    
    // 遍历所有食物项，按dishId分组
    dietItems.forEach((item, index) => {
      const dishId = item.dishId || null;
      
      // 如果该dishId的分组不存在，创建一个新分组
      if (!groups[dishId] && dishId !== null) {
        groups[dishId] = {
          items: [],
          name: '未知菜肴', // 默认名称，后面会更新
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0
        };
      }
      
      // 将食物项添加到对应分组
      groups[dishId].items.push({...item, index});
      
      // 累加营养素
      groups[dishId].totalCalories += item.calories || 0;
      groups[dishId].totalProtein += item.protein || 0;
      groups[dishId].totalCarbs += item.carbs || 0;
      groups[dishId].totalFat += item.fat || 0;
    });
    
    // 如果dishes参数存在，更新菜肴名称
    if (dishes) {
      Object.keys(groups).forEach(dishId => {
        if (dishId !== 'null') {
          // 将dishId转换为数字进行比较，因为JSON中的id是数字类型
          const numericDishId = parseInt(dishId, 10);
          const dish = dishes.find(d => d.id === numericDishId);
          if (dish) {
            groups[dishId].name = dish.name;
          }
        }
      });
    }
    
    return groups;
  }, [dietItems, dishes]);
  
  // 渲染食物行
  const renderFoodRow = (item, index) => (
    <TableRow key={`${item.foodId}-${index}`}>
      <TableCell><Typography color="text.secondary">{item.foodName}</Typography></TableCell>
      <TableCell align="center">
        <TextField
          type="number"
          value={item.amount}
          onChange={(e) => {
            const newAmount = parseFloat(e.target.value);
            if (!isNaN(newAmount) && newAmount > 0) {
              onAmountChange(item.index, newAmount);
            }
          }}
          size="small"
          sx={{ width: 80 }}
          inputProps={{ min: 0, step: 0.1 }}
        />
      </TableCell>
      <TableCell align="center">{item.calories.toFixed(1)}</TableCell>
      <TableCell align="center">{item.protein.toFixed(1)}</TableCell>
      <TableCell align="center">{item.carbs.toFixed(1)}</TableCell>
      <TableCell align="center">{item.fat.toFixed(1)}</TableCell>
      <TableCell align="center">
        <IconButton 
          size="small" 
          color="primary"
          onClick={() => {
            const food = foods.find(f => f.id === item.foodId);
            if (food) {
              onViewFoodDetail(food);
            }
          }}
          sx={{ mr: 1 }}
        >
          <VisibilityIcon />
        </IconButton>
        <IconButton 
          size="small" 
          color="error"
          onClick={() => onRemoveFood(item.index)}
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
  
  // 渲染菜肴组
  const renderDishGroup = (dishId, group) => {
    const isCollapsed = collapsedDishes[dishId] || false;
    
    return (
      <React.Fragment key={dishId || 'ungrouped'}>
        {/* 菜肴标题行 */}
        {dishId !== 'null' && (
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <RestaurantIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1" component="span" sx={{ fontWeight: 'bold' }}>
                  {group.name}
                </Typography>
              </Box>
            </TableCell>
            <TableCell align="center">
              <Typography variant="body2" color="text.primary" sx={{ fontWeight: 'medium' }}>
                总计
              </Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="body2" color="text.primary" sx={{ fontWeight: 'medium' }}>
                {group.totalCalories.toFixed(1)}
              </Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="body2" color="text.primary" sx={{ fontWeight: 'medium' }}>
                {group.totalProtein.toFixed(1)}
              </Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="body2" color="text.primary" sx={{ fontWeight: 'medium' }}>
                {group.totalCarbs.toFixed(1)}
              </Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="body2" color="text.primary" sx={{ fontWeight: 'medium' }}>
                {group.totalFat.toFixed(1)}
              </Typography>
            </TableCell>
            <TableCell align="center">
              <IconButton 
                size="small" 
                onClick={() => toggleDishCollapse(dishId)}
                sx={{ mr: 1 }}
              >
                {isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
              </IconButton>
              
              <IconButton 
                size="small" 
                color="error"
                onClick={() => {
                  // 获取该菜肴中所有食物的索引
                  const itemIndices = group.items.map(item => item.index);
                  // 调用删除菜肴的回调函数
                  if (onRemoveDish && typeof onRemoveDish === 'function') {
                    onRemoveDish(dishId, itemIndices);
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        )}
        
        {/* 食物行 - 根据折叠状态显示或隐藏 */}
        {(dishId === 'null' || !isCollapsed) && (
          group.items.map((item) => renderFoodRow(item, item.index))
        )}
        
        {/* 分隔线 */}
        {dishId !== 'null' && (
          <TableRow>
            <TableCell colSpan={7} padding="none">
              <Divider />
            </TableCell>
          </TableRow>
        )}
      </React.Fragment>
    );
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        食物列表
      </Typography>
      {dietItems.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
          食谱中还没有食物，点击上方的载入按钮载入已保存的食谱，或者请点击上方的添加按钮添加食物。
        </Typography>
      ) : (
        <TableContainer>
          <Table size="medium" sx={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '20%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '22%' }} />
            </colgroup>
            <TableHead>
              <TableRow>
                <TableCell>食物名称</TableCell>
                <TableCell align="center">数量 (克)</TableCell>
                <TableCell align="center">热量 (千卡)</TableCell>
                <TableCell align="center">蛋白质 (克)</TableCell>
                <TableCell align="center">碳水 (克)</TableCell>
                <TableCell align="center">脂肪 (克)</TableCell>
                <TableCell align="center">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* 先渲染未分组的食物 */}
              {groupedItems['null'] && groupedItems['null'].items.length > 0 && 
                renderDishGroup('null', groupedItems['null'])}
              
              {/* 再渲染各个菜肴组 */}
              {Object.keys(groupedItems)
                .filter(dishId => dishId !== 'null')
                .map(dishId => renderDishGroup(dishId, groupedItems[dishId]))}
              
              {/* 添加一个隐藏的表格行，用于保持表格结构一致 */}
              <TableRow style={{ display: 'none' }}>
                <TableCell>隐藏行</TableCell>
                <TableCell align="right">0</TableCell>
                <TableCell align="right">0</TableCell>
                <TableCell align="right">0</TableCell>
                <TableCell align="right">0</TableCell>
                <TableCell align="right">0</TableCell>
                <TableCell align="right">
                  <IconButton size="small" sx={{ visibility: 'hidden' }}>
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton size="small" sx={{ visibility: 'hidden' }}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default DietItemsTable;