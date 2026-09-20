import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Stack,
  Button,
  TextField,
  Typography,
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
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
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

const EMPTY_SLIDE = {
  imageUrl: '',
  title: '',
  sortOrder: 0,
  isActive: true,
};

function nextSlideKey(slides) {
  let max = 0;
  for (const s of slides ?? []) {
    const n = Number((s.key ?? '').replace(/^marquee-/, ''));
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `marquee-${max + 1}`;
}

function MarqueeModal({ open, initial, allSlides, onClose, onSaved }) {
  const { showSuccess, showError } = useNotification();
  const [form, setForm] = useState(initial || EMPTY_SLIDE);
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.imageUrl?.trim()) return showError('آدرس یا فایل تصویر الزامی است');

    setSaving(true);
    try {
      const key = initial?.key || nextSlideKey(allSlides);
      const payload = {
        ...form,
        key,
        title: form.title?.trim() || null,
        sortOrder: Number(form.sortOrder) || 0,
      };

      await adminApi.upsertContent(payload);
      showSuccess('اسلاید نوار متحرک با موفقیت ذخیره شد');
      onSaved();
      onClose();
    } catch (err) {
      showError(err.message || 'خطا در ذخیره اسلاید');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth dir="rtl">
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          {initial?.key ? 'ویرایش اسلاید نوار متحرک' : 'افزودن اسلاید جدید'}
        </Typography>
      </DialogTitle>

      <Box component="form" id="marquee-form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" mb={0.5} display="block">
                تصویر لوگو یا کارگاه *
              </Typography>
              <ImagePicker value={form.imageUrl} onChange={(url) => set('imageUrl', url)} alt="تصویر اسلاید" />
            </Box>

            <TextField
              label="عنوان / متن جایگزین (اختیاری)"
              value={form.title || ''}
              onChange={(e) => set('title', e.target.value)}
              placeholder="مثال: کارگاه آموزش خلاقیت"
            />

            <TextField
              label="ترتیب نمایش"
              type="number"
              value={form.sortOrder}
              onChange={(e) => set('sortOrder', e.target.value)}
              dir="ltr"
            />

            <FormControlLabel
              control={<Checkbox checked={!!form.isActive} onChange={(e) => set('isActive', e.target.checked)} />}
              label="فعال (نمایش در نوار متحرک بالای سایت)"
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
            {saving ? 'در حال ذخیره...' : 'ذخیره اسلاید'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default function AdminMarquee() {
  const { showSuccess, showError } = useNotification();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const slides = useApi(() => adminApi.listMarqueeSlides());

  const items = useMemo(() => {
    return [...(slides.data ?? [])].sort((a, b) => (a.sortOrder - b.sortOrder) || a.key.localeCompare(b.key));
  }, [slides.data]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteContent(deleteTarget.key);
      showSuccess('اسلاید با موفقیت حذف شد');
      setDeleteTarget(null);
      slides.reload();
    } catch (err) {
      showError(err.message || 'خطا در حذف اسلاید');
    } finally {
      setDeleting(false);
    }
  };

  const handleMove = useCallback(async (item, dir) => {
    try {
      await adminApi.upsertContent({
        key: item.key,
        sortOrder: (item.sortOrder ?? 0) + dir,
      });
      slides.reload();
    } catch (err) {
      showError(err.message || 'خطا در جابجایی');
    }
  }, [slides, showError]);

  const columns = useMemo(() => [
    {
      id: 'image',
      label: 'تصویر اسلاید',
      render: (row) => (
        <Box
          component="img"
          src={row.imageUrl}
          alt={row.title || row.key}
          sx={{
            width: 64,
            height: 48,
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
      id: 'title',
      label: 'عنوان',
      render: (row) => (
        <Box>
          <Typography fontWeight={700} fontSize="0.84rem">
            {row.title || '(بدون عنوان)'}
          </Typography>
          <Typography variant="caption" color="text.secondary" dir="ltr" sx={{ fontFamily: 'monospace' }}>
            {row.key}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'sortOrder',
      label: 'ترتیب نمایش',
      render: (row) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <IconButton size="small" onClick={() => handleMove(row, -1)} title="انتقال به بالا">
            <UpIcon fontSize="small" />
          </IconButton>
          <Typography sx={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }}>
            {row.sortOrder}
          </Typography>
          <IconButton size="small" onClick={() => handleMove(row, 1)} title="انتقال به پایین">
            <DownIcon fontSize="small" />
          </IconButton>
        </Stack>
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
                setEditingSlide(row);
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
  ], [handleMove]);

  return (
    <Stack spacing={3.5}>
      <PageHeader
        title="نوار متحرک (مارکی)"
        subtitle="مدیریت اسلایدها و لوگوهای متحرکی که در بالای وب‌سایت به حرکت درمی‌آیند"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingSlide(null);
              setModalOpen(true);
            }}
          >
            اسلاید جدید
          </Button>
        }
      />

      {/* Marquee DataTable */}
      <DataTable
        columns={columns}
        rows={items}
        loading={slides.loading}
        error={slides.error}
        onReload={slides.reload}
        searchPlaceholder="جستجوی عنوان اسلاید..."
        searchFilter={(row, term) => (row.title || '').toLowerCase().includes(term) || (row.key || '').toLowerCase().includes(term)}
        emptyTitle="اسلایدی ثبت نشده است"
        emptyDescription="هنوز اسلایدی برای نوار متحرک ایجاد نگردیده است."
      />

      {/* Create / Edit Modal */}
      {modalOpen && (
        <MarqueeModal
          open={modalOpen}
          initial={editingSlide}
          allSlides={items}
          onClose={() => {
            setModalOpen(false);
            setEditingSlide(null);
          }}
          onSaved={() => slides.reload()}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف اسلاید"
        message={`آیا مطمئن هستید که می‌خواهید اسلاید «${deleteTarget?.title || deleteTarget?.key}» را حذف کنید؟`}
        confirmText="حذف اسلاید"
        cancelText="انصراف"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Stack>
  );
}
