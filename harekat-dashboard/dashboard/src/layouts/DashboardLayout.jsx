import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, Drawer } from '@mui/material';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import CartDrawer from '../components/cart/CartDrawer.jsx';

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
      case '/catalog':
        return { title: 'کاوش دوره‌ها و مهارت‌ها', subtitle: 'کاتالوگ جامع دوره‌های آموزشی' };
      case '/subscriptions':
        return { title: 'پلن‌های اشتراک ویژه', subtitle: 'دسترسی نامحدود به اتاق فکر و کارگاه‌ها' };
      case '/orders':
        return { title: 'تاریخچه سفارشات و تراکنش‌ها', subtitle: 'رسید پرداخت‌ها و دوره‌های خریداری شده' };
      case '/profile':
        return { title: 'پروفایل و دستاوردها', subtitle: 'ویرایش اطلاعات کاربری و سطح پیشرفت' };
      default:
        return { title: 'حرکت مدیا', subtitle: 'سامانه آموزش تخصصی' };
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#edf1f7',
        p: { xs: 0, sm: 1.5, md: 2.5 },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {/* Reference Design: Large floating rounded dashboard card */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 1440,
          minHeight: { xs: '100vh', md: 'calc(100vh - 40px)' },
          backgroundColor: '#ffffff',
          borderRadius: { xs: 0, sm: '24px', md: '32px' },
          boxShadow: { xs: 'none', md: '0 25px 60px -15px rgba(15, 23, 42, 0.08)' },
          border: { xs: 'none', md: '1px solid #eef2f7' },
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isSidebarCollapsed={isSidebarCollapsed}
          onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
          activeContext={getActiveContext()}
        />

        {/* Body: Sidebar + Main Content Area */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Desktop Sidebar */}
          <Box
            sx={{
              display: { xs: 'none', md: isSidebarCollapsed ? 'none' : 'block' },
              borderLeft: '1px solid #f1f4f9',
              p: 2.5,
              width: 270,
              flexShrink: 0
            }}
          >
            <Sidebar />
          </Box>

          {/* Main Content Area */}
          <Box
            component="main"
            sx={{
              flex: 1,
              p: { xs: 2, sm: 2.5, md: 3.5 },
              overflowY: 'auto',
              backgroundColor: '#ffffff',
              height: { xs: 'auto', md: 'calc(100vh - 120px)' }
            }}
          >
            <Outlet />
          </Box>
        </Box>

        {/* Mobile Sidebar Drawer */}
        <Drawer
          anchor="right"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: 280,
              p: 2,
              backgroundColor: '#ffffff'
            }
          }}
        >
          <Sidebar onItemClick={() => setMobileDrawerOpen(false)} />
        </Drawer>

        {/* Global Cart Slide-Over Drawer */}
        <CartDrawer />
      </Box>
    </Box>
  );
}
