回答优先使用中文

技术实现
    后端：
        - 采用Nodejs + Express框架
        - 使用模块别名(@services, @routes)
        - RESTful API设计
        - 文件系统存储(fs-extra)
        - JWT认证(jsonwebtoken)

    前端：
        - React + Vite构建
        - 使用@别名代替相对路径
        - Material-UI组件库构建界面
        - Grid系统实现响应式布局
        - Chart.js实现数据可视化
        
        数据组织：
        - 前端函数间的数据传递以极简格式进行组织
          - Foods 使用简化格式的食谱数据（[{foodId, amount}]数组格式）
          - 如函数中需要详细数据，可自行调用前端的FoodService获取数据（优先使用同步方法）

        组件结构：
        - 复用src/components/下的组件
        - 按功能模块组织目录结构
        
        数据处理：
        - 自定义hooks处理业务逻辑
        - 服务层与API交互
        - 本地存储用户数据
        
        状态管理：
        - React状态管理
        - 表单处理使用Formik+Yup


项目路径
    根目录：
        - HealtyDiet_Project/：主项目代码
        - Docs/：项目文档
        - Tools/：数据处理工具

    项目代码：
        - frontend/：前端React应用
            - src/components/：可复用组件
                - auth/：认证相关组件
                - charts/：图表组件
                - dialogs/：对话框组件
                - diet/：饮食相关组件
                - layout/：布局组件
                - nutrition/：营养相关组件
            - src/hooks/：自定义钩子
                - nutrition/：营养计算钩子
            - src/pages/：页面组件
                - auth/：登录注册页面
                - diet/：饮食管理页面
                - food/：食物管理页面
                - plan/：计划管理页面
                - user/：用户管理页面
            - src/services/：前端服务
                - DietScoreService.js：饮食评分服务
                - DishService.js：菜品服务
                - FoodService.js：食物服务
                - NutritionService.js：营养服务
                - StorageService.js：存储服务

        - backend/：后端Node.js服务
            - routes/：API路由
                - dietRoutes.js：饮食相关路由
                - dishRoutes.js：菜品相关路由
                - foodRoutes.js：食物相关路由
                - planRoutes.js：计划相关路由
                - userRoutes.js：用户相关路由
            - services/：业务逻辑服务
                - dietService.js：饮食服务
                - dishService.js：菜品服务
                - foodService.js：食物服务
                - foodTypeService.js：食物类型服务
                - planService.js：计划服务
                - pathService.js：路径服务

        - data/：JSON数据存储
            - dishs/：菜品数据
            - foods/：食物数据（按类别分类）
            - needs/：营养需求数据
            - users/：用户数据
