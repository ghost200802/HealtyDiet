import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';

/**
 * 营养素卡片组件
 * @param {Object} props - 组件属性
 * @param {string} props.title - 卡片标题（营养素名称）
 * @param {number} props.value - 营养素值
 * @param {string} props.unit - 单位（如"克"）
 * @param {number} props.targetValue - 目标值
 * @param {number} props.highThreshold - 高阈值（默认为1.2）
 * @param {number} props.lowThreshold - 低阈值（默认为0.8）
 */
const NutrientCard = ({ 
  title, 
  value, 
  unit = '克', 
  targetValue, 
  highThreshold = 1.2, 
  lowThreshold = 0.8 
}) => {
  // 计算百分比
  const percentage = targetValue ? Math.round(value / targetValue * 100) : 0;
  
  // 确定颜色
  const getColor = () => {
    if (!targetValue) return 'text.secondary';
    if (value > targetValue * highThreshold) return 'warning.main';
    if (value < targetValue * lowThreshold) return 'error.main';
    return 'success.main';
  };
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" color="primary">
          {title}
        </Typography>
        <Typography variant="h4">
          {value} {unit}
        </Typography>
        {targetValue && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              推荐摄入: {targetValue} {unit}
            </Typography>
            <Typography 
              variant="body2" 
              color={getColor()}
              sx={{ fontWeight: 'bold' }}
            >
              {percentage}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default NutrientCard;