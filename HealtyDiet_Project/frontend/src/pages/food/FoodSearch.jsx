import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';
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

const FoodSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedFood, setEditedFood] = useState(null);

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
  };

  // 关闭食物详情
  const handleCloseDetails = () => {
    setSelectedFood(null);
    setIsEditing(false);
  };

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
      setSelectedFood(editedFood);
      setIsEditing(false);
      // 更新食物列表
      const response = await axios.get('http://localhost:5000/api/foods');
      setFoods(response.data);
    } catch (err) {
      console.error('保存食物数据失败:', err);
      setError('保存食物数据失败，请重试');
    }
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
          <>
            {selectedFood ? (
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {selectedFood.name}
                  </Typography>
                  
                  {selectedFood.description && (
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {selectedFood.description}
                    </Typography>
                  )}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="h6" gutterBottom>
                    营养成分 (每{selectedFood.servingSize}{selectedFood.unit})
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body1">
                        <strong>热量:</strong> 
                        {isEditing ? (
                          <TextField
                            type="number"
                            value={editedFood?.calories || selectedFood.calories}
                            onChange={(e) => handleNutrientChange(null, 'calories', e.target.value)}
                            size="small"
                            sx={{ width: '80px', ml: 1 }}
                          />
                        ) : (
                          `${selectedFood.calories} 千卡`
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body1">
                        <strong>蛋白质:</strong> 
                        {isEditing ? (
                          <TextField
                            type="number"
                            value={editedFood?.protein || selectedFood.protein}
                            onChange={(e) => handleNutrientChange(null, 'protein', e.target.value)}
                            size="small"
                            sx={{ width: '80px', ml: 1 }}
                          />
                        ) : (
                          `${selectedFood.protein}g`
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body1">
                        <strong>碳水化合物:</strong> 
                        {isEditing ? (
                          <TextField
                            type="number"
                            value={editedFood?.carbs || selectedFood.carbs}
                            onChange={(e) => handleNutrientChange(null, 'carbs', e.target.value)}
                            size="small"
                            sx={{ width: '80px', ml: 1 }}
                          />
                        ) : (
                          `${selectedFood.carbs}g`
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body1">
                        <strong>脂肪:</strong> 
                        {isEditing ? (
                          <TextField
                            type="number"
                            value={editedFood?.fat || selectedFood.fat}
                            onChange={(e) => handleNutrientChange(null, 'fat', e.target.value)}
                            size="small"
                            sx={{ width: '80px', ml: 1 }}
                          />
                        ) : (
                          `${selectedFood.fat}g`
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
                            {Object.entries(selectedFood.vitamins || {}).map(([vitamin, amount]) => (
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
                            {Object.entries(selectedFood.minerals || {}).map(([mineral, amount]) => (
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
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={handleCloseDetails}>返回列表</Button>
                  <Button size="small" onClick={() => {
                    setIsEditing(!isEditing);
                    setEditedFood({...selectedFood});
                  }}>
                    {isEditing ? '取消编辑' : '编辑'}
                  </Button>
                  {isEditing && (
                    <Button size="small" onClick={handleSaveChanges} color="primary">
                      保存
                    </Button>
                  )}
                </CardActions>
              </Card>
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
          </>
        )}
      </Box>
    </Container>
  );
};

export default FoodSearch;