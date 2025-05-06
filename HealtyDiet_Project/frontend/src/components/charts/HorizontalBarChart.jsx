import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

export default function HorizontalBarChart({ data, unit, type }) {
  // 根据营养素类型设置不同的颜色
  const getBarColor = (index, type) => {
    // 预设的颜色方案
    const colors = {
      calories: ['#ff5722', '#ff7043', '#ff8a65', '#ffab91', '#ffccbc'],
      protein: ['#2196f3', '#42a5f5', '#64b5f6', '#90caf9', '#bbdefb'],
      carbs: ['#ff9800', '#ffa726', '#ffb74d', '#ffcc80', '#ffe0b2'],
      fat: ['#f44336', '#ef5350', '#e57373', '#ef9a9a', '#ffcdd2']
    };
    
    // 根据类型选择颜色数组，默认使用绿色系
    const colorArray = colors[type] || ['#4caf50', '#66bb6a', '#81c784', '#a5d6a7', '#c8e6c9'];
    
    // 根据索引选择颜色，循环使用颜色数组
    return colorArray[index % colorArray.length];
  };

  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      {data.map((item, index) => (
        <Box key={index} sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: '60%' }}>
              {item.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {Math.round(item.percent)}% ({item.value.toFixed(1)}{unit})
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={item.percent} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                backgroundColor: getBarColor(index, type)
              }
            }} 
          />
        </Box>
      ))}
    </Box>
  );
}