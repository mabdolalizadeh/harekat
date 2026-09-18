import { useState } from 'react';
import { adminApi, isSuperAdmin } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { formatToman } from '../../utils/format.js';
import { Card, PageHeader, ListRowSkeleton } from './adminUi.jsx';
import {
  Box, Stack, Typography, Grid, Alert, Paper, Chip,
  Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Visibility as ViewIcon } from '@mui/icons-material';

const STATUS_MAP = {
  pending: { label: 'در انتظار پرداخت', color: 'warning' },
  paid: { label: 'پرداخت شده', color: 'success' },
  failed: { label: 'ناموفق', color: 'error' },
  cancelled: { label: 'لغو شده', color: 'default' },
  refunded: { label: 'مرجوع شده', color: 'info' }
};

export default function AdminOrders() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [notice, setNotice] = useState(null);

  const orders = useApi(() => adminApi.listOrders());

  if (!isSuperAdmin()) {
    return <Alert severity="warning">دسترسی به بخش سفارشات فقط برای مدیر ارشد مجاز است.</Alert>;
  }

  const handleUpdateStatus = async () => {
    if (!newStatus || !selectedOrder) return;
    setUpdating(true);
    try {
      await adminApi.updateOrderStatus(selectedOrder.id, { status: newStatus });
      setNotice('وضعیت سفارش با موفقیت تغییر کرد');
      setSelectedOrder(null);
      orders.reload();
    } catch (err) {
      alert(`خطا: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="سفارش‌ها"
        subtitle="مشاهده و مدیریت تمام سفارش‌های ثبت‌شده توسط کاربران"
      />

      {notice && <Alert severity="success" onClose={() => setNotice(null)}>{notice}</Alert>}

      <Card>
        {orders.loading && <ListRowSkeleton count={5} />}
        {orders.error && (
          <Alert severity="error">
            خطا: {orders.error} <Button size="small" onClick={orders.reload}>تلاش مجدد</Button>
          </Alert>
        )}

        {!orders.loading && orders.isEmpty && (
          <Alert severity="info">هیچ سفارشی یافت نشد.</Alert>
        )}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>شماره سفارش</TableCell>
              <TableCell>کاربر / دانشجو</TableCell>
              <TableCell>مبلغ نهایی</TableCell>
              <TableCell>کد تخفیف</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell>تاریخ ثبت</TableCell>
              <TableCell align="left">جزئیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(orders.data || []).map((o) => {
              const st = STATUS_MAP[o.status] || { label: o.status, color: 'default' };
              const user = o.user;
              const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.phoneNumber : '—';
              return (
                <TableRow key={o.id}>
                  <TableCell dir="ltr" sx={{ fontWeight: 600, fontSize: 12 }}>
                    {o.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600} fontSize={13}>{userName}</Typography>
                    {user?.phoneNumber && (
                      <Typography variant="caption" color="text.secondary" dir="ltr" display="block">
                        {user.phoneNumber}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    {formatToman(o.finalAmount)}
                  </TableCell>
                  <TableCell>
                    {o.couponCode ? (
                      <Chip label={o.couponCode} size="small" variant="outlined" />
                    ) : '—'}
                  </TableCell>
                  <TableCell>
                    <Chip label={st.label} color={st.color} size="small" sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString('fa-IR') : '—'}
                  </TableCell>
                  <TableCell align="left">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      onClick={() => {
                        setSelectedOrder(o);
                        setNewStatus(o.status);
                      }}
                    >
                      مشاهده و تغییر
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Order Detail & Status Modal */}
      {selectedOrder && (
        <Dialog open onClose={() => setSelectedOrder(null)} maxWidth="sm" fullWidth dir="rtl">
          <DialogTitle fontWeight={700}>
            جزئیات سفارش #{selectedOrder.id.slice(0, 8)}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">آیتم‌های سفارش:</Typography>
                <Stack spacing={1} mt={1}>
                  {(selectedOrder.items || []).map((item) => (
                    <Paper key={item.id} elevation={0} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography fontWeight={600} fontSize={14}>{item.productName || item.productId}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            نوع: {item.productType === 'course' ? 'دوره' : item.productType === 'subscription' ? 'اشتراک' : item.productType}
                          </Typography>
                        </Box>
                        <Typography fontWeight={700} color="primary">
                          {formatToman(item.price)}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>

              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">مبلغ کل: {formatToman(selectedOrder.totalAmount)}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">تخفیف: {formatToman(selectedOrder.discountAmount)}</Typography>
                </Grid>
              </Grid>

              <Divider />

              <FormControl fullWidth size="small">
                <InputLabel>تغییر وضعیت سفارش</InputLabel>
                <Select
                  value={newStatus}
                  label="تغییر وضعیت سفارش"
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <MenuItem value="pending">در انتظار پرداخت</MenuItem>
                  <MenuItem value="paid">پرداخت شده</MenuItem>
                  <MenuItem value="failed">ناموفق</MenuItem>
                  <MenuItem value="cancelled">لغو شده</MenuItem>
                  <MenuItem value="refunded">مرجوع شده</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setSelectedOrder(null)}>بستن</Button>
            <Button
              variant="contained"
              disabled={updating || newStatus === selectedOrder.status}
              onClick={handleUpdateStatus}
            >
              {updating ? 'در حال ثبت...' : 'بروزرسانی وضعیت'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  );
}
