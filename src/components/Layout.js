// src/components/Layout.js
import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  useTheme,
  useMediaQuery,
  Tooltip,
  Badge,
  Paper
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  Analytics as AnalyticsIcon,
  Feedback as FeedbackIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  AccountCircle,
  Logout as LogoutIcon,
  KeyboardArrowDown as ArrowDownIcon,
  AdminPanelSettings,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 280;

const menuItems = [
  {
    id: 'dashboard',
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
    color: '#FF5C5C',
    gradient: 'linear-gradient(135deg, #FF5C5C 0%, #FF8A80 100%)',
    description: 'Overview & Analytics'
  },
  {
    id: 'users',
    text: 'Manage Users',
    icon: <PeopleIcon />,
    path: '/users',
    color: '#3A4EFF',
    gradient: 'linear-gradient(135deg, #3A4EFF 0%, #5C6BC0 100%)',
    description: 'Students & Companies'
  },
  {
    id: 'projects',
    text: 'Project Management',
    icon: <WorkIcon />,
    path: '/projects',
    color: '#28B463',
    gradient: 'linear-gradient(135deg, #28B463 0%, #58D68D 100%)',
    description: 'Internship Projects'
  },
  {
    id: 'reports',
    text: 'Reports & Analytics',
    icon: <AnalyticsIcon />,
    path: '/reports',
    color: '#FFD460',
    gradient: 'linear-gradient(135deg, #FFD460 0%, #FFEB9C 100%)',
    description: 'Data Insights'
  },
  {
    id: 'feedback',
    text: 'Feedback & Complaints',
    icon: <FeedbackIcon />,
    path: '/feedback',
    color: '#A16EFF',
    gradient: 'linear-gradient(135deg, #A16EFF 0%, #B39DDB 100%)',
    description: 'User Feedback'
  },
  {
    id: 'notifications',
    text: 'Notification Center',
    icon: <NotificationsIcon />,
    path: '/notifications',
    color: '#2ACFCF',
    gradient: 'linear-gradient(135deg, #2ACFCF 0%, #4DD0E1 100%)',
    description: 'System Alerts'
  },
  {
    id: 'settings',
    text: 'Settings & Roles',
    icon: <SettingsIcon />,
    path: '/settings',
    color: '#FF9F45',
    gradient: 'linear-gradient(135deg, #FF9F45 0%, #FFB74D 100%)',
    description: 'System Configuration'
  }
];

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
    handleClose();
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const getActiveItem = () => {
    return menuItems.find(item => location.pathname === item.path);
  };

  const activeItem = getActiveItem();

  const DrawerHeader = () => (
    <Box
      sx={{
        p: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -50,
          right: -50,
          width: 100,
          height: 100,
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 80,
          height: 80,
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
        }
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              backdropFilter: 'blur(10px)'
            }}
          >
            <AdminPanelSettings sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
              InternLink
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Admin Portal
            </Typography>
          </Box>
        </Box>
        
        <Typography 
          variant="body2" 
          sx={{ 
            opacity: 0.8,
            fontSize: '0.85rem',
            fontStyle: 'italic'
          }}
        >
          Welcome, {currentUser?.email?.split('@')[0] || 'Admin'}
        </Typography>
      </Box>
    </Box>
  );

  const DrawerContent = () => (
    <Box>
      <DrawerHeader />
      
      <Box sx={{ p: 2 }}>
        <Typography 
          variant="overline" 
          sx={{ 
            px: 2,
            color: 'rgba(0, 0, 0, 0.6)',
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: 1
          }}
        >
          Main Menu
        </Typography>
        
        <List sx={{ mt: 1 }}>
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            
            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => handleMenuItemClick(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    background: isActive ? item.gradient : 'transparent',
                    color: isActive ? 'white' : 'inherit',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      background: isActive ? item.gradient : `${item.color}15`,
                      transform: 'translateX(8px)',
                      '& .MuiListItemIcon-root': {
                        transform: 'scale(1.2)',
                      },
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                      transition: 'all 0.3s ease',
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? 'white' : item.color,
                      minWidth: 48,
                      transition: 'transform 0.3s ease',
                      '& .MuiSvgIcon-root': {
                        fontSize: 24,
                        filter: isActive ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none'
                      }
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Typography 
                        sx={{ 
                          fontWeight: isActive ? 700 : 500,
                          fontSize: '0.95rem'
                        }}
                      >
                        {item.text}
                      </Typography>
                    }
                    secondary={
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: isActive ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)',
                          fontSize: '0.75rem'
                        }}
                      >
                        {item.description}
                      </Typography>
                    }
                  />
                  
                  {isActive && (
                    <Box
                      sx={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: 'white',
                        boxShadow: '0 0 8px rgba(255, 255, 255, 0.6)',
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                          '50%': { opacity: 0.7, transform: 'scale(1.2)' }
                        }
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Quick Stats */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            borderRadius: 2,
            border: '1px solid rgba(102, 126, 234, 0.1)'
          }}
        >
          <Typography 
            variant="overline" 
            sx={{ 
              color: 'rgba(0, 0, 0, 0.6)',
              fontWeight: 600,
              fontSize: '0.75rem'
            }}
          >
            Quick Stats
          </Typography>
          
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.7)' }}>
                Active Users
              </Typography>
              <Chip 
                label="1,234" 
                size="small" 
                sx={{ 
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  color: 'white',
                  fontWeight: 600
                }} 
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.7)' }}>
                New Today
              </Typography>
              <Chip 
                label="23" 
                size="small" 
                sx={{ 
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  fontWeight: 600
                }} 
              />
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <DrawerContent />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2, 
                display: { md: 'none' },
                color: '#667eea'
              }}
            >
              <MenuIcon />
            </IconButton>
            
            <Box>
              <Typography 
                variant="h6" 
                noWrap 
                component="div"
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {activeItem?.text || 'Dashboard'}
              </Typography>
              {activeItem && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'rgba(0, 0, 0, 0.6)',
                    display: 'block',
                    fontSize: '0.75rem'
                  }}
                >
                  {activeItem.description}
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notifications">
              <IconButton
                sx={{ 
                  color: '#667eea',
                  '&:hover': { 
                    background: 'rgba(102, 126, 234, 0.1)',
                    transform: 'scale(1.1)'
                  }
                }}
              >
                <Badge badgeContent={4} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Account Menu">
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                sx={{ 
                  color: '#667eea',
                  '&:hover': { 
                    background: 'rgba(102, 126, 234, 0.1)',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontSize: '0.9rem',
                      fontWeight: 600
                    }}
                  >
                    {currentUser?.email?.charAt(0).toUpperCase() || 'A'}
                  </Avatar>
                  <ArrowDownIcon sx={{ fontSize: 16 }} />
                </Box>
              </IconButton>
            </Tooltip>

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  borderRadius: 2,
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  mt: 1
                }
              }}
            >
              <MenuItem 
                onClick={handleClose}
                sx={{ 
                  px: 3,
                  py: 1.5,
                  '&:hover': { background: 'rgba(102, 126, 234, 0.05)' }
                }}
              >
                <AccountCircle sx={{ mr: 2, color: '#667eea' }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Profile
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                    {currentUser?.email}
                  </Typography>
                </Box>
              </MenuItem>
              
              <Divider />
              
              <MenuItem 
                onClick={handleLogout}
                sx={{ 
                  px: 3,
                  py: 1.5,
                  color: '#f44336',
                  '&:hover': { 
                    background: 'rgba(244, 67, 54, 0.05)',
                    color: '#d32f2f'
                  }
                }}
              >
                <LogoutIcon sx={{ mr: 2 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Logout
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              boxShadow: '20px 0 40px rgba(0, 0, 0, 0.1)'
            },
          }}
        >
          {drawer}
        </Drawer>
        
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              boxShadow: '8px 0 24px rgba(0, 0, 0, 0.05)'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          position: 'relative'
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 25% 25%, rgba(102, 126, 234, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(118, 75, 162, 0.05) 0%, transparent 50%)
            `,
            pointerEvents: 'none'
          }}
        />
        
        <Toolbar />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;