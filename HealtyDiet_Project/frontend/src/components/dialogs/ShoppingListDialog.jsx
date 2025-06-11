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
  Divider,
  Box,
  IconButton,
} from '@mui/material';
import { ContentCopy as ContentCopyIcon } from '@mui/icons-material';

/**
 * 购物清单对话框组件
 * 显示食谱中的食材清单，方便用户购买食材
 */
const ShoppingListDialog = ({ 
  open, 
  onClose, 
  items, // 食谱项目，格式为[{foodId, amount, foodName}]
}) => {
  // 复制购物清单到剪贴板
  const handleCopyToClipboard = () => {
    if (!items || items.length === 0) return;
    
    const listText = items.map(item => `${item.foodName}: ${item.amount}克`).join('\n');
    navigator.clipboard.writeText(listText)
      .then(() => {
        alert('购物清单已复制到剪贴板');
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">购物清单</Typography>
          <IconButton onClick={handleCopyToClipboard} title="复制到剪贴板">
            <ContentCopyIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {!items || items.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            没有食材
          </Typography>
        ) : (
          <List>
            {items.map((item, index) => (
              <React.Fragment key={`${item.foodId}-${index}`}>
                <ListItem>
                  <ListItemText
                    primary={item.foodName}
                    secondary={`${item.amount}克`}
                  />
                </ListItem>
                {index < items.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          关闭
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShoppingListDialog;