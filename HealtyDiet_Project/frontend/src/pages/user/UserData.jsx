import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import Avatar from '@mui/material/Avatar';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import zhCN from 'date-fns/locale/zh-CN';

// 用户数据表单验证模式
const UserDataSchema = Yup.object().shape({
  birthDate: Yup.date()
    .max(new Date(), '出生日期不能是未来日期')
    .required('出生日期不能为空'),
  gender: Yup.string()
    .oneOf(['male', 'female'], '请选择有效的性别')
    .required('性别不能为空'),
  height: Yup.number()
    .min(50, '身高必须大于50厘米')
    .max(250, '身高必须小于250厘米')
    .required('身高不能为空'),
  weight: Yup.number()
    .min(20, '体重必须大于20公斤')
    .max(300, '体重必须小于300公斤')
    .required('体重不能为空'),
  bodyFat: Yup.number()
    .min(1, '体脂率必须大于1%')
    .max(60, '体脂率必须小于60%')
    .nullable(),
  activityLevel: Yup.string()
    .oneOf(['sedentary', 'light', 'moderate', 'active', 'very_active'], '请选择有效的活动水平')
    .required('活动水平不能为空'),
  calorieDeficit: Yup.number()
    .min(0, '热量缺口不能为负数')
    .max(2000, '热量缺口不能超过2000千卡')
    .nullable()
});

// 活动水平选项
const activityLevels = [
  { value: 'sedentary', label: '久坐不动 (几乎不运动)', multiplier: 1.2, proteinCoefficient: 1.2 },
  { value: 'light', label: '轻度活动 (每周运动1-3天)', multiplier: 1.375, proteinCoefficient: 1.5 },
  { value: 'moderate', label: '中度活动 (每周运动3-5天)', multiplier: 1.55, proteinCoefficient: 1.8 },
  { value: 'active', label: '积极活动 (每周运动6-7天)', multiplier: 1.725, proteinCoefficient: 2.2 },
  { value: 'very_active', label: '非常活跃 (每天高强度运动)', multiplier: 1.9, proteinCoefficient: 2.5 }
];

// 计算年龄
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// 计算BMI
const calculateBMI = (weight, height) => {
  // 身高从厘米转换为米
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  return Math.round(bmi * 10) / 10; // 四舍五入到一位小数
};

// 计算基础代谢率 (BMR)
const calculateBMR = (weight, height, age, gender) => {
  // 使用Mifflin-St Jeor公式
  if (gender === 'male') {
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  } else {
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  }
};

// 获取BMI分类
const getBMICategory = (bmi) => {
  if (bmi < 18.5) return { category: '体重过轻', color: '#2196f3' };
  if (bmi < 24) return { category: '正常体重', color: '#4caf50' };
  if (bmi < 28) return { category: '超重', color: '#ff9800' };
  return { category: '肥胖', color: '#f44336' };
};

