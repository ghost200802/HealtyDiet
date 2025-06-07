import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  CircularProgress,
} from '@mui/material';
import ClassicPieChart from '../../components/charts/ClassicPieChart';
import { calculateEnergyDistribution } from '../../services/NutritionService';
import { calculateRecipeScoreWithUserData } from '../../services/RecipeScoreService';
import dailyNeeds from '../../../../data/needs/DailyNeeds.json';

/**
 * 食谱营养总览组件
 */
const NutritionOverview = ({ totalNutrition, user, recipeItems }) => {
  // 获取能量数据
  const calculateEnergyData = () => {
    return calculateEnergyDistribution(totalNutrition);
  };

  const energyData = calculateEnergyData();

  // 使用useState存储食谱评分
  const [recipeScore, setRecipeScore] = useState(0);

  // 使用useEffect处理异步评分计算
  useEffect(() => {
    const getScore = async () => {
      if (!recipeItems || recipeItems.length === 0 || !user) {
        console.log('无法计算评分：recipeItems或user不存在', { recipeItems, user });
        setRecipeScore(0);
        return;
      }
      
      console.log('计算评分的输入参数：', { recipeItems, user, dailyNeeds });
      
      try {
        // 调用RecipeScoreService中的评分函数
        const score = await calculateRecipeScoreWithUserData(recipeItems, user, dailyNeeds);
        console.log('计算得到的评分：', score);
        setRecipeScore(score);
      } catch (error) {
        console.error('计算评分时出错：', error);
        setRecipeScore(0);
      }
    };
    
    getScore();
  }, [recipeItems, user]);

  // 获取热量状态评价
  const getCaloriesStatus = () => {
    if (!user || !user.dci) return { text: '未设置推荐摄入量', color: 'text.secondary' };
    
    const percentage = totalNutrition.calories / user.dci * 100;
    
    if (percentage > 110) return { text: '热量偏高', color: 'error.main' };
    if (percentage < 90) return { text: '热量偏低', color: 'warning.main' };
    return { text: '热量适中', color: 'success.main' };
  };

  const caloriesStatus = getCaloriesStatus();
  const caloriesPercentage = user && user.dci ? Math.round(totalNutrition.calories / user.dci * 100) : 0;

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        营养总览
      </Typography>
      
      {/* 第一排：总热量、营养素能量占比、食谱评分 */}
      <Grid container spacing={3}>
        {/* 总热量 */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', position: 'relative', p: 3 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                总热量
              </Typography>
              
              <Box sx={{ position: 'relative', display: 'inline-flex', my: 2 }}>
                <CircularProgress 
                  variant="determinate" 
                  value={100} 
                  size={140} 
                  thickness={4}
                  sx={{ 
                    color: 'grey.200',
                  }}
                />
                <CircularProgress 
                  variant="determinate" 
                  value={caloriesPercentage > 100 ? 100 : caloriesPercentage} 
                  size={140} 
                  thickness={4}
                  sx={{ 
                    color: caloriesPercentage > 110 ? 'error.main' : 
                           caloriesPercentage < 90 ? 'warning.main' : 'success.main',
                    position: 'absolute',
                    left: 0,
                  }}
                />
                {caloriesPercentage > 100 && (
                  <CircularProgress 
                    variant="determinate" 
                    value={100} 
                    size={140} 
                    thickness={4}
                    sx={{ 
                      color: 'error.light',
                      position: 'absolute',
                      left: 0,
                      opacity: 0.3
                    }}
                  />
                )}
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}
                >
                  <Typography 
                    variant="h4" 
                    component="div" 
                    color="text.primary"
                    sx={{ 
                      fontWeight: 'bold',
                      lineHeight: 1.1
                    }}
                  >
                    {totalNutrition.calories}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    千卡
                  </Typography>
                </Box>
              </Box>
              
              <Typography 
                variant="h6" 
                color={caloriesStatus.color}
                sx={{ mt: 1, fontWeight: 'medium' }}
              >
                {caloriesStatus.text}
              </Typography>
              
              {user && user.dci && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    推荐摄入: {user.dci} 千卡 ({caloriesPercentage}%)
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* 营养素能量占比 */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                营养素能量占比
              </Typography>
              <ClassicPieChart 
                data={energyData} 
                unit="千卡" 
                type="calories" 
                donut={true} 
              />
            </CardContent>
          </Card>
        </Grid>
        
        {/* 食谱评分 */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                食谱评分
              </Typography>
              {recipeScore !== null ? (
                <Box>
                  <Typography variant="h3" color={recipeScore > 70 ? 'success.main' : recipeScore > 50 ? 'warning.main' : 'error.main'}>
                    {Math.round(recipeScore)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {recipeScore > 70 ? '优秀' : recipeScore > 50 ? '良好' : '需要改进'}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {recipeScore > 70 ? '这份食谱非常符合您的营养需求！' : 
                     recipeScore > 50 ? '这份食谱基本符合您的营养需求，可以适当调整。' : 
                     '这份食谱与您的营养需求有较大差距，建议调整食物种类和数量。'}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body1">无法计算评分，请确保已添加食物并设置用户数据</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* 第二排：三大营养素和膳食纤维 */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* 蛋白质 */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="primary">
                蛋白质
              </Typography>
              <Typography variant="h4">
                {totalNutrition.protein} 克
              </Typography>
              {user && user.protein && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    推荐摄入: {user.protein} 克
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color={totalNutrition.protein > user.protein * 1.2 ? 'warning.main' : 
                           totalNutrition.protein < user.protein * 0.8 ? 'error.main' : 'success.main'}
                    sx={{ fontWeight: 'bold' }}
                  >
                    {Math.round(totalNutrition.protein / user.protein * 100)}%
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* 碳水化合物 */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="primary">
                碳水化合物
              </Typography>
              <Typography variant="h4">
                {totalNutrition.carbs} 克
              </Typography>
              {user && user.carbs && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    推荐摄入: {user.carbs} 克
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color={totalNutrition.carbs > user.carbs * 1.2 ? 'warning.main' : 
                           totalNutrition.carbs < user.carbs * 0.8 ? 'error.main' : 'success.main'}
                    sx={{ fontWeight: 'bold' }}
                  >
                    {Math.round(totalNutrition.carbs / user.carbs * 100)}%
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* 脂肪 */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="primary">
                脂肪
              </Typography>
              <Typography variant="h4">
                {totalNutrition.fat} 克
              </Typography>
              {user && user.fat && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    推荐摄入: {user.fat} 克
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color={totalNutrition.fat > user.fat * 1.2 ? 'warning.main' : 
                           totalNutrition.fat < user.fat * 0.8 ? 'error.main' : 'success.main'}
                    sx={{ fontWeight: 'bold' }}
                  >
                    {Math.round(totalNutrition.fat / user.fat * 100)}%
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* 膳食纤维 */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="primary">
                膳食纤维
              </Typography>
              <Typography variant="h4">
                {totalNutrition.fiber || 0} 克
              </Typography>
              {user && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    推荐摄入: {user.fiber || 25} 克
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color={(totalNutrition.fiber || 0) > (user.fiber || 25) * 1.2 ? 'warning.main' : 
                           (totalNutrition.fiber || 0) < (user.fiber || 25) * 0.8 ? 'error.main' : 'success.main'}
                    sx={{ fontWeight: 'bold' }}
                  >
                    {Math.round((totalNutrition.fiber || 0) / (user.fiber || 25) * 100)}%
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default NutritionOverview;