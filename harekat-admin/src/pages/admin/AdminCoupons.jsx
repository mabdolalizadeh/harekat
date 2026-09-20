import { useState, useMemo } from 'react';
import {
  Box,
  Stack,
  Button,
  TextField,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  LocalOffer as CouponIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { adminApi } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { formatToman } from '../../utils/format.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import StatusChip from '../../components/admin/StatusChip.jsx';

const EMPTY_COUPON = {
  code: '',
  discountType: 'percent',
  discountValue: '',
  isActive: true,
  expiresAt: '',
  usageLimit: '',
  minimumOrderAmount: '',
};

function CouponModal({ open, initial, onClose, onSaved }) {
  const { showSuccess, showError } = useNotification();
  const [form, setForm] = useState(initial || EMPTY_COUPON);
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) return showError('کد تخفیف الزامی است');

    const v = Number(form.discountValue);
    if (!Number.isFinite(v) || v <= 0) return showError('مقدار تخفیف باید عددی مثبت باشد');
    if (form.discountType === 'percent' && v > 100) return showError('درصد تخفیف حداکثر ۱۰۰ درصد است');

    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: v,
        isActive: !!form.isActive,
        expiresAt: form.expiresAt || null,
        usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
        minimumOrderAmount: form.minimumOrderAmount === '' ? null : Number(form.minimumOrderAmount),
      };

      if (initial?.id) {
        await adminApi.updateCoupon(initial.id, payload);
        showSuccess('کد تخفیف با موفقیت ویرایش شد');
      } else {
        await adminApi.createCoupon(payload);
        showSuccess('کد تخفیف جدید با موفقیت ایجاد شد');
      }
      onSaved();
      onClose();
    } catch (err) {
      showError(err.message || 'خطا در ذخیره کد تخفیف');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth dir="rtl">
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          {initial?.id ? 'ویرایش کد تخفیف' : 'تعریف کد تخفیف جدید'}
        </Typography>
      </DialogTitle>

      <Box component="form" id="coupon-form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="کد تخفیف *"
                value={form.code}
                onChange={(e) => set('code', e.target.value.toUpperCase())}
                dir="ltr"
                placeholder="NOROOZ1404"
                helperText="حروف بزرگ انگلیسی"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>نوع محاسبه تخفیف</InputLabel>
                <Select
                  value={form.discountType}
                  label="نوع محاسبه تخفیف"
                  onChange={(e) => set('discountType', e.target.value)}
                >
                  <MenuItem value="percent">درصدی (٪)</MenuItem>
                  <MenuItem value="fixed">مبلغ ثابت (تومان)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="مقدار تخفیف *"
                type="number"
                value={form.discountValue}
                onChange={(e) => set('discountValue', e.target.value)}
                dir="ltr"
                placeholder={form.discountType === 'percent' ? 'مثال: 20' : 'مثال: 100000'}
                helperText={form.discountType === 'percent' ? 'درصد (بین ۱ تا ۱۰۰)' : 'مبلغ به تومان'}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="تاریخ انقضا"
                type="date"
                value={form.expiresAt ? String(form.expiresAt).slice(0, 10) : ''}
                onChange={(e) => set('expiresAt', e.target.value)}
                dir="ltr"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="سقف دفعات استفاده"
                type="number"
                value={form.usageLimit ?? ''}
                onChange={(e) => set('usageLimit', e.target.value)}
                dir="ltr"
                placeholder="خالی = نامحدود"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="حداقل مبلغ سفارش (تومان)"
                type="number"
                value={form.minimumOrderAmount ?? ''}
                onChange={(e) => set('minimumOrderAmount', e.target.value)}
                dir="ltr"
                placeholder="خالی = بدون شرط"
              />
            </Grid>

            <Grid size={12}>
              <FormControlLabel
                control={<Checkbox checked={!!form.isActive} onChange={(e) => set('isActive', e.target.checked)} />}
                label="کد فعال و قابل استفاده در سبد خرید باشد"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} variant="outlined">
            انصراف
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            startIcon={saving && <CircularProgress size={16} color="inherit" />}
          >
            {saving ? 'در حال ذخیره...' : 'ذخیره کد'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default function AdminCoupons() {
  const { showSuccess, showError } = useNotification();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const coupons = useApi(() => adminApi.listCoupons());

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteCoupon(deleteTarget.id);
      showSuccess('کد تخفیف با موفقیت حذف شد');
      setDeleteTarget(null);
      coupons.reload();
    } catch (err) {
      showError(err.message || 'خطا در حذف کد تخفیف');
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo(() => [
    {
      id: 'code',
      label: 'کد تخفیف',
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'warning.light', color: 'warning.dark', borderRadius: 2 }}>
            <CouponIcon sx={{ fontSize: 18 }} />
          </Avatar>
          <Chip
            label={row.code}
            variant="outlined"
            sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.84rem' }}
          />
        </Stack>
      ),
    },
    {
      id: 'discountValue',
      label: 'میزان تخفیف',
      render: (row) => (
        <Typography fontWeight={700} fontSize="0.84rem">
          {row.discountType === 'percent' ? `${row.discountValue}٪` : formatToman(row.discountValue)}
        </Typography>
      ),
    },
    {
      id: 'discountType',
      label: 'نوع تخفیف',
      render: (row) => (
        <Chip
          size="small"
          label={row.discountType === 'percent' ? 'درصدی' : 'مبلغ ثابت'}
          variant="outlined"
        />
      ),
    },
    {
      id: 'minimumOrderAmount',
      label: 'حداقل مبلغ سفارش',
      render: (row) => (
        row.minimumOrderAmount ? (
          <Typography fontSize="0.8rem">
            {formatToman(row.minimumOrderAmount)}
          </Typography>
        ) : (
          <Typography variant="caption" color="text.disabled">بدون محدودیت</Typography>
        )
      ),
    },
    {
      id: 'expiresAt',
      label: 'تاریخ انقضا',
      render: (row) => (
        <Typography variant="caption" color="text.secondary">
          {row.expiresAt ? new Date(row.expiresAt).toLocaleDateString('fa-IR') : 'نامحدود'}
        </Typography>
      ),
    },
    {
      id: 'isActive',
      label: 'وضعیت',
      render: (row) => <StatusChip status={!!row.isActive} />,
    },
    {
      id: 'actions',
      label: 'عملیات',
      sortable: false,
      align: 'left',
      render: (row) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="ویرایش">
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                setEditingCoupon(row);
                setModalOpen(true);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="حذف">
            <IconButton
              size="small"
              color="error"
              onClick={() => setDeleteTarget(row)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], []);

  return (
    <Stack spacing={3.5}>
      <PageHeader
        title="کدهای تخفیف"
        subtitle="تعریف، سقف‌گذاری و مدیریت کدهای تخفیف درصدی و ریالی برای سبد خرید"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingCoupon(null);
              setModalOpen(true);
            }}
          >
            کد جدید
          </Button>
        }
      />

      {/* Coupons DataTable */}
      <DataTable
        columns={columns}
        rows={coupons.data || []}
        loading={coupons.loading}
        error={coupons.error}
        onReload={coupons.reload}
        searchPlaceholder="جستجوی کد تخفیف..."
        searchFilter={(row, term) => (row.code || '').toLowerCase().includes(term)}
        emptyTitle="کد تخفیفی ثبت نشده است"
        emptyDescription="برای ایجاد اولین کد تخفیف روی دکمه کد جدید کلیک کنید."
      />

      {/* Create / Edit Modal */}
      {modalOpen && (
        <CouponModal
          open={modalOpen}
          initial={editingCoupon}
          onClose={() => {
            setModalOpen(false);
            setEditingCoupon(null);
          }}
          onSaved={() => coupons.reload()}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف کد تخفیف"
        message={`آیا مطمئن هستید که می‌خواهید کد تخفیف «${deleteTarget?.code}» را حذف کنید؟`}
        confirmText="حذف کد"
        cancelText="انصراف"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Stack>
  );
}
