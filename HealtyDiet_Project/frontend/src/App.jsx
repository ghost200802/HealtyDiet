import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// 组件导入
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/user/Profile';
import UserData from './pages/user/UserData';
import FoodSearch from './pages/food/FoodSearch';
import FoodAdd from './pages/food/FoodAdd';
import RecipePlanner from './pages/recipe/RecipePlanner';
import PrivateRoute from './components/auth/PrivateRoute';

// 创建主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#4caf50',
    },
    secondary: {
      main: '#ff9800',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  // 检查用户是否已登录
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);
  
  // 登录处理函数
  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };
  
  // 登出处理函数
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-container">
        <Navbar isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/profile" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Profile user={user} />
              </PrivateRoute>
            } />
            
            <Route path="/user-data" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <UserData user={user} />
              </PrivateRoute>
            } />
            
            <Route path="/food-search" element={<FoodSearch />} />
            
            <Route path="/food-add" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <FoodAdd />
              </PrivateRoute>
            } />
            
            <Route path="/recipe-planner" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <RecipePlanner user={user} />
              </PrivateRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;