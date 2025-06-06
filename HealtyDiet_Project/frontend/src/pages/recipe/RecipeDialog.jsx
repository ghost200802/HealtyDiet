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
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

/**
 * 食谱选择对话框组件
 */
const RecipeDialog = ({ 
  open, 
  onClose, 
  recipes, 
  onLoadRecipe, 
  onDeleteRecipe 
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>选择食谱</DialogTitle>
      <DialogContent>
        {recipes.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            没有保存的食谱
          </Typography>
        ) : (
          <List>
            {recipes.map(recipe => (
              <ListItem 
                key={recipe.id} 
                button 
                onClick={() => onLoadRecipe(recipe)}
                divider
              >
                <ListItemText
                  primary={recipe.name}
                  secondary={
                    <>
                      <Typography variant="body2" component="span">
                        热量: {recipe.nutrition?.calories || 0} 千卡 | 蛋白质: {recipe.nutrition?.protein || 0}g | 碳水: {recipe.nutrition?.carbs || 0}g | 脂肪: {recipe.nutrition?.fat || 0}g
                      </Typography>
                      {recipe.mainIngredients && recipe.mainIngredients.length > 0 && (
                        <Typography variant="body2" component="span" sx={{ display: 'block', mt: 1 }}>
                          主要食材: {recipe.mainIngredients.map(ing => ing.foodName).join('、')}
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
                    onDeleteRecipe(recipe.id);
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
        <Button onClick={onClose}>取消</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecipeDialog;