import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';

// 登录表单验证模式
const LoginSchema = Yup.object().shape({
  username: Yup.string().required('用户名不能为空'),
  password: Yup.string().required('密码不能为空')
});

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  // 处理登录提交
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      
      // 发送登录请求到后端API
      const response = await axios.post('/api/users/login', {
        username: values.username,
        password: values.password
      });
      
      // 登录成功，调用父组件的登录处理函数
      onLogin(response.data.user, response.data.token);
      
      // 重定向到首页
      navigate('/');
    } catch (err) {
      // 处理登录错误
      if (err.response && err.response.data) {
        setError(err.response.data.message || '登录失败，请重试');
      } else {
        setError('登录失败，请检查网络连接');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          用户登录
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        
        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form style={{ width: '100%', marginTop: '1rem' }}>
              <Field name="username">
                {({ field }) => (
                  <TextField
                    {...field}
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label="用户名"
                    autoComplete="username"
                    autoFocus
                    error={touched.username && Boolean(errors.username)}
                    helperText={touched.username && errors.username}
                  />
                )}
              </Field>
              
              <Field name="password">
                {({ field }) => (
                  <TextField
                    {...field}
                    margin="normal"
                    required
                    fullWidth
                    id="password"
                    label="密码"
                    type="password"
                    autoComplete="current-password"
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                  />
                )}
              </Field>
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? '登录中...' : '登录'}
              </Button>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2">
                  还没有账号？{' '}
                  <Link to="/register" style={{ textDecoration: 'none', color: 'primary.main' }}>
                    立即注册
                  </Link>
                </Typography>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default Login;