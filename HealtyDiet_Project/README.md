# HealtyDiet 健康饮食管理系统

## 项目介绍

HealtyDiet是一个健康饮食管理系统，帮助用户追踪饮食习惯、计算营养摄入并规划健康饮食。

## 功能特点

- 用户注册与登录系统
- 个人信息管理
- 基础代谢率(BMR)计算
- 食物数据库查询与管理
- 每日食谱规划与营养分析
- 基于用户数据的营养摄入建议

## 技术栈

- 前端：React.js
- 后端：Node.js + Express
- 数据存储：本地JSON文件（可扩展至MongoDB）

## 项目结构

```
HealtyDiet_Project/
├── frontend/         # React前端应用
├── backend/          # Node.js后端服务
└── data/             # 本地数据存储
    ├── users/        # 用户数据
    ├── foods/        # 食物数据
    └── recipes/      # 食谱数据
```

## 启动项目

### 后端服务

```bash
cd backend
npm install
npm run dev
```

### 前端应用

```bash
cd frontend
npm install
npm start
```

## 初始数据

系统启动时会自动创建必要的数据文件和示例数据。

## 开发计划

1. 完成用户认证系统
2. 实现食物数据库管理
3. 开发营养计算功能
4. 构建食谱规划系统
5. 优化用户界面和体验