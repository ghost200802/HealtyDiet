import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
} from '@mui/material';
import HorizontalBarChart from '@/components/charts/HorizontalBarChart';

/**
 * 营养素详情卡片组件，显示单个营养素的分布图表
 * @param {Object} props - 组件属性
 * @param {string} props.title - 卡片标题
 * @param {Array} props.data - 营养素数据
 * @param {string} props.unit - 单位
 * @param {string} props.type - 营养素类型
 */
const NutritionDetailsCard = ({ title, data, unit, type }) => {
  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <HorizontalBarChart 
          data={data} 
          unit={unit} 
          type={type} 
        />
      </CardContent>
    </Card>
  );
};

export default NutritionDetailsCard;