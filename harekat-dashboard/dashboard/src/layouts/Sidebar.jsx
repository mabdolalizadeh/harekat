import { Box, Typography, Avatar, LinearProgress, List, ListItemButton, ListItemIcon, ListItemText, Divider, Chip } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { assetUrl, toPersianDigits } from '../utils/formatters.js';

// Icons
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import CardMembershipOutlinedIcon from '@mui/icons-material/CardMembershipOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MilitaryTechOutlinedIcon from '@mui/icons-material/MilitaryTechOutlined';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

export default function Sidebar({ onItemClick }) {
  const { user, rubies, studyPoints, logout } = useAuth();
  const location = useLocation();

  const enrolledCount = user?.courses?.length || 0;
  const targetPoints = 300;
  const progressPercent = Math.min(100, Math.round((studyPoints / targetPoints) * 100));

  const navGroups = [
    {
      title: 'یادگیری من',
      icon: <SchoolOutlinedIcon sx={{ fontSize: 18, color: '#64748b' }} />,
      items: [
        { label: 'داشبورد و درس‌ها', path: '/overview', icon: <DashboardOutlinedIcon /> },
        { label: 'دوره‌های من', path: '/courses', icon: <AutoStoriesOutlinedIcon />, badge: enrolledCount > 0 ? toPersianDigits(enrolledCount) : null },
        { label: 'کاوش دوره‌ها', path: '/catalog', icon: <ExploreOutlinedIcon /> }
      ]
    },
    {
      title: 'خرید و اشتراک',
      icon: <CardMembershipOutlinedIcon sx={{ fontSize: 18, color: '#64748b' }} />,
      items: [
        { label: 'پلن‌های اشتراک', path: '/subscriptions', icon: <CardMembershipOutlinedIcon /> },
        { label: 'سفارشات من', path: '/orders', icon: <ReceiptLongOutlinedIcon /> }
      ]
    },
    {
      title: 'پشتیبانی',
      icon: <HeadsetMicOutlinedIcon sx={{ fontSize: 18, color: '#64748b' }} />,
      items: [
        { label: 'سوالات متداول', path: '/faq', icon: <HelpOutlineOutlinedIcon /> },
        { label: 'پشتیبانی و تیکت', path: '/support', icon: <HeadsetMicOutlinedIcon /> }
      ]
    }
  ];

  return (
    <Box sx={{ width: 260, display: 'flex', flexDirection: 'column', height: '100%', pr: { md: 1 } }}>
      {/* Reference Design: Top User Progress Card */}
      <Box
        sx={{
          backgroundColor: '#f8fafc',
          border: '1px solid #eef2f6',
          borderRadius: '24px',
          p: 2,
          mb: 3,
          position: 'relative'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Avatar
              src={assetUrl(user?.avatar)}
              alt={user?.firstName || 'کاربر'}
              sx={{ width: 44, height: 44, border: '2px solid #ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            >
              {(user?.firstName?.[0] || 'ح')}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2 }}>
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : (user?.phoneNumber || 'دانش‌آموز')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                سطح فعال
              </Typography>
            </Box>
          </Box>

          {/* Rubies badge as in reference */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              backgroundColor: '#ede9fe',
              color: '#7c3aed',
              borderRadius: '9999px',
              px: 1,
              py: 0.3
            }}
          >
            <DiamondOutlinedIcon sx={{ fontSize: 14 }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
              {toPersianDigits(rubies)} یاقوت
            </Typography>
          </Box>
        </Box>

        {/* Milestone points & progress bar */}
        <Box sx={{ mt: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <MilitaryTechOutlinedIcon sx={{ fontSize: 16, color: '#0d9488' }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#0f766e' }}>
                {toPersianDigits(studyPoints)} امتیاز
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
              هدف {toPersianDigits(targetPoints)}
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: '#e2e8f0',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: 'linear-gradient(90deg, #10b981 0%, #0d9488 100%)'
              }
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.65rem' }}>۱۰۰</Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.65rem' }}>۲۰۰</Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.65rem' }}>۳۰۰</Typography>
          </Box>
        </Box>

        {/* "My progress >" link as in reference */}
        <Box
          component={NavLink}
          to="/profile"
          onClick={onItemClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textDecoration: 'none',
            color: '#2563eb',
            fontSize: '0.8rem',
            fontWeight: 700,
            mt: 1.5,
            pt: 1,
            borderTop: '1px dashed #e2e8f0',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          <span>پیشرفت من</span>
          <ChevronLeftIcon sx={{ fontSize: 16 }} />
        </Box>
      </Box>

      {/* Navigation list */}
      <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
        {navGroups.map((group, gIdx) => (
          <Box key={gIdx} sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, mb: 1 }}>
              {group.icon}
              <Typography
                sx={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  color: '#94a3b8',
                  textTransform: 'uppercase'
                }}
              >
                {group.title}
              </Typography>
            </Box>

            <List disablePadding>
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <ListItemButton
                    key={item.path}
                    component={NavLink}
                    to={item.path}
                    onClick={onItemClick}
                    sx={{
                      borderRadius: '14px',
                      mb: 0.5,
                      py: 0.9,
                      px: 1.8,
                      backgroundColor: isActive ? '#eff6ff' : 'transparent',
                      color: isActive ? '#2563eb' : '#475569',
                      '&:hover': {
                        backgroundColor: isActive ? '#dbeafe' : '#f8fafc',
                        color: '#2563eb'
                      }
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 32,
                        color: isActive ? '#2563eb' : '#94a3b8'
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.86rem',
                        fontWeight: isActive ? 700 : 500
                      }}
                    />
                    {item.badge && (
                      <Chip
                        label={item.badge}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          backgroundColor: isActive ? '#2563eb' : '#f1f5f9',
                          color: isActive ? '#ffffff' : '#64748b'
                        }}
                      />
                    )}
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Profile & Logout actions */}
      <Box sx={{ pt: 0.5 }}>
        <ListItemButton
          component={NavLink}
          to="/profile"
          onClick={onItemClick}
          sx={{ borderRadius: '14px', py: 0.8, px: 1.8, color: '#475569' }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: '#94a3b8' }}>
            <PersonOutlineOutlinedIcon />
          </ListItemIcon>
          <ListItemText
            primary="تنظیمات پروفایل"
            primaryTypographyProps={{ fontSize: '0.86rem', fontWeight: 500 }}
          />
        </ListItemButton>

        <ListItemButton
          onClick={() => {
            logout();
            if (onItemClick) onItemClick();
          }}
          sx={{ borderRadius: '14px', py: 0.8, px: 1.8, color: '#ef4444', '&:hover': { backgroundColor: '#fef2f2' } }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: '#ef4444' }}>
            <LogoutOutlinedIcon />
          </ListItemIcon>
          <ListItemText
            primary="خروج از حساب"
            primaryTypographyProps={{ fontSize: '0.86rem', fontWeight: 600 }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );
}
