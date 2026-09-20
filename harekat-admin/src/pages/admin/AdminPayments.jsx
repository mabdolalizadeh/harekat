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
} from '@mui/material';
import {
  CheckCircle as VerifyIcon,
  Payment as PayIcon,
} from '@mui/icons-material';
import { adminApi, isSuperAdmin } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { formatToman } from '../../utils/format.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import StatusChip from '../../components/admin/StatusChip.jsx';

export default function AdminPayments() {
  const { showSuccess, showError } = useNotification();
  const [verifyingTarget, setVerifyingTarget] = useState(null);
  const [verifying, setVerifying] = useState(false);
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
      id: 'transactionId',
      label: 'شناسه تراکنش / درگاه',
      render: (row) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'success.light', borderRadius: 1.5 }}>
            <PayIcon sx={{ fontSize: 16 }} />
          </Avatar>
          <Box>
            <Typography dir="ltr" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem' }}>
              {row.transactionId || row.id.slice(0, 10)}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              درگاه: {row.gateway || 'mock'}
            </Typography>
          </Box>
        </Stack>
      ),
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
      id: 'orderId',
      label: 'سفارش مربوطه',
      render: (row) => (
        row.orderId ? (
          <Chip
            label={`#${row.orderId.slice(0, 8)}`}
            size="small"
            variant="outlined"
            sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
          />
        ) : (
          <Typography variant="caption" color="text.disabled">—</Typography>
        )
      ),
    },
    {
      id: 'amount',
      label: 'مبلغ پرداختی',
      render: (row) => (
        <Typography fontWeight={700} fontSize="0.84rem">
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
      id: 'createdAt',
      label: 'تاریخ تراکنش',
      render: (row) => (
        <Typography variant="caption" color="text.secondary">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString('fa-IR') : '—'}
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
        return isPaid ? (
          <Chip size="small" label="تایید شده" color="success" variant="outlined" />
        ) : (
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<VerifyIcon fontSize="small" />}
            onClick={() => setVerifyingTarget(row)}
            sx={{ borderRadius: 2 }}
          >
            تایید تراکنش
          </Button>
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
        subtitle="سوابق تراکنش‌های پرداخت، وضعیت درگاه و اعطای خودکار دسترسی دوره‌ها پس از تایید"
      />

      {/* Payments DataTable */}
      <DataTable
        columns={columns}
        rows={filteredPayments}
        loading={payments.loading}
        error={payments.error}
        onReload={payments.reload}
        searchPlaceholder="جستجوی شناسه تراکنش، نام یا شماره تماس..."
        searchFilter={(row, term) => {
          const user = row.user;
          const name = `${user?.firstName || ''} ${user?.lastName || ''}`.toLowerCase();
          const phone = (user?.phoneNumber || '').toLowerCase();
          const txId = (row.transactionId || '').toLowerCase();
          return name.includes(term) || phone.includes(term) || txId.includes(term);
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
              <MenuItem value="refunded">مسترد شده</MenuItem>
            </Select>
          </FormControl>
        }
        emptyTitle="تراکنشی یافت نشد"
        emptyDescription="هیچ پرداختی مطابق با فیلترهای انتخابی یافت نشد."
      />

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
