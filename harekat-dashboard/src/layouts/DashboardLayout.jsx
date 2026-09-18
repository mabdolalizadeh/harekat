import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, Drawer } from '@mui/material';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';

export default function DashboardLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const location = useLocation();

  const getActiveContext = () => {
    switch (location.pathname) {
      case '/overview':
        return { title: 'داشبورد و وضعیت یادگیری', subtitle: 'برنامه هفتگی و درس‌های فعال' };
      case '/courses':
        return { title: 'دوره‌های من', subtitle: 'محتوای آموزشی ثبت‌نام شده' };
      case '/packages':
        return { title: 'پکیج‌های مهارت', subtitle: 'مجموعه دوره‌ها و مهارت‌های جامع' };
      case '/subscriptions':
        return { title: 'پلن‌های اشتراک ویژه', subtitle: 'دسترسی نامحدود به اتاق فکر و کارگاه‌ها' };
      case '/payments':
      case '/orders':
        return { title: 'تاریخچه پرداخت‌ها و تراکنش‌ها', subtitle: 'رسید پرداخت‌ها و دوره‌های خریداری شده' };
      case '/profile':
        return { title: 'حساب کاربری و تنظیمات', subtitle: 'مدیریت اطلاعات هویتی و نشان اشتراک' };
      case '/tickets':
      case '/support':
        return { title: 'پشتیبانی و تیکت', subtitle: 'ارسال پیام و پیگیری درخواست‌ها' };
      case '/faq':
        return { title: 'سوالات متداول', subtitle: 'راهنما و پرسش‌های پرتکرار' };
      default:
        return { title: 'حرکت مدیا', subtitle: 'سامانه آموزش تخصصی هنر و رسانه' };
    }
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        backgroundColor: '#f7f5f0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        m: 0,
        p: 0
      }}
    >
      {/* Top Header Bar - Full Width */}
      <Header
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isSidebarCollapsed={isSidebarCollapsed}
        onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
        activeContext={getActiveContext()}
      />

      {/* Main Workspace Area: Sidebar + Scrollable Content */}
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          height: 'calc(100vh - 64px)',
          overflow: 'hidden',
          width: '100%'
        }}
      >
        {/* Desktop Sidebar (docked on right in RTL) */}
        {!isSidebarCollapsed && (
          <Box
            component="aside"
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              width: 280,
              minWidth: 280,
              maxWidth: 280,
              flexShrink: 0,
              height: '100%',
              backgroundColor: '#ffffff',
              borderLeft: '1px solid #deddd7',
              overflow: 'hidden'
            }}
          >
            <Sidebar />
          </Box>
        )}

        {/* Scrollable Main Content Area */}
        <Box
          component="main"
          sx={{
            flex: 1,
            height: '100%',
            overflowY: 'auto',
            backgroundColor: '#f7f5f0',
            p: { xs: 2, sm: 2.5, md: 3.5 },
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box sx={{ maxWidth: 1400, width: '100%', mx: 'auto', flex: 1 }}>
            <Outlet />
          </Box>
        </Box>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: 290,
            backgroundColor: '#ffffff',
            borderLeft: '1px solid #deddd7'
          }
        }}
      >
        <Sidebar onItemClick={() => setMobileDrawerOpen(false)} />
      </Drawer>
    </Box>
  );
}
