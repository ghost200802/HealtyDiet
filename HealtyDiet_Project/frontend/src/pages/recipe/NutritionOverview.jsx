import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
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

  // 计算食谱评分
  const calculateScore = () => {
    return 0;
  };

  const recipeScore = calculateScore();

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        营养总览
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="primary">
                总热量
              </Typography>
              <Typography variant="h4">
                {totalNutrition.calories} 千卡
              </Typography>
              {user && user.dci && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    推荐摄入: {user.dci} 千卡
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color={totalNutrition.calories > user.dci * 1.1 ? 'error.main' : 
                           totalNutrition.calories < user.dci * 0.9 ? 'warning.main' : 'success.main'}
                    sx={{ fontWeight: 'bold' }}
                  >
                    {Math.round(totalNutrition.calories / user.dci * 100)}%
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
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
      </Grid>
      
      {/* 食谱评分卡片 */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
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
        
        <Grid item xs={12} md={6}>
          <Card>
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
      </Grid>
    </Paper>
  );
};

export default NutritionOverview;