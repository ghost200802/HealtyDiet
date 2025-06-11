import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import RestaurantIcon from '@mui/icons-material/Restaurant';

const Navbar = ({ isAuthenticated, user, onLogout }) => {
  const navigate = useNavigate();
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  
  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };
  
  const handleMenuClick = (path) => {
    navigate(path);
    handleCloseNavMenu();
  };
  
  const handleLogout = () => {
    onLogout();
    navigate('/');
  };
  
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* 桌面版 Logo */}
          <RestaurantIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            HealtyDiet
          </Typography>
          
          {/* 移动版菜单 */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              <MenuItem onClick={() => handleMenuClick('/food-search')}>
                <Typography textAlign="center">食物查询</Typography>
              </MenuItem>
              
              {isAuthenticated ? (
                <>
                  <MenuItem onClick={() => handleMenuClick('/profile')}>
                    <Typography textAlign="center">个人信息</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => handleMenuClick('/user-data')}>
                    <Typography textAlign="center">身体数据</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => handleMenuClick('/food-add')}>
                    <Typography textAlign="center">添加食物</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => handleMenuClick('/recipe')}>
                    <Typography textAlign="center">每日食谱</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => handleMenuClick('/plan')}>
                    <Typography textAlign="center">食谱规划</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Typography textAlign="center">退出登录</Typography>
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem onClick={() => handleMenuClick('/login')}>
                    <Typography textAlign="center">登录</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => handleMenuClick('/register')}>
                    <Typography textAlign="center">注册</Typography>
                  </MenuItem>
                </>
              )}
            </Menu>
          </Box>
          
          {/* 移动版 Logo */}
          <RestaurantIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            HealtyDiet
          </Typography>
          
          {/* 桌面版菜单 */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Button
              onClick={() => handleMenuClick('/food-search')}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              食物查询
            </Button>
            
            {isAuthenticated ? (
              <>
                <Button
                  onClick={() => handleMenuClick('/profile')}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  个人信息
                </Button>
                <Button
                  onClick={() => handleMenuClick('/user-data')}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  身体数据
                </Button>
                <Button
                  onClick={() => handleMenuClick('/food-add')}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  添加食物
                </Button>
                <Button
                  onClick={() => handleMenuClick('/recipe')}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  每日食谱
                </Button>
                <Button
                  onClick={() => handleMenuClick('/plan')}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  食谱规划
                </Button>
              </>
            ) : null}
          </Box>
          
          {/* 用户操作区 */}
          <Box sx={{ flexGrow: 0, display: { xs: 'none', md: 'flex' } }}>
            {isAuthenticated ? (
              <>
                <Typography variant="body1" sx={{ mr: 2, alignSelf: 'center' }}>
                  你好, {user?.username}
                </Typography>
                <Button color="inherit" onClick={handleLogout}>
                  退出登录
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/login">
                  登录
                </Button>
                <Button color="inherit" component={Link} to="/register">
                  注册
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;