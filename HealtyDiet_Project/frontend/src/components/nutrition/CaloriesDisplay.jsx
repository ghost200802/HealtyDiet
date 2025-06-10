import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { getCaloriesStatus, calculateCaloriesPercentage } from '../../services/NutritionService';

/**
 * 总热量展示组件
 * @param {Object} props - 组件属性
 * @param {Object} props.totalNutrition - 总营养数据
 * @param {Object} props.user - 用户数据
 */
const CaloriesDisplay = ({ totalNutrition, user }) => {
  // 获取热量状态
  const caloriesStatus = getCaloriesStatus(totalNutrition, user);
  
  // 计算热量百分比
  const caloriesPercentage = calculateCaloriesPercentage(totalNutrition, user);
  
  return (
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
  );
};

export default CaloriesDisplay;