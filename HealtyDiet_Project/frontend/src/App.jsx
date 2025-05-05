import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import axios from 'axios';

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
  const [nutritionData, setNutritionData] = useState(null);
  
  // 处理营养数据更新
  const handleNutritionDataUpdate = (data) => {
    setNutritionData(data);
    // 更新user对象，添加营养数据
    setUser(prevUser => ({
      ...prevUser,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      tdee: data.tdee
    }));
  };
  
  // 检查用户是否已登录
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      const parsedUserData = JSON.parse(userData);
      setUser(parsedUserData);
      
      // 自动获取用户营养数据
      fetchUserNutritionData(parsedUserData, token);
    }
  }, []);
  
  // 获取用户营养数据并计算营养指标
  const fetchUserNutritionData = async (userData, token) => {
    try {
      if (!userData || !userData.id) return;
      
      const response = await axios.get(`http://localhost:5000/api/users/profile/${userData.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // 确保解析正确的profile数据结构
      console.log('自动获取的用户数据:', response.data);
      const profileData = response.data.profile;
      
      // 如果有用户数据，计算营养指标
      if (profileData) {
        updateNutritionMetrics(profileData, userData);
      }
    } catch (err) {
      console.error('自动获取用户营养数据失败:', err);
    }
  };
  
  // 更新营养指标
  const updateNutritionMetrics = (profileData, userData) => {
    // 计算年龄
    const calculateAge = (birthDate) => {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      return age;
    };
    
    // 计算BMR
    const calculateBMR = (weight, height, age, gender) => {
      // 使用Mifflin-St Jeor公式
      if (gender === 'male') {
        return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
      } else {
        return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
      }
    };
    
    const calculatedAge = calculateAge(profileData.birthDate);
    
    const calculatedBMR = profileData.weight && profileData.height && profileData.gender ? 
      calculateBMR(
        profileData.weight,
        profileData.height,
        calculatedAge,
        profileData.gender
      ) : 0;
    
    // 活动水平乘数
    const activityLevels = [
      { value: 'sedentary', multiplier: 1.2, proteinCoefficient: 1.2 },
      { value: 'light', multiplier: 1.375, proteinCoefficient: 1.5 },
      { value: 'moderate', multiplier: 1.55, proteinCoefficient: 1.8 },
      { value: 'active', multiplier: 1.725, proteinCoefficient: 2.2 },
      { value: 'very_active', multiplier: 1.9, proteinCoefficient: 2.5 }
    ];
    
    // 查找活动水平乘数
    const activityLevel = activityLevels.find(level => level.value === profileData.activityLevel);
    const multiplier = activityLevel ? activityLevel.multiplier : 1.2;
    const proteinCoefficient = activityLevel ? activityLevel.proteinCoefficient : 1.0;
    
    // 计算TDEE (总能量消耗)
    const tdeeValue = calculatedBMR ? Math.round(calculatedBMR * multiplier) : 0;
    
    // 获取热量缺口值（默认0千卡）
    const calorieDeficit = profileData.calorieDeficit || 0;
    const adjustedTdee = Math.max(tdeeValue - calorieDeficit, 1200); // 确保不低于基础代谢
    
    // 计算蛋白质需求
    const proteinValue = Math.round(profileData.weight * proteinCoefficient);
    
    // 脂肪(25% TDEE, 9千卡/克)
    const fatValue = Math.round(adjustedTdee * 0.25 / 9);
    
    // 计算碳水化合物需求 (TDEE - (蛋白质*4 + 脂肪*9)) / 4
    const proteinCalories = proteinValue * 4;
    const fatCalories = fatValue * 9;
    const carbsValue = Math.round((adjustedTdee - proteinCalories - fatCalories) / 4);
    
    // 更新用户对象，添加营养数据
    setUser(prevUser => ({
      ...prevUser,
      protein: proteinValue,
      carbs: carbsValue,
      fat: fatValue,
      tdee: adjustedTdee
    }));
    
    // 更新营养数据状态
    setNutritionData({
      protein: proteinValue,
      carbs: carbsValue,
      fat: fatValue,
      tdee: adjustedTdee
    });
  };
  
  // 登录处理函数
  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
    
    // 登录后立即获取用户营养数据
    fetchUserNutritionData(userData, token);
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
                <UserData user={user} onNutritionDataUpdate={handleNutritionDataUpdate} />
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