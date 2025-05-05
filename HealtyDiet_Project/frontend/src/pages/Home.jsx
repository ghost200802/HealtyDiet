import React from 'react';
import { Link } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';

const Home = () => {
  return (
    <Container maxWidth="lg">
      {/* 主标题区域 */}
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          欢迎使用 CleanEats
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          您的个人健康饮食管理助手，帮助您追踪营养摄入，规划健康饮食
        </Typography>
      </Box>

      {/* 功能卡片区域 */}
      <Grid container spacing={4} sx={{ mt: 2 }}>
        {/* 食物查询卡片 */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <SearchIcon fontSize="large" color="primary" />
              </Box>
              <Typography gutterBottom variant="h5" component="h2" align="center">
                食物查询
              </Typography>
              <Typography>
                查询各种食物的详细营养成分，包括热量、蛋白质、碳水化合物、脂肪、维生素和矿物质等信息。
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to="/food-search" fullWidth>
                开始查询
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* 个人数据卡片 */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <PersonIcon fontSize="large" color="primary" />
              </Box>
              <Typography gutterBottom variant="h5" component="h2" align="center">
                个人数据
              </Typography>
              <Typography>
                记录和管理您的个人信息和身体数据，包括身高、体重、体脂率等，系统将自动计算您的基础代谢率(BMR)。
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to="/user-data" fullWidth>
                管理数据
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* 食谱规划卡片 */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <MenuBookIcon fontSize="large" color="primary" />
              </Box>
              <Typography gutterBottom variant="h5" component="h2" align="center">
                食谱规划
              </Typography>
              <Typography>
                根据您的身体数据和活动水平，规划每日饮食，系统会自动计算营养摄入并提供平衡饮食建议。
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to="/recipe-planner" fullWidth>
                开始规划
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* 系统特点区域 */}
      <Box sx={{ my: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center">
          系统特点
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <RestaurantIcon color="primary" sx={{ mr: 2, mt: 0.5 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  全面的食物数据库
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  包含丰富的食物营养数据，支持自定义添加新食物，满足个性化需求。
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <MonitorWeightIcon color="primary" sx={{ mr: 2, mt: 0.5 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  精确的营养计算
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  基于科学公式计算基础代谢率和每日营养需求，帮助您制定合理的饮食计划。
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <MenuBookIcon color="primary" sx={{ mr: 2, mt: 0.5 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  个性化食谱管理
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  支持创建、保存和加载个人食谱，方便您规划每日饮食并追踪营养摄入。
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <SearchIcon color="primary" sx={{ mr: 2, mt: 0.5 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  智能营养分析
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  自动分析食谱中的营养平衡情况，提示营养不足或过量，帮助您调整饮食结构。
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* 开始使用区域 */}
      <Box sx={{ my: 6, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom>
          开始使用
        </Typography>
        <Typography variant="body1" paragraph>
          立即注册账号，开始您的健康饮食管理之旅！
        </Typography>
        <Button variant="contained" size="large" component={Link} to="/register">
          免费注册
        </Button>
        <Typography variant="body2" sx={{ mt: 2 }}>
          已有账号？<Link component={Link} to="/login">立即登录</Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default Home;