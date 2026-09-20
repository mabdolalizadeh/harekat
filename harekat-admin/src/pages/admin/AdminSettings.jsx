import { useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Divider,
  Avatar,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  LockReset as LockResetIcon,
  CheckCircle as CheckIcon,
  Cancel as CrossIcon,
} from '@mui/icons-material';
import { adminApi, getAdminUser, isTA } from '../../services/api.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';

function validatePassword(password) {
  if (!password || password.length < 8) return 'رمز عبور باید حداقل ۸ کاراکتر باشد';
  if (!/[A-Z]/.test(password)) return 'رمز عبور باید حداقل یک حرف بزرگ انگلیسی داشته باشد';
  if (!/[a-z]/.test(password)) return 'رمز عبور باید حداقل یک حرف کوچک انگلیسی داشته باشد';
  if (!/[0-9]/.test(password)) return 'رمز عبور باید حداقل یک عدد داشته باشد';
  if (!/[^A-Za-z0-9]/.test(password)) return 'رمز عبور باید حداقل یک کاراکتر ویژه داشته باشد';
  return null;
}

export default function AdminSettings() {
  const { showSuccess, showError } = useNotification();
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const admin = getAdminUser();
  const ta = isTA();

  // Password rules validation checklist
  const rules = [
    { label: 'حداقل ۸ کاراکتر', passed: password.length >= 8 },
    { label: 'حداقل یک حرف بزرگ انگلیسی (A-Z)', passed: /[A-Z]/.test(password) },
    { label: 'حداقل یک حرف کوچک انگلیسی (a-z)', passed: /[a-z]/.test(password) },
    { label: 'حداقل یک عدد (0-9)', passed: /[0-9]/.test(password) },
    { label: 'حداقل یک کاراکتر ویژه (!@#$%...)', passed: /[^A-Za-z0-9]/.test(password) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!admin?.id) {
      showError('اطلاعات کاربری یافت نشد. لطفاً دوباره وارد سیستم شوید.');
      return;
    }
    if (!currentPassword) {
      showError('لطفاً رمز عبور فعلی خود را وارد کنید.');
      return;
    }

    const err = validatePassword(password);
    if (err) {
      showError(err);
      return;
    }
    if (password !== confirmPassword) {
      showError('تکرار رمز عبور با رمز جدید یکسان نیست.');
      return;
    }

    setLoading(true);
    try {
      await adminApi.updateAdmin(admin.id, { currentPassword, password });
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
      showSuccess('رمز عبور شما با موفقیت تغییر کرد.');
    } catch (error) {
      showError(
        error.status === 401
          ? 'رمز عبور فعلی اشتباه است.'
          : error.message || 'خطا در تغییر رمز عبور.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={3.5}>
      <PageHeader
        title="تنظیمات حساب کاربری"
        subtitle="مدیریت اطلاعات هویتی و تغییر رمز عبور ورود به پنل مدیریت"
      />

      <Grid container spacing={3}>
        {/* Left Card: Profile Details */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Stack spacing={2.5} alignItems="center" textAlign="center">
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: ta ? 'secondary.main' : 'primary.main',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                {admin?.username?.[0]?.toUpperCase() || (ta ? 'T' : 'A')}
              </Avatar>

              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {admin?.name || admin?.username || 'مدیر سامانه'}
                </Typography>
                <Typography variant="caption" color="text.secondary" dir="ltr" display="block">
                  @{admin?.username}
                </Typography>
                <Chip
                  size="small"
                  label={ta ? 'دستیار آموزشی (TA)' : 'مدیر ارشد سامانه'}
                  color={ta ? 'secondary' : 'primary'}
                  variant="filled"
                  sx={{ mt: 1, fontWeight: 700 }}
                />
              </Box>

              <Divider sx={{ width: '100%' }} />

              <Stack spacing={1.5} width="100%" textAlign="right">
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    شناسه یکتا در سیستم:
                  </Typography>
                  <Typography variant="body2" dir="ltr" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {admin?.id}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    سطح دسترسی:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {ta ? 'محدود به دوره‌ها و تیکت‌های محول‌شده' : 'دسترسی نامحدود به تمامی بخش‌ها'}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        {/* Right Card: Change Password Form */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper
            component="form"
            onSubmit={handleSubmit}
            elevation={0}
            sx={{ p: { xs: 2.5, sm: 3.5 }, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}
          >
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <LockResetIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  تغییر رمز عبور ورود
                </Typography>
              </Stack>

              <Typography variant="body2" color="text.secondary">
                برای افزایش امنیت حساب، از رمز عبور قدرتمند شامل حروف، ارقام و علائم نگارشی استفاده کنید.
              </Typography>

              <TextField
                label="رمز عبور فعلی *"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                dir="ltr"
              />

              <TextField
                label="رمز عبور جدید *"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                dir="ltr"
              />

              <TextField
                label="تکرار رمز عبور جدید *"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                dir="ltr"
              />

              {/* Password Policy Checklist */}
              {password && (
                <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
                    الزامات رمز عبور:
                  </Typography>
                  <List dense disablePadding>
                    {rules.map((r, idx) => (
                      <ListItem key={idx} disablePadding sx={{ py: 0.25 }}>
                        <ListItemIcon sx={{ minWidth: 26 }}>
                          {r.passed ? (
                            <CheckIcon color="success" sx={{ fontSize: 16 }} />
                          ) : (
                            <CrossIcon color="disabled" sx={{ fontSize: 16 }} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={r.label}
                          slotProps={{
                            primary: {
                              sx: {
                                fontSize: '0.75rem',
                                color: r.passed ? 'success.main' : 'text.secondary',
                                fontWeight: r.passed ? 600 : 400,
                              },
                            },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              <Button
                type="submit"
                variant="contained"
                disabled={loading || !currentPassword || !password || !confirmPassword}
                startIcon={loading && <CircularProgress size={16} color="inherit" />}
                sx={{ alignSelf: 'flex-start', px: 3 }}
              >
                {loading ? 'در حال ثبت...' : 'تغییر رمز عبور'}
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
