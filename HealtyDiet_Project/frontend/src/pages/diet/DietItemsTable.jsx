import React, { useMemo } from 'react';
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
  Restaurant as RestaurantIcon
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
  dishes // 添加dishes参数，用于获取菜肴名称
}) => {
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
      <TableCell>{item.foodName}</TableCell>
      <TableCell align="right">
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
      <TableCell align="right">{item.calories.toFixed(1)}</TableCell>
      <TableCell align="right">{item.protein.toFixed(1)}</TableCell>
      <TableCell align="right">{item.carbs.toFixed(1)}</TableCell>
      <TableCell align="right">{item.fat.toFixed(1)}</TableCell>
      <TableCell align="right">
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
    return (
      <React.Fragment key={dishId || 'ungrouped'}>
        {/* 菜肴标题行 */}
        {dishId !== 'null' && (
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell colSpan={7}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <RestaurantIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1" component="span">
                  {group.name}
                </Typography>
                <Box sx={{ ml: 2, display: 'flex', flexGrow: 1, justifyContent: 'flex-end' }}>
                  <Typography variant="body2" color="text.secondary">
                    热量: {group.totalCalories.toFixed(1)} 千卡 | 
                    蛋白质: {group.totalProtein.toFixed(1)} 克 | 
                    碳水: {group.totalCarbs.toFixed(1)} 克 | 
                    脂肪: {group.totalFat.toFixed(1)} 克
                  </Typography>
                </Box>
              </Box>
            </TableCell>
          </TableRow>
        )}
        
        {/* 食物行 */}
        {group.items.map((item) => renderFoodRow(item, item.index))}
        
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
              {/* 先渲染未分组的食物 */}
              {groupedItems['null'] && groupedItems['null'].items.length > 0 && 
                renderDishGroup('null', groupedItems['null'])}
              
              {/* 再渲染各个菜肴组 */}
              {Object.keys(groupedItems)
                .filter(dishId => dishId !== 'null')
                .map(dishId => renderDishGroup(dishId, groupedItems[dishId]))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default DietItemsTable;