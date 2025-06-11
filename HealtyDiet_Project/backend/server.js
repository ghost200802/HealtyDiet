// 注册模块别名
require('module-alias/register');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { ensureDataFilesExist } = require('@services/index');
const { foodsData } = require('@services/index');

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors({
  origin: '*', // 允许所有来源的请求
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// 确保数据目录和文件存在
ensureDataFilesExist();

// 初始化食物缓存
try {
  foodsData.initializeCache();
  console.log('食物缓存初始化成功');
} catch (error) {
  console.error('食物缓存初始化失败:', error.message);
}

// 路由导入
const userRoutes = require('@routes/userRoutes');
const foodRoutes = require('@routes/foodRoutes');
const recipeRoutes = require('@routes/recipeRoutes');

// 路由注册
app.use('/api/users', userRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/recipes', recipeRoutes);

// 基础路由
app.get('/', (req, res) => {
  res.json({ message: 'HealtyDiet API 服务运行中' });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在端口: ${PORT}，可通过局域网访问`);
});