import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert
} from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';

import { paymentsApi } from '../api/paymentsApi.js';
import { formatPrice, formatDate, toPersianDigits } from '../utils/formatters.js';
import FakePaymentModal from '../components/payment/FakePaymentModal.jsx';
import AnimatedPage from '../components/ui/AnimatedPage.jsx';
import SpotlightCard from '../components/ui/SpotlightCard.jsx';
import AnimatedNumber from '../components/ui/AnimatedNumber.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useThemeMode } from '../contexts/ThemeModeContext.jsx';

export default function OrdersPage() {
  const { refreshUser } = useAuth();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const res = await paymentsApi.getMyPayments();
      if (res?.ok && res.data) {
        setPayments(res.data);
      }
    } catch (err) {
      console.error('Error loading payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleOpenPaymentModal = async (payment) => {
    try {
      const orderId = payment.orderId || payment.id;
      const initRes = await paymentsApi.initiatePayment(orderId, payment.gateway);
      if (initRes?.ok && initRes.data?.requiresGatewayRedirect && initRes.data?.redirectUrl) {
        window.location.href = initRes.data.redirectUrl;
        return;
      }
      setSelectedPayment({ ...payment, ...(initRes?.data || {}) });
      setModalOpen(true);
    } catch (err) {
      setSelectedPayment(payment);
      setModalOpen(true);
    }
  };

  const handlePaymentSuccess = async (data) => {
    setFeedbackMessage({
      type: 'success',
      text: 'پرداخت با موفقیت انجام شد و دوره‌ها و بسته‌های آموزشی بلافاصله برای شما فعال گردیدند!'
    });
    refreshUser();
    await loadPayments();
  };

  const handlePaymentCancelled = async (data) => {
    setFeedbackMessage({
      type: 'warning',
      text: 'پرداخت توسط شما لغو شد. سفارش به حالت لغو شده تغییر یافت.'
    });
    await loadPayments();
  };

  const getStatusChip = (status) => {
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'paid':
        return (
          <Chip
            icon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
            label="پرداخت شده"
            size="small"
            sx={{
              backgroundColor: isDark ? 'rgba(22, 163, 106, 0.2)' : '#dcfce7',
              color: isDark ? '#4ade80' : '#15803d',
              fontWeight: 700
            }}
          />
        );
      case 'pending':
        return (
          <Chip
            icon={<HourglassEmptyIcon sx={{ fontSize: 16 }} />}
            label="در انتظار پرداخت"
            size="small"
            sx={{
              backgroundColor: isDark ? 'rgba(217, 148, 0, 0.2)' : '#fef3c7',
              color: isDark ? '#fcd34d' : '#b45309',
              fontWeight: 700
            }}
          />
        );
      case 'failed':
        return (
          <Chip
            icon={<HighlightOffIcon sx={{ fontSize: 16 }} />}
            label="ناموفق"
            size="small"
            sx={{
              backgroundColor: isDark ? 'rgba(229, 72, 77, 0.2)' : '#fee2e2',
              color: isDark ? '#f87171' : '#b91c1c',
              fontWeight: 700
            }}
          />
        );
      case 'cancelled':
        return (
          <Chip
            icon={<HighlightOffIcon sx={{ fontSize: 16 }} />}
            label="لغو شده"
            size="small"
            sx={{
              backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
              color: 'text.secondary',
              fontWeight: 700
            }}
          />
        );
      default:
        return (
          <Chip
            label={status || 'نامشخص'}
            size="small"
            sx={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9', color: 'text.secondary' }}
          />
        );
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AnimatedPage>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.75rem' }, mb: 0.5, color: 'text.primary' }}>
          تاریخچه پرداخت‌ها و تراکنش‌ها
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          گزارش کامل سفارش‌ها، وضعیت درگاه و کد رهگیری تراکنش‌ها
        </Typography>
      </Box>

      {feedbackMessage && (
        <Alert
          severity={feedbackMessage.type}
          onClose={() => setFeedbackMessage(null)}
          sx={{ mb: 3, borderRadius: '16px' }}
        >
          {feedbackMessage.text}
        </Alert>
      )}

      {payments.length === 0 ? (
        <Card
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: '24px',
            border: '1px dashed',
            borderColor: 'divider',
            backgroundColor: 'background.paper'
          }}
        >
          <ReceiptLongOutlinedIcon sx={{ fontSize: 60, color: '#f47c20', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
            هیچ تراکنشی یافت نشد
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, maxWidth: 440, mx: 'auto' }}>
            پس از ثبت سفارش در دوره‌ها یا پکیج‌های مهارتی، وضعیت پرداخت و فاکتور شما در این بخش نمایش داده خواهد شد.
          </Typography>
        </Card>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: '20px',
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.03)',
            overflow: 'auto'
          }}
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: isDark ? '#1e293b' : '#f7f5f0' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: 'text.primary' }}>شناسه سفارش / پرداخت</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.primary' }}>محصول / دوره</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.primary' }}>مبلغ</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.primary' }}>تاریخ</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.primary' }}>وضعیت</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.primary' }}>درگاه / کد رهگیری</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.primary', textAlign: 'left' }}>عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((p) => {
                const isPending = (p.status || '').toLowerCase() === 'pending';
                return (
                  <TableRow key={p.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.82rem', fontFamily: 'monospace', color: 'text.primary' }}>
                      {p.orderId ? p.orderId.slice(0, 13) + '...' : p.id.slice(0, 13) + '...'}
                    </TableCell>

                    <TableCell sx={{ fontWeight: 700, fontSize: '0.88rem', color: 'text.primary' }}>
                      {p.product || 'سفارش دوره'}
                    </TableCell>

                    <TableCell sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#f47c20' }}>
                      {formatPrice(p.amount)}
                    </TableCell>

                    <TableCell sx={{ fontSize: '0.84rem', color: 'text.secondary' }}>
                      {formatDate(p.date)}
                    </TableCell>

                    <TableCell>
                      {getStatusChip(p.status)}
                    </TableCell>

                    <TableCell sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: 'text.primary' }}>
                          {p.gateway === 'zibal' ? 'درگاه زیبال' : (p.gateway === 'mock' ? 'درگاه آزمایشی' : (p.gateway || 'درگاه آنلاین'))}
                        </Typography>
                        {p.trackId && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            شناسه: {p.trackId}
                          </Typography>
                        )}
                        {p.transactionId ? (
                          <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 600, display: 'block', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            کد مرجع: {p.transactionId}
                          </Typography>
                        ) : !p.trackId && (
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                            فاقد کد رهگیری
                          </Typography>
                        )}
                        {p.cardNumber && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                            {p.cardNumber}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    <TableCell sx={{ textAlign: 'left' }}>
                      {isPending ? (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleOpenPaymentModal(p)}
                          startIcon={<CreditCardOutlinedIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            backgroundColor: '#f47c20',
                            '&:hover': { backgroundColor: '#df5b13' }
                          }}
                        >
                          پرداخت در درگاه
                        </Button>
                      ) : (
                        <Chip
                          label={p.status === 'paid' ? 'پرداخت موفق' : 'لغو شده'}
                          size="small"
                          sx={{
                            height: 24,
                            fontSize: '0.72rem',
                            backgroundColor: p.status === 'paid'
                              ? (isDark ? 'rgba(22, 163, 106, 0.2)' : '#dcfce7')
                              : (isDark ? '#1e293b' : '#f1f5f9'),
                            color: p.status === 'paid' ? (isDark ? '#4ade80' : '#15803d') : 'text.secondary'
                          }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Fake Payment Gateway Modal */}
      <FakePaymentModal
        open={modalOpen}
        payment={selectedPayment}
        onClose={() => setModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        onCancelled={handlePaymentCancelled}
      />
    </AnimatedPage>
  );
}
