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
  Tabs,
  Tab,
  Divider,
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
  Key as KeyIcon,
  FileUpload as UploadIcon,
} from '@mui/icons-material';
import { adminApi, isAdminAuthenticated, signChallengeWithRsaKey } from '../../services/api.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isExpired = Boolean(location.state?.expired || new URLSearchParams(location.search).get('expired') === '1');

  const [authMethod, setAuthMethod] = useState('password'); // 'password' | 'rsa'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [privateKeyPem, setPrivateKeyPem] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAdminAuthenticated()) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [navigate, location]);

  const handlePasswordSubmit = async (e) => {
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

  const handleRsaSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !privateKeyPem.trim()) {
      setError('نام کاربری و کلید خصوصی RSA را وارد کنید');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // 1. Request challenge from backend
      const challengeRes = await adminApi.requestRsaChallenge(username.trim());
      const challenge = challengeRes.data?.challenge;
      if (!challenge) {
        throw new Error('چالش امنیتی از سرور دریافت نشد');
      }

      // 2. Sign challenge with user's private key in browser via WebCrypto
      const signature = await signChallengeWithRsaKey(privateKeyPem.trim(), challenge);

      // 3. Verify signature and login
      const loginRes = await adminApi.rsaLogin(username.trim(), challenge, signature);
      localStorage.setItem('adminToken', loginRes.data.token);
      localStorage.setItem('adminUser', JSON.stringify(loginRes.data.admin));
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.status === 401 || err.status === 400
          ? err.message || 'امضای کلید خصوصی RSA نامعتبر است'
          : err.message || 'خطا در ورود با کلید RSA'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setPrivateKeyPem(content);
      }
    };
    reader.readAsText(file);
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
          maxWidth: 400,
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack spacing={1.5} alignItems="center" mb={2.5}>
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
            ورود به مدیریت حرکت
          </Typography>
        </Stack>

        <Tabs
          value={authMethod}
          onChange={(_, v) => {
            setAuthMethod(v);
            setError(null);
          }}
          variant="fullWidth"
          sx={{
            minHeight: 40,
            mb: 2.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 40,
              fontSize: '0.8rem',
              fontWeight: 700,
              py: 0.75,
            },
          }}
        >
          <Tab value="password" label="رمز عبور" icon={<LockIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
          <Tab value="rsa" label="کلید اختصاصی RSA" icon={<KeyIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
        </Tabs>

        {isExpired && (
          <Alert severity="warning" variant="outlined" sx={{ mb: 2, borderRadius: 2, fontSize: '0.8rem', py: 0.5 }}>
            نشست شما منقضی شده است
          </Alert>
        )}

        {error && (
          <Alert severity="error" variant="outlined" sx={{ mb: 2, borderRadius: 2, fontSize: '0.8rem', py: 0.5 }}>
            {error}
          </Alert>
        )}

        {authMethod === 'password' ? (
          <Box component="form" onSubmit={handlePasswordSubmit}>
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
        ) : (
          <Box component="form" onSubmit={handleRsaSubmit}>
            <Stack spacing={2}>
              <TextField
                label="نام کاربری مدیر ارشد"
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

              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    کلید خصوصی RSA (PEM)
                  </Typography>
                  <Button
                    component="label"
                    size="small"
                    variant="outlined"
                    startIcon={<UploadIcon sx={{ fontSize: 14 }} />}
                    sx={{ fontSize: '0.7rem', py: 0.25, px: 1, borderRadius: 1.5 }}
                  >
                    انتخاب فایل .pem
                    <input type="file" accept=".pem,.key,.txt" hidden onChange={handleKeyFileUpload} />
                  </Button>
                </Stack>
                <TextField
                  placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                  multiline
                  rows={4}
                  value={privateKeyPem}
                  onChange={(e) => setPrivateKeyPem(e.target.value)}
                  dir="ltr"
                  size="small"
                  fullWidth
                  sx={{
                    '& textarea': {
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      lineHeight: 1.3,
                    },
                  }}
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                color="secondary"
                fullWidth
                disabled={loading || !username.trim() || !privateKeyPem.trim()}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <KeyIcon fontSize="small" />}
                sx={{
                  mt: 1,
                  py: 1.1,
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: '0.875rem',
                }}
              >
                {loading ? 'در حال تایید کلید و ورود...' : 'ورود امن با کلید RSA'}
              </Button>
            </Stack>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
