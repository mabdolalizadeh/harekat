import { useState, useMemo } from 'react';
import {
  Box,
  Stack,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  Paper
} from '@mui/material';
import {
  CheckCircle as VerifyIcon,
  Payment as PayIcon,
  InfoOutlined as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { adminApi, isSuperAdmin } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { formatToman, formatDate } from '../../utils/format.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import StatusChip from '../../components/admin/StatusChip.jsx';

export default function AdminPayments() {
  const { showSuccess, showError } = useNotification();
  const [verifyingTarget, setVerifyingTarget] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const payments = useApi(() => adminApi.listPayments());

  const handleConfirmVerify = async () => {
    if (!verifyingTarget) return;
    setVerifying(true);
    try {
      await adminApi.verifyPayment(verifyingTarget.id);
      showSuccess('پرداخت با موفقیت تایید شد و دسترسی‌های دوره برای کاربر فعال گردیدند');
      setVerifyingTarget(null);
      payments.reload();
    } catch (err) {
      showError(err.message || 'خطا در تایید تراکنش');
    } finally {
      setVerifying(false);
    }
  };

  const filteredPayments = useMemo(() => {
    const list = payments.data || [];
    if (statusFilter === 'all') return list;
    return list.filter((p) => (p.status || p.type) === statusFilter);
  }, [payments.data, statusFilter]);

  const columns = useMemo(() => [
    {
      id: 'id',
      label: 'شناسه پرداخت',
      render: (row) => (
        <Typography dir="ltr" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary' }}>
          #{row.id ? row.id.slice(0, 8) : '—'}
        </Typography>
      )
    },
    {
      id: 'user',
      label: 'کاربر / دانشجو',
      render: (row) => {
        const user = row.user;
        const name = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.phoneNumber : '—';
        return (
          <Box>
            <Typography fontWeight={700} fontSize="0.84rem">
              {name}
            </Typography>
            {user?.phoneNumber && (
              <Typography variant="caption" color="text.secondary" dir="ltr" display="block">
                {user.phoneNumber}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      id: 'product',
      label: 'پکیج / دوره / اشتراک',
      render: (row) => {
        const items = row.order?.items || [];
        if (items.length === 0) {
          return row.description ? (
            <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 180, display: 'block', noWrap: true }}>
              {row.description}
            </Typography>
          ) : (
            <Typography variant="caption" color="text.disabled">—</Typography>
          );
        }
        return (
          <Box sx={{ maxWidth: 200 }}>
            {items.map((item, idx) => (
              <Chip
                key={item.id || idx}
                label={item.productName || (item.productType === 'subscription' ? 'اشتراک' : 'دوره')}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 22, mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
        );
      }
    },
    {
      id: 'amount',
      label: 'مبلغ',
      render: (row) => (
        <Typography fontWeight={700} fontSize="0.84rem" color="primary.main">
          {formatToman(row.amount)}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'وضعیت',
      render: (row) => <StatusChip status={row.status || row.type} />,
    },
    {
      id: 'gateway',
      label: 'درگاه',
      render: (row) => (
        <Chip
          label={row.gateway === 'zibal' ? 'زیبال' : (row.gateway === 'mock' ? 'آزمایشی' : (row.gateway || 'mock'))}
          size="small"
          color={row.gateway === 'zibal' ? 'primary' : 'default'}
          sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600 }}
        />
      ),
    },
    {
      id: 'trackId',
      label: 'شناسه درگاه (Track ID)',
      render: (row) => (
        row.trackId ? (
          <Typography dir="ltr" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.78rem' }}>
            {row.trackId}
          </Typography>
        ) : (
          <Typography variant="caption" color="text.disabled">—</Typography>
        )
      )
    },
    {
      id: 'transactionId',
      label: 'شماره مرجع / تراکنش',
      render: (row) => (
        row.transactionId ? (
          <Typography dir="ltr" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.78rem', color: 'success.dark' }}>
            {row.transactionId}
          </Typography>
        ) : (
          <Typography variant="caption" color="text.disabled">—</Typography>
        )
      )
    },
    {
      id: 'createdAt',
      label: 'تاریخ ایجاد',
      render: (row) => (
        <Typography variant="caption" color="text.secondary">
          {formatDate(row.createdAt)}
        </Typography>
      ),
    },
    {
      id: 'paidAt',
      label: 'تاریخ پرداخت',
      render: (row) => (
        <Typography variant="caption" color={row.paidAt ? 'success.main' : 'text.disabled'} fontWeight={row.paidAt ? 600 : 400}>
          {row.paidAt ? formatDate(row.paidAt) : '—'}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'عملیات',
      sortable: false,
      align: 'left',
      render: (row) => {
        const isPaid = (row.status === 'paid' || row.type === 'paid');
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              size="small"
              onClick={() => setSelectedDetails(row)}
              title="مشاهده جزئیات کامل تراکنش"
            >
              <InfoIcon fontSize="small" />
            </IconButton>
            {isPaid ? (
              <Chip size="small" label="تایید شده" color="success" variant="outlined" sx={{ height: 24, fontSize: '0.72rem' }} />
            ) : (
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<VerifyIcon fontSize="small" />}
                onClick={() => setVerifyingTarget(row)}
                sx={{ borderRadius: 2, fontSize: '0.72rem', py: 0.4 }}
              >
                تایید تراکنش
              </Button>
            )}
          </Stack>
        );
      },
    },
  ], []);

  if (!isSuperAdmin()) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="warning.main">دسترسی به بخش پرداخت‌ها فقط برای مدیر ارشد مجاز است.</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3.5}>
      <PageHeader
        title="پرداخت‌ها و تراکنش‌ها"
        subtitle="سوابق تراکنش‌های پرداخت، وضعیت درگاه زیبال و اعطای خودکار دسترسی دوره‌ها پس از تایید"
      />

      {/* Payments DataTable */}
      <DataTable
        columns={columns}
        rows={filteredPayments}
        loading={payments.loading}
        error={payments.error}
        onReload={payments.reload}
        searchPlaceholder="جستجوی شناسه تراکنش، شناسه پیگیری، نام یا شماره تماس..."
        searchFilter={(row, term) => {
          const user = row.user;
          const name = `${user?.firstName || ''} ${user?.lastName || ''}`.toLowerCase();
          const phone = (user?.phoneNumber || '').toLowerCase();
          const txId = (row.transactionId || '').toLowerCase();
          const trId = (row.trackId || '').toLowerCase();
          const pId = (row.id || '').toLowerCase();
          return name.includes(term) || phone.includes(term) || txId.includes(term) || trId.includes(term) || pId.includes(term);
        }}
        filterSlot={
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>فیلتر وضعیت</InputLabel>
            <Select
              value={statusFilter}
              label="فیلتر وضعیت"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">همه وضعیت‌ها</MenuItem>
              <MenuItem value="paid">پرداخت موفق</MenuItem>
              <MenuItem value="pending">در انتظار پرداخت</MenuItem>
              <MenuItem value="failed">ناموفق</MenuItem>
              <MenuItem value="cancelled">لغو شده</MenuItem>
              <MenuItem value="refunded">مسترد شده</MenuItem>
            </Select>
          </FormControl>
        }
        emptyTitle="تراکنشی یافت نشد"
        emptyDescription="هیچ پرداختی مطابق با فیلترهای انتخابی یافت نشد."
      />

      {/* Detailed Payment View Dialog */}
      <Dialog
        open={Boolean(selectedDetails)}
        onClose={() => setSelectedDetails(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            جزئیات تراکنش پرداخت
          </Typography>
          <IconButton size="small" onClick={() => setSelectedDetails(null)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedDetails && (
            <Stack spacing={2}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">شناسه پرداخت:</Typography>
                    <Typography fontFamily="monospace" fontSize="0.82rem" fontWeight={600} dir="ltr">{selectedDetails.id}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">شناسه سفارش:</Typography>
                    <Typography fontFamily="monospace" fontSize="0.82rem" fontWeight={600} dir="ltr">{selectedDetails.orderId || '—'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">مبلغ:</Typography>
                    <Typography fontWeight={700} color="primary.main">{formatToman(selectedDetails.amount)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">وضعیت:</Typography>
                    <Box sx={{ mt: 0.5 }}><StatusChip status={selectedDetails.status || selectedDetails.type} /></Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">درگاه:</Typography>
                    <Typography fontWeight={600}>{selectedDetails.gateway === 'zibal' ? 'درگاه زیبال (Zibal)' : selectedDetails.gateway}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">شناسه پیگیری زیبال (Track ID):</Typography>
                    <Typography fontFamily="monospace" fontWeight={700} dir="ltr">{selectedDetails.trackId || '—'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">شماره مرجع بانکی (Ref Number):</Typography>
                    <Typography fontFamily="monospace" fontWeight={700} dir="ltr" color="success.main">{selectedDetails.transactionId || '—'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">شماره کارت خریدار:</Typography>
                    <Typography fontFamily="monospace" dir="ltr">{selectedDetails.cardNumber || '—'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">تاریخ ایجاد:</Typography>
                    <Typography fontSize="0.82rem">{formatDate(selectedDetails.createdAt)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">تاریخ تایید پرداخت:</Typography>
                    <Typography fontSize="0.82rem" color={selectedDetails.paidAt ? 'success.main' : 'text.disabled'}>
                      {selectedDetails.paidAt ? formatDate(selectedDetails.paidAt) : '—'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {selectedDetails.failureReason && (
                <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 2 }}>
                  <Typography variant="caption" fontWeight={700} color="error.dark">علت عدم موفقیت / لغو:</Typography>
                  <Typography variant="body2" color="error.dark" sx={{ mt: 0.5 }}>{selectedDetails.failureReason}</Typography>
                </Box>
              )}

              {selectedDetails.order?.items && selectedDetails.order.items.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} mb={1}>اقلام سفارش:</Typography>
                  <Stack spacing={1}>
                    {selectedDetails.order.items.map((it, idx) => (
                      <Box key={it.id || idx} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography fontSize="0.84rem" fontWeight={600}>{it.productName}</Typography>
                        <Typography fontSize="0.84rem" fontWeight={700} color="primary.main">{formatToman(it.price)}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedDetails(null)}>بستن</Button>
        </DialogActions>
      </Dialog>

      {/* Verify Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(verifyingTarget)}
        title="تایید تراکنش و اعطای دسترسی"
        message={`آیا از تایید این تراکنش و فعال‌سازی خودکار دوره‌ها / اشتراک‌ها برای کاربر «${verifyingTarget?.user ? `${verifyingTarget.user.firstName || ''} ${verifyingTarget.user.lastName || ''}`.trim() || verifyingTarget.user.phoneNumber : ''}» اطمینان دارید؟`}
        confirmText="تایید پرداخت و فعال‌سازی"
        cancelText="انصراف"
        severity="info"
        loading={verifying}
        onConfirm={handleConfirmVerify}
        onClose={() => setVerifyingTarget(null)}
      />
    </Stack>
  );
}
