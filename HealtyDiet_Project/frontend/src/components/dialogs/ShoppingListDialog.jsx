import React, { useMemo } from 'react';
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
  // 合并相同食材的数量
  const mergedItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    
    const foodMap = new Map();
    
    // 遍历所有食材，合并相同名称的食材数量
    items.forEach(item => {
      const existingItem = foodMap.get(item.foodName);
      if (existingItem) {
        existingItem.amount += item.amount;
      } else {
        foodMap.set(item.foodName, { ...item });
      }
    });
    
    // 转换回数组并排序
    return Array.from(foodMap.values()).sort((a, b) => 
      a.foodName.localeCompare(b.foodName)
    );
  }, [items]);

  // 复制购物清单到剪贴板
  const handleCopyToClipboard = () => {
    if (!mergedItems || mergedItems.length === 0) return;
    
    const listText = mergedItems.map(item => `${item.foodName}: ${item.amount}克`).join('\n');
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
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          width: { xs: '95%', sm: '80%', md: '60%' },
          maxWidth: '500px',
          mx: 'auto'
        }
      }}
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
        {!mergedItems || mergedItems.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            没有食材
          </Typography>
        ) : (
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {mergedItems.map((item, index) => (
              <React.Fragment key={`${item.foodId}-${index}`}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" component="span">
                          {item.foodName}
                        </Typography>
                        <Typography 
                          variant="subtitle1" 
                          component="span" 
                          color="primary.main"
                          sx={{ fontWeight: 'medium', ml: 2 }}
                        >
                          {item.amount}克
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < mergedItems.length - 1 && <Divider />}
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