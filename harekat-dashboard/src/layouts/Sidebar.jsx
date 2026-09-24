import { Box, Typography, Avatar, LinearProgress, List, ListItemButton, ListItemIcon, ListItemText, Divider, Chip } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useThemeMode } from '../contexts/ThemeModeContext.jsx';
import { assetUrl, toPersianDigits } from '../utils/formatters.js';
import { getLandingUrl } from '../utils/landingUrl.js';

// Icons
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import CardMembershipOutlinedIcon from '@mui/icons-material/CardMembershipOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import AnimatedNumber from '../components/ui/AnimatedNumber.jsx';

export default function Sidebar({ onItemClick }) {
  const { user, rubies, studyPoints, logout } = useAuth();
  const { mode } = useThemeMode();
  const location = useLocation();

  const isDark = mode === 'dark';
  const enrolledCount = user?.courses?.length || 0;
  const targetPoints = 300;
  const progressPercent = Math.min(100, Math.round((studyPoints / targetPoints) * 100));

  // The 7 canonical Student Panel Navigation Items
  const studentNavItems = [
    { label: 'داشبورد', path: '/overview', icon: <DashboardOutlinedIcon sx={{ fontSize: 20 }} /> },
    { label: 'حساب کاربری', path: '/profile', icon: <PersonOutlineOutlinedIcon sx={{ fontSize: 20 }} /> },
    { label: 'دوره‌های من', path: '/courses', icon: <AutoStoriesOutlinedIcon sx={{ fontSize: 20 }} />, badge: enrolledCount > 0 ? toPersianDigits(enrolledCount) : null },
    { label: 'تیکت‌های پشتیبانی', path: '/tickets', icon: <HeadsetMicOutlinedIcon sx={{ fontSize: 20 }} /> },
    { label: 'پکیج‌های من', path: '/packages', icon: <SchoolOutlinedIcon sx={{ fontSize: 20 }} /> },
    { label: 'پلن‌های اشتراک', path: '/subscriptions', icon: <CardMembershipOutlinedIcon sx={{ fontSize: 20 }} /> },
    { label: 'پرداخت‌ها', path: '/payments', icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} /> }
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        p: 2,
        backgroundColor: 'background.paper',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Top Student Progress Card */}
      <Box
        sx={{
          backgroundColor: isDark ? '#1e293b' : '#fff8ed',
          border: '1px solid',
          borderColor: isDark ? '#334155' : '#ffdda8',
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
                color: '#ffffff'
              }}
            >
              <PersonOutlineIcon sx={{ fontSize: 22 }} />
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  lineHeight: 1.2,
                  color: 'text.primary',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : (user?.phoneNumber || 'دانش‌آموز')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#f47c20', fontWeight: 600, fontSize: '0.72rem' }}>
                دانش‌آموز فعال
              </Typography>
            </Box>
          </Box>

          {/* Rubies badge */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              backgroundColor: isDark ? '#334155' : '#ffefd3',
              color: isDark ? '#fed7aa' : '#b94410',
              border: '1px solid',
              borderColor: isDark ? '#475569' : '#ffdda8',
              borderRadius: '9999px',
              px: 1,
              py: 0.3,
              flexShrink: 0
            }}
          >
            <DiamondOutlinedIcon sx={{ fontSize: 13, color: '#f47c20' }} />
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700 }}>
              <AnimatedNumber value={rubies} /> یاقوت
            </Typography>
          </Box>
        </Box>

        {/* Milestone points & progress bar */}
        <Box sx={{ mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <EmojiEventsOutlinedIcon sx={{ fontSize: 15, color: '#d99400' }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.primary' }}>
                <AnimatedNumber value={studyPoints} /> امتیاز
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
              هدف {toPersianDigits(targetPoints)}
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: isDark ? '#334155' : '#ffdda8',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: 'linear-gradient(90deg, #f47c20 0%, #df5b13 100%)'
              }
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.3 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.62rem' }}>۱۰۰</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.62rem' }}>۲۰۰</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.62rem' }}>۳۰۰</Typography>
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
            color: '#f47c20',
            fontSize: '0.76rem',
            fontWeight: 700,
            mt: 1,
            pt: 0.8,
            borderTop: '1px dashed',
            borderColor: isDark ? '#334155' : '#ffdda8',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          <span>مشاهده حساب و اشتراک</span>
          <ChevronLeftIcon sx={{ fontSize: 15 }} />
        </Box>
      </Box>

      {/* Main Student Panel Navigation List */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          pr: 0.5,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': { backgroundColor: isDark ? '#334155' : '#deddd7', borderRadius: 2 }
        }}
      >
        <List disablePadding sx={{ mb: 2 }}>
          {studentNavItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path === '/tickets' && location.pathname === '/support') ||
              (item.path === '/payments' && location.pathname === '/orders');

            return (
              <Box key={item.path} sx={{ position: 'relative', mb: 0.5 }}>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  onClick={onItemClick}
                  sx={{
                    position: 'relative',
                    borderRadius: '12px',
                    py: 1,
                    px: 1.5,
                    backgroundColor: isActive ? (isDark ? 'rgba(244, 124, 32, 0.12)' : '#fff8ed') : 'transparent',
                    color: isActive ? '#f47c20' : 'text.primary',
                    transition: 'background-color 0.2s ease, color 0.2s ease',
                    zIndex: 2,
                    '&:hover': {
                      backgroundColor: isActive
                        ? (isDark ? 'rgba(244, 124, 32, 0.18)' : '#fff3e0')
                        : (isDark ? 'rgba(255, 255, 255, 0.04)' : '#f7f5f0'),
                      color: isActive ? '#df5b13' : 'text.primary',
                      transform: 'translateX(-2px)',
                    },
                  }}
                >
                  {/* Subtle active pill indicator on the right edge */}
                  {isActive && (
                    <Box
                      sx={{
                        position: 'absolute',
                        right: 0,
                        top: '18%',
                        bottom: '18%',
                        width: 3.5,
                        borderRadius: '0 4px 4px 0',
                        bgcolor: 'primary.main',
                      }}
                    />
                  )}

                  <ListItemIcon
                    sx={{
                      minWidth: 34,
                      color: isActive ? '#f47c20' : 'text.secondary',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.86rem',
                      fontWeight: isActive ? 700 : 500,
                      letterSpacing: '-0.01em',
                    }}
                  />
                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        backgroundColor: isActive ? '#f47c20' : (isDark ? '#334155' : '#deddd7'),
                        color: isActive ? '#ffffff' : (isDark ? '#cbd5e1' : '#55554f'),
                        fontWeight: 700,
                      }}
                    />
                  )}
                </ListItemButton>
              </Box>
            );
          })}
        </List>
      </Box>

      {/* Pinned Footer: Landing Link & Logout */}
      <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <ListItemButton
          component="a"
          href={getLandingUrl('/')}
          sx={{
            borderRadius: '12px',
            py: 0.7,
            px: 1.4,
            mb: 0.5,
            color: 'text.secondary',
            textDecoration: 'none',
            '&:hover': {
              backgroundColor: isDark ? '#1e293b' : '#f7f5f0',
              color: 'text.primary',
              textDecoration: 'none'
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
            <LanguageOutlinedIcon sx={{ fontSize: 19 }} />
          </ListItemIcon>
          <ListItemText
            primary="مشاهده وب‌سایت"
            primaryTypographyProps={{ fontSize: '0.84rem', fontWeight: 600 }}
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
            '&:hover': { backgroundColor: isDark ? 'rgba(229, 72, 77, 0.1)' : '#fff5f5' }
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: '#e5484d' }}>
            <LogoutOutlinedIcon sx={{ fontSize: 19 }} />
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
