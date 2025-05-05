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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Avatar from '@mui/material/Avatar';

// 注册表单验证模式
const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, '用户名至少需要3个字符')
    .max(20, '用户名不能超过20个字符')
    .required('用户名不能为空'),
  email: Yup.string()
    .email('请输入有效的邮箱地址')
    .required('邮箱不能为空'),
  password: Yup.string()
    .min(6, '密码至少需要6个字符')
    .required('密码不能为空'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], '两次输入的密码不匹配')
    .required('请确认密码')
});

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 处理注册提交
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setError('');
      setSuccess('');
      
      // 发送注册请求到后端API
      const response = await axios.post('http://localhost:5000/api/users/register', {
        username: values.username,
        email: values.email,
        password: values.password
      });
      
      // 注册成功
      setSuccess('注册成功！即将跳转到登录页面...');
      resetForm();
      
      // 3秒后跳转到登录页面
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      // 处理注册错误
      if (err.response && err.response.data) {
        setError(err.response.data.message || '注册失败，请重试');
      } else {
        setError('注册失败，请检查网络连接');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <PersonAddIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          用户注册
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
            {success}
          </Alert>
        )}
        
        <Formik
          initialValues={{ username: '', email: '', password: '', confirmPassword: '' }}
          validationSchema={RegisterSchema}
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
              
              <Field name="email">
                {({ field }) => (
                  <TextField
                    {...field}
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="邮箱地址"
                    autoComplete="email"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
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
                    autoComplete="new-password"
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                  />
                )}
              </Field>
              
              <Field name="confirmPassword">
                {({ field }) => (
                  <TextField
                    {...field}
                    margin="normal"
                    required
                    fullWidth
                    id="confirmPassword"
                    label="确认密码"
                    type="password"
                    autoComplete="new-password"
                    error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                    helperText={touched.confirmPassword && errors.confirmPassword}
                  />
                )}
              </Field>
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="secondary"
                sx={{ mt: 3, mb: 2 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? '注册中...' : '注册'}
              </Button>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2">
                  已有账号？{' '}
                  <Link to="/login" style={{ textDecoration: 'none', color: 'primary.main' }}>
                    立即登录
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

export default Register;