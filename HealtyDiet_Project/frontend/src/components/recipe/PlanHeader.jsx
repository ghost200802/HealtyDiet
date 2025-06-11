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
  onGenerateShoppingList
}) => {
  return (
    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          食谱规划
        </Typography>
        <TextField
          fullWidth
          label="规划名称"
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
        />
      </Box>
      <Box>
        <Button
          variant="outlined"
          startIcon={<CloudDownloadIcon />}
          onClick={onLoad}
          sx={{ mr: 2 }}
        >
          加载规划
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<AutoFixHighIcon />}
          onClick={onAutoGenerate}
          sx={{ mr: 2 }}
        >
          自动生成
        </Button>
        <Button
          variant="outlined"
          color="success"
          startIcon={<ShoppingCartIcon />}
          onClick={onGenerateShoppingList}
          sx={{ mr: 2 }}
        >
          购物清单
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={onSave}
        >
          保存规划
        </Button>
      </Box>
    </Box>
  );
};

export default PlanHeader;