import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Stack, Typography, TextField, Button, Alert, InputAdornment, Divider } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import { adminApi } from '../../services/api.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!username || !password) return setError('نام کاربری و رمز عبور را وارد کنید');
    setLoading(true); setError(null);
    try {
      const res = await adminApi.login(username, password);
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminUser', JSON.stringify(res.data.admin));
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.status === 401 ? 'نام کاربری یا رمز عبور اشتباه است' : (err.message || 'خطای ورود'));
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '42% 1fr' }, bgcolor: 'background.default' }} dir="rtl">
      {/* Aside */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          bgcolor: '#172554',
          color: '#fff',
          p: { md: 5, lg: 7 },
          position: 'relative',
          overflow: 'hidden',
          '&::after': { content: '""', position: 'absolute', inset: 0, background: 'radial-gradient(600px 400px at 70% 20%, rgba(109,140,255,0.18), transparent 60%)' },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={6}>
            <Box component="img" src="/favicon.svg" alt="حرکت" sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#fff', p: 0.5 }} />
            <Box>
              <Typography fontWeight={800} fontSize={18}>مدرسه حرکت</Typography>
              <Typography variant="caption" sx={{ color: '#aabcf7' }}>مدیریت محتوا</Typography>
            </Box>
          </Stack>
        </Box>
        <Box sx={{ position: 'relative', zIndex: 1, mt: 'auto' }}>
          <Typography variant="h3" fontWeight={900} lineHeight={1.35} fontSize={{ md: 30, lg: 42 }}>
            فضای مدیریت محتوا،<br />
            <Box component="span" sx={{ color: '#8da7ff' }}>ساده و روشن.</Box>
          </Typography>
          <Typography sx={{ color: '#becaf0', mt: 2, fontSize: 14, lineHeight: 2 }}>
            همه چیز برای مدیریت محصولات و محتوای سایت، یک‌جا — با طراحی جدید مبتنی بر MUI.
          </Typography>
          <Stack direction="row" spacing={1} mt={4}>
            <Box sx={{ width: 32, height: 3, bgcolor: '#8da7ff', borderRadius: 1 }} />
            <Box sx={{ width: 16, height: 3, bgcolor: 'rgba(255,255,255,0.3)', borderRadius: 1 }} />
            <Box sx={{ width: 16, height: 3, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 1 }} />
          </Stack>
        </Box>
      </Box>

      {/* Form */}
      <Box sx={{ display: 'grid', placeItems: 'center', p: 3, bgcolor: { xs: 'background.default', md: 'background.paper' } }}>
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 420,
            p: { xs: 3, sm: 4 },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 4,
          }}
        >
          <Stack spacing={0.5} mb={3}>
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 1 }}>
              <Box component="img" src="/favicon.svg" alt="حرکت" sx={{ width: 34, height: 34, borderRadius: 2 }} />
              <Typography fontWeight={800}>مدرسه حرکت</Typography>
            </Box>
            <Typography variant="h5" fontWeight={800}>خوش آمدید</Typography>
            <Typography variant="body2" color="text.secondary" fontSize={13}>برای ورود به پنل مدیریت اطلاعات خود را وارد کنید.</Typography>
          </Stack>

          <Box component="form" onSubmit={submit} noValidate>
            <Stack spacing={2}>
              <Box>
                <Typography component="label" htmlFor="admin-username" sx={{ display: 'block', mb: 0.75, fontSize: 13, fontWeight: 600, color: 'text.primary' }}>
                  نام کاربری
                </Typography>
                <TextField
                  id="admin-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="admin"
                  aria-label="نام کاربری"
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonIcon fontSize="small" color="action" /></InputAdornment> } }}
                />
              </Box>
              <Box>
                <Typography component="label" htmlFor="admin-password" sx={{ display: 'block', mb: 0.75, fontSize: 13, fontWeight: 600, color: 'text.primary' }}>
                  رمز عبور
                </Typography>
                <TextField
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  aria-label="رمز عبور"
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" color="action" /></InputAdornment> } }}
                />
              </Box>
              {error && <Alert severity="error" variant="outlined" sx={{ fontSize: 13 }}>{error}</Alert>}
              <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth sx={{ mt: 1, height: 46 }}>
                {loading ? 'در حال ورود...' : 'ورود به پنل'}
              </Button>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary" textAlign="center">
                دسترسی فقط برای مدیران مجاز است
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
