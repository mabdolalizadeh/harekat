import { useEffect } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import { useAuth } from '../../contexts/AuthContext.jsx';

export default function RequireAuth({ children }) {
  const { isAuthenticated, loading, redirectToLandingLogin, landingAuthUrl } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      redirectToLandingLogin();
    }
  }, [loading, isAuthenticated, redirectToLandingLogin]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#edf1f7' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#edf1f7',
          p: 3,
          textAlign: 'center'
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#0f172a' }}>
          در حال انتقال به صفحه ورود حرکت مدیا...
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
          برای دسترسی به پنل کاربری، ورود در وب‌سایت اصلی الزامی است.
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<LoginIcon />}
          href={landingAuthUrl}
          sx={{ borderRadius: '16px', px: 4, py: 1.3, fontWeight: 700 }}
        >
          ورود از طریق صفحه اصلی
        </Button>
      </Box>
    );
  }

  return children;
}
