import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Box,
  Divider,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip
} from '@mui/material';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

// 注册Chart.js组件
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

/**
 * 食物详情对话框组件
 */
const FoodDetailDialog = ({ open, onClose, food }) => {
  const [tabValue, setTabValue] = useState(0);
  
  // 处理标签页切换
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 如果没有食物数据，显示加载中
  if (!food) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>关闭</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // 准备雷达图数据
  const radarData = {
    labels: ['蛋白质', '碳水化合物', '脂肪', '纤维素', '维生素', '矿物质'],
    datasets: [
      {
        label: '营养成分',
        data: [
          food.protein / 30 * 100, // 假设30g蛋白质为100%
          food.carbs / 100 * 100,   // 假设100g碳水为100%
          food.fat / 30 * 100,      // 假设30g脂肪为100%
          food.fiber / 10 * 100,    // 假设10g纤维为100%
          // 以下是估算值，实际应该根据具体维生素和矿物质含量计算
          (food.vitaminA || 0) / 800 * 100 + 
          (food.vitaminC || 0) / 80 * 100 + 
          (food.vitaminE || 0) / 12 * 100,
          (food.calcium || 0) / 800 * 100 + 
          (food.iron || 0) / 14 * 100 + 
          (food.zinc || 0) / 10 * 100
        ],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // 雷达图选项
  const radarOptions = {
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 100
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h5" component="div">
          {food.name}
          <Chip 
            label={`${food.type} - ${food.subType}`} 
            size="small" 
            color="primary" 
            sx={{ ml: 2 }}
          />
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="基本信息" />
            <Tab label="营养成分" />
            <Tab label="健康分析" />
          </Tabs>
        </Box>

        {/* 基本信息标签页 */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>主要营养素 (每100克)</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1">热量:</Typography>
                  <Typography variant="body1" fontWeight="bold">{food.calories} 千卡</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1">蛋白质:</Typography>
                  <Typography variant="body1" fontWeight="bold">{food.protein}g</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1">碳水化合物:</Typography>
                  <Typography variant="body1" fontWeight="bold">{food.carbs}g</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1">脂肪:</Typography>
                  <Typography variant="body1" fontWeight="bold">{food.fat}g</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1">纤维素:</Typography>
                  <Typography variant="body1" fontWeight="bold">{food.fiber || 0}g</Typography>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h6" gutterBottom>营养雷达图</Typography>
                <Box sx={{ height: 300 }}>
                  <Radar data={radarData} options={radarOptions} />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* 营养成分标签页 */}
        {tabValue === 1 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>营养成分</TableCell>
                  <TableCell align="right">含量 (每100克)</TableCell>
                  <TableCell align="right">每日推荐摄入量百分比</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>热量</TableCell>
                  <TableCell align="right">{food.calories} 千卡</TableCell>
                  <TableCell align="right">{(food.calories / 2000 * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>蛋白质</TableCell>
                  <TableCell align="right">{food.protein}g</TableCell>
                  <TableCell align="right">{(food.protein / 60 * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>碳水化合物</TableCell>
                  <TableCell align="right">{food.carbs}g</TableCell>
                  <TableCell align="right">{(food.carbs / 300 * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>脂肪</TableCell>
                  <TableCell align="right">{food.fat}g</TableCell>
                  <TableCell align="right">{(food.fat / 60 * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>纤维素</TableCell>
                  <TableCell align="right">{food.fiber || 0}g</TableCell>
                  <TableCell align="right">{((food.fiber || 0) / 25 * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>糖</TableCell>
                  <TableCell align="right">{food.sugar || 0}g</TableCell>
                  <TableCell align="right">{((food.sugar || 0) / 25 * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>钠</TableCell>
                  <TableCell align="right">{food.sodium || 0}mg</TableCell>
                  <TableCell align="right">{((food.sodium || 0) / 2000 * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>钙</TableCell>
                  <TableCell align="right">{food.calcium || 0}mg</TableCell>
                  <TableCell align="right">{((food.calcium || 0) / 1000 * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>铁</TableCell>
                  <TableCell align="right">{food.iron || 0}mg</TableCell>
                  <TableCell align="right">{((food.iron || 0) / 18 * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>维生素A</TableCell>
                  <TableCell align="right">{food.vitaminA || 0}μg</TableCell>
                  <TableCell align="right">{((food.vitaminA || 0) / 800 * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>维生素C</TableCell>
                  <TableCell align="right">{food.vitaminC || 0}mg</TableCell>
                  <TableCell align="right">{((food.vitaminC || 0) / 80 * 100).toFixed(1)}%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* 健康分析标签页 */}
        {tabValue === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>健康评分</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                    <CircularProgress 
                      variant="determinate" 
                      value={food.healthScore || 70} 
                      size={80} 
                      thickness={5} 
                      sx={{ color: food.healthScore >= 80 ? 'success.main' : food.healthScore >= 60 ? 'warning.main' : 'error.main' }}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="h6" component="div">
                        {food.healthScore || 70}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1">
                    {food.healthScore >= 80 ? '非常健康' : 
                     food.healthScore >= 60 ? '健康' : 
                     food.healthScore >= 40 ? '一般' : '不太健康'}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>健康特性</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {food.protein / food.calories * 1000 > 10 && (
                    <Chip label="高蛋白" color="success" />
                  )}
                  {food.fiber > 3 && (
                    <Chip label="高纤维" color="success" />
                  )}
                  {food.fat / food.calories * 1000 > 30 && (
                    <Chip label="高脂肪" color="warning" />
                  )}
                  {food.sugar > 10 && (
                    <Chip label="高糖" color="warning" />
                  )}
                  {food.sodium > 500 && (
                    <Chip label="高钠" color="warning" />
                  )}
                  {food.vitaminC > 20 && (
                    <Chip label="富含维生素C" color="success" />
                  )}
                  {food.calcium > 200 && (
                    <Chip label="富含钙" color="success" />
                  )}
                  {food.iron > 3 && (
                    <Chip label="富含铁" color="success" />
                  )}
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>适合人群</Typography>
                <Typography variant="body1" paragraph>
                  {food.protein / food.calories * 1000 > 10 ? '适合增肌人群、' : ''}
                  {food.fiber > 3 ? '适合减肥人群、' : ''}
                  {food.calcium > 200 ? '适合青少年和老年人、' : ''}
                  {food.iron > 3 ? '适合女性、' : ''}
                  {food.vitaminC > 20 ? '适合免疫力低下人群、' : ''}
                  {food.fat / food.calories * 1000 < 20 && food.protein / food.calories * 1000 > 8 ? '适合运动员、' : ''}
                  {food.carbs / food.calories * 1000 > 60 ? '适合耐力运动员、' : ''}
                  {'适合大众人群'}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>注意事项</Typography>
                <Typography variant="body1">
                  {food.fat / food.calories * 1000 > 30 ? '脂肪含量较高，心血管疾病患者应适量食用。' : ''}
                  {food.sugar > 10 ? '糖分含量较高，糖尿病患者应控制摄入量。' : ''}
                  {food.sodium > 500 ? '钠含量较高，高血压患者应减少食用。' : ''}
                  {food.fat / food.calories * 1000 <= 30 && food.sugar <= 10 && food.sodium <= 500 ? '无特殊注意事项，可放心食用。' : ''}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
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

export default FoodDetailDialog;