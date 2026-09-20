import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Link
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../contexts/AuthContext.jsx';
import { toPersianDigits } from '../utils/formatters.js';

const LANDING_URL = import.meta.env?.VITE_LANDING_URL || (import.meta.env?.DEV ? 'http://localhost:5173' : '/');

function buildRedirectUrl(target, token) {
  if (!target || (!target.startsWith('http://') && !target.startsWith('https://'))) {
    return target || '/overview';
  }
  try {
    const urlObj = new URL(target, window.location.origin);
    if (token) {
      urlObj.searchParams.set('auth_token', token);
    }
    return urlObj.toString();
  } catch {
    return target;
  }
}

export default function LoginPage() {
  const { requestOtp, validateOtp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const redirectTarget = queryParams.get('redirect') || queryParams.get('from') || location.state?.from?.pathname || location.state?.from || '/overview';

  useEffect(() => {
    if (isAuthenticated) {
      const currentToken = localStorage.getItem('token');
      const finalRedirect = buildRedirectUrl(redirectTarget, currentToken);
      if (finalRedirect.startsWith('http://') || finalRedirect.startsWith('https://')) {
        window.location.href = finalRedirect;
      } else {
        navigate(finalRedirect, { replace: true });
      }
    }
  }, [isAuthenticated, navigate, redirectTarget]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('لطفاً شماره موبایل معتبر وارد کنید (مثال: ۰۹۱۲۳۴۵۶۷۸۹)');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await requestOtp(cleanPhone);
      if (res?.ok) {
        setStep(2);
      } else {
        setError(res?.message || 'خطا در ارسال کد ورود');
      }
    } catch (err) {
      setError(err.message || 'خطا در برقراری ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateOtp = async (e) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      setError('لطفاً کد تایید را وارد کنید');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const authRes = await validateOtp(phoneNumber.trim(), cleanOtp);
      const currentToken = authRes?.data?.token || localStorage.getItem('token');
      const finalRedirect = buildRedirectUrl(redirectTarget, currentToken);
      if (finalRedirect.startsWith('http://') || finalRedirect.startsWith('https://')) {
        window.location.href = finalRedirect;
      } else {
        navigate(finalRedirect, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'کد تایید نامعتبر است');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#edf1f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 440,
          borderRadius: '28px',
          p: { xs: 3, sm: 4.5 },
          boxShadow: '0 20px 50px -15px rgba(15, 23, 42, 0.12)',
          border: '1px solid #eef2f7',
          textAlign: 'center'
        }}
      >
        {/* Brand Icon */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 60,
            height: 60,
            borderRadius: '20px',
            backgroundColor: '#fff8ed',
            color: '#f47c20',
            mb: 2.5
          }}
        >
          <LoginIcon sx={{ fontSize: 30 }} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#0f172a' }}>
          ورود به پنل کاربری حرکت
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 3.5, lineHeight: 1.7 }}>
          {step === 1
            ? 'جهت ورود یا ثبت‌نام، شماره تلفن همراه خود را وارد فرمایید.'
            : `کد تایید پیامک‌شده به شماره ${toPersianDigits(phoneNumber)} را وارد نمایید.`}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: '14px', textAlign: 'right', fontSize: '0.85rem' }}>
            {error}
          </Alert>
        )}

        {step === 1 ? (
          <Box component="form" onSubmit={handleRequestOtp} sx={{ textAlign: 'left' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 0.8 }}>
              شماره موبایل:
            </Typography>
            <TextField
              fullWidth
              size="medium"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              autoFocus
              InputProps={{
                startAdornment: <PhoneIphoneOutlinedIcon sx={{ color: '#94a3b8', mr: 1, ml: -0.5 }} />
              }}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  backgroundColor: '#ffffff'
                }
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.4,
                borderRadius: '16px',
                fontWeight: 800,
                fontSize: '1rem',
                backgroundColor: '#f47c20',
                '&:hover': { backgroundColor: '#df5b13' }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'ارسال کد تایید'}
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleValidateOtp} sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 0.8 }}>
              کد ۶ رقمی تایید:
            </Typography>
            <TextField
              fullWidth
              size="medium"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="۱۲۳۴۵۶"
              autoFocus
              InputProps={{
                startAdornment: <KeyOutlinedIcon sx={{ color: '#94a3b8', mr: 1, ml: -0.5 }} />
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  backgroundColor: '#ffffff'
                }
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.4,
                borderRadius: '16px',
                fontWeight: 800,
                fontSize: '1rem',
                backgroundColor: '#f47c20',
                '&:hover': { backgroundColor: '#df5b13' },
                mb: 1.5
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'ورود به حساب کاربری'}
            </Button>
            <Button
              size="small"
              onClick={() => { setStep(1); setError(null); }}
              sx={{ color: '#64748b', fontSize: '0.8rem', width: '100%', borderRadius: '12px' }}
            >
              ویرایش شماره موبایل
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 3, borderColor: '#e2e8f0' }} />

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            component="a"
            href={LANDING_URL}
            size="small"
            endIcon={<ArrowBackIcon size={18} />}
            sx={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}
          >
            بازگشت به وب‌سایت اصلی حرکت
          </Button>
        </Box>
      </Card>
    </Box>
  );
}