const UserData = ({ user, onNutritionDataUpdate }) => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [bmr, setBmr] = useState(0);
  const [tdee, setTdee] = useState(0);
  const [bmi, setBmi] = useState(0);
  const [bmiCategory, setBmiCategory] = useState({ category: '', color: '' });
  const [age, setAge] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  
  // 获取用户数据
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user || !user.id) return;
        
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/users/profile/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // 确保解析正确的profile数据结构
        console.log('后端返回的用户数据:', response.data);
        const profileData = response.data.profile;
        setUserData(profileData);
        
        // 如果有用户数据，计算BMR、TDEE和BMI
        if (profileData) {
          updateHealthMetrics(profileData);
        }
      } catch (err) {
        console.error('获取用户数据失败:', err);
        setError('获取用户数据失败，请重试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user?.id]);
  
  // 更新健康指标
  const updateHealthMetrics = (profileData) => {
    if (!profileData) return;
    
    const calculatedAge = calculateAge(profileData.birthDate);
    setAge(calculatedAge);
    
    const calculatedBMI = profileData.weight && profileData.height ? calculateBMI(profileData.weight, profileData.height) : 0;
    setBmi(calculatedBMI);
    setBmiCategory(getBMICategory(calculatedBMI || 0));
    
    const calculatedBMR = profileData.weight && profileData.height && profileData.gender ? 
      calculateBMR(
        profileData.weight,
        profileData.height,
        calculatedAge,
        profileData.gender
      ) : 0;
    setBmr(calculatedBMR);
    
    // 查找活动水平乘数
    const activityLevel = activityLevels.find(level => level.value === profileData.activityLevel);
    console.log('当前活动水平:', activityLevel);
    const multiplier = activityLevel ? activityLevel.multiplier : 1.2;
    
    // 计算TDEE (总能量消耗)
    const tdeeValue = calculatedBMR ? Math.round(calculatedBMR * multiplier) : 0;
    
    // 获取热量缺口值（默认500千卡）
    const calorieDeficit = profileData.calorieDeficit || 0;
    const adjustedTdee = Math.max(tdeeValue - calorieDeficit, 1200); // 确保不低于基础代谢
    setTdee(adjustedTdee);
    
    // 计算每日营养素推荐摄入量  
    // 根据活动水平确定蛋白质系数
    const proteinCoefficient = activityLevel ? activityLevel.proteinCoefficient : 1.0;
    
    // 计算蛋白质需求
    const proteinValue = Math.round(profileData.weight * proteinCoefficient);
    setProtein(proteinValue);
    // 脂肪(25% TDEE, 9千卡/克)
    const fatValue = Math.round(adjustedTdee * 0.25 / 9);
    setFat(fatValue);
    
    // 计算碳水化合物需求 (TDEE - (蛋白质*4 + 脂肪*9)) / 4
    const proteinCalories = proteinValue * 4;
    const fatCalories = fatValue * 9;
    const carbsValue = Math.round((adjustedTdee - proteinCalories - fatCalories) / 4);
    setCarbs(carbsValue);
    
    // 如果有回调函数，将营养数据传递给父组件
    if (onNutritionDataUpdate) {
      onNutritionDataUpdate({
        protein: proteinValue,
        carbs: carbsValue,
        fat: fatValue,
        tdee: adjustedTdee
      });
    }
  };
  
  // 处理用户数据更新
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      console.log('提交的用户数据:', values);
      const response = await axios.put(
        `/api/users/profile/${user.id}`,
        { profile: values },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log('API响应数据:', response.data);
      
      // 获取响应中的用户资料数据
      const profileData = response.data.profile;
      
      // 更新用户数据状态
      setUserData(profileData);
      
      // 使用updateHealthMetrics函数更新所有健康指标
      updateHealthMetrics(profileData);
      
      // 设置成功消息
      setSuccess('用户数据更新成功！');
      
      // 3秒后清除成功消息
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || '更新用户数据失败，请重试');
      } else {
        setError('更新用户数据失败，请检查网络连接');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography>加载中...</Typography>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 56, height: 56 }}>
              <FitnessCenterIcon fontSize="large" />
            </Avatar>
            <Typography component="h1" variant="h4">
              身体数据
            </Typography>
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
              birthDate: userData?.birthDate ? new Date(userData.birthDate) : new Date('1990-01-01'),
              gender: userData?.gender || '',
              height: userData?.height || '',
              weight: userData?.weight || '',
              bodyFat: userData?.bodyFat || '',
              activityLevel: userData?.activityLevel || 'moderate',
              calorieDeficit: userData?.calorieDeficit || ''
            }}
            validationSchema={UserDataSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, errors, touched, values, setFieldValue }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN}>
                      <DatePicker
                        label="出生日期"
                        value={values.birthDate}
                        onChange={(newValue) => {
                          setFieldValue('birthDate', newValue);
                        }}
                        format="yyyy-MM-dd"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: touched.birthDate && Boolean(errors.birthDate),
                            helperText: touched.birthDate && errors.birthDate
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Field name="gender">
                      {({ field }) => (
                        <TextField
                          {...field}
                          select
                          fullWidth
                          id="gender"
                          label="性别"
                          error={touched.gender && Boolean(errors.gender)}
                          helperText={touched.gender && errors.gender}
                        >
                          <MenuItem value="male">男</MenuItem>
                          <MenuItem value="female">女</MenuItem>
                        </TextField>
                      )}
                    </Field>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Field name="height">
                      {({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          id="height"
                          label="身高 (厘米)"
                          type="number"
                          error={touched.height && Boolean(errors.height)}
                          helperText={touched.height && errors.height}
                        />
                      )}
                    </Field>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Field name="weight">
                      {({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          id="weight"
                          label="体重 (公斤)"
                          type="number"
                          error={touched.weight && Boolean(errors.weight)}
                          helperText={touched.weight && errors.weight}
                        />
                      )}
                    </Field>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Field name="bodyFat">
                      {({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          id="bodyFat"
                          label="体脂率 (%)"
                          type="number"
                          error={touched.bodyFat && Boolean(errors.bodyFat)}
                          helperText={touched.bodyFat && errors.bodyFat}
                        />
                      )}
                    </Field>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Field name="calorieDeficit">
                      {({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          id="calorieDeficit"
                          label="热量缺口 (千卡)"
                          type="number"
                          error={touched.calorieDeficit && Boolean(errors.calorieDeficit)}
                          helperText={touched.calorieDeficit && errors.calorieDeficit}
                        />
                      )}
                    </Field>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Field name="activityLevel">
                      {({ field }) => (
                        <TextField
                          {...field}
                          select
                          fullWidth
                          id="activityLevel"
                          label="活动水平"
                          error={touched.activityLevel && Boolean(errors.activityLevel)}
                          helperText={touched.activityLevel && errors.activityLevel}
                        >
                          {activityLevels.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    </Field>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting}
                        sx={{ minWidth: 120 }}
                      >
                        {isSubmitting ? '保存中...' : '保存数据'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
          
          {userData && (
            <>
              <Divider sx={{ my: 4 }} />
              
              <Typography variant="h5" gutterBottom align="center">
                健康指标
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 2 }}>
  {/* BMI单独一行 */}
  <Grid item xs={12}>
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom align="center">
          体质指数 (BMI)
        </Typography>
        <Typography variant="h4" align="center" sx={{ color: bmiCategory.color }}>
          {bmi}
        </Typography>
        <Typography variant="body1" align="center" sx={{ color: bmiCategory.color, fontWeight: 'bold', mt: 1 }}>
          {bmiCategory.category}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          BMI = 体重(kg) / 身高(m)²
        </Typography>
      </CardContent>
    </Card>
  </Grid>

  {/* 能量指标分组 */}
  <Grid item xs={12}>
    <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
      能量指标
    </Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom align="center">
              基础代谢率 (BMR)
            </Typography>
            <Typography variant="h4" align="center" color="primary">
              {bmr} 千卡/天
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              身体在完全静息状态下维持基本生命活动所需的能量
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom align="center">
              每日总能量消耗 (TDEE)
            </Typography>
            <Typography variant="h4" align="center" color="secondary">
              {tdee} 千卡/天
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              考虑活动水平后的每日总能量消耗
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom align="center">
              热量缺口
            </Typography>
            <Typography variant="h4" align="center" color="primary">
              {userData?.calorieDeficit || 0} 千卡/天
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              每日建议减少的热量摄入
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Grid>

  {/* 营养素分组 */}
  <Grid item xs={12}>
    <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
      营养素摄入
    </Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom align="center">
              蛋白质
            </Typography>
            <Typography variant="h4" align="center" color="primary">
              {protein}克
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              基于TDEE计算
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom align="center">
              碳水化合物
            </Typography>
            <Typography variant="h4" align="center" color="secondary">
              {carbs}克
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              基于TDEE计算
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom align="center">
              脂肪
            </Typography>
            <Typography variant="h4" align="center" sx={{ color: '#ed6c02' }}>
              {fat}克
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              基于TDEE计算
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Grid>
</Grid>
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  个人信息摘要
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      年龄
                    </Typography>
                    <Typography variant="body1">
                      {age} 岁
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      性别
                    </Typography>
                    <Typography variant="body1">
                      {userData.gender === 'male' ? '男' : '女'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      身高
                    </Typography>
                    <Typography variant="body1">
                      {userData.height} 厘米
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      体重
                    </Typography>
                    <Typography variant="body1">
                      {userData.weight} 公斤
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default UserData;