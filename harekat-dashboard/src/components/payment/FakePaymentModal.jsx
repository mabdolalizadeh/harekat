import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import paymentsApi from '../../api/paymentsApi.js';

export default function FakePaymentModal({ open, payment, onClose, onSuccess, onCancelled }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  if (!payment) return null;

  const handlePay = async () => {
    try {
      setProcessing(true);
      setError(null);
      const res = await paymentsApi.processFakePayment(
        payment.id,
        'pay',
        `TXN-SIM-${Date.now()}`
      );
      if (res?.ok) {
        if (onSuccess) onSuccess(res.data);
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
          p: { xs: 3, sm: 4 },
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          backgroundColor: 'background.paper',
        }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: 3,
            width: '100%'
          }}
        >
          {/* 1. Section/Page Heading (Title) */}
          <Typography
            component="h1"
            variant="h5"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              fontSize: { xs: '1.35rem', sm: '1.6rem' }
            }}
          >
            پرداخت
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', borderRadius: '12px' }}>
              {error}
            </Alert>
          )}

          {/* 2. Primary Payment / Action Button */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={processing}
            onClick={handlePay}
            sx={{
              py: 1.5,
              borderRadius: '16px',
              fontWeight: 700,
              fontSize: '1.05rem',
              backgroundColor: '#16a34a',
              '&:hover': { backgroundColor: '#15803d' },
              boxShadow: '0 10px 15px -3px rgba(22, 163, 74, 0.25)'
            }}
          >
            {processing ? <CircularProgress size={24} color="inherit" /> : 'پرداخت'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
