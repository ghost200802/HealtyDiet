# 健康饮食研究项目

## 项目描述
这是一个关于健康饮食研究的全栈项目，包含前端和后端服务。

## 项目结构
```
FoodResearch/
├── HealtyDiet_Project/
│   ├── backend/        # 后端服务
│   └── frontend/       # 前端应用
└── start.bat           # 启动脚本
```

## 环境要求
- Node.js (建议版本16+) 
- npm (建议版本8+)

## 安装步骤
1. 克隆项目仓库
2. 安装后端依赖：
```bash
cd HealtyDiet_Project/backend
npm install
```
3. 安装前端依赖：
```bash
cd ../frontend
npm install
```

## 运行项目
1. 使用启动脚本（推荐）：
```bash
start.bat
```
2. 或手动启动：
   - 后端服务：
   ```bash
   cd HealtyDiet_Project/backend
   npm run start
   ```
   - 前端应用：
   ```bash
   cd ../frontend
   npm start
   ```

## 主要功能
- 健康饮食规划
- 营养信息分析
- 个性化食谱推荐

## 注意事项
- 确保同时启动前后端服务
- 首次运行前请先安装依赖