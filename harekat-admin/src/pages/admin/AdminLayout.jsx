import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Avatar,
  Chip,
  Stack,
  Tooltip,
  useMediaQuery,
  Menu,
  MenuItem,
  Breadcrumbs,
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
  Settings as SettingsIcon,
  SupervisorAccount as TAIcon,
  ShoppingCart as CartIcon,
  Payment as PaymentIcon,
  LiveHelp as HelpIcon,
  Quiz as ExamIcon,
  WorkspacePremium as LicenseIcon,
  Group as StudentsIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { adminLogout, isTA, getAdminUser } from '../../services/api.js';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';

const SUPER_ADMIN_GROUPS = [
  {
    title: 'نمای کلی',
    items: [
      { to: '/', end: true, label: 'داشبورد', icon: DashboardIcon },
    ],
  },
  {
    title: 'آموزش و محتوا',
    items: [
      { to: '/courses', label: 'دوره‌ها', icon: SchoolIcon },
      { to: '/capsules', label: 'دوره‌های کپسولی', icon: BoltIcon },
      { to: '/packages', label: 'پکیج‌های مهارتی', icon: WorkspacesIcon },
      { to: '/categories', label: 'دسته‌بندی‌ها', icon: CategoryIcon },
      { to: '/teachers', label: 'اساتید و مدرسان', icon: PeopleIcon },
      { to: '/exams', label: 'آزمون‌ها و نمرات', icon: ExamIcon },
      { to: '/licenses', label: 'مدارک و گواهینامه‌ها', icon: LicenseIcon },
    ],
  },
  {
    title: 'کاربران و پشتیبانی',
    items: [
      { to: '/students', label: 'دانشجویان و دسترسی‌ها', icon: StudentsIcon },
      { to: '/tickets', label: 'تیکت‌های پشتیبانی', icon: HelpIcon },
      { to: '/tas', label: 'دستیاران آموزشی (TAs)', icon: TAIcon },
    ],
  },
  {
    title: 'فروش و مالی',
    items: [
      { to: '/subscriptions', label: 'پلن‌های اشتراک', icon: CreditCardIcon },
      { to: '/orders', label: 'سفارش‌ها', icon: CartIcon },
      { to: '/payments', label: 'پرداخت‌ها و تراکنش‌ها', icon: PaymentIcon },
      { to: '/coupons', label: 'کدهای تخفیف', icon: TicketIcon },
    ],
  },
  {
    title: 'مدیریت وب‌سایت',
    items: [
      { to: '/banners', label: 'بنرهای صفحه اصلی', icon: ImageIcon },
      { to: '/marquee', label: 'نوار متحرک (مارکی)', icon: CampaignIcon },
      { to: '/header', label: 'منوی سربرگ', icon: MenuIcon },
      { to: '/content', label: 'بلوک‌های محتوا', icon: ArticleIcon },
    ],
  },
  {
    title: 'سیستم',
    items: [
      { to: '/settings', label: 'تنظیمات حساب', icon: SettingsIcon },
    ],
  },
];

const TA_GROUPS = [
  {
    title: 'نمای کلی',
    items: [
      { to: '/', end: true, label: 'داشبورد', icon: DashboardIcon },
    ],
  },
  {
    title: 'آموزش و آزمون',
    items: [
      { to: '/courses', label: 'دوره‌های من', icon: SchoolIcon },
      { to: '/tickets', label: 'تیکت‌های دوره‌های من', icon: HelpIcon },
      { to: '/exams', label: 'آزمون‌ها و ثبت نمره', icon: ExamIcon },
      { to: '/licenses', label: 'گواهینامه‌های دوره‌ها', icon: LicenseIcon },
    ],
  },
  {
    title: 'سیستم',
    items: [
      { to: '/settings', label: 'تنظیمات حساب', icon: SettingsIcon },
    ],
  },
];

const SITE_URL = import.meta.env?.VITE_SITE_URL || 'http://localhost:5173';
const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 76;

