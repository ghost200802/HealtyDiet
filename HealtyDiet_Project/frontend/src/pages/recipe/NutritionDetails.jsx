import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
} from '@mui/material';
import HorizontalBarChart from '../../components/charts/HorizontalBarChart';
import { prepareNutritionData } from './RecipeUtils';

/**
 * 食谱营养详情组件，显示各营养素的分布图表
 */
const NutritionDetails = ({ recipeItems, totalNutrition }) => {
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        营养详情
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="热量分布" />
            <CardContent>
              <HorizontalBarChart 
                data={prepareNutritionData(recipeItems, totalNutrition, 'calories')} 
                unit="千卡" 
                type="calories" 
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="蛋白质分布" />
            <CardContent>
              <HorizontalBarChart 
                data={prepareNutritionData(recipeItems, totalNutrition, 'protein')} 
                unit="g" 
                type="protein" 
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="碳水化合物分布" />
            <CardContent>
              <HorizontalBarChart 
                data={prepareNutritionData(recipeItems, totalNutrition, 'carbs')} 
                unit="g" 
                type="carbs" 
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="脂肪分布" />
            <CardContent>
              <HorizontalBarChart 
                data={prepareNutritionData(recipeItems, totalNutrition, 'fat')} 
                unit="g" 
                type="fat" 
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default NutritionDetails;