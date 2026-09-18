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
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

import { paymentsApi } from '../api/paymentsApi.js';
import { formatPrice, formatDate, toPersianDigits } from '../utils/formatters.js';

export default function OrdersPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);
  const [verifyMessage, setVerifyMessage] = useState(null);

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

  const handleSimulatePayment = async (payment) => {
    try {
      setVerifyingId(payment.id);
      setVerifyMessage(null);
      const simulatedRef = `SIM-${Date.now()}`;
      const res = await paymentsApi.verifyPayment(payment.id, simulatedRef);
      if (res?.ok) {
        setVerifyMessage({ type: 'success', text: 'پرداخت با موفقیت تایید شد و دسترسی به دوره‌ها بلافاصله فعال گردید!' });
        await loadPayments();
      }
    } catch (err) {
      setVerifyMessage({ type: 'error', text: err.message || 'خطا در تایید پرداخت' });
    } finally {
      setVerifyingId(null);
    }
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
            sx={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 700 }}
          />
        );
      case 'pending':
        return (
          <Chip
            icon={<HourglassEmptyIcon sx={{ fontSize: 16 }} />}
            label="در انتظار پرداخت"
            size="small"
            sx={{ backgroundColor: '#fef3c7', color: '#b45309', fontWeight: 700 }}
          />
        );
      case 'failed':
        return (
          <Chip
            icon={<HighlightOffIcon sx={{ fontSize: 16 }} />}
            label="ناموفق"
            size="small"
            sx={{ backgroundColor: '#fee2e2', color: '#b91c1c', fontWeight: 700 }}
          />
        );
      case 'cancelled':
        return (
          <Chip
            icon={<HighlightOffIcon sx={{ fontSize: 16 }} />}
            label="لغو شده"
            size="small"
            sx={{ backgroundColor: '#f1f5f9', color: '#64748b', fontWeight: 700 }}
          />
        );
      default:
        return (
          <Chip
            label={status || 'نامشخص'}
            size="small"
            sx={{ backgroundColor: '#f1f5f9', color: '#64748b' }}
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
    <Box>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.75rem' }, mb: 0.5, color: '#171715' }}>
          تاریخچه پرداخت‌ها و تراکنش‌ها
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b6b63' }}>
          گزارش کامل سفارش‌ها، شهریه دوره‌ها، وضعیت درگاه و کد رهگیری پرداخت
        </Typography>
      </Box>

      {verifyMessage && (
        <Alert severity={verifyMessage.type} sx={{ mb: 3, borderRadius: '16px' }}>
          {verifyMessage.text}
        </Alert>
      )}

      {payments.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center', borderRadius: '24px', border: '1px dashed #deddd7', backgroundColor: '#ffffff' }}>
          <ReceiptLongOutlinedIcon sx={{ fontSize: 60, color: '#f47c20', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#171715' }}>
            هیچ تراکنشی یافت نشد
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b6b63', mb: 3, maxWidth: 440, mx: 'auto' }}>
            پس از ثبت سفارش در دوره‌ها یا پکیج‌های مهارتی، وضعیت پرداخت و فاکتور شما در این بخش نمایش داده خواهد شد.
          </Typography>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: '20px', border: '1px solid #deddd7', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: '#f7f5f0' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#171715' }}>شناسه سفارش / پرداخت</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#171715' }}>محصول / دوره</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#171715' }}>مبلغ</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#171715' }}>تاریخ</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#171715' }}>وضعیت</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#171715' }}>درگاه / کد رهگیری</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#171715', textAlign: 'left' }}>عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((p) => {
                const isPending = (p.status || '').toLowerCase() === 'pending';
                return (
                  <TableRow key={p.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.82rem', fontFamily: 'monospace' }}>
                      {p.orderId ? p.orderId.slice(0, 13) + '...' : p.id.slice(0, 13) + '...'}
                    </TableCell>

                    <TableCell sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#171715' }}>
                      {p.product || 'سفارش دوره'}
                    </TableCell>

                    <TableCell sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#f47c20' }}>
                      {formatPrice(p.amount)}
                    </TableCell>

                    <TableCell sx={{ fontSize: '0.84rem', color: '#6b6b63' }}>
                      {formatDate(p.date)}
                    </TableCell>

                    <TableCell>
                      {getStatusChip(p.status)}
                    </TableCell>

                    <TableCell sx={{ fontSize: '0.82rem', color: '#55554f' }}>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                          {p.gateway || 'درگاه آنلاین'}
                        </Typography>
                        {p.transactionId ? (
                          <Typography variant="caption" sx={{ color: '#9b9b92', fontFamily: 'monospace' }}>
                            {p.transactionId}
                          </Typography>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#9b9b92' }}>
                            فاقد کد رهگیری
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    <TableCell sx={{ textAlign: 'left' }}>
                      {isPending ? (
                        <Button
                          size="small"
                          variant="contained"
                          disabled={verifyingId === p.id}
                          onClick={() => handleSimulatePayment(p)}
                          startIcon={verifyingId === p.id ? <CircularProgress size={14} color="inherit" /> : <CreditCardOutlinedIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            backgroundColor: '#f47c20',
                            '&:hover': { backgroundColor: '#df5b13' }
                          }}
                        >
                          پرداخت و فعال‌سازی
                        </Button>
                      ) : (
                        <Chip
                          label="تکمیل شده"
                          size="small"
                          sx={{ height: 24, fontSize: '0.72rem', backgroundColor: '#f1f5f9', color: '#64748b' }}
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
    </Box>
  );
}
