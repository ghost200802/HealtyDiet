const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 确保数据目录存在
const dataDir = path.join(__dirname, '..', 'data');
const usersDir = path.join(dataDir, 'users');
const foodsDir = path.join(dataDir, 'foods');
const recipesDir = path.join(dataDir, 'recipes');

fs.ensureDirSync(dataDir);
fs.ensureDirSync(usersDir);
fs.ensureDirSync(foodsDir);
fs.ensureDirSync(recipesDir);

// 初始化食物数据文件
const foodsFile = path.join(foodsDir, 'foods.json');
if (!fs.existsSync(foodsFile)) {
  fs.writeJsonSync(foodsFile, {
    foods: [
      {
        id: '1',
        name: '鸡胸肉',
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        vitamins: { A: 0, C: 0, D: 0, E: 0.3 },
        minerals: { calcium: 15, iron: 1, magnesium: 29, potassium: 256 },
        servingSize: 100,
        unit: 'g',
        description: '去皮鸡胸肉，富含蛋白质，低脂肪'
      },
      {
        id: '2',
        name: '糙米',
        calories: 112,
        protein: 2.6,
        carbs: 23.5,
        fat: 0.9,
        vitamins: { A: 0, C: 0, D: 0, E: 0.1 },
        minerals: { calcium: 10, iron: 0.5, magnesium: 43, potassium: 79 },
        servingSize: 100,
        unit: 'g',
        description: '全谷物，富含纤维和矿物质'
      },
      {
        id: '3',
        name: '西兰花',
        calories: 34,
        protein: 2.8,
        carbs: 6.6,
        fat: 0.4,
        vitamins: { A: 623, C: 89.2, D: 0, E: 0.8 },
        minerals: { calcium: 47, iron: 0.7, magnesium: 21, potassium: 316 },
        servingSize: 100,
        unit: 'g',
        description: '十字花科蔬菜，富含维生素C和抗氧化物'
      }
    ]
  });
}

// 路由导入
const userRoutes = require('./routes/userRoutes');
const foodRoutes = require('./routes/foodRoutes');
const recipeRoutes = require('./routes/recipeRoutes');

// 路由注册
app.use('/api/users', userRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/recipes', recipeRoutes);

// 基础路由
app.get('/', (req, res) => {
  res.json({ message: 'CleanEats API 服务运行中' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口: ${PORT}`);
});