import React from 'react';
import {
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import ClassicPieChart from '@/components/charts/ClassicPieChart';
import { calculateEnergyDistribution } from '@/services/NutritionService';

/**
 * 营养素能量占比组件
 * @param {Object} props - 组件属性
 * @param {Object} props.totalNutrition - 总营养数据
 */
const EnergyDistribution = ({ totalNutrition }) => {
  // 计算能量分布数据
  const calculateEnergyData = () => {
    return calculateEnergyDistribution(totalNutrition);
  };

  const energyData = calculateEnergyData();
  
  return (
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
  );
};

export default EnergyDistribution;