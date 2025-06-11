import React from 'react';
import { Grid } from '@mui/material';
import NutrientCard from '@/components/nutrition/NutrientCard';

/**
 * 营养素卡片组组件
 * @param {Object} props - 组件属性
 * @param {Object} props.totalNutrition - 总营养数据
 * @param {Object} props.user - 用户数据
 */
const NutrientCardsGroup = ({ totalNutrition, user }) => {
  return (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      {/* 蛋白质 */}
      <Grid item xs={12} md={3}>
        <NutrientCard 
          title="蛋白质" 
          value={totalNutrition.protein} 
          targetValue={user?.protein} 
        />
      </Grid>
      
      {/* 碳水化合物 */}
      <Grid item xs={12} md={3}>
        <NutrientCard 
          title="碳水化合物" 
          value={totalNutrition.carbs} 
          targetValue={user?.carbs} 
        />
      </Grid>
      
      {/* 脂肪 */}
      <Grid item xs={12} md={3}>
        <NutrientCard 
          title="脂肪" 
          value={totalNutrition.fat} 
          targetValue={user?.fat} 
        />
      </Grid>
      
      {/* 膳食纤维 */}
      <Grid item xs={12} md={3}>
        <NutrientCard 
          title="膳食纤维" 
          value={totalNutrition.fiber || 0} 
          targetValue={user?.fiber || 25} 
        />
      </Grid>
    </Grid>
  );
};

export default NutrientCardsGroup;