import { useState, useMemo, useCallback } from 'react';
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
  Menu as MenuIcon,
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

const EMPTY_MENU = {
  label: '',
  link: '',
  scrollId: '',
  sortOrder: 0,
  isActive: true,
};

function MenuItemModal({ open, initial, onClose, onSaved }) {
  const { showSuccess, showError } = useNotification();
  const [form, setForm] = useState(initial || EMPTY_MENU);
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.label.trim() || !form.link.trim()) {
      showError('عنوان و لینک الزامی هستند');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        label: form.label.trim(),
        link: form.link.trim(),
        scrollId: form.scrollId?.trim() || null,
        sortOrder: Number(form.sortOrder) || 0,
      };

      if (initial?.id) {
        await adminApi.updateMenuItem(initial.id, payload);
        showSuccess('آیتم منو با موفقیت ویرایش شد');
      } else {
        await adminApi.createMenuItem(payload);
        showSuccess('آیتم منو جدید با موفقیت اضافه شد');
      }
      onSaved();
      onClose();
    } catch (err) {
      showError(err.message || 'خطا در ذخیره آیتم منو');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth dir="rtl">
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          {initial?.id ? 'ویرایش آیتم منو' : 'افزودن آیتم جدید به سربرگ'}
        </Typography>
      </DialogTitle>

      <Box component="form" id="menu-form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="عنوان آیتم *"
                value={form.label}
                onChange={(e) => set('label', e.target.value)}
                placeholder="مثال: دوره‌ها"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="لینک مقصد *"
                dir="ltr"
                value={form.link}
                onChange={(e) => set('link', e.target.value)}
                placeholder="/courses یا /#courses"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="شناسه اسکرول (اختیاری)"
                dir="ltr"
                value={form.scrollId ?? ''}
                onChange={(e) => set('scrollId', e.target.value)}
                placeholder="courses"
                helperText="برای اسکرول نرم به بخش خاصی از صفحه"
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

            <Grid size={12}>
              <FormControlLabel
                control={<Checkbox checked={!!form.isActive} onChange={(e) => set('isActive', e.target.checked)} />}
                label="فعال (نمایش در منوی سربرگ وب‌سایت)"
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
            {saving ? 'در حال ذخیره...' : 'ذخیره آیتم'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default function AdminHeader() {
  const { showSuccess, showError } = useNotification();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const menu = useApi(() => adminApi.listMenu());

  const items = useMemo(() => {
    return [...(menu.data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [menu.data]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteMenuItem(deleteTarget.id);
      showSuccess('آیتم منو با موفقیت حذف شد');
      setDeleteTarget(null);
      menu.reload();
    } catch (err) {
      showError(err.message || 'خطا در حذف آیتم');
    } finally {
      setDeleting(false);
    }
  };

  const handleMove = useCallback(async (item, dir) => {
    try {
      await adminApi.updateMenuItem(item.id, {
        sortOrder: (item.sortOrder ?? 0) + dir,
      });
      menu.reload();
    } catch (err) {
      showError(err.message || 'خطا در جابجایی');
    }
  }, [menu, showError]);

  const columns = useMemo(() => [
    {
      id: 'label',
      label: 'عنوان آیتم منو',
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <MenuIcon color="primary" fontSize="small" />
          <Typography fontWeight={700} fontSize="0.84rem">
            {row.label}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'link',
      label: 'آدرس لینک و اسکرول',
      render: (row) => (
        <Typography dir="ltr" variant="caption" sx={{ fontFamily: 'monospace' }}>
          {row.link}{row.scrollId ? ` (#${row.scrollId})` : ''}
        </Typography>
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
                setEditingItem(row);
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
        title="مدیریت سربرگ و منو"
        subtitle="تنظیم عناوین، ترتیب و پیوندهای منوی اصلی بالای وب‌سایت"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingItem(null);
              setModalOpen(true);
            }}
          >
            آیتم جدید
          </Button>
        }
      />

      {/* Menu DataTable */}
      <DataTable
        columns={columns}
        rows={items}
        loading={menu.loading}
        error={menu.error}
        onReload={menu.reload}
        searchPlaceholder="جستجوی عنوان منو..."
        searchFilter={(row, term) => (row.label || '').toLowerCase().includes(term) || (row.link || '').toLowerCase().includes(term)}
        emptyTitle="آیتمی برای سربرگ ثبت نشده است"
        emptyDescription="برای اضافه کردن اولین گزینه به منوی بالای سایت، روی دکمه آیتم جدید کلیک کنید."
      />

      {/* Create / Edit Modal */}
      {modalOpen && (
        <MenuItemModal
          open={modalOpen}
          initial={editingItem}
          onClose={() => {
            setModalOpen(false);
            setEditingItem(null);
          }}
          onSaved={() => menu.reload()}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف آیتم منو"
        message={`آیا مطمئن هستید که می‌خواهید «${deleteTarget?.label}» را از سربرگ حذف کنید؟`}
        confirmText="حذف آیتم"
        cancelText="انصراف"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Stack>
  );
}
