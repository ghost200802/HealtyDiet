import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
} from '@mui/material';
import {
  Save as SaveIcon,
  CloudDownload as CloudDownloadIcon,
  AutoFixHigh as AutoFixHighIcon,
  ShoppingCart as ShoppingCartIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

/**
 * 食谱规划页面的标题和操作按钮组件
 */
const PlanHeader = ({ 
  planName, 
  setPlanName, 
  onSave, 
  onLoad, 
  onAutoGenerate,
  onGenerateShoppingList,
  onClearPlan
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
          食谱规划
        </Typography>
        <TextField
          fullWidth
          label="规划名称"
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
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
                boxShadow: '0 4px 8px rgba(2,136,209,0.1)'
              }
            }}
          >
            加载规划
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
                boxShadow: '0 4px 8px rgba(25,118,210,0.1)'
              }
            }}
          >
            保存规划
          </Button>
          {onClearPlan && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={onClearPlan}
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
              清除规划
            </Button>
          )}
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
      </Box>
    </Box>
  );
};

export default PlanHeader;