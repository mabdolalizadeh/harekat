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
  Collapse,
  Chip
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CodeIcon from '@mui/icons-material/Code';
import { useAuth } from '../contexts/AuthContext.jsx';
import { toPersianDigits } from '../utils/formatters.js';

export default function LoginPage() {
  const { requestOtp, validateOtp, isAuthenticated, landingAuthUrl } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('09123456789');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [devOtpHint, setDevOtpHint] = useState(null);
  const [showDevForm, setShowDevForm] = useState(false);

  const from = location.state?.from?.pathname || '/overview';

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/overview', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError('لطفاً شماره موبایل خود را وارد کنید');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await requestOtp(phoneNumber.trim());
      if (res?.ok) {
        setStep(2);
        if (res.data?.otp) {
          setDevOtpHint(res.data.otp);
          setOtp(res.data.otp);
        } else {
          setDevOtpHint('123456');
          setOtp('123456');
        }
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
    if (!otp.trim()) {
      setError('لطفاً کد تایید را وارد کنید');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await validateOtp(phoneNumber.trim(), otp.trim());
      navigate(from, { replace: true });
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
          maxWidth: 460,
          borderRadius: '32px',
          p: { xs: 3, sm: 4.5 },
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.12)',
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
            width: 64,
            height: 64,
            borderRadius: '22px',
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            mb: 2.5
          }}
        >
          <LoginIcon sx={{ fontSize: 32 }} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#0f172a' }}>
          ورود به پنل حرکت اسکول
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 3.5, lineHeight: 1.7 }}>
          احراز هویت و دریافت توکن دسترسی از طریق صفحه اصلی (Landing Page) انجام می‌شود و سپس به این داشبورد هدایت می‌شوید.
        </Typography>

        {/* Primary Action: Go to Landing Page Auth */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          href={landingAuthUrl}
          startIcon={<LoginIcon />}
          sx={{
            py: 1.5,
            borderRadius: '16px',
            fontWeight: 800,
            fontSize: '1rem',
            mb: 2,
            background: 'linear-gradient(135deg, #f47c20 0%, #df5b13 100%)'
          }}
        >
          ورود از طریق وب‌سایت اصلی حرکت
        </Button>

        <Divider sx={{ my: 3 }}>
          <Chip
            label="یا ورود آزمایشی محیط توسعه"
            size="small"
            onClick={() => setShowDevForm(!showDevForm)}
            sx={{ cursor: 'pointer', fontSize: '0.72rem', backgroundColor: '#f1f5f9' }}
          />
        </Divider>

        {/* Collapsible Local Dev Bypass */}
        <Collapse in={showDevForm}>
          <Box sx={{ mt: 2, textAlign: 'right', p: 2.5, backgroundColor: '#f8fafc', borderRadius: '20px', border: '1px solid #eef2f7' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CodeIcon sx={{ fontSize: 18, color: '#64748b' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>
                فرم ورود مستقیم برای تست محلی
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: '12px', fontSize: '0.8rem' }}>
                {error}
              </Alert>
            )}

            {step === 1 ? (
              <Box component="form" onSubmit={handleRequestOtp}>
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  شماره موبایل دمو:
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="09123456789"
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#ffffff' } }}
                />
                <Button
                  type="submit"
                  variant="outlined"
                  fullWidth
                  disabled={loading}
                  sx={{ borderRadius: '12px', fontWeight: 700 }}
                >
                  {loading ? <CircularProgress size={20} /> : 'دریافت کد تایید'}
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleValidateOtp}>
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  کد تایید OTP:
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#ffffff' } }}
                />
                {devOtpHint && (
                  <Typography variant="caption" sx={{ color: '#15803d', display: 'block', mb: 1.5, fontWeight: 600 }}>
                    کد آماده: {devOtpHint}
                  </Typography>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{ borderRadius: '12px', fontWeight: 700, mb: 1 }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'ورود مستقیم'}
                </Button>
                <Button
                  size="small"
                  onClick={() => setStep(1)}
                  sx={{ color: '#64748b', fontSize: '0.75rem', width: '100%' }}
                >
                  تغییر شماره
                </Button>
              </Box>
            )}
          </Box>
        </Collapse>
      </Card>
    </Box>
  );
}
