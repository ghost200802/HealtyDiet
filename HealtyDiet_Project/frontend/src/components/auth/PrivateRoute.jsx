import React from 'react';
import { Navigate } from 'react-router-dom';

// 私有路由组件，用于保护需要登录才能访问的页面
const PrivateRoute = ({ isAuthenticated, children }) => {
  // 如果用户已认证，则渲染子组件
  // 否则重定向到登录页面
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;