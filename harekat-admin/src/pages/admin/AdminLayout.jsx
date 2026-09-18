import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, IconButton, Avatar, Chip, Stack, Tooltip, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Bolt as BoltIcon,
  Workspaces as WorkspacesIcon,
  Category as CategoryIcon,
  LocalOffer as TicketIcon,
  Menu as MenuIcon,
  Article as ArticleIcon,
  People as PeopleIcon,
  Campaign as CampaignIcon,
  Image as ImageIcon,
  Logout as LogoutIcon,
  OpenInNew as ExternalLinkIcon,
  CreditCard as CreditCardIcon,
  LightMode as SunIcon,
  DarkMode as MoonIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  SupervisorAccount as TAIcon,
  ShoppingCart as CartIcon,
  Payment as PaymentIcon,
  LiveHelp as HelpIcon,
  Quiz as ExamIcon,
  WorkspacePremium as LicenseIcon,
  Group as StudentsIcon
} from '@mui/icons-material';
import { adminLogout, isAdminLoggedIn, isTA, getAdminUser } from '../../services/api.js';

const SUPER_ADMIN_NAV = [
  { to: '/', end: true, label: 'داشبورد', icon: DashboardIcon },
  { to: '/students', label: 'دانشجویان و دسترسی‌ها', icon: StudentsIcon },
  { to: '/courses', label: 'دوره‌ها', icon: SchoolIcon },
  { to: '/capsules', label: 'دوره‌های کپسولی', icon: BoltIcon },
  { to: '/packages', label: 'پکیج‌های مهارتی', icon: WorkspacesIcon },
  { to: '/subscriptions', label: 'اشتراک‌ها', icon: CreditCardIcon },
  { to: '/orders', label: 'سفارش‌ها', icon: CartIcon },
  { to: '/payments', label: 'پرداخت‌ها', icon: PaymentIcon },
  { to: '/tickets', label: 'تیکت‌های پشتیبانی', icon: HelpIcon },
  { to: '/exams', label: 'آزمون‌ها و نمرات', icon: ExamIcon },
  { to: '/licenses', label: 'مدارک و گواهینامه‌ها', icon: LicenseIcon },
  { to: '/tas', label: 'دستیاران آموزشی (TAs)', icon: TAIcon },
  { to: '/categories', label: 'دسته‌بندی‌ها', icon: CategoryIcon },
  { to: '/teachers', label: 'مدرسان', icon: PeopleIcon },
  { to: '/coupons', label: 'کدهای تخفیف', icon: TicketIcon },
  { to: '/marquee', label: 'نوار متحرک', icon: CampaignIcon },
  { to: '/banners', label: 'بنرهای صفحه اصلی', icon: ImageIcon },
  { to: '/header', label: 'مدیریت سربرگ', icon: MenuIcon },
  { to: '/content', label: 'محتوای سایت', icon: ArticleIcon },
  { to: '/settings', label: 'تنظیمات حساب', icon: SettingsIcon },
];

const TA_NAV = [
  { to: '/', end: true, label: 'داشبورد', icon: DashboardIcon },
  { to: '/courses', label: 'دوره‌های اختصاص‌یافته من', icon: SchoolIcon },
  { to: '/tickets', label: 'تیکت‌های دوره‌های من', icon: HelpIcon },
  { to: '/exams', label: 'آزمون‌ها و ثبت نمره', icon: ExamIcon },
  { to: '/licenses', label: 'گواهینامه‌های دوره‌ها', icon: LicenseIcon },
  { to: '/settings', label: 'تنظیمات حساب', icon: SettingsIcon },
];

const SITE_URL = import.meta.env?.VITE_SITE_URL || 'http://localhost:5173';
const DRAWER_W = 272;

