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
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';

export default function Sidebar({ onItemClick }) {
  const { user, rubies, studyPoints, logout } = useAuth();
  const location = useLocation();

  const enrolledCount = user?.courses?.length || 0;
  const targetPoints = 300;
  const progressPercent = Math.min(100, Math.round((studyPoints / targetPoints) * 100));

  const navGroups = [
    {
      title: 'یادگیری من',
      icon: <SchoolOutlinedIcon sx={{ fontSize: 16, color: '#9b9b92' }} />,
      items: [
        { label: 'داشبورد و درس‌ها', path: '/overview', icon: <DashboardOutlinedIcon sx={{ fontSize: 20 }} /> },
        { label: 'دوره‌های من', path: '/courses', icon: <AutoStoriesOutlinedIcon sx={{ fontSize: 20 }} />, badge: enrolledCount > 0 ? toPersianDigits(enrolledCount) : null },
        { label: 'کاوش دوره‌ها', path: '/catalog', icon: <ExploreOutlinedIcon sx={{ fontSize: 20 }} /> }
      ]
    },
    {
      title: 'خرید و اشتراک',
      icon: <CardMembershipOutlinedIcon sx={{ fontSize: 16, color: '#9b9b92' }} />,
      items: [
        { label: 'پلن‌های اشتراک', path: '/subscriptions', icon: <CardMembershipOutlinedIcon sx={{ fontSize: 20 }} /> },
        { label: 'سفارشات من', path: '/orders', icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} /> }
      ]
    },
    {
      title: 'پشتیبانی',
      icon: <HeadsetMicOutlinedIcon sx={{ fontSize: 16, color: '#9b9b92' }} />,
      items: [
        { label: 'سوالات متداول', path: '/faq', icon: <HelpOutlineOutlinedIcon sx={{ fontSize: 20 }} /> },
        { label: 'پشتیبانی و تیکت', path: '/support', icon: <HeadsetMicOutlinedIcon sx={{ fontSize: 20 }} /> }
      ]
    }
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        p: 2,
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Top Student Progress Card (Warm Harekat theme) */}
      <Box
        sx={{
          backgroundColor: '#fff8ed',
          border: '1px solid #ffdda8',
          borderRadius: '18px',
          p: 1.6,
          mb: 2,
          flexShrink: 0
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              src={assetUrl(user?.avatar)}
              alt={user?.firstName || 'کاربر'}
              sx={{
                width: 40,
                height: 40,
                border: '2px solid #f47c20',
                backgroundColor: '#ffa33f',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.9rem'
              }}
            >
              {(user?.firstName?.[0] || 'ح')}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  lineHeight: 1.2,
                  color: '#171715',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : (user?.phoneNumber || 'دانش‌آموز')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#df5b13', fontWeight: 600, fontSize: '0.72rem' }}>
                دانش‌آموز فعال
              </Typography>
            </Box>
          </Box>

          {/* Rubies badge */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.4,
              backgroundColor: '#ffefd3',
              color: '#b94410',
              border: '1px solid #ffdda8',
              borderRadius: '9999px',
              px: 0.9,
              py: 0.3,
              flexShrink: 0
            }}
          >
            <DiamondOutlinedIcon sx={{ fontSize: 13, color: '#f47c20' }} />
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700 }}>
              {toPersianDigits(rubies)}
            </Typography>
          </Box>
        </Box>

        {/* Milestone points & progress bar */}
        <Box sx={{ mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <EmojiEventsOutlinedIcon sx={{ fontSize: 15, color: '#d99400' }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#171715' }}>
                {toPersianDigits(studyPoints)} امتیاز
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#72726a', fontSize: '0.7rem' }}>
              هدف {toPersianDigits(targetPoints)}
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: '#ffdda8',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: 'linear-gradient(90deg, #f47c20 0%, #df5b13 100%)'
              }
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.3 }}>
            <Typography variant="caption" sx={{ color: '#9b9b92', fontSize: '0.62rem' }}>۱۰۰</Typography>
            <Typography variant="caption" sx={{ color: '#9b9b92', fontSize: '0.62rem' }}>۲۰۰</Typography>
            <Typography variant="caption" sx={{ color: '#9b9b92', fontSize: '0.62rem' }}>۳۰۰</Typography>
          </Box>
        </Box>

        {/* "My progress >" link */}
        <Box
          component={NavLink}
          to="/profile"
          onClick={onItemClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textDecoration: 'none',
            color: '#df5b13',
            fontSize: '0.76rem',
            fontWeight: 700,
            mt: 1,
            pt: 0.8,
            borderTop: '1px dashed #ffdda8',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          <span>مشاهده پیشرفت و کارنامه</span>
          <ChevronLeftIcon sx={{ fontSize: 15 }} />
        </Box>
      </Box>

      {/* Navigation list with internal scroll so it NEVER overflows */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          pr: 0.5,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': { backgroundColor: '#deddd7', borderRadius: 2 }
        }}
      >
        {navGroups.map((group, gIdx) => (
          <Box key={gIdx} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, px: 1, mb: 0.6 }}>
              {group.icon}
              <Typography
                sx={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  color: '#9b9b92'
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
                      borderRadius: '12px',
                      mb: 0.4,
                      py: 0.8,
                      px: 1.4,
                      backgroundColor: isActive ? '#fff8ed' : 'transparent',
                      color: isActive ? '#f47c20' : '#55554f',
                      borderRight: isActive ? '3px solid #f47c20' : '3px solid transparent',
                      '&:hover': {
                        backgroundColor: isActive ? '#fff8ed' : '#f7f5f0',
                        color: isActive ? '#df5b13' : '#171715'
                      }
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 32,
                        color: isActive ? '#f47c20' : '#72726a'
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.84rem',
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
                          backgroundColor: isActive ? '#f47c20' : '#deddd7',
                          color: isActive ? '#ffffff' : '#55554f',
                          fontWeight: 700
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

      {/* Pinned Footer: Profile settings + Logout */}
      <Box sx={{ pt: 1, borderTop: '1px solid #deddd7', flexShrink: 0 }}>
        <ListItemButton
          component={NavLink}
          to="/profile"
          onClick={onItemClick}
          sx={{
            borderRadius: '12px',
            py: 0.7,
            px: 1.4,
            color: '#55554f',
            '&:hover': { backgroundColor: '#f7f5f0', color: '#171715' }
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: '#72726a' }}>
            <PersonOutlineOutlinedIcon sx={{ fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText
            primary="تنظیمات پروفایل"
            primaryTypographyProps={{ fontSize: '0.84rem', fontWeight: 500 }}
          />
        </ListItemButton>

        <ListItemButton
          onClick={() => {
            logout();
            if (onItemClick) onItemClick();
          }}
          sx={{
            borderRadius: '12px',
            py: 0.7,
            px: 1.4,
            color: '#e5484d',
            '&:hover': { backgroundColor: '#fff5f5' }
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: '#e5484d' }}>
            <LogoutOutlinedIcon sx={{ fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText
            primary="خروج از حساب"
            primaryTypographyProps={{ fontSize: '0.84rem', fontWeight: 700 }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );
}
