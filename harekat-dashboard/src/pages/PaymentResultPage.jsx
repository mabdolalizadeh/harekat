import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import RefreshIcon from '@mui/icons-material/Refresh';

import { paymentsApi } from '../api/paymentsApi.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useThemeMode } from '../contexts/ThemeModeContext.jsx';
import AnimatedPage from '../components/ui/AnimatedPage.jsx';
import SpotlightCard from '../components/ui/SpotlightCard.jsx';
import AnimatedNumber from '../components/ui/AnimatedNumber.jsx';
import { formatPrice, formatDate, toPersianDigits } from '../utils/formatters.js';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  const queryPaymentId = searchParams.get('paymentId');
  const queryStatus = (searchParams.get('status') || '').toLowerCase();
  const queryTrackId = searchParams.get('trackId');
  const queryRefNumber = searchParams.get('refNumber');
  const queryMessage = searchParams.get('message');

  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState(null);

  const lookupId = queryPaymentId || queryTrackId;

  const fetchStatus = async () => {
    if (!lookupId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await paymentsApi.getPaymentStatus(lookupId);
      if (res?.ok && res.data) {
        setPayment(res.data);
        if (res.data.status === 'paid') {
          refreshUser();
        }
      } else {
        setError(res?.message || 'اطلاعات تراکنش یافت نشد.');
      }
    } catch (err) {
      console.warn('Payment status fetch notice:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [lookupId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '55vh', gap: 2 }}>
        <CircularProgress size={48} sx={{ color: '#f47c20' }} />
        <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          در حال بررسی و دریافت آخرین وضعیت پرداخت...
        </Typography>
      </Box>
    );
  }

  // Derive authoritative status: Backend status takes absolute priority over query params
  const backendStatus = (payment?.status || '').toLowerCase();
  let resolvedStatus = 'unknown';

  if (backendStatus === 'paid') {
    resolvedStatus = 'success';
  } else if (backendStatus === 'cancelled') {
    resolvedStatus = 'cancelled';
  } else if (backendStatus === 'failed') {
    resolvedStatus = 'failed';
  } else if (backendStatus === 'pending') {
    resolvedStatus = 'pending';
  } else if (queryStatus === 'success') {
    resolvedStatus = 'success';
  } else if (queryStatus === 'cancelled') {
    resolvedStatus = 'cancelled';
  } else if (queryStatus === 'failed') {
    resolvedStatus = 'failed';
  }

  const effectiveAmount = payment?.amount || '0';
  const effectiveRefNumber = payment?.transactionId || queryRefNumber || '—';
  const effectiveTrackId = payment?.trackId || queryTrackId || '—';
  const effectiveGateway = payment?.gateway === 'zibal' ? 'درگاه پرداخت اینترنتی زیبال' : (payment?.gateway || 'درگاه پرداخت آنلاین');

  return (
    <AnimatedPage>
      <Box sx={{ maxWidth: 680, mx: 'auto', py: { xs: 2, md: 4 } }}>
        <SpotlightCard
          sx={{
            borderRadius: '28px',
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            boxShadow: isDark ? '0 12px 40px rgba(0, 0, 0, 0.4)' : '0 10px 30px rgba(15, 23, 42, 0.06)',
          }}
        >

        {/* Status Header Banner */}
        <Box
          sx={{
            p: 4,
            textAlign: 'center',
            backgroundColor: resolvedStatus === 'success'
              ? (isDark ? 'rgba(22, 163, 74, 0.15)' : '#f0fdf4')
              : resolvedStatus === 'cancelled'
              ? (isDark ? 'rgba(217, 119, 6, 0.15)' : '#fffbeb')
              : resolvedStatus === 'failed'
              ? (isDark ? 'rgba(220, 38, 38, 0.15)' : '#fef2f2')
              : (isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff'),
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          {resolvedStatus === 'success' && (
            <Box>
              <CheckCircleOutlineIcon sx={{ fontSize: 72, color: '#16a34a', mb: 1.5 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? '#4ade80' : '#15803d', mb: 1, fontSize: { xs: '1.4rem', md: '1.8rem' } }}>
                پرداخت با موفقیت انجام شد
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 440, mx: 'auto', lineHeight: 1.7 }}>
                تراکنش شما توسط درگاه پرداخت تایید شد و دسترسی به دوره‌ها و بسته‌های آموزشی بلافاصله برای حساب شما فعال گردید.
              </Typography>
            </Box>
          )}

          {resolvedStatus === 'cancelled' && (
            <Box>
              <WarningAmberIcon sx={{ fontSize: 72, color: '#d97706', mb: 1.5 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? '#fbbf24' : '#b45309', mb: 1, fontSize: { xs: '1.4rem', md: '1.8rem' } }}>
                پرداخت توسط کاربر لغو گردید
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 440, mx: 'auto', lineHeight: 1.7 }}>
                عملیات پرداخت در درگاه بانکی تکمیل نشد و مبلغی از حساب شما کسر نگردیده است. در صورت تمایل می‌توانید مجدداً اقدام فرمایید.
              </Typography>
            </Box>
          )}

          {resolvedStatus === 'failed' && (
            <Box>
              <HighlightOffIcon sx={{ fontSize: 72, color: '#dc2626', mb: 1.5 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? '#f87171' : '#b91c1c', mb: 1, fontSize: { xs: '1.4rem', md: '1.8rem' } }}>
                پرداخت ناموفق بود
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 440, mx: 'auto', lineHeight: 1.7 }}>
                {payment?.failureReason || queryMessage || 'متاسفانه تراکنش توسط درگاه بانکی تایید نشد یا با خطا مواجه گردید.'}
              </Typography>
            </Box>
          )}

          {resolvedStatus === 'pending' && (
            <Box>
              <HourglassEmptyIcon sx={{ fontSize: 72, color: '#2563eb', mb: 1.5 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? '#60a5fa' : '#1d4ed8', mb: 1, fontSize: { xs: '1.4rem', md: '1.8rem' } }}>
                در انتظار تایید نهایی درگاه
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 440, mx: 'auto', lineHeight: 1.7 }}>
                تراکنش در حال استعلام از درگاه بانکی است. پس از چند لحظه دکمه به‌روزرسانی را لمس فرمایید.
              </Typography>
            </Box>
          )}
        </Box>

        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          {error && (
            <Alert severity="warning" sx={{ mb: 3, borderRadius: '16px' }}>
              {error}
            </Alert>
          )}

          {/* Receipt Details Paper */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '20px',
              backgroundColor: isDark ? '#1e293b' : '#f8fafc',
              border: '1px solid',
              borderColor: 'divider',
              mb: 3
            }}
          >
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  مبلغ تراکنش:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#f47c20' }}>
                  {formatPrice(effectiveAmount)}
                </Typography>
              </Box>

              <Divider sx={{ borderColor: 'divider' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  شماره پیگیری / مرجع بانکی:
                </Typography>
                <Typography sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'text.primary' }}>
                  {effectiveRefNumber}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  شناسه پیگیری درگاه (Track ID):
                </Typography>
                <Typography sx={{ fontWeight: 600, fontFamily: 'monospace', color: 'text.secondary', fontSize: '0.88rem' }}>
                  {effectiveTrackId}
                </Typography>
              </Box>

              {payment?.cardNumber && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    شماره کارت پرداخت‌کننده:
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'text.primary', direction: 'ltr' }}>
                    {payment.cardNumber}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  درگاه پرداخت:
                </Typography>
                <Chip
                  label={effectiveGateway}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    backgroundColor: isDark ? 'rgba(244, 124, 32, 0.15)' : '#fff8ed',
                    color: isDark ? '#fed7aa' : '#b94410'
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  تاریخ و زمان:
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {formatDate(payment?.paidAt || payment?.createdAt || new Date())}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Purchased Items List if present */}
          {payment?.items && payment.items.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: 'text.primary' }}>
                اقلام این سفارش ({toPersianDigits(payment.items.length)}):
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                  overflow: 'hidden'
                }}
              >
                <List disablePadding>
                  {payment.items.map((item, idx) => (
                    <ListItem
                      key={item.id || idx}
                      divider={idx < payment.items.length - 1}
                      sx={{ py: 1.5, px: 2 }}
                    >
                      <ListItemText
                        primary={item.productName || 'دوره آموزشی حرکت'}
                        primaryTypographyProps={{ fontWeight: 700, fontSize: '0.88rem', color: 'text.primary' }}
                        secondary={item.productType === 'subscription' ? 'پلن اشتراک ویژه' : 'دوره مهارتی'}
                      />
                      <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#f47c20' }}>
                        {formatPrice(item.price)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>
          )}

          {/* Action Buttons */}
          <Grid container spacing={2}>
            {resolvedStatus === 'success' ? (
              <>
                <Grid item xs={12} sm={6}>
                  <Button
                    component={Link}
                    to="/courses"
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<SchoolIcon />}
                    sx={{
                      py: 1.3,
                      borderRadius: '16px',
                      fontWeight: 700,
                      backgroundColor: '#16a34a',
                      '&:hover': { backgroundColor: '#15803d' }
                    }}
                  >
                    مشاهده در دوره‌های من
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    component={Link}
                    to="/payments"
                    variant="outlined"
                    fullWidth
                    size="large"
                    startIcon={<ReceiptLongIcon />}
                    sx={{
                      py: 1.3,
                      borderRadius: '16px',
                      fontWeight: 700,
                      borderColor: 'divider',
                      color: 'text.primary'
                    }}
                  >
                    سوابق پرداخت‌ها
                  </Button>
                </Grid>
              </>
            ) : resolvedStatus === 'pending' ? (
              <>
                <Grid item xs={12} sm={6}>
                  <Button
                    onClick={fetchStatus}
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<RefreshIcon />}
                    sx={{
                      py: 1.3,
                      borderRadius: '16px',
                      fontWeight: 700,
                      backgroundColor: '#2563eb',
                      '&:hover': { backgroundColor: '#1d4ed8' }
                    }}
                  >
                    استعلام مجدد وضعیت
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    component={Link}
                    to="/payments"
                    variant="outlined"
                    fullWidth
                    size="large"
                    sx={{
                      py: 1.3,
                      borderRadius: '16px',
                      fontWeight: 700,
                      borderColor: 'divider',
                      color: 'text.primary'
                    }}
                  >
                    مشاهده سوابق
                  </Button>
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={12} sm={6}>
                  <Button
                    component={Link}
                    to="/payments"
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<ArrowBackIcon />}
                    sx={{
                      py: 1.3,
                      borderRadius: '16px',
                      fontWeight: 700,
                      backgroundColor: '#f47c20',
                      '&:hover': { backgroundColor: '#df5b13' }
                    }}
                  >
                    تلاش مجدد برای پرداخت
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    component={Link}
                    to="/tickets"
                    variant="outlined"
                    fullWidth
                    size="large"
                    startIcon={<SupportAgentIcon />}
                    sx={{
                      py: 1.3,
                      borderRadius: '16px',
                      fontWeight: 700,
                      borderColor: 'divider',
                      color: 'text.primary'
                    }}
                  >
                    ارتباط با پشتیبانی
                  </Button>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
        </SpotlightCard>
      </Box>
    </AnimatedPage>
  );
}
