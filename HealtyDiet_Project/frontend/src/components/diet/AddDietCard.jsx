import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';

/**
 * 添加食谱卡片组件
 */
const AddDietCard = ({ onClick }) => {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
        cursor: 'pointer',
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <AddIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" color="text.secondary">
            添加食谱
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AddDietCard;