import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Avatar from '@mui/material/Avatar';

// 个人资料表单验证模式
const ProfileSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, '用户名至少需要3个字符')
    .max(20, '用户名不能超过20个字符')
    .required('用户名不能为空'),
  email: Yup.string()
    .email('请输入有效的邮箱地址')
    .required('邮箱不能为空'),
  password: Yup.string()
    .min(6, '密码至少需要6个字符')
    .nullable(),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], '两次输入的密码不匹配')
});

const Profile = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  
  // 获取用户个人资料
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user || !user.id) return;
        
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/users/profile/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setProfile(response.data);
      } catch (err) {
        console.error('获取个人资料失败:', err);
        setError('获取个人资料失败，请重试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  // 处理个人资料更新
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setSuccess('');
      
      // 只有当密码字段有值时才包含在更新数据中
      const updateData = {
        username: values.username,
        email: values.email
      };
      
      if (values.password) {
        updateData.password = values.password;
      }
      
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/users/profile/${user.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // 更新成功
      setProfile(response.data);
      setSuccess('个人资料更新成功！');
      
      // 更新本地存储的用户信息
      const updatedUser = { ...user, username: values.username, email: values.email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // 3秒后清除成功消息
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || '更新个人资料失败，请重试');
      } else {
        setError('更新个人资料失败，请检查网络连接');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography>加载中...</Typography>
        </Box>
      </Container>
    );
  }
  
  if (!profile) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography color="error">无法加载个人资料，请重新登录</Typography>
          <Button variant="contained" color="primary" href="/login" sx={{ mt: 2 }}>
            返回登录
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
            <AccountCircleIcon fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h4">
            个人资料
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        <Formik
          initialValues={{
            username: profile.username || '',
            email: profile.email || '',
            password: '',
            confirmPassword: ''
          }}
          validationSchema={ProfileSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Field name="username">
                    {({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        id="username"
                        label="用户名"
                        error={touched.username && Boolean(errors.username)}
                        helperText={touched.username && errors.username}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12}>
                  <Field name="email">
                    {({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        id="email"
                        label="邮箱地址"
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    修改密码（如不修改请留空）
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Field name="password">
                    {({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        id="password"
                        label="新密码"
                        type="password"
                        error={touched.password && Boolean(errors.password)}
                        helperText={touched.password && errors.password}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Field name="confirmPassword">
                    {({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        id="confirmPassword"
                        label="确认新密码"
                        type="password"
                        error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                        helperText={touched.confirmPassword && errors.confirmPassword}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                    sx={{ mr: 2 }}
                  >
                    {isSubmitting ? '保存中...' : '保存修改'}
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default Profile;