import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Chip
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SecurityIcon from '@mui/icons-material/Security';
import paymentsApi from '../../api/paymentsApi.js';
import { formatPrice, toPersianDigits } from '../../utils/formatters.js';

export default function FakePaymentModal({ open, payment, onClose, onSuccess, onCancelled }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  if (!payment) return null;

  const handleAction = async (action) => {
    try {
      setProcessing(true);
      setError(null);
      const res = await paymentsApi.processFakePayment(
        payment.id,
        action,
        `TXN-SIM-${Date.now()}`
      );
      if (res?.ok) {
        if (action === 'pay') {
          if (onSuccess) onSuccess(res.data);
        } else {
          if (onCancelled) onCancelled(res.data);
        }
        onClose();
      } else {
        setError(res?.message || 'خطا در انجام تراکنش');
      }
    } catch (err) {
      setError(err.message || 'خطا در برقراری ارتباط با سرور درگاه');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={processing ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          p: 1,
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              backgroundColor: '#fff8ed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f47c20',
              border: '1px solid #fed7aa'
            }}
          >
            <AccountBalanceIcon sx={{ fontSize: 32 }} />
          </Box>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.15rem' }}>
          درگاه پرداخت تستی (شبیه‌ساز)
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748b' }}>
          محیط آزمایشی شاپرک / پرداخت امن حرکت
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ py: 1.5 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        {/* Invoice Summary Card */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 2.5,
            borderRadius: '16px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              مبلغ قابل پرداخت:
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#f47c20' }}>
              {formatPrice(payment.amount || 0)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              شناسه پرداخت:
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
              {payment.id?.slice(0, 16)}...
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              درگاه مقصد:
            </Typography>
            <Chip
              label="تستی / شاپرک"
              size="small"
              sx={{ height: 20, fontSize: '0.68rem', backgroundColor: '#e2e8f0', color: '#334155' }}
            />
          </Box>
        </Paper>

        {/* Mock Card Preview */}
        <Box
          sx={{
            p: 2,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#ffffff',
            mb: 2,
            boxShadow: '0 8px 16px -4px rgba(15, 23, 42, 0.2)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <CreditCardIcon sx={{ color: '#f47c20', fontSize: 28 }} />
            <Typography variant="caption" sx={{ color: '#94a3b8', letterSpacing: 1 }}>
              TEST DEBIT CARD
            </Typography>
          </Box>
          <Typography sx={{ fontFamily: 'monospace', fontSize: '1.05rem', letterSpacing: 2, mb: 1.5 }}>
            ۶۰۳۷ •••• •••• ۱۲۳۴
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              کاربر تستی حرکت
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: 'monospace' }}>
              ۱۲/۰۸
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
          <SecurityIcon sx={{ fontSize: 16, color: '#10b981' }} />
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            اتصال شبیه‌سازی‌شده امن به درگاه پرداخت
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0, flexDirection: 'column', gap: 1 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={processing}
          onClick={() => handleAction('pay')}
          startIcon={processing ? <CircularProgress size={18} color="inherit" /> : <CheckCircleOutlineIcon />}
          sx={{
            borderRadius: '14px',
            py: 1.2,
            fontWeight: 700,
            fontSize: '0.95rem',
            backgroundColor: '#16a34a',
            '&:hover': { backgroundColor: '#15803d' }
          }}
        >
          {processing ? 'در حال پردازش...' : 'پرداخت آزمایشی (تایید)'}
        </Button>

        <Button
          fullWidth
          variant="outlined"
          color="error"
          size="medium"
          disabled={processing}
          onClick={() => handleAction('cancel')}
          startIcon={<CancelOutlinedIcon />}
          sx={{
            borderRadius: '14px',
            py: 1,
            fontWeight: 600,
            fontSize: '0.85rem',
            borderColor: '#fca5a5'
          }}
        >
          لغو پرداخت و بازگشت
        </Button>
      </DialogActions>
    </Dialog>
  );
}
