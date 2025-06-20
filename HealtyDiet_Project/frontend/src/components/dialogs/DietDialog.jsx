import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  Box,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

/**
 * 食谱选择对话框组件
 */
const DietDialog = ({ 
  open, 
  onClose, 
  diets, 
  onLoadDiet, 
  onDeleteDiet,
  saveAsFile = true, // 默认为true，始终按文件保存
  onSaveAsFileChange
}) => {
  // 移除saveAsFileState状态和handleSaveAsFileChange函数，因为不再需要用户选择

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>选择食谱</DialogTitle>
      <DialogContent>
        {/* 移除保存方式选择开关 */}

        {diets.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            没有保存的食谱
          </Typography>
        ) : (
          <List>
            {diets.map(diet => (
              <ListItem 
                key={diet.id} 
                sx={{ cursor: 'pointer' }}
                onClick={() => onLoadDiet(diet)}
                divider
              >
                <ListItemText
                  primary={diet.name}
                  secondary={
                    <>
                      <Typography variant="body2" component="span">
                        热量: {diet.nutrition?.calories || 0} 千卡 | 蛋白质: {diet.nutrition?.protein || 0}g | 碳水: {diet.nutrition?.carbs || 0}g | 脂肪: {diet.nutrition?.fat || 0}g
                      </Typography>
                      {diet.mainIngredients && diet.mainIngredients.length > 0 && (
                        <Typography variant="body2" component="span" sx={{ display: 'block', mt: 1 }}>
                          主要食材: {diet.mainIngredients.map(ing => ing.foodName).join('、')}
                        </Typography>
                      )}
                    </>
                  }
                />
                <IconButton 
                  edge="end" 
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDiet(diet.id);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          取消
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DietDialog;