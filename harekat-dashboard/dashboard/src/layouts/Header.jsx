import { useState } from 'react';
import { Box, Typography, IconButton, Badge, Avatar, Tooltip, Chip } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import { useNotifications } from '../contexts/NotificationContext.jsx';
import { assetUrl, toPersianDigits } from '../utils/formatters.js';
import NotificationPopover from '../components/common/NotificationPopover.jsx';

// Icons
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

export default function Header({ onToggleSidebar, isSidebarCollapsed, onOpenMobileDrawer, activeContext }) {
  const { user, isPreviewMode } = useAuth();
  const { itemCount, openCart } = useCart();
  const { unreadCount } = useNotifications();

  const [notifAnchor, setNotifAnchor] = useState(null);

  const handleOpenNotif = (e) => {
    setNotifAnchor(e.currentTarget);
  };

  const handleCloseNotif = () => {
    setNotifAnchor(null);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1.5,
        px: { xs: 1.5, md: 2.5 },
        borderBottom: '1px solid #f1f4f9'
      }}
    >
      {/* Left side: Brand + Collapse button + Context Breadcrumb */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
        {/* Mobile menu hamburger */}
        <IconButton
          onClick={onOpenMobileDrawer}
          sx={{ display: { xs: 'flex', md: 'none' }, color: '#1e293b' }}
        >
          <MenuIcon />
        </IconButton>

        {/* Brand Logo matching reference */}
        <Box
          component={NavLink}
          to="/overview"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: '#1e293b',
            gap: 0.8
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.2rem', md: '1.45rem' },
              letterSpacing: '-0.02em',
              color: '#0f172a'
            }}
          >
            حَرَکَت
          </Typography>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#f47c20'
            }}
          />
        </Box>

        {/* Sidebar collapse button matching reference '< =' */}
        <Tooltip title={isSidebarCollapsed ? 'باز کردن منو' : 'بستن منو'}>
          <IconButton
            onClick={onToggleSidebar}
            size="small"
            sx={{
              display: { xs: 'none', md: 'flex' },
              color: '#64748b',
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              p: 0.8,
              '&:hover': { backgroundColor: '#f1f5f9' }
            }}
          >
            {isSidebarCollapsed ? <MenuIcon fontSize="small" /> : <MenuOpenIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        {/* Reference Context / Active Course Breadcrumb (e.g. "Strategic Marketing - Anna Smith") */}
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b' }}>
            {activeContext?.title || 'داشبورد یادگیری و دوره‌ها'}
          </Typography>
          {activeContext?.subtitle && (
            <Typography sx={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              • {activeContext.subtitle}
            </Typography>
          )}
        </Box>

        {/* Mockup Preview Mode Indicator */}
        {isPreviewMode && (
          <Tooltip title="شما در حال مشاهده پیش‌نمایش موکاپ داشبورد هستید">
            <Chip
              icon={<VisibilityOutlinedIcon sx={{ fontSize: 14 }} />}
              label="پیش‌نمایش موکاپ (Preview Mode)"
              size="small"
              sx={{
                display: { xs: 'none', md: 'inline-flex' },
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                fontWeight: 700,
                fontSize: '0.72rem',
                borderRadius: '9999px'
              }}
            />
          </Tooltip>
        )}
      </Box>

      {/* Right side: Cart + Chat + Notification + Avatar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 1.8 } }}>
        {/* Shopping Cart Drawer Trigger */}
        <Tooltip title="سبد خرید">
          <IconButton
            onClick={openCart}
            sx={{
              color: '#475569',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              p: 1,
              '&:hover': { backgroundColor: '#f1f5f9' }
            }}
          >
            <Badge badgeContent={itemCount ? toPersianDigits(itemCount) : 0} color="secondary">
              <ShoppingBagOutlinedIcon sx={{ fontSize: 21 }} />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Chat icon with badge 15 as in Dribbble reference */}
        <Tooltip title="گفتگوها و پیام‌ها">
          <IconButton
            sx={{
              color: '#475569',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              p: 1,
              '&:hover': { backgroundColor: '#f1f5f9' }
            }}
          >
            <Badge badgeContent={toPersianDigits(15)} color="primary">
              <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 21 }} />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Notification bell with red badge 1 as in Dribbble reference */}
        <Tooltip title="اعلان‌ها">
          <IconButton
            onClick={handleOpenNotif}
            sx={{
              color: '#475569',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              p: 1,
              '&:hover': { backgroundColor: '#f1f5f9' }
            }}
          >
            <Badge badgeContent={toPersianDigits(unreadCount)} color="error">
              <NotificationsNoneOutlinedIcon sx={{ fontSize: 22 }} />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Reference Notification Popover */}
        <NotificationPopover
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={handleCloseNotif}
        />

        {/* User Profile Avatar */}
        <Box
          component={NavLink}
          to="/profile"
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <Avatar
            src={assetUrl(user?.avatar)}
            alt={user?.firstName || 'کاربر'}
            sx={{
              width: 38,
              height: 38,
              border: '2px solid #e2e8f0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
              '&:hover': { transform: 'scale(1.05)' }
            }}
          >
            {(user?.firstName?.[0] || 'ح')}
          </Avatar>
        </Box>
      </Box>
    </Box>
  );
}
