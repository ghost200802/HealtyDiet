import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import Avatar from '@mui/material/Avatar';

// 导入食物详情对话框组件
import FoodDetailDialog from '@/components/dialogs/FoodDetailDialog';

// 食物表单验证模式
const FoodSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, '食物名称至少需要2个字符')
    .max(50, '食物名称不能超过50个字符')
    .required('食物名称不能为空'),
  calories: Yup.number()
    .min(0, '热量不能为负数')
    .required('热量不能为空'),
  protein: Yup.number()
    .min(0, '蛋白质不能为负数')
    .required('蛋白质不能为空'),
  carbs: Yup.number()
    .min(0, '碳水化合物不能为负数')
    .required('碳水化合物不能为空'),
  fat: Yup.number()
    .min(0, '脂肪不能为负数')
    .required('脂肪不能为空'),
  servingSize: Yup.number()
    .min(1, '份量必须大于0')
    .required('份量不能为空'),
  unit: Yup.string()
    .required('单位不能为空'),
  description: Yup.string()
    .max(500, '描述不能超过500个字符')
});

const FoodAdd = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addedFood, setAddedFood] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  // 处理食物添加
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setError('');
      setSuccess('');
      
      // 准备维生素和矿物质数据
      const vitamins = {
        A: parseFloat(values.vitaminA) || 0,
        C: parseFloat(values.vitaminC) || 0,
        D: parseFloat(values.vitaminD) || 0,
        E: parseFloat(values.vitaminE) || 0
      };
      
      const minerals = {
        calcium: parseFloat(values.calcium) || 0,
        iron: parseFloat(values.iron) || 0,
        magnesium: parseFloat(values.magnesium) || 0,
        potassium: parseFloat(values.potassium) || 0
      };
      
      // 准备提交的食物数据
      const foodData = {
        name: values.name,
        calories: parseFloat(values.calories),
        protein: parseFloat(values.protein),
        carbs: parseFloat(values.carbs),
        fat: parseFloat(values.fat),
        vitamins,
        minerals,
        servingSize: parseFloat(values.servingSize),
        unit: values.unit,
        description: values.description
      };
      
      // 发送添加食物请求到后端API
      const response = await axios.post('/api/foods', foodData);
      
      // 添加成功
      setSuccess('食物添加成功！');
      resetForm();
      
      // 显示添加的食物详情
      setAddedFood(response.data);
      setDetailDialogOpen(true);
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || '添加食物失败，请重试');
      } else {
        setError('添加食物失败，请检查网络连接');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  // 关闭食物详情对话框
  const handleCloseDetails = () => {
    setDetailDialogOpen(false);
  };

  // 处理食物更新
  const handleFoodUpdate = (updatedFood) => {
    setAddedFood(updatedFood);
  };

  return (
    <>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 56, height: 56 }}>
              <RestaurantIcon fontSize="large" />
            </Avatar>
            <Typography component="h1" variant="h4">
              添加新食物
          </Typography>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/food-search')}
          >
            返回食物列表
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        <Formik
          initialValues={{
            name: '',
            calories: '',
            protein: '',
            carbs: '',
            fat: '',
            vitaminA: '0',
            vitaminC: '0',
            vitaminD: '0',
            vitaminE: '0',
            calcium: '0',
            iron: '0',
            magnesium: '0',
            potassium: '0',
            servingSize: '100',
            unit: 'g',
            description: ''
          }}
          validationSchema={FoodSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              <Typography variant="h6" gutterBottom>
                基本信息
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Field name="name">
                    {({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        id="name"
                        label="食物名称"
                        required
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12}>
                  <Field name="description">
                    {({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        id="description"
                        label="食物描述"
                        multiline
                        rows={3}
                        error={touched.description && Boolean(errors.description)}
                        helperText={touched.description && errors.description}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Field name="servingSize">
                    {({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        id="servingSize"
                        label="份量"
                        type="number"
                        required
                        error={touched.servingSize && Boolean(errors.servingSize)}
                        helperText={touched.servingSize && errors.servingSize}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Field name="unit">
                    {({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        id="unit"
                        label="单位"
                        required
                        error={touched.unit && Boolean(errors.unit)}
                        helperText={touched.unit && errors.unit}
                      />
                    )}
                  </Field>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                主要营养成分
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Field name="calories">
                    {({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        id="calories"
                        label="热量 (千卡)"
                        type="number"
                        required
                        error={touched.calories && Boolean(errors.calories)}
                        helperText={touched.calories && errors.calories}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Field name="protein">
                    {({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        id="protein"
                        label="蛋白质 (g)"
                        type="number"
                        required
                        error={touched.protein && Boolean(errors.protein)}
                        helperText={touched.protein && errors.protein}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Field name="carbs">
                    {({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        id="carbs"
                        label="碳水化合物 (g)"
                        type="number"
                        required
                        error={touched.carbs && Boolean(errors.carbs)}
                        helperText={touched.carbs && errors.carbs}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Field name="fat">
                    {({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        id="fat"
                        label="脂肪 (g)"
                        type="number"
                        required
                        error={touched.fat && Boolean(errors.fat)}
                        helperText={touched.fat && errors.fat}
                      />
                    )}
                  </Field>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                维生素 (mg)
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Field name="vitaminA">
                    {({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        id="vitaminA"
                        label="维生素A"
                        type="number"
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Field name="vitaminC">
                    {({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        id="vitaminC"
                        label="维生素C"
                        type="number"
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Field name="vitaminD">
                    {({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        id="vitaminD"
                        label="维生素D"
                        type="number"
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Field name="vitaminE">
                    {({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        id="vitaminE"
                        label="维生素E"
                        type="number"
                      />
                    )}
                  </Field>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                矿物质 (mg)
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Field name="calcium">
                    {({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        id="calcium"
                        label="钙"
                        type="number"
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Field name="iron">
                    {({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        id="iron"
                        label="铁"
                        type="number"
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Field name="magnesium">
                    {({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        id="magnesium"
                        label="镁"
                        type="number"
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Field name="potassium">
                    {({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        id="potassium"
                        label="钾"
                        type="number"
                      />
                    )}
                  </Field>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  size="large"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '添加中...' : '添加食物'}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>

    {/* 食物详情对话框 */}
    <FoodDetailDialog 
      open={detailDialogOpen} 
      onClose={handleCloseDetails}
      food={addedFood}
      onFoodUpdate={handleFoodUpdate}
    />
  </>
  );
};

export default FoodAdd;