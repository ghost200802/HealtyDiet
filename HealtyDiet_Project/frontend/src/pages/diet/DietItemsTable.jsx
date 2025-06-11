import React from 'react';
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
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

/**
 * 食谱中的食物列表表格组件
 */
const DietItemsTable = ({ 
  dietItems, 
  foods, 
  onAmountChange, 
  onRemoveFood, 
  onViewFoodDetail 
}) => {
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
              {dietItems.map((item, index) => (
                <TableRow key={`${item.foodId}-${index}`}>
                  <TableCell>{item.foodName}</TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      value={item.amount}
                      onChange={(e) => {
                        const newAmount = parseFloat(e.target.value);
                        if (!isNaN(newAmount) && newAmount > 0) {
                          onAmountChange(index, newAmount);
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
                      onClick={() => onRemoveFood(index)}
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
  );
};

export default DietItemsTable;