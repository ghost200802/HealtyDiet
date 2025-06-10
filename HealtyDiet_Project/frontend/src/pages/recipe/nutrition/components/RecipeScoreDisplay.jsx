import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';

/**
 * 食谱评分展示组件
 * @param {Object} props - 组件属性
 * @param {number} props.recipeScore - 食谱评分
 * @param {Object} props.scoreSuggestions - 评分建议
 */
const RecipeScoreDisplay = ({ recipeScore, scoreSuggestions }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography variant="h6" color="primary" gutterBottom>
          食谱评分
        </Typography>
        {recipeScore !== null ? (
          <Box>
            <Typography variant="h3" color={recipeScore > 70 ? 'success.main' : recipeScore > 50 ? 'warning.main' : 'error.main'}>
              {Math.round(recipeScore)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {recipeScore > 70 ? '优秀' : recipeScore > 50 ? '良好' : '需要改进'}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {recipeScore > 70 ? '这份食谱非常符合您的营养需求！' : 
               recipeScore > 50 ? '这份食谱基本符合您的营养需求，可以适当调整。' : 
               '这份食谱与您的营养需求有较大差距，建议调整食物种类和数量。'}
            </Typography>
            
            {/* 营养建议 */}
            {scoreSuggestions && (
              <Box sx={{ mt: 2, textAlign: 'left' }}>
                {/* 使用卡片式布局显示建议 */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 0.5,
                  pr: 1
                }}>
                  {/* 热量建议 */}
                  <SuggestionItem suggestion={scoreSuggestions.calories} />
                  
                  {/* 蛋白质建议 */}
                  <SuggestionItem suggestion={scoreSuggestions.protein} />
                  
                  {/* 碳水化合物建议 */}
                  <SuggestionItem suggestion={scoreSuggestions.carbs} />
                  
                  {/* 脂肪建议 */}
                  <SuggestionItem suggestion={scoreSuggestions.fat} />
                  
                  {/* 膳食纤维建议 */}
                  <SuggestionItem suggestion={scoreSuggestions.fiber} />
                </Box>
              </Box>
            )}
          </Box>
        ) : (
          <Typography variant="body1">无法计算评分，请确保已添加食物并设置用户数据</Typography>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * 建议项组件
 * @param {Object} props - 组件属性
 * @param {Object} props.suggestion - 建议对象，包含text和color属性
 */
const SuggestionItem = ({ suggestion }) => {
  if (!suggestion) return null;
  
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      p: 0.75, 
      borderRadius: 1,
      bgcolor: `${suggestion.color}.light`,
      opacity: 0.9
    }}>
      <Box 
        component="span" 
        sx={{ 
          width: 8, 
          height: 8, 
          borderRadius: '50%', 
          bgcolor: suggestion.color,
          mr: 1,
          flexShrink: 0
        }} 
      />
      <Typography 
        variant="body2" 
        color={suggestion.color}
        sx={{ 
          fontSize: '0.8rem',
          lineHeight: 1.3,
          wordBreak: 'break-word'
        }}
      >
        {suggestion.text}
      </Typography>
    </Box>
  );
};

export default RecipeScoreDisplay;