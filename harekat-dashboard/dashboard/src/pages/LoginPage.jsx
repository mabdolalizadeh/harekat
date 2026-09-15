import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useAuth } from '../contexts/AuthContext.jsx';
import { toPersianDigits } from '../utils/formatters.js';

export default function LoginPage() {
  const { requestOtp, validateOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1); // 1: Phone, 2: OTP
  const [phoneNumber, setPhoneNumber] = useState('09123456789'); // Seeded demo user
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [devOtpHint, setDevOtpHint] = useState(null);

  const from = location.state?.from?.pathname || '/overview';

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
          maxWidth: 440,
          borderRadius: '32px',
          p: { xs: 2.5, sm: 4 },
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.12)',
          border: '1px solid #eef2f7'
        }}
      >
        {/* Brand Header */}
        <Box sx={{ textAlign: 'center', mb: 3.5 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: '20px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              mb: 2
            }}
          >
            {step === 1 ? <PhoneIphoneOutlinedIcon sx={{ fontSize: 30 }} /> : <LockOutlinedIcon sx={{ fontSize: 30 }} />}
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.8, color: '#0f172a' }}>
            {step === 1 ? 'ورود به پنل یادگیری حرکت' : 'تایید شماره موبایل'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            {step === 1
              ? 'شماره موبایل خود را وارد کنید تا کد ورود ارسال شود.'
              : `کد تایید ارسال شده به شماره ${toPersianDigits(phoneNumber)} را وارد کنید.`}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '16px', fontSize: '0.85rem' }}>
            {error}
          </Alert>
        )}

        {/* Step 1 Form */}
        {step === 1 ? (
          <Box component="form" onSubmit={handleRequestOtp}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#334155' }}>
                شماره موبایل:
              </Typography>
              <TextField
                fullWidth
                autoFocus
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="09123456789"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '16px',
                    backgroundColor: '#f8fafc'
                  }
                }}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ py: 1.4, borderRadius: '16px', fontWeight: 700, fontSize: '1rem' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'دریافت کد ورود'}
            </Button>
          </Box>
        ) : (
          /* Step 2 Form */
          <Box component="form" onSubmit={handleValidateOtp}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#334155' }}>
                کد یکبار مصرف (OTP):
              </Typography>
              <TextField
                fullWidth
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '16px',
                    backgroundColor: '#f8fafc',
                    letterSpacing: '0.3em',
                    textAlign: 'center',
                    fontWeight: 700
                  }
                }}
              />
            </Box>

            {devOtpHint && (
              <Box sx={{ mb: 2.5, p: 1.5, backgroundColor: '#f0fdf4', borderRadius: '14px', border: '1px solid #bbf7d0' }}>
                <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 600, display: 'block' }}>
                  کد تایید محیط توسعه: <strong>{devOtpHint}</strong> (تکمیل خودکار انجام شد)
                </Typography>
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ py: 1.4, borderRadius: '16px', fontWeight: 700, fontSize: '1rem', mb: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'ورود به پنل'}
            </Button>

            <Button
              fullWidth
              onClick={() => {
                setStep(1);
                setError(null);
              }}
              sx={{ color: '#64748b', fontSize: '0.84rem' }}
            >
              تغییر شماره موبایل
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Development fast login badge */}
        <Box sx={{ textAlign: 'center' }}>
          <Chip
            label="اکانت تستی دمو: ۰۹۱۲۳۴۵۶۷۸۹"
            size="small"
            sx={{ backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '0.75rem' }}
          />
        </Box>
      </Card>
    </Box>
  );
}