function SidebarContent({ onClose, onLogout, activePath, mobile }) {
  const ta = isTA();
  const navItems = ta ? TA_NAV : SUPER_ADMIN_NAV;
  const adminUser = getAdminUser();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', py: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 2 }}>
        <Box component="img" src="/favicon.svg" alt="حرکت" sx={{ width: 40, height: 40, borderRadius: 2.5, flexShrink: 0 }} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: 15, lineHeight: 1.2 }} noWrap>پنل مدیریت مدرسه حرکت</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
            {ta ? 'دستیار آموزشی (TA)' : 'مدیر ارشد سیستم'}
          </Typography>
        </Box>
        {mobile && (
          <IconButton size="small" onClick={onClose} sx={{ ml: 'auto' }}><CloseIcon fontSize="small" /></IconButton>
        )}
      </Box>

      <Typography variant="caption" sx={{ px: 2.5, pt: 1, pb: 1, color: 'text.secondary', letterSpacing: 0.6, fontWeight: 700, fontSize: 11 }}>
        منوی اصلی
      </Typography>

      <List dense sx={{ px: 1.5, flex: 1, overflowY: 'auto' }}>
        {navItems.map(({ to, end, label, icon: Icon }) => {
          const isActive = end ? activePath === '/' : activePath.startsWith(to);
          return (
            <ListItemButton
              key={to}
              component={NavLink}
              to={to}
              onClick={onClose}
              selected={isActive}
              sx={{
                borderRadius: 2,
                mb: 0.4,
                py: 1.1,
                '&.Mui-selected': { bgcolor: 'primary.main', color: 'primary.contrastText', '& .MuiListItemIcon-root': { color: 'primary.contrastText' }, '&:hover': { bgcolor: 'primary.dark' } },
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: isActive ? 'inherit' : 'text.secondary' }}><Icon fontSize="small" /></ListItemIcon>
              <ListItemText primary={label} slotProps={{ primary: { sx: { fontSize: 13.5, fontWeight: isActive ? 700 : 500 } } }} />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ mx: 2, my: 1 }} />
      <Box sx={{ px: 1.5, pb: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <ListItemButton component="a" href={SITE_URL} target="_blank" rel="noreferrer" sx={{ borderRadius: 2, py: 1 }}>
          <ListItemIcon sx={{ minWidth: 36 }}><ExternalLinkIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="مشاهده سایت" slotProps={{ primary: { sx: { fontSize: 13 } } }} />
        </ListItemButton>
        <ListItemButton onClick={onLogout} sx={{ borderRadius: 2, py: 1, color: 'error.main', '&:hover': { bgcolor: 'rgba(229,72,77,0.08)' } }}>
          <ListItemIcon sx={{ minWidth: 36, color: 'error.main' }}><LogoutIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="خروج از حساب" slotProps={{ primary: { sx: { fontSize: 13, fontWeight: 600 } } }} />
        </ListItemButton>
      </Box>
    </Box>
  );
}

export default function AdminLayout({ mode, onToggleTheme }) {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    adminLogout();
    navigate('/login', { replace: true });
  };

  const ta = isTA();
  const allNav = [...SUPER_ADMIN_NAV, ...TA_NAV];
  const active = allNav.find((n) => n.end ? location.pathname === '/' : location.pathname.startsWith(n.to));
  const adminUser = getAdminUser();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }} dir="rtl">
      {/* Desktop drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? open : true}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: DRAWER_W,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_W,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderLeft: isMobile ? 0 : `1px solid ${theme.palette.divider}`,
            borderRight: 0,
          },
        }}
      >
        <SidebarContent onClose={() => setOpen(false)} onLogout={logout} activePath={location.pathname} mobile={isMobile} />
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="sticky" elevation={0} sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
          <Toolbar sx={{ gap: 1.5, minHeight: { xs: 60, md: 68 } }}>
            {isMobile && (
              <IconButton edge="start" onClick={() => setOpen(true)} sx={{ mr: 0.5 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontSize: 13 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>پنل مدیریت</Typography>
              <Typography color="divider" sx={{ fontWeight: 300 }}>/</Typography>
              <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: 13 }}>{active?.label ?? 'داشبورد'}</Typography>
            </Box>
            <Box sx={{ flex: 1 }} />
            <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}>
              <Tooltip title={mode === 'dark' ? 'حالت روشن' : 'حالت تاریک'}>
                <IconButton
                  onClick={onToggleTheme}
                  size="small"
                  sx={{ width: 36, height: 36, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.default' }}
                >
                  {mode === 'dark' ? <SunIcon fontSize="small" /> : <MoonIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
              <Chip
                label={adminUser?.name || (ta ? 'دستیار آموزشی' : 'مدیر سیستم')}
                avatar={
                  <Avatar sx={{ bgcolor: ta ? 'secondary.main' : 'primary.main', width: 28, height: 28, fontSize: 12 }}>
                    {adminUser?.username?.[0]?.toUpperCase() || (ta ? 'T' : 'A')}
                  </Avatar>
                }
                variant="outlined"
                sx={{ pl: 0.5, pr: 1, height: 34, bgcolor: 'background.paper' }}
              />
            </Stack>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flex: 1, p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1280, width: '100%', mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
