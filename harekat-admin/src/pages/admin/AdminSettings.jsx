import { useState } from 'react';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import { adminApi } from '../../services/api.js';

function validatePassword(password) {
  if (!password || password.length < 8) return 'رمز عبور باید حداقل ۸ کاراکتر باشد';
  if (!/[A-Z]/.test(password)) return 'رمز عبور باید حداقل یک حرف بزرگ انگلیسی داشته باشد';
  if (!/[a-z]/.test(password)) return 'رمز عبور باید حداقل یک حرف کوچک انگلیسی داشته باشد';
  if (!/[0-9]/.test(password)) return 'رمز عبور باید حداقل یک عدد داشته باشد';
  if (!/[^A-Za-z0-9]/.test(password)) return 'رمز عبور باید حداقل یک کاراکتر ویژه داشته باشد';
  return null;
}

export default function AdminSettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    setFeedback(null);
    let admin;
    try {
      admin = JSON.parse(localStorage.getItem('adminUser') || 'null');
    } catch {
      admin = null;
    }
    if (!admin?.id) {
      setFeedback({ severity: 'error', text: 'اطلاعات مدیر پیدا نشد؛ دوباره وارد شوید.' });
      return;
    }
    if (!currentPassword) {
      setFeedback({ severity: 'error', text: 'رمز عبور فعلی را وارد کنید.' });
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      setFeedback({ severity: 'error', text: passwordError });
      return;
    }
    if (password !== confirmPassword) {
      setFeedback({ severity: 'error', text: 'تکرار رمز عبور با رمز جدید یکسان نیست.' });
      return;
    }

    setLoading(true);
    try {
      await adminApi.updateAdmin(admin.id, { currentPassword, password });
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
      setFeedback({ severity: 'success', text: 'رمز عبور با موفقیت تغییر کرد.' });
    } catch (error) {
      setFeedback({
        severity: 'error',
        text: error.status === 401 ? 'رمز عبور فعلی اشتباه است.' : (error.message || 'تغییر رمز عبور انجام نشد.'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={800}>تنظیمات حساب</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          رمز عبور ورود به پنل مدیریت را تغییر دهید.
        </Typography>
      </Box>

      <Paper component="form" onSubmit={submit} elevation={0} sx={{ maxWidth: 620, p: { xs: 2.5, sm: 4 }, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Stack spacing={2.25}>
          <Stack direction="row" spacing={1} alignItems="center">
            <LockResetIcon color="primary" />
            <Typography fontWeight={700}>تغییر رمز عبور</Typography>
          </Stack>
          <TextField
            label="رمز عبور فعلی"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            autoComplete="current-password"
          />
          <TextField
            label="رمز عبور جدید"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            helperText="حداقل ۸ کاراکتر، شامل حروف بزرگ و کوچک، عدد و کاراکتر ویژه"
          />
          <TextField
            label="تکرار رمز عبور جدید"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
          />
          {feedback && <Alert severity={feedback.severity} variant="outlined">{feedback.text}</Alert>}
          <Button type="submit" variant="contained" disabled={loading} sx={{ alignSelf: 'flex-start' }}>
            {loading ? 'در حال ذخیره...' : 'ذخیره رمز عبور'}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
