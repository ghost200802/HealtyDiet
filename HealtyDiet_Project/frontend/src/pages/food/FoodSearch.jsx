import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import AddIcon from '@mui/icons-material/Add';

// 导入食物详情对话框组件
import FoodDetailDialog from '../../components/food/FoodDetailDialog';

const FoodSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // 获取所有食物（初始加载）
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await axios.get('http://localhost:5000/api/foods');
        setFoods(response.data);
      } catch (err) {
        console.error('获取食物数据失败:', err);
        setError('获取食物数据失败，请重试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFoods();
  }, []);

  // 处理搜索
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      // 如果搜索框为空，获取所有食物
      try {
        setLoading(true);
        setError('');
        
        const response = await axios.get('http://localhost:5000/api/foods');
        setFoods(response.data);
      } catch (err) {
        console.error('获取食物数据失败:', err);
        setError('获取食物数据失败，请重试');
      } finally {
        setLoading(false);
      }
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`http://localhost:5000/api/foods/search/${searchQuery}`);
      setFoods(response.data);
      
      if (response.data.length === 0) {
        setError('未找到匹配的食物');
      }
    } catch (err) {
      console.error('搜索食物失败:', err);
      setError('搜索食物失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 显示食物详情
  const handleFoodSelect = (food) => {
    setSelectedFood(food);
    setDetailDialogOpen(true);
  };

  // 关闭食物详情
  const handleCloseDetails = () => {
    setDetailDialogOpen(false);
  };

  // 处理食物更新
  const handleFoodUpdate = (updatedFood) => {
    // 更新食物列表中的数据
    setFoods(prevFoods => {
      return prevFoods.map(food => {
        if (food.id === updatedFood.id) {
          return updatedFood;
        }
        return food;
      });
    });
    // 更新选中的食物
    setSelectedFood(updatedFood);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          食物数据库
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <form onSubmit={handleSearch}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={9}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="搜索食物名称..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? '搜索中...' : '搜索'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            component={Link}
            to="/food-add"
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
          >
            添加新食物
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>食物名称</TableCell>
                  <TableCell align="right">热量 (千卡)</TableCell>
                  <TableCell align="right">蛋白质 (g)</TableCell>
                  <TableCell align="right">碳水化合物 (g)</TableCell>
                  <TableCell align="right">脂肪 (g)</TableCell>
                  <TableCell align="right">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {foods.length > 0 ? (
                  foods.map((food) => (
                    <TableRow key={food.id}>
                      <TableCell component="th" scope="row">
                        {food.name}
                      </TableCell>
                      <TableCell align="right">{food.calories}</TableCell>
                      <TableCell align="right">{food.protein}</TableCell>
                      <TableCell align="right">{food.carbs}</TableCell>
                      <TableCell align="right">{food.fat}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => handleFoodSelect(food)}>
                          查看详情
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      暂无食物数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      
      {/* 食物详情对话框 */}
      <FoodDetailDialog 
        open={detailDialogOpen} 
        onClose={handleCloseDetails}
        food={selectedFood}
        onFoodUpdate={handleFoodUpdate}
      />
    </Container>
  );
};

export default FoodSearch;