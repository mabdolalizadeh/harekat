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
  FormControlLabel,
  Switch,
  IconButton,
  Tooltip,
  Avatar,
  CircularProgress,
  Link,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Description as FileIcon,
} from '@mui/icons-material';
import { adminApi } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import StatusChip from '../../components/admin/StatusChip.jsx';
import ImagePicker from '../../components/ImagePicker.jsx';

const EMPTY_TEACHER = {
  firstName: '',
  lastName: '',
  email: '',
  resume: '',
  resumeFile: '',
  avatar: '',
  categoryIds: [],
  showOnLanding: false,
};

function TeacherModal({ open, initial, categories, onClose, onSaved }) {
  const { showSuccess, showError } = useNotification();
  const [form, setForm] = useState(initial || EMPTY_TEACHER);
  const [saving, setSaving] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const toggleCategory = (id) => {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((c) => c !== id)
        : [...prev.categoryIds, id],
    }));
  };

  const handleResumeFile = async (file) => {
    if (!file) return;
    setFileUploading(true);
    try {
      const url = await adminApi.uploadFile(file);
      set('resumeFile', url);
      showSuccess('فایل رزومه با موفقیت بارگذاری شد');
    } catch (err) {
      showError(err.message || 'خطا در بارگذاری فایل');
    } finally {
      setFileUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim() && !form.lastName.trim()) {
      showError('نام یا نام خانوادگی الزامی است');
      return;
    }
    if (!form.resume.trim()) {
      showError('رزومه / سوابق استاد الزامی است');
      return;
    }
    if (!form.categoryIds || form.categoryIds.length === 0) {
      showError('حداقل یک دسته‌بندی برای استاد انتخاب کنید');
      return;
    }

    setSaving(true);
    try {
      const clean = {
        ...form,
        firstName: form.firstName.trim() || null,
        lastName: form.lastName.trim() || null,
        email: form.email.trim() || null,
        resume: form.resume.trim(),
        resumeFile: form.resumeFile?.trim() || null,
        avatar: form.avatar?.trim() || null,
        categoryIds: form.categoryIds,
        showOnLanding: !!form.showOnLanding,
      };

      if (initial?.id) {
        await adminApi.updateTeacher(initial.id, clean);
        showSuccess('مشخصات استاد با موفقیت ویرایش شد');
      } else {
        await adminApi.createTeacher(clean);
        showSuccess('استاد جدید با موفقیت اضافه شد');
      }
      onSaved();
      onClose();
    } catch (err) {
      showError(err.message || 'خطا در ذخیره مشخصات استاد');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth dir="rtl">
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          {initial?.id ? 'ویرایش مشخصات مدرس' : 'معرفی مدرس جدید'}
        </Typography>
      </DialogTitle>

      <Box component="form" id="teacher-form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="نام"
                value={form.firstName}
                onChange={(e) => set('firstName', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="نام خانوادگی *"
                value={form.lastName}
                onChange={(e) => set('lastName', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="ایمیل (جهت ارتباط و رزومه)"
                dir="ltr"
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="teacher@example.com"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.5}>
                تصویر پرتره مدرس
              </Typography>
              <ImagePicker value={form.avatar} onChange={(url) => set('avatar', url)} alt="تصویر مدرس" />
            </Grid>

            <Grid size={12}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.5}>
                سوابق تحصیلی و حرفه‌ای (Markdown) *
              </Typography>
              <TextField
                multiline
                rows={6}
                value={form.resume}
                onChange={(e) => set('resume', e.target.value)}
                placeholder={'# درباره استاد\n\nمتن رزومه، سوابق تدریس و فعالیت‌های علمی...'}
                slotProps={{ input: { sx: { fontFamily: 'monospace', lineHeight: 1.8 } } }}
              />
            </Grid>

            {/* Resume Document Upload */}
            <Grid size={12}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
                  فایل ضمیمه رزومه (PDF یا Word) — اختیاری
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                  <Button
                    component="label"
                    variant="outlined"
                    size="small"
                    startIcon={<CloudUploadIcon />}
                    disabled={fileUploading}
                  >
                    بارگذاری فایل جدید
                    <input type="file" hidden accept=".pdf,.doc,.docx" onChange={(e) => handleResumeFile(e.target.files[0])} />
                  </Button>

                  {fileUploading && <CircularProgress size={20} />}

                  {form.resumeFile && !fileUploading && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FileIcon color="primary" fontSize="small" />
                      <Link href={form.resumeFile} target="_blank" rel="noreferrer" variant="caption" dir="ltr">
                        {form.resumeFile.slice(0, 45)}...
                      </Link>
                      <IconButton size="small" color="error" onClick={() => set('resumeFile', '')}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  )}
                </Stack>
              </Paper>
            </Grid>

            {/* Category selection */}
            <Grid size={12}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={1}>
                حوزه‌های تخصصی / دسته‌بندی‌ها * (انتخاب یک یا چند مورد)
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {categories.map((c) => {
                  const selected = (form.categoryIds || []).includes(c.id);
                  return (
                    <Chip
                      key={c.id}
                      label={c.name}
                      onClick={() => toggleCategory(c.id)}
                      color={selected ? 'primary' : 'default'}
                      variant={selected ? 'filled' : 'outlined'}
                      clickable
                    />
                  );
                })}
              </Stack>
            </Grid>

            <Grid size={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!form.showOnLanding}
                    onChange={(e) => set('showOnLanding', e.target.checked)}
                  />
                }
                label="نمایش در بخش اساتید صفحه اصلی (لندینگ)"
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
            disabled={saving || fileUploading}
            startIcon={saving && <CircularProgress size={16} color="inherit" />}
          >
            {saving ? 'در حال ذخیره...' : 'ذخیره مدرس'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default function AdminTeachers() {
  const { showSuccess, showError } = useNotification();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const teachers = useApi(() => adminApi.listTeachers());
  const categories = useApi(() => adminApi.listCategories());

  const allCategories = categories.data || [];

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteTeacher(deleteTarget.id);
      showSuccess('مدرس با موفقیت حذف شد');
      setDeleteTarget(null);
      teachers.reload();
    } catch (err) {
      showError(err.message || 'خطا در حذف مدرس');
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo(() => [
    {
      id: 'name',
      label: 'نام و تصویر مدرس',
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            src={row.avatar}
            sx={{ width: 40, height: 40, bgcolor: 'primary.light', fontWeight: 700 }}
          >
            {row.firstName?.[0] || row.lastName?.[0]}
          </Avatar>
          <Box>
            <Typography fontWeight={700} fontSize="0.84rem">
              {`${row.firstName || ''} ${row.lastName || ''}`.trim()}
            </Typography>
            {row.email && (
              <Typography variant="caption" color="text.secondary" dir="ltr" display="block">
                {row.email}
              </Typography>
            )}
          </Box>
        </Stack>
      ),
    },
    {
      id: 'categories',
      label: 'حوزه‌های تخصصی',
      render: (row) => {
        const cats = row.categories || [];
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 280 }}>
            {cats.map((c) => (
              <Chip key={c.id} label={c.name} size="small" variant="outlined" />
            ))}
          </Box>
        );
      },
    },
    {
      id: 'showOnLanding',
      label: 'نمایش در لندینگ',
      render: (row) => (
        <StatusChip status={!!row.showOnLanding} label={row.showOnLanding ? 'صفحه اصلی' : 'فقط دوره'} />
      ),
    },
    {
      id: 'resumeFile',
      label: 'فایل رزومه',
      render: (row) => (
        row.resumeFile ? (
          <Tooltip title="مشاهده فایل رزومه">
            <IconButton size="small" component="a" href={row.resumeFile} target="_blank" rel="noreferrer" color="primary">
              <FileIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Typography variant="caption" color="text.disabled">—</Typography>
        )
      ),
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
                setEditingTeacher(row);
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
        title="اساتید و مدرسان"
        subtitle="معرفی کادر علمی، سوابق آموزشی و اتصال اساتید به دوره‌ها و دسته‌بندی‌های تخصصی"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingTeacher(null);
              setModalOpen(true);
            }}
          >
            مدرس جدید
          </Button>
        }
      />

      {/* Teachers DataTable */}
      <DataTable
        columns={columns}
        rows={teachers.data || []}
        loading={teachers.loading}
        error={teachers.error}
        onReload={teachers.reload}
        searchPlaceholder="جستجوی نام مدرس یا ایمیل..."
        searchFilter={(row, term) => {
          const name = `${row.firstName || ''} ${row.lastName || ''}`.toLowerCase();
          const email = (row.email || '').toLowerCase();
          return name.includes(term) || email.includes(term);
        }}
        emptyTitle="مدرسی ثبت نشده است"
        emptyDescription="هنوز مدرسی در سامانه ثبت نشده است."
      />

      {/* Create / Edit Modal */}
      {modalOpen && (
        <TeacherModal
          open={modalOpen}
          initial={editingTeacher ? {
            ...editingTeacher,
            categoryIds: editingTeacher.categories?.map((c) => c.id) || editingTeacher.categoryIds || [],
          } : null}
          categories={allCategories}
          onClose={() => {
            setModalOpen(false);
            setEditingTeacher(null);
          }}
          onSaved={() => teachers.reload()}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف مدرس"
        message={`آیا مطمئن هستید که می‌خواهید استاد «${deleteTarget?.firstName || ''} ${deleteTarget?.lastName || ''}» را حذف کنید؟`}
        confirmText="حذف مدرس"
        cancelText="انصراف"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Stack>
  );
}
