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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  IconButton,
  Tooltip,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { adminApi, isSuperAdmin } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import StatusChip from '../../components/admin/StatusChip.jsx';

const EMPTY_TA = {
  username: '',
  password: '',
  name: '',
  email: '',
  phoneNumber: '',
  status: 'active',
  courseIds: [],
};

function TAModal({ open, initial, courses, onClose, onSaved }) {
  const { showSuccess, showError } = useNotification();
  const [form, setForm] = useState(initial || EMPTY_TA);
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username?.trim()) return showError('نام کاربری الزامی است');
    if (!initial?.id && !form.password) return showError('رمز عبور الزامی است');

    setSaving(true);
    try {
      const payload = {
        ...form,
        username: form.username.trim(),
        name: form.name.trim() || null,
        email: form.email.trim() || null,
        phoneNumber: form.phoneNumber.trim() || null,
        courseIds: form.courseIds || [],
      };

      if (initial?.id) {
        if (!payload.password) delete payload.password;
        await adminApi.updateTA(initial.id, payload);
        showSuccess('دستیار آموزشی با موفقیت ویرایش شد');
      } else {
        await adminApi.createTA(payload);
        showSuccess('دستیار آموزشی جدید با موفقیت ایجاد شد');
      }
      onSaved();
      onClose();
    } catch (err) {
      showError(err.message || 'خطا در ثبت اطلاعات دستیار آموزشی');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth dir="rtl">
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          {initial?.id ? 'ویرایش دستیار آموزشی' : 'تعریف دستیار آموزشی جدید'}
        </Typography>
      </DialogTitle>

      <Box component="form" id="ta-form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="نام و نام خانوادگی"
                value={form.name || ''}
                onChange={(e) => set('name', e.target.value)}
                placeholder="مثال: علی احمدی"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="نام کاربری *"
                value={form.username || ''}
                onChange={(e) => set('username', e.target.value)}
                dir="ltr"
                placeholder="ta_user"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={initial?.id ? 'رمز عبور جدید (اختیاری)' : 'رمز عبور *'}
                type="password"
                value={form.password || ''}
                onChange={(e) => set('password', e.target.value)}
                dir="ltr"
                placeholder="حداقل ۸ کاراکتر"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="شماره موبایل"
                value={form.phoneNumber || ''}
                onChange={(e) => set('phoneNumber', e.target.value)}
                dir="ltr"
                placeholder="0912..."
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="ایمیل"
                type="email"
                value={form.email || ''}
                onChange={(e) => set('email', e.target.value)}
                dir="ltr"
                placeholder="ta@example.com"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>وضعیت دسترسی</InputLabel>
                <Select
                  value={form.status || 'active'}
                  label="وضعیت دسترسی"
                  onChange={(e) => set('status', e.target.value)}
                >
                  <MenuItem value="active">فعال</MenuItem>
                  <MenuItem value="inactive">غیرفعال / مسدود</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={12}>
              <FormControl fullWidth size="small">
                <InputLabel>دوره‌های اختصاص‌یافته به این TA</InputLabel>
                <Select
                  multiple
                  value={form.courseIds || []}
                  onChange={(e) => set('courseIds', e.target.value)}
                  input={<OutlinedInput label="دوره‌های اختصاص‌یافته به این TA" />}
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
                      <Checkbox checked={(form.courseIds || []).includes(c.id)} />
                      <ListItemText primary={c.name} secondary={c.level || 'عمومی'} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                دستیار آموزشی فقط به تیکت‌ها، جلسات و آزمون‌های دوره‌های انتخاب‌شده فوق دسترسی خواهد داشت.
              </Typography>
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
            {saving ? 'در حال ذخیره...' : 'ذخیره دستیار'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default function AdminTAs() {
  const { showSuccess, showError } = useNotification();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTA, setEditingTA] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const tas = useApi(() => adminApi.listTAs());
  const courses = useApi(() => adminApi.listCourses());

  const allCourses = courses.data || [];

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteTA(deleteTarget.id);
      showSuccess('دستیار آموزشی با موفقیت حذف شد');
      setDeleteTarget(null);
      tas.reload();
    } catch (err) {
      showError(err.message || 'خطا در حذف دستیار آموزشی');
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo(() => [
    {
      id: 'name',
      label: 'دستیار آموزشی (TA)',
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.light', fontWeight: 700 }}>
            {row.name?.[0] || row.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography fontWeight={700} fontSize="0.84rem">
              {row.name || 'بدون نام'}
            </Typography>
            <Typography variant="caption" color="text.secondary" dir="ltr" display="block">
              @{row.username}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      id: 'phoneNumber',
      label: 'شماره تماس و ایمیل',
      render: (row) => (
        <Box>
          <Typography dir="ltr" sx={{ fontFamily: 'monospace', fontSize: '0.84rem' }}>
            {row.phoneNumber || '—'}
          </Typography>
          {row.email && (
            <Typography variant="caption" color="text.secondary" dir="ltr" display="block">
              {row.email}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'courses',
      label: 'دوره‌های تحت نظارت',
      render: (row) => {
        const list = row.courses || [];
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 260 }}>
            {list.length > 0 ? (
              list.map((c) => <Chip key={c.id} label={c.name} size="small" variant="outlined" />)
            ) : (
              <Typography variant="caption" color="text.disabled">بدون دوره</Typography>
            )}
          </Box>
        );
      },
    },
    {
      id: 'status',
      label: 'وضعیت',
      render: (row) => <StatusChip status={row.status === 'active'} label={row.status === 'active' ? 'فعال' : 'غیرفعال'} />,
    },
    {
      id: 'actions',
      label: 'عملیات',
      sortable: false,
      align: 'left',
      render: (row) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="ویرایش دستیار">
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                setEditingTA(row);
                setModalOpen(true);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="حذف دستیار">
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

  if (!isSuperAdmin()) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="warning.main">مدیریت دستیاران آموزشی فقط برای مدیر ارشد مجاز است.</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3.5}>
      <PageHeader
        title="دستیاران آموزشی (TAs)"
        subtitle="مدیریت حساب‌های کاربری دستیاران آموزشی و تخصیص دسترسی به دوره‌ها جهت نظارت بر تیکت‌ها و آزمون‌ها"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingTA(null);
              setModalOpen(true);
            }}
          >
            دستیار جدید
          </Button>
        }
      />

      {/* TAs DataTable */}
      <DataTable
        columns={columns}
        rows={tas.data || []}
        loading={tas.loading}
        error={tas.error}
        onReload={tas.reload}
        searchPlaceholder="جستجوی نام، نام کاربری یا شماره تماس..."
        searchFilter={(row, term) => {
          const name = (row.name || '').toLowerCase();
          const username = (row.username || '').toLowerCase();
          const phone = (row.phoneNumber || '').toLowerCase();
          return name.includes(term) || username.includes(term) || phone.includes(term);
        }}
        emptyTitle="دستیار آموزشی یافت نشد"
        emptyDescription="هنوز هیچ دستیار آموزشی در سامانه تعریف نشده است."
      />

      {/* Create / Edit Modal */}
      {modalOpen && (
        <TAModal
          open={modalOpen}
          initial={editingTA}
          courses={allCourses}
          onClose={() => {
            setModalOpen(false);
            setEditingTA(null);
          }}
          onSaved={() => tas.reload()}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف حساب دستیار آموزشی"
        message={`آیا مطمئن هستید که می‌خواهید دستیار آموزشی «${deleteTarget?.name || deleteTarget?.username}» را حذف کنید؟`}
        confirmText="حذف دستیار"
        cancelText="انصراف"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Stack>
  );
}
