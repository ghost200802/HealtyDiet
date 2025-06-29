import React from 'react';
import {
  Paper,
  Typography,
  Grid,
} from '@mui/material';

// 导入子组件
import CaloriesDisplay from '@/components/nutrition/CaloriesDisplay';
import EnergyDistribution from '@/components/nutrition/EnergyDistribution';
import DietScoreDisplay from '@/components/nutrition/DietScoreDisplay';
import NutrientCardsGroup from '@/components/nutrition/NutrientCardsGroup';

// 导入钩子
import useDietScore from '@/hooks/nutrition/useDietScore';

/**
 * 食谱营养总览组件
 * @param {Object} props - 组件属性
 * @param {Object} props.totalNutrition - 总营养数据
 * @param {Object} props.user - 用户数据
 * @param {Array} props.dietItems - 食谱项目数组
 */
const NutritionOverview = ({ totalNutrition, user, dietItems }) => {
  // 使用钩子计算食谱评分
  const { dietScore, scoreSuggestions } = useDietScore(dietItems, user);

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        营养总览
      </Typography>
      
      {/* 第一排：总热量、营养素能量占比、食谱评分 */}
      <Grid container spacing={3}>
        {/* 总热量 */}
        <Grid item xs={12} md={4}>
          <CaloriesDisplay totalNutrition={totalNutrition} user={user} />
        </Grid>
        
        {/* 营养素能量占比 */}
        <Grid item xs={12} md={4}>
          <EnergyDistribution totalNutrition={totalNutrition} />
        </Grid>
        
        {/* 食谱评分 */}
        <Grid item xs={12} md={4}>
          <DietScoreDisplay dietScore={dietScore} scoreSuggestions={scoreSuggestions} />
        </Grid>
      </Grid>
      
      {/* 第二排：三大营养素和膳食纤维 */}
      <NutrientCardsGroup totalNutrition={totalNutrition} user={user} />
    </Paper>
  );
};

export default NutritionOverview;