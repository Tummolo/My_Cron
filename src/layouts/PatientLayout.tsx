// src/layouts/PatientLayout.tsx
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  CssBaseline,
  Badge,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Book as BookIcon,
  Warning as WarningIcon,
  Build as BuildIcon,
  ShowChart as ShowChartIcon,
  MedicalServices as MedicalServicesIcon,
  Chat as ChatIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';

// pages
import Home from '../pages/Patient/Home';
import Educazione from '../pages/Patient/Educazione';
import Segnali from '../pages/Patient/Segnali';
import Acutizzazioni from '../pages/Patient/Acutizzazioni';
import Diario from '../pages/Patient/Diario';
import Terapia from '../pages/Patient/Terapia';
import Chat from '../pages/Patient/Chat';

// Import del logo
import logo from '../img/logo.png';

const drawerWidth = 240;

export default function PatientLayout({ user }: any) {
  const { logout } = useAuth();
  const { hasUnreadUser, markUserRead } = useChat();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Chiude il drawer alla navigazione
  useEffect(() => {
    if (mobileOpen) {
      setMobileOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/home' },
    { text: 'Educazione', icon: <BookIcon />, path: '/educazione' },
    { text: 'Segnali', icon: <WarningIcon />, path: '/segnali' },
    { text: 'Acutizzazioni', icon: <BuildIcon />, path: '/acutizzazioni' },
    { text: 'Diario', icon: <ShowChartIcon />, path: '/diario' },
    { text: 'Terapia', icon: <MedicalServicesIcon />, path: '/terapia' },
    {
      text: 'Chat',
      icon: <ChatIcon />,
      path: '/chat',
      badge: hasUnreadUser,
      action: () => { markUserRead(); navigate('/chat'); },
    },
    {
      text: 'Logout',
      icon: <LogoutIcon />,
      action: () => { logout(); navigate('/login'); },
    },
  ];

  // Contenuto del drawer
  const drawerContent = (
    <Box sx={{ width: drawerWidth, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Toolbar />
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => (item.action ? item.action() : navigate(item.path!))}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>
              {item.badge ? (
                <Badge color="error" variant="dot">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} My Cron V1.0 ® Powered by Your Health
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />

      {/* AppBar con logo */}
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            {/* Logo a sinistra */}
            <Box
              component="img"
              src={logo}
              alt="My Cron Logo"
              sx={{ height: 48, width: 'auto', mr: 1 }}
            />
            <Typography variant="h6" noWrap component="div">
              My Cron
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer lato */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Contenuto principale */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: 0,
          mt: `${theme.mixins.toolbar.minHeight}px`,
          width: '100%',
          overflowY: 'auto',
        }}
      >
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/educazione" element={<Educazione />} />
          <Route path="/segnali" element={<Segnali />} />
          <Route path="/acutizzazioni" element={<Acutizzazioni />} />
          <Route path="/diario" element={<Diario />} />
          <Route path="/terapia" element={<Terapia />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}
