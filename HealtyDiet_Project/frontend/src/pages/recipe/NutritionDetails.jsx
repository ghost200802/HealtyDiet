import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  CircularProgress,
} from '@mui/material';

// 导入自定义Hook
import useNutritionDetails from '../../hooks/nutrition/useNutritionDetails';

// 导入组件
import NutritionDetailsCard from '../../components/nutrition/NutritionDetailsCard';

/**
 * 食谱营养详情组件，显示各营养素的分布图表
 * @param {Object} props - 组件属性
 * @param {Array} props.recipeItems - 食谱中的食物项目
 * @param {Object} props.totalNutrition - 食谱的总营养成分
 */
const NutritionDetails = ({ recipeItems, totalNutrition }) => {
  // 使用自定义Hook加载营养素数据
  const {
    caloriesData,
    proteinData,
    carbsData,
    fatData,
    fiberData,
    loading
  } = useNutritionDetails(recipeItems, totalNutrition);

  // 加载中显示加载指示器
  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          正在加载营养数据...
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        营养详情
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <NutritionDetailsCard 
            title="热量分布" 
            data={caloriesData} 
            unit="千卡" 
            type="calories" 
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <NutritionDetailsCard 
            title="蛋白质分布" 
            data={proteinData} 
            unit="g" 
            type="protein" 
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <NutritionDetailsCard 
            title="碳水化合物分布" 
            data={carbsData} 
            unit="g" 
            type="carbs" 
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <NutritionDetailsCard 
            title="脂肪分布" 
            data={fatData} 
            unit="g" 
            type="fat" 
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <NutritionDetailsCard 
            title="纤维素分布" 
            data={fiberData} 
            unit="g" 
            type="fiber" 
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default NutritionDetails;