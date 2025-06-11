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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
} from '@mui/material';
import { 
  ContentCopy as ContentCopyIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';

/**
 * 购物清单对话框组件
 * 显示食谱中的食材清单，方便用户购买食材
 * 支持按照周一到周日分组显示食材
 */
const ShoppingListDialog = ({ 
  open, 
  onClose, 
  items, // 食谱项目，格式为[{foodId, amount, foodName}]
  groupedItems, // 按周几分组的食谱项目，格式为{周一: [{foodId, amount, foodName}], 周二: [...], ...}
}) => {
  const [viewMode, setViewMode] = React.useState('merged'); // 'merged' 或 'grouped'
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
  
  // 处理按周几分组的食材数据
  const processedGroupedItems = useMemo(() => {
    // 如果没有传入groupedItems，则根据items生成默认的分组
    if (!groupedItems) {
      if (!items || items.length === 0) return {};
      return { '全部': items };
    }
    
    // 为每个分组合并相同食材
    const result = {};
    
    Object.entries(groupedItems).forEach(([weekday, weekItems]) => {
      if (!weekItems || weekItems.length === 0) {
        result[weekday] = [];
        return;
      }
      
      const foodMap = new Map();
      
      // 遍历该周几的所有食材，合并相同名称的食材数量
      weekItems.forEach(item => {
        const existingItem = foodMap.get(item.foodName);
        if (existingItem) {
          existingItem.amount += item.amount;
        } else {
          foodMap.set(item.foodName, { ...item });
        }
      });
      
      // 转换回数组并排序
      result[weekday] = Array.from(foodMap.values()).sort((a, b) => 
        a.foodName.localeCompare(b.foodName)
      );
    });
    
    return result;
  }, [groupedItems, items]);

  // 复制购物清单到剪贴板
  const handleCopyToClipboard = () => {
    if (viewMode === 'merged') {
      if (!mergedItems || mergedItems.length === 0) return;
      
      const listText = mergedItems.map(item => `${item.foodName}: ${item.amount}克`).join('\n');
      navigator.clipboard.writeText(listText)
        .then(() => {
          alert('购物清单已复制到剪贴板');
        })
        .catch(err => {
          console.error('复制失败:', err);
        });
    } else {
      // 分组模式下的复制
      if (!processedGroupedItems || Object.keys(processedGroupedItems).length === 0) return;
      
      const groupedListText = Object.entries(processedGroupedItems)
        .map(([weekday, items]) => {
          if (!items || items.length === 0) return '';
          
          const itemsText = items.map(item => `  ${item.foodName}: ${item.amount}克`).join('\n');
          return `${weekday}:\n${itemsText}`;
        })
        .filter(text => text !== '')
        .join('\n\n');
      
      navigator.clipboard.writeText(groupedListText)
        .then(() => {
          alert('分组购物清单已复制到剪贴板');
        })
        .catch(err => {
          console.error('复制失败:', err);
        });
    }
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
      
      {/* 只有在有分组数据时才显示视图切换选项卡 */}
      {groupedItems && Object.keys(groupedItems).length > 0 && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={viewMode} 
            onChange={(e, newValue) => setViewMode(newValue)}
            variant="fullWidth"
            aria-label="shopping list view mode"
          >
            <Tab label="合并视图" value="merged" />
            <Tab label="分组视图" value="grouped" />
          </Tabs>
        </Box>
      )}
      
      <DialogContent>
        {/* 如果没有分组数据或者当前是合并视图模式，显示合并视图 */}
        {(!groupedItems || Object.keys(groupedItems).length === 0 || viewMode === 'merged') ? (
          // 合并视图
          !mergedItems || mergedItems.length === 0 ? (
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
          )
        ) : (
          // 分组视图 - 只有在有分组数据且viewMode为grouped时才显示
          <Box sx={{ mt: 2 }}>
            {Object.entries(processedGroupedItems).map(([weekday, items], groupIndex) => (
              <Accordion key={weekday} defaultExpanded={groupIndex === 0}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`${weekday}-content`}
                  id={`${weekday}-header`}
                >
                  <Typography variant="subtitle1">{weekday}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {items.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      没有食材
                    </Typography>
                  ) : (
                    <List dense disablePadding>
                      {items.map((item, index) => (
                        <React.Fragment key={`${weekday}-${item.foodId}-${index}`}>
                          <ListItem>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="body1" component="span">
                                    {item.foodName}
                                  </Typography>
                                  <Typography 
                                    variant="body1" 
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
                          {index < items.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
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