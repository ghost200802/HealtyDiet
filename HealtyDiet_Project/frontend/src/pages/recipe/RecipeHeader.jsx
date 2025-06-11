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
} from '@mui/icons-material';

/**
 * 食谱页面的标题和操作按钮组件
 */
const RecipeHeader = ({ 
  recipeName, 
  setRecipeName, 
  onSave, 
  onLoad, 
  onAdd,
  onAutoGenerate,
  onAutoOptimize,
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
          label="食谱名称"
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
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
          载入
        </Button>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAdd}
          sx={{ mr: 2 }}
        >
          添加
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
          color="info"
          startIcon={<TuneIcon />}
          onClick={onAutoOptimize}
          sx={{ mr: 2 }}
        >
          自动优化
        </Button>
        <Button
          variant="outlined"
          color="success"
          startIcon={<ShoppingCartIcon />}
          onClick={onGenerateShoppingList}
          sx={{ mr: 2 }}
        >
          生成清单
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={onSave}
        >
          保存
        </Button>
      </Box>
    </Box>
  );
};

export default RecipeHeader;