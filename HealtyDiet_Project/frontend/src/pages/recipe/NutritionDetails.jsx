import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CircularProgress,
} from '@mui/material';
import HorizontalBarChart from '../../components/charts/HorizontalBarChart';
import { prepareNutritionData } from '../../services/NutritionService';

/**
 * 食谱营养详情组件，显示各营养素的分布图表
 */
const NutritionDetails = ({ recipeItems, totalNutrition }) => {
  // 为每种营养素创建状态
  const [caloriesData, setCaloriesData] = useState([]);
  const [proteinData, setProteinData] = useState([]);
  const [carbsData, setCarbsData] = useState([]);
  const [fatData, setFatData] = useState([]);
  const [fiberData, setFiberData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 加载所有营养素数据
  useEffect(() => {
    const loadNutritionData = async () => {
      setLoading(true);
      try {
        // 并行加载所有营养素数据
        const [calories, protein, carbs, fat, fiber] = await Promise.all([
          prepareNutritionData(recipeItems, totalNutrition, 'calories'),
          prepareNutritionData(recipeItems, totalNutrition, 'protein'),
          prepareNutritionData(recipeItems, totalNutrition, 'carbs'),
          prepareNutritionData(recipeItems, totalNutrition, 'fat'),
          prepareNutritionData(recipeItems, totalNutrition, 'fiber')
        ]);

        setCaloriesData(calories);
        setProteinData(protein);
        setCarbsData(carbs);
        setFatData(fat);
        setFiberData(fiber);
      } catch (error) {
        console.error('加载营养素数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNutritionData();
  }, [recipeItems, totalNutrition]);

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
          <Card>
            <CardHeader title="热量分布" />
            <CardContent>
              <HorizontalBarChart 
                data={caloriesData} 
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
                data={proteinData} 
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
                data={carbsData} 
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
                data={fatData} 
                unit="g" 
                type="fat" 
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="纤维素分布" />
            <CardContent>
              <HorizontalBarChart 
                data={fiberData} 
                unit="g" 
                type="fiber" 
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default NutritionDetails;