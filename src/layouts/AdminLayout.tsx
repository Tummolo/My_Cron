import React from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  CssBaseline,
  Badge
} from '@mui/material'
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  Chat as ChatIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../contexts/ChatContext'

// pagine admin
import AdminPanel       from '../pages/Admin/AdminPanel'
import GestionePazienti from '../pages/Admin/GestionePazienti'
import Statistiche      from '../pages/Admin/Statistiche'
import Impostazioni     from '../pages/Admin/Impostazioni'
import ChatAdmin        from '../pages/Admin/ChatAdmin'

// logo
import logo from '../img/logo.png'

const drawerWidth = 240

const menuItems = [
  { text:'Dashboard',         icon:<HomeIcon/>,    path:'/'                  },
  { text:'Gestione Pazienti', icon:<PeopleIcon/>,  path:'/gestione-pazienti' },
  { text:'Statistiche',       icon:<BarChartIcon/>,path:'/statistiche'      },
  { text:'Chat',              icon:<ChatIcon/>,    path:'/chat'             },
  { text:'Impostazioni',      icon:<SettingsIcon/>,path:'/impostazioni'     }
] as const

export default function AdminLayout({ user }: any) {
  const { logout }                        = useAuth()
  const { hasUnreadAdmin, markAdminRead } = useChat()
  const [mobileOpen, setMobileOpen]       = React.useState(false)
  const location                          = useLocation()

  const toggleDrawer = () => setMobileOpen(v => !v)

  return (
    <Box sx={{ display:'flex' }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar position="fixed" sx={{ ml:{ sm:`${drawerWidth}px` } }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr:2, display:{ sm:'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display:'flex', alignItems:'center', flexGrow: 1 }}>
            <Box
              component="img"
              src={logo}
              alt="My Cron Logo"
              sx={{ height: 48, width: 'auto', mr: 1 }}
            />
            <Typography variant="h6" noWrap>
              My Cron (Admin)
            </Typography>
          </Box>

          <Typography>Admin</Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted:true }}
        sx={{
          display:{ xs:'block', sm:'none' },
          '& .MuiDrawer-paper':{ width:drawerWidth }
        }}
      >
        {renderDrawer()}
      </Drawer>

      {/* Drawer desktop */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display:{ xs:'none', sm:'block' },
          '& .MuiDrawer-paper':{ width:drawerWidth }
        }}
      >
        {renderDrawer()}
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow:1, p:3, ml:{ sm:`${drawerWidth}px` } }}>
        <Toolbar/>
        <Routes>
          <Route path="/"                   element={<AdminPanel/>} />
          <Route path="/gestione-pazienti" element={<GestionePazienti/>} />
          <Route path="/statistiche"       element={<Statistiche/>} />
          <Route path="/chat"               element={<ChatAdmin/>} />
          <Route path="/impostazioni"       element={<Impostazioni/>} />
        </Routes>
      </Box>
    </Box>
  )

  function renderDrawer() {
    return (
      <Box sx={{ textAlign:'center', display:'flex', flexDirection:'column', height:'100%' }}>
        <Box sx={{ py:2 }}>
          <Box
            component="img"
            src={logo}
            alt="My Cron Logo"
            sx={{ height: 48, width: 'auto', mb: 1 }}
          />
          <Typography variant="h5">My Cron</Typography>
        </Box>
        <List sx={{ flexGrow:1 }}>
          {menuItems.map(m => {
            const selected = location.pathname === m.path
            return (
              <ListItemButton
                key={m.text}
                component={Link}
                to={m.path}
                selected={selected}
                onClick={() => m.text === 'Chat' && markAdminRead()}
              >
                <ListItemIcon>
                  {m.text === 'Chat'
                    ? <Badge variant="dot" color="error" invisible={!hasUnreadAdmin}>{m.icon}</Badge>
                    : m.icon
                  }
                </ListItemIcon>
                <ListItemText primary={m.text} />
              </ListItemButton>
            )
          })}
          <ListItemButton onClick={logout}>
            <ListItemIcon><LogoutIcon/></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>
        <Box sx={{ p:2, borderTop:'1px solid', borderColor:'divider' }}>
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} My Cron V1.0 ®
          </Typography>
        </Box>
      </Box>
    )
  }
}
