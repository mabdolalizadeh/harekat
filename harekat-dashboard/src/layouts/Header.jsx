import { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Tooltip,
  Chip,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNotifications } from '../contexts/NotificationContext.jsx';
import { useThemeMode } from '../contexts/ThemeModeContext.jsx';
import { assetUrl, toPersianDigits } from '../utils/formatters.js';
import NotificationPopover from '../components/common/NotificationPopover.jsx';
import Logo from '../components/common/Logo.jsx';

// Icons
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export default function Header({ onToggleSidebar, isSidebarCollapsed, onOpenMobileDrawer, activeContext }) {
  const navigate = useNavigate();
  const { user, isPreviewMode, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { mode, toggleTheme } = useThemeMode();

  const [notifAnchor, setNotifAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);

  const handleOpenNotif = (e) => setNotifAnchor(e.currentTarget);
  const handleCloseNotif = () => setNotifAnchor(null);

  const handleOpenProfile = (e) => setProfileAnchor(e.currentTarget);
  const handleCloseProfile = () => setProfileAnchor(null);

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : (user?.phoneNumber || 'کاربر مهمان');

  return (
    <Box
      component="header"
      sx={{
        height: 64,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, md: 3 },
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: 1100,
        flexShrink: 0
      }}
    >
      {/* Right side (RTL start): Brand Logo + Toggle + Context Breadcrumb */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
        {/* Mobile menu button */}
        <IconButton
          onClick={onOpenMobileDrawer}
          size="small"
          sx={{ display: { xs: 'flex', md: 'none' }, color: '#171715' }}
          title="منوی اصلی"
        >
          <MenuIcon />
        </IconButton>

        {/* Brand Logo */}
        <Logo />

        {/* Desktop Sidebar collapse toggle */}
        <Tooltip title={isSidebarCollapsed ? 'نمایش سایدبار' : 'مخفی‌سازی سایدبار'}>
          <IconButton
            onClick={onToggleSidebar}
            size="small"
            sx={{
              display: { xs: 'none', md: 'flex' },
              color: '#6b6b63',
              backgroundColor: '#f7f5f0',
              border: '1px solid #deddd7',
              borderRadius: '10px',
              p: 0.7,
              '&:hover': { backgroundColor: '#efede7', color: '#171715' }
            }}
          >
            {isSidebarCollapsed ? <MenuIcon sx={{ fontSize: 18 }} /> : <MenuOpenIcon sx={{ fontSize: 18 }} />}
          </IconButton>
        </Tooltip>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ display: { xs: 'none', sm: 'block' }, mx: 0.5, height: 22, alignSelf: 'center', borderColor: '#deddd7' }}
        />

        {/* Active Context Breadcrumb */}
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.92rem',
              color: '#171715',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {activeContext?.title || 'داشبورد یادگیری'}
          </Typography>

          {activeContext?.subtitle && (
            <Typography
              sx={{
                display: { xs: 'none', lg: 'inline' },
                fontSize: '0.8rem',
                color: '#6b6b63',
                whiteSpace: 'nowrap'
              }}
            >
              • {activeContext.subtitle}
            </Typography>
          )}
        </Box>

        {/* Preview badge */}
        {isPreviewMode && (
          <Chip
            label="پیش‌نمایش موکاپ"
            size="small"
            sx={{
              display: { xs: 'none', md: 'inline-flex' },
              backgroundColor: '#fff8ed',
              color: '#b94410',
              border: '1px solid #ffdda8',
              fontWeight: 700,
              fontSize: '0.7rem',
              height: 22
            }}
          />
        )}
      </Box>

      {/* Left side (RTL end): Notification + Profile */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
        {/* Theme mode toggle button */}
        <Tooltip title={mode === 'dark' ? 'حالت روشن' : 'حالت تاریک'}>
          <IconButton
            onClick={toggleTheme}
            size="small"
            sx={{
              color: 'text.primary',
              backgroundColor: mode === 'dark' ? '#1e293b' : '#f7f5f0',
              border: `1px solid ${mode === 'dark' ? '#334155' : '#deddd7'}`,
              borderRadius: '12px',
              p: 0.9,
              '&:hover': { backgroundColor: mode === 'dark' ? '#334155' : '#efede7' }
            }}
          >
            {mode === 'dark' ? <LightModeOutlinedIcon sx={{ fontSize: 20, color: '#f59e0b' }} /> : <DarkModeOutlinedIcon sx={{ fontSize: 20 }} />}
          </IconButton>
        </Tooltip>

        {/* Notification bell */}
        <Tooltip title="اعلان‌ها">
          <IconButton
            onClick={handleOpenNotif}
            size="small"
            sx={{
              color: 'text.primary',
              backgroundColor: mode === 'dark' ? '#1e293b' : '#f7f5f0',
              border: `1px solid ${mode === 'dark' ? '#334155' : '#deddd7'}`,
              borderRadius: '12px',
              p: 0.9,
              '&:hover': { backgroundColor: mode === 'dark' ? '#334155' : '#efede7' }
            }}
          >
            <Badge
              badgeContent={unreadCount > 0 ? toPersianDigits(unreadCount) : 0}
              invisible={!unreadCount || unreadCount === 0}
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#f47c20',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.7rem'
                }
              }}
            >
              <NotificationsNoneOutlinedIcon sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>
        </Tooltip>

        <NotificationPopover
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={handleCloseNotif}
        />

        <Divider
          orientation="vertical"
          flexItem
          sx={{ mx: 0.5, height: 22, alignSelf: 'center', borderColor: '#deddd7' }}
        />

        {/* User Profile Trigger Button */}
        <Box
          onClick={handleOpenProfile}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            p: '4px 8px 4px 6px',
            borderRadius: '14px',
            backgroundColor: mode === 'dark' ? '#1e293b' : '#f7f5f0',
            border: `1px solid ${mode === 'dark' ? '#334155' : '#deddd7'}`,
            transition: 'background-color 0.15s ease',
            '&:hover': { backgroundColor: mode === 'dark' ? '#334155' : '#efede7' }
          }}
        >
          <Avatar
            src={assetUrl(user?.avatar)}
            alt={displayName}
            sx={{
              width: 32,
              height: 32,
              backgroundColor: '#f47c20',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700
            }}
          >
            {(user?.firstName?.[0] || 'ح')}
          </Avatar>
          <Typography
            sx={{
              display: { xs: 'none', sm: 'block' },
              fontSize: '0.84rem',
              fontWeight: 600,
              color: 'text.primary',
              maxWidth: 120,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {displayName}
          </Typography>
          <KeyboardArrowDownIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        </Box>

        {/* Profile Menu Dropdown */}
        <Menu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={handleCloseProfile}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1,
              width: 200,
              borderRadius: '16px',
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              p: 0.5
            }
          }}
        >
          <MenuItem
            onClick={() => {
              handleCloseProfile();
              navigate('/profile');
            }}
            sx={{ borderRadius: '10px', py: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: '#6b6b63' }}>
              <PersonOutlineIcon sx={{ fontSize: 19 }} />
            </ListItemIcon>
            <ListItemText primary="پروفایل کاربری" primaryTypographyProps={{ fontSize: '0.84rem', fontWeight: 600 }} />
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleCloseProfile();
              navigate('/courses');
            }}
            sx={{ borderRadius: '10px', py: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: '#6b6b63' }}>
              <AutoStoriesOutlinedIcon sx={{ fontSize: 19 }} />
            </ListItemIcon>
            <ListItemText primary="دوره‌های من" primaryTypographyProps={{ fontSize: '0.84rem', fontWeight: 600 }} />
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleCloseProfile();
              navigate('/orders');
            }}
            sx={{ borderRadius: '10px', py: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: '#6b6b63' }}>
              <ReceiptLongOutlinedIcon sx={{ fontSize: 19 }} />
            </ListItemIcon>
            <ListItemText primary="سفارشات من" primaryTypographyProps={{ fontSize: '0.84rem', fontWeight: 600 }} />
          </MenuItem>

          <Divider sx={{ my: 0.5, borderColor: '#deddd7' }} />

          <MenuItem
            onClick={() => {
              handleCloseProfile();
              logout();
              navigate('/login');
            }}
            sx={{ borderRadius: '10px', py: 1, color: '#e5484d' }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: '#e5484d' }}>
              <LogoutOutlinedIcon sx={{ fontSize: 19 }} />
            </ListItemIcon>
            <ListItemText primary="خروج از حساب" primaryTypographyProps={{ fontSize: '0.84rem', fontWeight: 700 }} />
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}
