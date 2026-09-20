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
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Article as ContentIcon,
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

const EMPTY_CONTENT = {
  key: '',
  title: '',
  body: '',
  imageUrl: '',
  linkUrl: '',
  linkText: '',
  sortOrder: 0,
  isActive: true,
};

function ContentBlockModal({ open, initial, onClose, onSaved }) {
  const { showSuccess, showError } = useNotification();
  const isEditing = Boolean(initial?.key);
  const [form, setForm] = useState(initial || EMPTY_CONTENT);
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.key.trim()) return showError('کلید یکتای بلوک الزامی است');

    setSaving(true);
    try {
      const payload = Object.fromEntries(
        Object.entries({
          ...form,
          sortOrder: Number(form.sortOrder) || 0,
        }).map(([k, v]) => [k, v === '' ? null : v])
      );
      payload.key = form.key.trim();

      await adminApi.upsertContent(payload);
      showSuccess('بلوک محتوا با موفقیت ذخیره شد');
      onSaved();
      onClose();
    } catch (err) {
      showError(err.message || 'خطا در ذخیره محتوا');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth dir="rtl">
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          {isEditing ? `ویرایش بلوک: ${form.key}` : 'افزودن بلوک محتوای جدید'}
        </Typography>
      </DialogTitle>

      <Box component="form" id="content-form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="کلید یکتا (انگلیسی، مثلا hero-title) *"
                value={form.key}
                disabled={isEditing}
                onChange={(e) => set('key', e.target.value)}
                dir="ltr"
                placeholder="footer-about"
                helperText={isEditing ? 'کلید پس از ایجاد قابل ویرایش نیست' : 'از حروف کوچک و خط تیره استفاده کنید'}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="عنوان بلوک (اختیاری)"
                value={form.title ?? ''}
                onChange={(e) => set('title', e.target.value)}
                placeholder="عنوان نمایشی در بخش مربوطه"
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label="متن محتوا"
                multiline
                rows={4}
                value={form.body ?? ''}
                onChange={(e) => set('body', e.target.value)}
                placeholder="متن کامل یا توضیحات..."
              />
            </Grid>

            <Grid size={12}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" mb={0.5} display="block">
                تصویر همراه (اختیاری)
              </Typography>
              <ImagePicker value={form.imageUrl} onChange={(url) => set('imageUrl', url)} alt="تصویر محتوا" />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="آدرس لینک (اختیاری)"
                dir="ltr"
                value={form.linkUrl ?? ''}
                onChange={(e) => set('linkUrl', e.target.value)}
                placeholder="https://... یا /courses"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="متن دکمه یا لینک"
                value={form.linkText ?? ''}
                onChange={(e) => set('linkText', e.target.value)}
                placeholder="مثال: اطلاعات بیشتر"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="ترتیب نمایش"
                type="number"
                value={form.sortOrder ?? 0}
                onChange={(e) => set('sortOrder', e.target.value)}
                dir="ltr"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={<Checkbox checked={!!form.isActive} onChange={(e) => set('isActive', e.target.checked)} />}
                label="فعال (قابل خواندن و نمایش در سایت)"
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
            {saving ? 'در حال ذخیره...' : 'ذخیره بلوک'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default function AdminContent() {
  const { showSuccess, showError } = useNotification();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const content = useApi(() => adminApi.listContent());

  const blocks = useMemo(() => {
    return [...(content.data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [content.data]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteContent(deleteTarget.key);
      showSuccess('بلوک محتوا با موفقیت حذف شد');
      setDeleteTarget(null);
      content.reload();
    } catch (err) {
      showError(err.message || 'خطا در حذف بلوک');
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo(() => [
    {
      id: 'key',
      label: 'کلید و عنوان بلوک',
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.light', borderRadius: 2 }}>
            <ContentIcon sx={{ fontSize: 18 }} />
          </Avatar>
          <Box>
            <Typography dir="ltr" sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.84rem' }}>
              {row.key}
            </Typography>
            {row.title && (
              <Typography variant="caption" color="text.secondary" display="block">
                {row.title}
              </Typography>
            )}
          </Box>
        </Stack>
      ),
    },
    {
      id: 'body',
      label: 'خلاصه متن',
      render: (row) => (
        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300, fontSize: '0.8rem' }}>
          {row.body || '—'}
        </Typography>
      ),
    },
    {
      id: 'sortOrder',
      label: 'ترتیب',
      render: (row) => (
        <Typography fontSize="0.84rem" dir="ltr">
          {row.sortOrder ?? 0}
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
                setEditingBlock(row);
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
        title="محتوای پویای سایت"
        subtitle="مدیریت بلوک‌های متنی، تصاویر و لینک‌های بخش‌های مختلف صفحه اصلی و صفحات سایت"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingBlock(null);
              setModalOpen(true);
            }}
          >
            بلوک جدید
          </Button>
        }
      />

      {/* Content DataTable */}
      <DataTable
        columns={columns}
        rows={blocks}
        loading={content.loading}
        error={content.error}
        onReload={content.reload}
        searchPlaceholder="جستجوی کلید، عنوان یا متن..."
        searchFilter={(row, term) => {
          const k = (row.key || '').toLowerCase();
          const t = (row.title || '').toLowerCase();
          const b = (row.body || '').toLowerCase();
          return k.includes(term) || t.includes(term) || b.includes(term);
        }}
        emptyTitle="بلوکی ثبت نشده است"
        emptyDescription="هنوز هیچ بلوک محتوایی تعریف نشده است."
      />

      {/* Create / Edit Modal */}
      {modalOpen && (
        <ContentBlockModal
          open={modalOpen}
          initial={editingBlock}
          onClose={() => {
            setModalOpen(false);
            setEditingBlock(null);
          }}
          onSaved={() => content.reload()}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف بلوک محتوا"
        message={`آیا مطمئن هستید که می‌خواهید بلوک «${deleteTarget?.key}» را حذف کنید؟`}
        confirmText="حذف بلوک"
        cancelText="انصراف"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Stack>
  );
}