function NavigationContent({ collapsed, onClose, activePath, onLogoutConfirm }) {
  const ta = isTA();
  const groups = ta ? TA_GROUPS : SUPER_ADMIN_GROUPS;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', py: 1.5 }}>
      {/* Brand Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: collapsed ? 1.5 : 2.5,
          py: 1,
          mb: 1,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <Box
          component="img"
          src="/favicon.svg"
          alt="حرکت"
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        />
        {!collapsed && (
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: '0.9375rem',
                lineHeight: 1.25,
                color: 'text.primary',
                letterSpacing: '-0.02em',
              }}
              noWrap
            >
              مدرسه حرکت
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: '0.725rem', fontWeight: 500 }}
              noWrap
            >
              {ta ? 'پنل دستیار آموزشی' : 'پنل مدیریت سامانه'}
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ mx: 2, mb: 1.5 }} />

      {/* Nav groups list */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: collapsed ? 1 : 1.5 }}>
        {groups.map((group, gIdx) => (
          <Box key={group.title} sx={{ mb: 2 }}>
            {!collapsed ? (
              <Typography
                variant="overline"
                color="text.disabled"
                sx={{
                  px: 1.5,
                  display: 'block',
                  mb: 0.5,
                  fontWeight: 700,
                  fontSize: '0.675rem',
                  letterSpacing: '0.04em',
                }}
              >
                {group.title}
              </Typography>
            ) : gIdx > 0 ? (
              <Divider sx={{ my: 1 }} />
            ) : null}

            <List dense disablePadding>
              {group.items.map(({ to, end, label, icon: Icon }) => {
                const isActive = end ? activePath === '/' : activePath.startsWith(to);

                const itemBtn = (
                  <ListItemButton
                    component={NavLink}
                    to={to}
                    onClick={onClose}
                    selected={isActive}
                    sx={{
                      borderRadius: 2,
                      mb: 0.4,
                      py: 1,
                      px: collapsed ? 1.5 : 1.75,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      transition: 'all 0.15s ease-in-out',
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        '& .MuiListItemIcon-root': {
                          color: 'primary.contrastText',
                        },
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                      },
                      '&:hover:not(.Mui-selected)': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: collapsed ? 0 : 34,
                        color: isActive ? 'inherit' : 'text.secondary',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={label}
                        slotProps={{
                          primary: {
                            sx: {
                              fontSize: '0.84rem',
                              fontWeight: isActive ? 700 : 500,
                              lineHeight: 1.4,
                            },
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={to} title={label} placement="left" arrow>
                      {itemBtn}
                    </Tooltip>
                  );
                }

                return <Box key={to}>{itemBtn}</Box>;
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Footer Actions */}
      <Divider sx={{ mx: 2, my: 1 }} />
      <Box sx={{ px: collapsed ? 1 : 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {collapsed ? (
          <Tooltip title="مشاهده وب‌سایت" placement="left" arrow>
            <ListItemButton
              component="a"
              href={SITE_URL}
              target="_blank"
              rel="noreferrer"
              sx={{ borderRadius: 2, py: 1, justifyContent: 'center' }}
            >
              <ListItemIcon sx={{ minWidth: 0, color: 'text.secondary' }}>
                <ExternalLinkIcon sx={{ fontSize: 20 }} />
              </ListItemIcon>
            </ListItemButton>
          </Tooltip>
        ) : (
          <ListItemButton
            component="a"
            href={SITE_URL}
            target="_blank"
            rel="noreferrer"
            sx={{ borderRadius: 2, py: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 34, color: 'text.secondary' }}>
              <ExternalLinkIcon sx={{ fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText
              primary="مشاهده وب‌سایت"
              slotProps={{ primary: { sx: { fontSize: '0.8125rem' } } }}
            />
          </ListItemButton>
        )}

        {collapsed ? (
          <Tooltip title="خروج از حساب" placement="left" arrow>
            <ListItemButton
              onClick={onLogoutConfirm}
              sx={{
                borderRadius: 2,
                py: 1,
                justifyContent: 'center',
                color: 'error.main',
                '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.08)' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, color: 'error.main' }}>
                <LogoutIcon sx={{ fontSize: 20 }} />
              </ListItemIcon>
            </ListItemButton>
          </Tooltip>
        ) : (
          <ListItemButton
            onClick={onLogoutConfirm}
            sx={{
              borderRadius: 2,
              py: 1,
              color: 'error.main',
              '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.08)' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 34, color: 'error.main' }}>
              <LogoutIcon sx={{ fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText
              primary="خروج از حساب"
              slotProps={{ primary: { sx: { fontSize: '0.8125rem', fontWeight: 600 } } }}
            />
          </ListItemButton>
        )}
      </Box>
    </Box>
  );
}

export default function AdminLayout({ mode, onToggleTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('adminSidebarCollapsed') === 'true';
  });
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const location = useLocation();
  const navigate = useNavigate();

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('adminSidebarCollapsed', String(next));
      return next;
    });
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/login', { replace: true });
  };

  const ta = isTA();
  const allGroups = ta ? TA_GROUPS : SUPER_ADMIN_GROUPS;

  let currentNav = { item: { label: 'داشبورد' }, group: { title: 'نمای کلی' } };
  for (const group of allGroups) {
    for (const item of group.items) {
      if (item.end ? location.pathname === '/' : location.pathname.startsWith(item.to)) {
        currentNav = { item, group };
        break;
      }
    }
  }

  const adminUser = getAdminUser();
  const drawerWidth = collapsed && !isMobile ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }} dir="rtl">
      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderLeft: isMobile ? 0 : `1px solid ${theme.palette.divider}`,
            borderRight: 0,
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        <NavigationContent
          collapsed={collapsed && !isMobile}
          onClose={() => setMobileOpen(false)}
          activePath={location.pathname}
          onLogoutConfirm={() => setLogoutModalOpen(true)}
        />
      </Drawer>

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {/* Top Header */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            zIndex: (t) => t.zIndex.drawer + 1,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar sx={{ gap: 1.5, minHeight: { xs: 60, md: 64 }, px: { xs: 2, sm: 3 } }}>
            {isMobile ? (
              <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ color: 'text.secondary' }}>
                <MenuIcon />
              </IconButton>
            ) : (
              <IconButton
                edge="start"
                onClick={toggleCollapsed}
                sx={{
                  color: 'text.secondary',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 0.75,
                }}
                title={collapsed ? 'گسترش منو' : 'جمع کردن منو'}
              >
                {collapsed ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
              </IconButton>
            )}

            {/* Breadcrumb Info */}
            <Breadcrumbs
              separator={<Typography color="text.disabled" sx={{ fontSize: 13, mx: 0.5 }}>/</Typography>}
              sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                {currentNav.group?.title || 'پنل مدیریت'}
              </Typography>
              <Typography
                variant="body2"
                color="text.primary"
                sx={{ fontSize: '0.8125rem', fontWeight: 700 }}
              >
                {currentNav.item?.label || 'صفحه جاری'}
              </Typography>
            </Breadcrumbs>

            <Box sx={{ flex: 1 }} />

            {/* Header Right Actions */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title={mode === 'dark' ? 'حالت روشن' : 'حالت تاریک'}>
                <IconButton
                  onClick={onToggleTheme}
                  size="small"
                  sx={{
                    width: 36,
                    height: 36,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    color: 'text.secondary',
                    borderRadius: 2,
                  }}
                >
                  {mode === 'dark' ? <SunIcon fontSize="small" /> : <MoonIcon fontSize="small" />}
                </IconButton>
              </Tooltip>

              <Tooltip title="مشاهده وب‌سایت">
                <IconButton
                  component="a"
                  href={SITE_URL}
                  target="_blank"
                  rel="noreferrer"
                  size="small"
                  sx={{
                    width: 36,
                    height: 36,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    color: 'text.secondary',
                    borderRadius: 2,
                    display: { xs: 'none', sm: 'inline-flex' },
                  }}
                >
                  <ExternalLinkIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {/* User Profile Pill & Dropdown */}
              <Box>
                <Chip
                  onClick={(e) => setProfileAnchorEl(e.currentTarget)}
                  avatar={
                    <Avatar
                      sx={{
                        bgcolor: ta ? 'secondary.main' : 'primary.main',
                        width: 28,
                        height: 28,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {adminUser?.username?.[0]?.toUpperCase() || (ta ? 'T' : 'A')}
                    </Avatar>
                  }
                  label={adminUser?.name || adminUser?.username || (ta ? 'دستیار آموزشی' : 'مدیر سیستم')}
                  variant="outlined"
                  clickable
                  sx={{
                    height: 36,
                    borderRadius: 2,
                    pl: 0.5,
                    pr: 1.25,
                    bgcolor: 'background.paper',
                    borderColor: 'divider',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                />

                <Menu
                  anchorEl={profileAnchorEl}
                  open={Boolean(profileAnchorEl)}
                  onClose={() => setProfileAnchorEl(null)}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  PaperProps={{
                    sx: {
                      width: 220,
                      mt: 1,
                      p: 0.5,
                    },
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="body2" fontWeight={700} noWrap>
                      {adminUser?.name || adminUser?.username || 'مدیر سیستم'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" dir="ltr" display="block">
                      @{adminUser?.username || 'admin'}
                    </Typography>
                    <Chip
                      size="small"
                      label={ta ? 'دستیار آموزشی' : 'مدیر ارشد'}
                      color={ta ? 'secondary' : 'primary'}
                      variant="filled"
                      sx={{ mt: 1, height: 20, fontSize: '0.675rem' }}
                    />
                  </Box>
                  <Divider sx={{ my: 0.5 }} />
                  <MenuItem
                    onClick={() => {
                      setProfileAnchorEl(null);
                      navigate('/settings');
                    }}
                    sx={{ borderRadius: 1.5, py: 1, gap: 1.5 }}
                  >
                    <SettingsIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2">تنظیمات حساب</Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setProfileAnchorEl(null);
                      setLogoutModalOpen(true);
                    }}
                    sx={{ borderRadius: 1.5, py: 1, gap: 1.5, color: 'error.main' }}
                  >
                    <LogoutIcon fontSize="small" />
                    <Typography variant="body2" fontWeight={600}>خروج از حساب</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Content Outlet */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3, md: 4 },
            maxWidth: 1440,
            width: '100%',
            mx: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        open={logoutModalOpen}
        title="خروج از حساب کاربری"
        message="آیا مطمئن هستید که می‌خواهید از پنل مدیریت خارج شوید؟"
        confirmText="خروج"
        cancelText="انصراف"
        severity="error"
        onConfirm={handleLogout}
        onClose={() => setLogoutModalOpen(false)}
      />
    </Box>
  );
}
