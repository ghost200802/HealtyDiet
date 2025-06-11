import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
import { alpha } from '@mui/material/styles';

const Navbar = ({ isAuthenticated, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorElNav, setAnchorElNav] = useState(null);
  
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

  // 检查当前路径是否匹配
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <AppBar 
      position="static" 
      sx={{
        background: 'linear-gradient(90deg, #4caf50 0%, #2e7d32 100%)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* 桌面版 Logo */}
          <RestaurantIcon 
            sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              mr: 1,
              fontSize: '2rem',
              color: '#fff',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }} 
          />
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 3,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              }
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
              sx={{
                '&:hover': {
                  backgroundColor: alpha('#fff', 0.1),
                },
              }}
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
                '& .MuiPaper-root': {
                  borderRadius: '8px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  mt: 1.5,
                },
              }}
            >
              <MenuItem 
                onClick={() => handleMenuClick('/food-search')}
                selected={isActive('/food-search')}
                sx={{
                  borderLeft: isActive('/food-search') ? '4px solid #4caf50' : 'none',
                  pl: isActive('/food-search') ? 1.5 : 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                <Typography textAlign="center">食物查询</Typography>
              </MenuItem>
              
              {isAuthenticated ? (
                <>
                  <MenuItem 
                    onClick={() => handleMenuClick('/user-data')}
                    selected={isActive('/user-data')}
                    sx={{
                      borderLeft: isActive('/user-data') ? '4px solid #4caf50' : 'none',
                      pl: isActive('/user-data') ? 1.5 : 2,
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    <Typography textAlign="center">健康数据</Typography>
                  </MenuItem>
                  <MenuItem 
                    onClick={() => handleMenuClick('/diet')}
                    selected={isActive('/diet')}
                    sx={{
                      borderLeft: isActive('/diet') ? '4px solid #4caf50' : 'none',
                      pl: isActive('/diet') ? 1.5 : 2,
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    <Typography textAlign="center">每日食谱</Typography>
                  </MenuItem>
                  <MenuItem 
                    onClick={() => handleMenuClick('/plan')}
                    selected={isActive('/plan')}
                    sx={{
                      borderLeft: isActive('/plan') ? '4px solid #4caf50' : 'none',
                      pl: isActive('/plan') ? 1.5 : 2,
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    <Typography textAlign="center">食谱规划</Typography>
                  </MenuItem>
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: '#ffebee',
                        color: '#d32f2f',
                      },
                    }}
                  >
                    <Typography textAlign="center">退出登录</Typography>
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem 
                    onClick={() => handleMenuClick('/login')}
                    selected={isActive('/login')}
                    sx={{
                      borderLeft: isActive('/login') ? '4px solid #4caf50' : 'none',
                      pl: isActive('/login') ? 1.5 : 2,
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    <Typography textAlign="center">登录</Typography>
                  </MenuItem>
                  <MenuItem 
                    onClick={() => handleMenuClick('/register')}
                    selected={isActive('/register')}
                    sx={{
                      borderLeft: isActive('/register') ? '4px solid #4caf50' : 'none',
                      pl: isActive('/register') ? 1.5 : 2,
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    <Typography textAlign="center">注册</Typography>
                  </MenuItem>
                </>
              )}
            </Menu>
          </Box>
          
          {/* 移动版 Logo */}
          <RestaurantIcon 
            sx={{ 
              display: { xs: 'flex', md: 'none' }, 
              mr: 1,
              fontSize: '1.8rem',
              color: '#fff',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }} 
          />
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
              letterSpacing: '.05rem',
              color: 'inherit',
              textDecoration: 'none',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            HealtyDiet
          </Typography>
          
          {/* 桌面版菜单 */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Button
              onClick={() => handleMenuClick('/food-search')}
              sx={{
                my: 2,
                mx: 0.5,
                color: 'white',
                display: 'block',
                minWidth: '100px',
                textAlign: 'center',
                position: 'relative',
                fontWeight: isActive('/food-search') ? 700 : 500,
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: isActive('/food-search') ? 'translateX(-50%)' : 'translateX(-50%) scaleX(0)',
                  height: '3px',
                  width: isActive('/food-search') ? '50%' : '0%',
                  backgroundColor: '#fff',
                  transition: 'all 0.3s ease',
                  borderRadius: '3px',
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:after': {
                    transform: 'translateX(-50%) scaleX(1)',
                    width: '50%',
                  },
                },
                transition: 'all 0.3s ease',
              }}
            >
              食物查询
            </Button>
            
            {isAuthenticated ? (
              <>
                <Button
                  onClick={() => handleMenuClick('/user-data')}
                  sx={{
                    my: 2,
                    mx: 0.5,
                    color: 'white',
                    display: 'block',
                    minWidth: '100px',
                    textAlign: 'center',
                    position: 'relative',
                    fontWeight: isActive('/user-data') ? 700 : 500,
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: isActive('/user-data') ? 'translateX(-50%)' : 'translateX(-50%) scaleX(0)',
                      height: '3px',
                      width: isActive('/user-data') ? '50%' : '0%',
                      backgroundColor: '#fff',
                      transition: 'all 0.3s ease',
                      borderRadius: '3px',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '&:after': {
                        transform: 'translateX(-50%) scaleX(1)',
                        width: '50%',
                      },
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  健康数据
                </Button>
                <Button
                  onClick={() => handleMenuClick('/diet')}
                  sx={{
                    my: 2,
                    mx: 0.5,
                    color: 'white',
                    display: 'block',
                    minWidth: '100px',
                    textAlign: 'center',
                    position: 'relative',
                    fontWeight: isActive('/diet') ? 700 : 500,
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: isActive('/diet') ? 'translateX(-50%)' : 'translateX(-50%) scaleX(0)',
                      height: '3px',
                      width: isActive('/diet') ? '50%' : '0%',
                      backgroundColor: '#fff',
                      transition: 'all 0.3s ease',
                      borderRadius: '3px',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '&:after': {
                        transform: 'translateX(-50%) scaleX(1)',
                        width: '50%',
                      },
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  每日食谱
                </Button>
                <Button
                  onClick={() => handleMenuClick('/plan')}
                  sx={{
                    my: 2,
                    mx: 0.5,
                    color: 'white',
                    display: 'block',
                    minWidth: '100px',
                    textAlign: 'center',
                    position: 'relative',
                    fontWeight: isActive('/plan') ? 700 : 500,
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: isActive('/plan') ? 'translateX(-50%)' : 'translateX(-50%) scaleX(0)',
                      height: '3px',
                      width: isActive('/plan') ? '50%' : '0%',
                      backgroundColor: '#fff',
                      transition: 'all 0.3s ease',
                      borderRadius: '3px',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '&:after': {
                        transform: 'translateX(-50%) scaleX(1)',
                        width: '50%',
                      },
                    },
                    transition: 'all 0.3s ease',
                  }}
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
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mr: 2, 
                    alignSelf: 'center', 
                    cursor: 'pointer',
                    minWidth: '100px',
                    textAlign: 'center',
                    fontWeight: isActive('/profile') ? 700 : 500,
                    position: 'relative',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  onClick={() => handleMenuClick('/profile')}
                >
                  你好, {user?.username}
                </Typography>
                <Button 
                  color="inherit" 
                  onClick={handleLogout}
                  sx={{ 
                    minWidth: '100px', 
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  退出登录
                </Button>
              </>
            ) : (
              <>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/login"
                  sx={{ 
                    minWidth: '100px', 
                    textAlign: 'center',
                    mx: 0.5,
                    fontWeight: isActive('/login') ? 700 : 500,
                    position: 'relative',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: isActive('/login') ? 'translateX(-50%)' : 'translateX(-50%) scaleX(0)',
                      height: '3px',
                      width: isActive('/login') ? '50%' : '0%',
                      backgroundColor: '#fff',
                      transition: 'all 0.3s ease',
                      borderRadius: '3px',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '&:after': {
                        transform: 'translateX(-50%) scaleX(1)',
                        width: '50%',
                      },
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  登录
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/register"
                  sx={{ 
                    minWidth: '100px', 
                    textAlign: 'center',
                    mx: 0.5,
                    fontWeight: isActive('/register') ? 700 : 500,
                    position: 'relative',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: isActive('/register') ? 'translateX(-50%)' : 'translateX(-50%) scaleX(0)',
                      height: '3px',
                      width: isActive('/register') ? '50%' : '0%',
                      backgroundColor: '#fff',
                      transition: 'all 0.3s ease',
                      borderRadius: '3px',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '&:after': {
                        transform: 'translateX(-50%) scaleX(1)',
                        width: '50%',
                      },
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
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