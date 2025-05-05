@echo off

REM 启动后端服务
cd HealtyDiet_Project\backend
start "后端服务" npm run start

REM 启动前端服务
cd ..\frontend
start "前端应用" npm start

REM 返回项目根目录
cd ..\..

echo Frontend and backend services started