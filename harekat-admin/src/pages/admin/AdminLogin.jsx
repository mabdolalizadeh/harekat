import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility as ShowIcon,
  VisibilityOff as HideIcon,
  Login as LoginIcon,
  LightMode as SunIcon,
  DarkMode as MoonIcon,
} from '@mui/icons-material';
import { adminApi, isAdminAuthenticated } from '../../services/api.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isExpired = Boolean(location.state?.expired || new URLSearchParams(location.search).get('expired') === '1');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAdminAuthenticated()) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('نام کاربری و رمز عبور را وارد کنید');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.login(username.trim(), password);
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminUser', JSON.stringify(res.data.admin));
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.status === 401
          ? 'نام کاربری یا رمز عبور اشتباه است'
          : err.message || 'خطا در برقراری ارتباط'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    if (typeof window.__toggleAdminTheme === 'function') {
      window.__toggleAdminTheme();
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
        position: 'relative',
      }}
      dir="rtl"
    >
      {/* Theme toggle in top corner */}
      <Box sx={{ position: 'absolute', top: 20, left: 20 }}>
        <Tooltip title={theme.palette.mode === 'dark' ? 'حالت روشن' : 'حالت تیره'}>
          <IconButton
            onClick={toggleTheme}
            size="small"
            sx={{
              p: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'background.paper',
            }}
          >
            {theme.palette.mode === 'dark' ? (
              <SunIcon fontSize="small" sx={{ color: 'warning.main' }} />
            ) : (
              <MoonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Minimal Centered Card */}
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 360,
          p: { xs: 3.5, sm: 4.5 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack spacing={2} alignItems="center" mb={3}>
          <Box
            component="img"
            src="/favicon.svg"
            alt="Logo"
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              p: 0.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'action.hover',
            }}
          />
          <Typography variant="h6" fontWeight={800} letterSpacing="-0.02em">
            ورود به مدیریت
          </Typography>
        </Stack>

        {isExpired && (
          <Alert severity="warning" variant="outlined" sx={{ mb: 2.5, borderRadius: 2, fontSize: '0.8rem', py: 0.5 }}>
            نشست شما منقضی شده است
          </Alert>
        )}

        {error && (
          <Alert severity="error" variant="outlined" sx={{ mb: 2.5, borderRadius: 2, fontSize: '0.8rem', py: 0.5 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="نام کاربری"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              dir="ltr"
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              label="رمز عبور"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              dir="ltr"
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? <HideIcon fontSize="small" /> : <ShowIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading || !username.trim() || !password}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <LoginIcon fontSize="small" />}
              sx={{
                mt: 1,
                py: 1.1,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: '0.875rem',
              }}
            >
              {loading ? 'در حال ورود...' : 'ورود'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
