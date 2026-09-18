import { useState } from 'react';
import { adminApi, isSuperAdmin } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { formatToman } from '../../utils/format.js';
import { Card, PageHeader, ListRowSkeleton } from './adminUi.jsx';
import {
  Box, Stack, Typography, Grid, Alert, Chip,
  Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel, Tooltip
} from '@mui/material';
import { CheckCircle as VerifyIcon, Payment as PayIcon } from '@mui/icons-material';

const STATUS_MAP = {
  pending: { label: 'در انتظار پرداخت', color: 'warning' },
  paid: { label: 'پرداخت موفق', color: 'success' },
  failed: { label: 'ناموفق', color: 'error' },
  cancelled: { label: 'لغو شده', color: 'default' },
  refunded: { label: 'مسترد شده', color: 'info' }
};

export default function AdminPayments() {
  const [notice, setNotice] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);

  const payments = useApi(() => adminApi.listPayments());

  if (!isSuperAdmin()) {
    return <Alert severity="warning">دسترسی به بخش پرداخت‌ها فقط برای مدیر ارشد مجاز است.</Alert>;
  }

  const handleVerify = async (paymentId) => {
    if (!window.confirm('آیا از تایید این تراکنش و اعطای خودکار دسترسی دوره‌ها به کاربر اطمینان دارید؟')) return;
    setVerifyingId(paymentId);
    try {
      await adminApi.verifyPayment(paymentId);
      setNotice('پرداخت با موفقیت تایید و دسترسی‌های دوره فعال شدند');
      payments.reload();
    } catch (err) {
      alert(`خطا: ${err.message}`);
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="پرداخت‌ها و تراکنش‌ها"
        subtitle="سوابق تراکنش‌های درگاه، وضعیت پرداخت‌ها و اعطای خودکار دسترسی پس از تایید"
      />

      {notice && <Alert severity="success" onClose={() => setNotice(null)}>{notice}</Alert>}

      <Card>
        {payments.loading && <ListRowSkeleton count={5} />}
        {payments.error && (
          <Alert severity="error">
            خطا: {payments.error} <Button size="small" onClick={payments.reload}>تلاش مجدد</Button>
          </Alert>
        )}

        {!payments.loading && payments.isEmpty && (
          <Alert severity="info">هیچ تراکنشی یافت نشد.</Alert>
        )}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>شناسه تراکنش</TableCell>
              <TableCell>کاربر / دانشجو</TableCell>
              <TableCell>سفارش مربوطه</TableCell>
              <TableCell>مبلغ</TableCell>
              <TableCell>درگاه</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell>تاریخ</TableCell>
              <TableCell align="left">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(payments.data || []).map((p) => {
              const st = STATUS_MAP[p.status || p.type] || { label: p.status || p.type, color: 'default' };
              const user = p.user;
              const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.phoneNumber : '—';
              const isPaid = (p.status === 'paid' || p.type === 'paid');

              return (
                <TableRow key={p.id}>
                  <TableCell dir="ltr" sx={{ fontSize: 11, fontWeight: 600 }}>
                    {p.transactionId || p.id.slice(0, 10)}
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600} fontSize={13}>{userName}</Typography>
                    {user?.phoneNumber && (
                      <Typography variant="caption" color="text.secondary" dir="ltr" display="block">
                        {user.phoneNumber}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell dir="ltr" sx={{ fontSize: 12 }}>
                    {p.orderId ? `#${p.orderId.slice(0, 8)}` : '—'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    {p.amount ? formatToman(p.amount) : (p.order ? formatToman(p.order.finalAmount) : '—')}
                  </TableCell>
                  <TableCell dir="ltr">
                    <Chip size="small" label={p.gateway || 'mock'} variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip label={st.label} color={st.color} size="small" sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString('fa-IR') : '—'}
                  </TableCell>
                  <TableCell align="left">
                    {!isPaid && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<VerifyIcon />}
                        disabled={verifyingId === p.id}
                        onClick={() => handleVerify(p.id)}
                      >
                        {verifyingId === p.id ? '...' : 'تایید پرداخت'}
                      </Button>
                    )}
                    {isPaid && (
                      <Typography variant="caption" color="success.main" fontWeight={700}>
                        تایید شده
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </Stack>
  );
}
