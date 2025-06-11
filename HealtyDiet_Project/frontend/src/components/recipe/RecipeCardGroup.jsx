import React from 'react';
import {
  Grid,
  Typography,
  Paper,
} from '@mui/material';

// 导入拆分后的组件
import RecipeCard from './RecipeCard';
import AddRecipeCard from './AddRecipeCard';

// 星期几的中文名称
const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];



/**
 * 食谱卡片组组件，显示一周的食谱规划
 */
const RecipeCardGroup = ({ recipes = [], onAddRecipe, onRemoveRecipe }) => {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        一周食谱安排
      </Typography>
      
      <Grid container spacing={3}>
        {/* 已添加的食谱卡片 */}
        {recipes.map((recipe, index) => (
          <Grid item xs={12} sm={6} md={4} key={`recipe-${index}`}>
            <RecipeCard 
              recipe={recipe} 
              weekday={WEEKDAYS[index % 7]}
              onRemove={() => onRemoveRecipe(index)}
            />
          </Grid>
        ))}
        
        {/* 添加食谱卡片（如果食谱数量少于7个） */}
        {recipes.length < 7 && (
          <Grid item xs={12} sm={6} md={4}>
            <AddRecipeCard onClick={onAddRecipe} />
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default RecipeCardGroup;