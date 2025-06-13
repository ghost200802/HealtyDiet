import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  CloudDownload as CloudDownloadIcon,
  AutoFixHigh as AutoFixHighIcon,
  Tune as TuneIcon,
  ShoppingCart as ShoppingCartIcon,
  Delete as DeleteIcon,
  Restaurant as RestaurantIcon,
} from '@mui/icons-material';

/**
 * 食谱页面的标题和操作按钮组件
 */
const DietHeader = ({ 
  dietName, 
  setDietName, 
  onSave, 
  onLoad, 
  onAdd,
  onAddDish,
  onAutoGenerate,
  onAutoOptimize,
  onGenerateShoppingList,
  onClearDiet
}) => {
  return (
    <Box sx={{ 
      mb: 4, 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' },
      justifyContent: 'space-between', 
      alignItems: { xs: 'stretch', md: 'center' },
      gap: 3,
      p: 2,
      borderRadius: 2,
      bgcolor: 'background.paper',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      <Box sx={{ minWidth: { xs: '100%', md: '30%' } }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            color: 'primary.main',
            mb: 2
          }}
        >
          每日食谱
        </Typography>
        <TextField
          fullWidth
          label="食谱名称"
          value={dietName}
          onChange={(e) => setDietName(e.target.value)}
          variant="outlined"
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              }
            }
          }}
        />
      </Box>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 2, 
        justifyContent: { xs: 'center', md: 'flex-end' }, 
        alignItems: 'center' 
      }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="info"
            startIcon={<CloudDownloadIcon />}
            onClick={onLoad}
            sx={{ 
              minWidth: '120px',
              borderRadius: 1.5,
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }
            }}
          >
            加载食谱
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={onSave}
            sx={{ 
              minWidth: '120px',
              borderRadius: 1.5,
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }
            }}
          >
            保存食谱
          </Button>
          {onClearDiet && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={onClearDiet}
              sx={{ 
                minWidth: '120px',
                borderRadius: 1.5,
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(220,0,0,0.1)'
                }
              }}
            >
              清除食谱
            </Button>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="success"
            startIcon={<AddIcon />}
            onClick={onAdd}
            sx={{ 
              minWidth: '120px',
              borderRadius: 1.5,
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(46,125,50,0.1)'
              }
            }}
          >
            添加食物
          </Button>
          <Button
            variant="outlined"
            color="success"
            startIcon={<RestaurantIcon />}
            onClick={onAddDish}
            sx={{ 
              minWidth: '120px',
              borderRadius: 1.5,
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(46,125,50,0.1)'
              }
            }}
          >
            添加菜肴
          </Button>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<ShoppingCartIcon />}
            onClick={onGenerateShoppingList}
            sx={{ 
              minWidth: '120px',
              borderRadius: 1.5,
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(237,108,2,0.1)'
              }
            }}
          >
            购物清单
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<AutoFixHighIcon />}
            onClick={onAutoGenerate}
            sx={{ 
              minWidth: '120px',
              borderRadius: 1.5,
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(156,39,176,0.1)'
              }
            }}
          >
            自动生成
          </Button>
          <Button
            variant="outlined"
            color="info"
            startIcon={<TuneIcon />}
            onClick={onAutoOptimize}
            sx={{ 
              minWidth: '120px',
              borderRadius: 1.5,
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(2,136,209,0.1)'
              }
            }}
          >
            自动优化
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default DietHeader;