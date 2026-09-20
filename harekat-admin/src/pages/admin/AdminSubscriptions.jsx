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
  OutlinedInput,
  ListItemText,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  WorkspacePremium as BadgeIcon,
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

const EMPTY_SUBSCRIPTION = {
  name: '',
  price: '',
  salePrice: '',
  image: '',
  description: '',
  durationMonths: 1,
  badgeLabel: '',
  badgeIconSvg: '',
  includedCourseIds: [],
  isActive: true,
  sortOrder: 0,
};

function SubscriptionModal({ open, initial, courses, onClose, onSaved }) {
  const { showSuccess, showError } = useNotification();
  const [form, setForm] = useState(initial || EMPTY_SUBSCRIPTION);
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return showError('نام پلن اشتراک الزامی است');
    if (!form.price.toString().trim()) return showError('قیمت اصلی الزامی است');

    const duration = Number(form.durationMonths);
    if (!Number.isFinite(duration) || duration <= 0) return showError('مدت زمان اشتراک باید حداقل ۱ ماه باشد');

    setSaving(true);
    try {
      const payload = {
        ...form,
        durationMonths: duration,
        price: String(form.price).replace(/[,٬]/g, ''),
        salePrice: form.salePrice ? String(form.salePrice).replace(/[,٬]/g, '') : null,
        sortOrder: Number(form.sortOrder) || 0,
        badgeLabel: form.badgeLabel.trim() || form.name.trim(),
        includedCourseIds: form.includedCourseIds || [],
      };

      if (initial?.id) {
        await adminApi.updateSubscription(initial.id, payload);
        showSuccess('پلن اشتراک با موفقیت ویرایش شد');
      } else {
        await adminApi.createSubscription(payload);
        showSuccess('پلن اشتراک جدید با موفقیت ایجاد شد');
      }
      onSaved();
      onClose();
    } catch (err) {
      showError(err.message || 'خطا در ذخیره پلن اشتراک');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth dir="rtl">
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          {initial?.id ? 'ویرایش پلن اشتراک' : 'تعریف پلن اشتراک جدید'}
        </Typography>
      </DialogTitle>

      <Box component="form" id="sub-form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="نام پلن اشتراک *"
                value={form.name}
                onChange={(e) => {
                  set('name', e.target.value);
                  if (!form.badgeLabel) set('badgeLabel', e.target.value);
                }}
                placeholder="مثال: اشتراک طلایی ۳ ماهه"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="مدت زمان (ماه) *"
                type="number"
                value={form.durationMonths}
                onChange={(e) => set('durationMonths', e.target.value)}
                dir="ltr"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="متن نشان (Badge)"
                value={form.badgeLabel || ''}
                onChange={(e) => set('badgeLabel', e.target.value)}
                placeholder="VIP"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="قیمت اصلی (تومان) *"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                placeholder="490000"
                dir="ltr"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="قیمت فروش / تخفیف‌دار (تومان)"
                value={form.salePrice ?? ''}
                onChange={(e) => set('salePrice', e.target.value)}
                placeholder="390000 (خالی = بدون تخفیف)"
                dir="ltr"
              />
            </Grid>

            <Grid size={12}>
              <FormControl fullWidth size="small">
                <InputLabel>دوره‌های شامل این اشتراک</InputLabel>
                <Select
                  multiple
                  value={form.includedCourseIds || []}
                  onChange={(e) => set('includedCourseIds', e.target.value)}
                  input={<OutlinedInput label="دوره‌های شامل این اشتراک" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((val) => {
                        const crs = courses.find((c) => c.id === val);
                        return <Chip key={val} label={crs?.name || val} size="small" />;
                      })}
                    </Box>
                  )}
                >
                  {courses.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      <Checkbox checked={(form.includedCourseIds || []).includes(c.id)} />
                      <ListItemText primary={c.name} secondary={`${c.level || 'عمومی'} · ${formatToman(c.price)}`} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                کاربر با خرید این اشتراک به تمام دوره‌های مشخص‌شده فوق در طول مدت فعال بودن اشتراک دسترسی خواهد داشت.
              </Typography>
            </Grid>

            <Grid size={12}>
              <TextField
                label="توضیحات و مزایای اشتراک"
                multiline
                rows={3}
                value={form.description || ''}
                onChange={(e) => set('description', e.target.value)}
                placeholder="مزایای عضویت در این پلن..."
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="ترتیب نمایش"
                type="number"
                value={form.sortOrder}
                onChange={(e) => set('sortOrder', e.target.value)}
                dir="ltr"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={<Checkbox checked={!!form.isActive} onChange={(e) => set('isActive', e.target.checked)} />}
                label="فعال (قابل خرید توسط کاربران)"
                sx={{ mt: 1 }}
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
            {saving ? 'در حال ذخیره...' : 'ذخیره پلن'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default function AdminSubscriptions() {
  const { showSuccess, showError } = useNotification();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const subscriptions = useApi(() => adminApi.listSubscriptions());
  const courses = useApi(() => adminApi.listCourses());

  const allCourses = courses.data || [];

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteSubscription(deleteTarget.id);
      showSuccess('پلن اشتراک با موفقیت حذف شد');
      setDeleteTarget(null);
      subscriptions.reload();
    } catch (err) {
      showError(err.message || 'خطا در حذف پلن اشتراک');
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo(() => [
    {
      id: 'name',
      label: 'نام پلن اشتراک',
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: 'secondary.light', width: 38, height: 38, borderRadius: 2 }}>
            <BadgeIcon sx={{ fontSize: 20 }} />
          </Avatar>
          <Box>
            <Typography fontWeight={700} fontSize="0.84rem">
              {row.name}
            </Typography>
            {row.badgeLabel && (
              <Chip
                label={row.badgeLabel}
                size="small"
                color="secondary"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.675rem', mt: 0.25 }}
              />
            )}
          </Box>
        </Stack>
      ),
    },
    {
      id: 'durationMonths',
      label: 'مدت زمان',
      render: (row) => (
        <Typography fontWeight={600} fontSize="0.84rem">
          {row.durationMonths} ماه
        </Typography>
      ),
    },
    {
      id: 'price',
      label: 'قیمت و تخفیف',
      render: (row) => (
        <Box>
          <Typography fontWeight={700} fontSize="0.84rem">
            {formatToman(row.salePrice || row.price)}
          </Typography>
          {row.salePrice && (
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ textDecoration: 'line-through', display: 'block' }}
            >
              {formatToman(row.price)}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'includedCourseIds',
      label: 'دوره‌های تحت پوشش',
      render: (row) => {
        const count = row.includedCourseIds?.length || 0;
        return (
          <Chip
            size="small"
            label={`${count} دوره`}
            color={count > 0 ? 'primary' : 'default'}
            variant="outlined"
          />
        );
      },
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
                setEditingSub(row);
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
        title="پلن‌های اشتراک"
        subtitle="تعریف و مدیریت پلن‌های اشتراک دوره‌ای (ماهانه/سالانه) و اتصال دوره‌ها به هر پلن"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingSub(null);
              setModalOpen(true);
            }}
          >
            پلن جدید
          </Button>
        }
      />

      {/* Subscriptions DataTable */}
      <DataTable
        columns={columns}
        rows={subscriptions.data || []}
        loading={subscriptions.loading}
        error={subscriptions.error}
        onReload={subscriptions.reload}
        searchPlaceholder="جستجوی نام پلن اشتراک..."
        emptyTitle="پلن اشتراکی تعریف نشده است"
        emptyDescription="برای شروع می‌توانید با دکمه پلن جدید، اولین پلن اشتراک را ایجاد کنید."
      />

      {/* Create / Edit Modal */}
      {modalOpen && (
        <SubscriptionModal
          open={modalOpen}
          initial={editingSub}
          courses={allCourses}
          onClose={() => {
            setModalOpen(false);
            setEditingSub(null);
          }}
          onSaved={() => subscriptions.reload()}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف پلن اشتراک"
        message={`آیا مطمئن هستید که می‌خواهید پلن «${deleteTarget?.name}» را حذف کنید؟`}
        confirmText="حذف پلن"
        cancelText="انصراف"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Stack>
  );
}
