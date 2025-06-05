import React from 'react';
import { Box, Typography, Card } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// 注册Chart.js所需的组件
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * 经典饼图组件 - 使用Chart.js实现，不依赖React hooks
 * 这个组件使用react-chartjs-2，它是Chart.js的React封装
 * 相比MUI的PieChart，它不会引起Invalid hook call的问题
 */
class ClassicPieChart extends React.Component {
  // 根据营养素类型设置不同的颜色
  getColors(type) {
    // 预设的颜色方案 - 更新为用户要求的颜色
    const colors = {
      calories: ['#8BC34A', '#EF9A9A', '#FFE082'], // 淡绿色、淡红色、淡黄色
      protein: ['#EF9A9A', '#8BC34A', '#FFE082'], // 淡红色、淡绿色、淡黄色
      carbs: ['#8BC34A', '#EF9A9A', '#FFE082'], // 淡绿色、淡红色、淡黄色
      fat: ['#FFE082', '#8BC34A', '#EF9A9A'] // 淡黄色、淡绿色、淡红色
    };
    
    // 根据类型选择颜色数组，默认使用绿色系
    return colors[type] || ['#8BC34A', '#EF9A9A', '#FFE082'];
  }

  // 获取特定营养素的颜色
  getNutrientColor(nutrientName) {
    // 根据营养素名称返回对应颜色
    if (nutrientName.includes('碳水')) {
      return '#8BC34A'; // 淡绿色
    } else if (nutrientName.includes('蛋白质')) {
      return '#EF9A9A'; // 淡红色
    } else if (nutrientName.includes('脂肪')) {
      return '#FFE082'; // 淡黄色
    }
    return '#9E9E9E'; // 默认灰色
  }

  // 渲染图例
  renderLegend() {
    const { data, unit } = this.props;
    
    // 按百分比从大到小排序数据
    const sortedData = [...data].sort((a, b) => b.percent - a.percent);
    
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        {sortedData.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1, width: '80%', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: 1,
                  backgroundColor: this.getNutrientColor(item.name),
                  mr: 1,
                }}
              />
              <Typography variant="caption" color="text.secondary" noWrap>
                {item.name}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {item.value.toFixed(1)}{unit} ({Math.round(item.percent)}%)
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }

  render() {
    const { data, donut = true } = this.props;
    
    // 按百分比从大到小排序数据
    const sortedData = [...data].sort((a, b) => b.percent - a.percent);
    
    // 准备Chart.js数据格式
    const chartData = {
      labels: sortedData.map(item => item.name),
      datasets: [
        {
          data: sortedData.map(item => item.value),
          backgroundColor: sortedData.map(item => this.getNutrientColor(item.name)),
          borderColor: sortedData.map(item => this.getNutrientColor(item.name)),
          borderWidth: 1,
        },
      ],
    };

    // Chart.js配置选项
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: donut ? '50%' : 0, // 设置中空比例，0表示普通饼图，50%表示中空饼图
      plugins: {
        legend: {
          display: false, // 隐藏内置图例，使用自定义图例
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const dataset = context.dataset;
              const total = dataset.data.reduce((acc, data) => acc + data, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value.toFixed(1)} (${percentage}%)`;
            }
          }
        }
      },
    };

    return (
      <Box sx={{ width: '100%', mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ height: 200, position: 'relative', width: '100%', maxWidth: '300px' }}>
          <Pie data={chartData} options={options} />
        </Box>
        <Box sx={{ mt: 2, width: '100%', maxWidth: '300px' }}>
          {this.renderLegend()}
        </Box>
      </Box>
    );
  }
}

export default ClassicPieChart;