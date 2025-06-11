import React, { useState, useEffect } from 'react';
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
  IconButton,
  Box,
  CircularProgress,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

/**
 * 食谱规划加载对话框组件
 */
const PlanLoadDialog = ({ 
  open, 
  onClose, 
  onLoadPlan, 
  onDeletePlan,
}) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 加载所有可用的规划
  useEffect(() => {
    const fetchPlans = async () => {
      if (!open) return; // 只在对话框打开时加载
      
      try {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/plans', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setPlans(response.data);
        setLoading(false);
      } catch (err) {
        console.error('获取规划列表失败:', err);
        setError('获取规划列表失败: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };
    
    fetchPlans();
  }, [open]);

  // 处理删除规划
  const handleDeletePlan = async (planId, event) => {
    event.stopPropagation(); // 阻止事件冒泡
    
    if (!window.confirm('确定要删除这个规划吗？')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      await axios.delete(`/api/plans/${planId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // 从列表中移除已删除的规划
      setPlans(plans.filter(plan => plan.id !== planId));
      
      if (onDeletePlan) {
        onDeletePlan(planId);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('删除规划失败:', err);
      setError('删除规划失败: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>加载食谱规划</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography variant="body1" color="error" sx={{ textAlign: 'center', py: 3 }}>
            {error}
          </Typography>
        ) : plans.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            没有保存的食谱规划
          </Typography>
        ) : (
          <List>
            {plans.map(plan => (
              <ListItem 
                key={plan.id} 
                sx={{ cursor: 'pointer' }}
                onClick={() => onLoadPlan(plan)}
                divider
              >
                <ListItemText
                  primary={plan.name}
                  secondary={
                    <Typography variant="body2" component="span">
                      创建时间: {new Date(plan.createdAt).toLocaleString()}
                      {plan.updatedAt && plan.updatedAt !== plan.createdAt && 
                        ` | 更新时间: ${new Date(plan.updatedAt).toLocaleString()}`}
                    </Typography>
                  }
                />
                <IconButton 
                  edge="end" 
                  color="error"
                  onClick={(e) => handleDeletePlan(plan.id, e)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          取消
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlanLoadDialog;