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
  Checkbox,
  FormControlLabel,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { adminApi } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import StatusChip from '../../components/admin/StatusChip.jsx';
import ImagePicker from '../../components/ImagePicker.jsx';

const EMPTY_BANNER = {
  imageUrl: '',
  tabletImageUrl: '',
  mobileImageUrl: '',
  linkUrl: '',
  duration: 4,
  sortOrder: 0,
  isActive: true,
};

function BannerModal({ open, initial, onClose, onSaved }) {
  const { showSuccess, showError } = useNotification();
  const [form, setForm] = useState(initial || EMPTY_BANNER);
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.imageUrl) return showError('تصویر بنر دسکتاپ الزامی است');

    const duration = Number(form.duration);
    if (!Number.isFinite(duration) || duration < 1) return showError('مدت زمان نمایش حداقل ۱ ثانیه است');

    setSaving(true);
    try {
      const payload = {
        ...form,
        duration: Math.round(duration),
        sortOrder: Number(form.sortOrder) || 0,
        linkUrl: form.linkUrl?.trim() || null,
      };

      if (initial?.id) {
        await adminApi.updateBanner(initial.id, payload);
        showSuccess('بنر با موفقیت ویرایش شد');
      } else {
        await adminApi.createBanner(payload);
        showSuccess('بنر جدید با موفقیت ایجاد شد');
      }
      onSaved();
      onClose();
    } catch (err) {
      showError(err.message || 'خطا در ذخیره بنر');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth dir="rtl">
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          {initial?.id ? 'ویرایش بنر' : 'افزودن بنر جدید'}
        </Typography>
      </DialogTitle>

      <Box component="form" id="banner-form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary">
              تصویر متناسب با سایزهای مختلف صفحه نمایش را بارگذاری کنید. در صورت خالی ماندن تصویر تبلت یا موبایل، تصویر دسکتاپ استفاده می‌شود.
            </Typography>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" mb={1} display="block">
                  دسکتاپ (نسبت ۱۶:۹) *
                </Typography>
                <ImagePicker value={form.imageUrl} onChange={(url) => set('imageUrl', url)} alt="بنر دسکتاپ" />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" mb={1} display="block">
                  تبلت (نسبت ۴:۳)
                </Typography>
                <ImagePicker value={form.tabletImageUrl} onChange={(url) => set('tabletImageUrl', url)} alt="بنر تبلت" />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" mb={1} display="block">
                  موبایل (نسبت ۴:۵)
                </Typography>
                <ImagePicker value={form.mobileImageUrl} onChange={(url) => set('mobileImageUrl', url)} alt="بنر موبایل" />
              </Grid>
            </Grid>

            <TextField
              label="لینک مقصد هنگام کلیک (اختیاری)"
              dir="ltr"
              value={form.linkUrl ?? ''}
              onChange={(e) => set('linkUrl', e.target.value)}
              placeholder="https://... یا /courses"
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="مدت زمان نمایش اسلاید (ثانیه)"
                  type="number"
                  value={form.duration}
                  onChange={(e) => set('duration', e.target.value)}
                  dir="ltr"
                  helperText="پیش‌فرض: ۴ ثانیه"
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
            </Grid>

            <FormControlLabel
              control={<Checkbox checked={!!form.isActive} onChange={(e) => set('isActive', e.target.checked)} />}
              label="فعال (نمایش در اسلایدر صفحه اصلی)"
            />
          </Stack>
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
            {saving ? 'در حال ذخیره...' : 'ذخیره بنر'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default function AdminBanners() {
  const { showSuccess, showError } = useNotification();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const banners = useApi(() => adminApi.listBanners());

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteBanner(deleteTarget.id);
      showSuccess('بنر با موفقیت حذف شد');
      setDeleteTarget(null);
      banners.reload();
    } catch (err) {
      showError(err.message || 'خطا در حذف بنر');
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo(() => [
    {
      id: 'image',
      label: 'پیش‌نمایش بنر',
      render: (row) => (
        <Box
          component="img"
          src={row.imageUrl}
          alt="بنر"
          sx={{
            width: 120,
            height: 60,
            borderRadius: 1.5,
            objectFit: 'cover',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'action.hover',
          }}
        />
      ),
    },
    {
      id: 'linkUrl',
      label: 'لینک مقصد',
      render: (row) => (
        row.linkUrl ? (
          <Typography dir="ltr" variant="caption" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
            {row.linkUrl}
          </Typography>
        ) : (
          <Typography variant="caption" color="text.disabled">بدون لینک</Typography>
        )
      ),
    },
    {
      id: 'duration',
      label: 'مدت نمایش',
      render: (row) => (
        <Typography fontSize="0.84rem">
          {row.duration} ثانیه
        </Typography>
      ),
    },
    {
      id: 'sortOrder',
      label: 'ترتیب نمایش',
      render: (row) => (
        <Typography fontSize="0.84rem" dir="ltr">
          {row.sortOrder}
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
                setEditingBanner(row);
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
        title="بنرهای صفحه اصلی"
        subtitle="مدیریت اسلایدر بزرگ صفحه اصلی، تصاویر ریسپانسیو و زمان‌بندی تغییر خودکار بنرها"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingBanner(null);
              setModalOpen(true);
            }}
          >
            بنر جدید
          </Button>
        }
      />

      {/* Banners DataTable */}
      <DataTable
        columns={columns}
        rows={banners.data || []}
        loading={banners.loading}
        error={banners.error}
        onReload={banners.reload}
        searchPlaceholder="جستجوی لینک مقصد..."
        searchFilter={(row, term) => (row.linkUrl || '').toLowerCase().includes(term)}
        emptyTitle="بنری ثبت نشده است"
        emptyDescription="برای صفحه اصلی هنوز هیچ بنری ایجاد نشده است."
      />

      {/* Create / Edit Modal */}
      {modalOpen && (
        <BannerModal
          open={modalOpen}
          initial={editingBanner}
          onClose={() => {
            setModalOpen(false);
            setEditingBanner(null);
          }}
          onSaved={() => banners.reload()}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف بنر"
        message="آیا از حذف این بنر از صفحه اصلی اطمینان دارید؟"
        confirmText="حذف بنر"
        cancelText="انصراف"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Stack>
  );
}
