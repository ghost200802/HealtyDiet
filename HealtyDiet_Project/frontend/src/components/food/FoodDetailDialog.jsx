import React, { useState } from 'react';
import axios from 'axios';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

/**
 * 食物详情弹出式对话框组件
 * 可以在任何页面中使用来显示食物详情
 */
const FoodDetailDialog = ({ open, onClose, food, onFoodUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFood, setEditedFood] = useState(null);
  const [error, setError] = useState('');

  // 当食物数据变化时，更新编辑状态
  React.useEffect(() => {
    if (food) {
      setEditedFood({...food});
    }
  }, [food]);

  // 处理营养数值变化
  const handleNutrientChange = (nutrientType, key, value) => {
    setEditedFood(prev => {
      const newFood = {...prev};
      if (nutrientType === 'vitamins') {
        newFood.vitamins = {...newFood.vitamins, [key]: parseFloat(value)};
      } else if (nutrientType === 'minerals') {
        newFood.minerals = {...newFood.minerals, [key]: parseFloat(value)};
      } else {
        newFood[key] = parseFloat(value);
      }
      return newFood;
    });
  };

  // 保存修改
  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/foods/${editedFood.id}`, editedFood, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setIsEditing(false);
      // 通知父组件食物已更新
      if (onFoodUpdate) {
        onFoodUpdate(editedFood);
      }
    } catch (err) {
      console.error('保存食物数据失败:', err);
      setError('保存食物数据失败，请重试');
    }
  };

  // 如果没有食物数据，不渲染任何内容
  if (!food) return null;

  return (
    <Dialog
      open={open}
      onClose={() => {
        setIsEditing(false);
        onClose();
      }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {food.name}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        {food.description && (
          <Typography variant="body1" color="text.secondary" paragraph>
            {food.description}
          </Typography>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          营养成分 (每{food.servingSize}{food.unit})
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body1">
              <strong>热量:</strong> 
              {isEditing ? (
                <TextField
                  type="number"
                  value={editedFood?.calories || food.calories}
                  onChange={(e) => handleNutrientChange(null, 'calories', e.target.value)}
                  size="small"
                  sx={{ width: '80px', ml: 1 }}
                />
              ) : (
                `${food.calories} 千卡`
              )}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body1">
              <strong>蛋白质:</strong> 
              {isEditing ? (
                <TextField
                  type="number"
                  value={editedFood?.protein || food.protein}
                  onChange={(e) => handleNutrientChange(null, 'protein', e.target.value)}
                  size="small"
                  sx={{ width: '80px', ml: 1 }}
                />
              ) : (
                `${food.protein}g`
              )}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body1">
              <strong>碳水化合物:</strong> 
              {isEditing ? (
                <TextField
                  type="number"
                  value={editedFood?.carbs || food.carbs}
                  onChange={(e) => handleNutrientChange(null, 'carbs', e.target.value)}
                  size="small"
                  sx={{ width: '80px', ml: 1 }}
                />
              ) : (
                `${food.carbs}g`
              )}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body1">
              <strong>脂肪:</strong> 
              {isEditing ? (
                <TextField
                  type="number"
                  value={editedFood?.fat || food.fat}
                  onChange={(e) => handleNutrientChange(null, 'fat', e.target.value)}
                  size="small"
                  sx={{ width: '80px', ml: 1 }}
                />
              ) : (
                `${food.fat}g`
              )}
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              维生素
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>维生素</TableCell>
                    <TableCell align="right">含量</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(food.vitamins || {}).map(([vitamin, amount]) => (
                    <TableRow key={vitamin}>
                      <TableCell>维生素 {vitamin}</TableCell>
                      <TableCell align="right">{amount} mg</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              矿物质
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>矿物质</TableCell>
                    <TableCell align="right">含量</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(food.minerals || {}).map(([mineral, amount]) => (
                    <TableRow key={mineral}>
                      <TableCell>
                        {mineral === 'calcium' ? '钙' :
                         mineral === 'iron' ? '铁' :
                         mineral === 'magnesium' ? '镁' :
                         mineral === 'potassium' ? '钾' : mineral}
                      </TableCell>
                      <TableCell align="right">{amount} mg</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {
          setIsEditing(!isEditing);
          if (!isEditing) {
            setEditedFood({...food});
          }
        }}>
          {isEditing ? '取消编辑' : '编辑'}
        </Button>
        {isEditing && (
          <Button onClick={handleSaveChanges} color="primary">
            保存
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FoodDetailDialog;