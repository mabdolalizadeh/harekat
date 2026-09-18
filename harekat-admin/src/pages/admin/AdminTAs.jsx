import { useState } from 'react';
import { adminApi, isSuperAdmin } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { Card, Field, FormError, RowActions, StatusDot, PageHeader, ListRowSkeleton } from './adminUi.jsx';
import {
  Box, Stack, Button, TextField, Typography, Grid, Alert, Paper, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, FormControl, InputLabel,
  Select, MenuItem, OutlinedInput, Checkbox, ListItemText
} from '@mui/material';
import { Add as AddIcon, SupervisorAccount as TAIcon } from '@mui/icons-material';

const EMPTY_TA = {
  username: '',
  password: '',
  name: '',
  email: '',
  phoneNumber: '',
  status: 'active',
  courseIds: []
};

function TAModal({ open, initial, courses, onClose, onSaved }) {
  const [form, setForm] = useState(initial || EMPTY_TA);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.username?.trim()) return setError('نام کاربری الزامی است');
    if (!initial?.id && !form.password) return setError('رمز عبور الزامی است');

    setSaving(true);
    setError(null);
    try {
      if (initial?.id) {
        await adminApi.updateTA(initial.id, form);
      } else {
        await adminApi.createTA(form);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'خطا در ذخیره اطلاعات');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth dir="rtl">
      <DialogTitle fontWeight={700}>
        {initial?.id ? 'ویرایش دستیار آموزشی' : 'تعریف دستیار آموزشی جدید'}
      </DialogTitle>
      <DialogContent dividers>
        <Box component="form" id="ta-form" onSubmit={submit}>
          <Stack spacing={2} mt={1}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="نام و نام خانوادگی"
                  value={form.name || ''}
                  onChange={(e) => set('name', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="نام کاربری *"
                  value={form.username || ''}
                  onChange={(e) => set('username', e.target.value)}
                  dir="ltr"
                  fullWidth
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
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="شماره موبایل"
                  value={form.phoneNumber || ''}
                  onChange={(e) => set('phoneNumber', e.target.value)}
                  dir="ltr"
                  placeholder="0912..."
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="ایمیل"
                  value={form.email || ''}
                  onChange={(e) => set('email', e.target.value)}
                  dir="ltr"
                  placeholder="user@example.com"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>وضعیت</InputLabel>
                  <Select
                    value={form.status || 'active'}
                    label="وضعیت"
                    onChange={(e) => set('status', e.target.value)}
                  >
                    <MenuItem value="active">فعال</MenuItem>
                    <MenuItem value="inactive">غیرفعال</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>دوره‌های اختصاص‌یافته</InputLabel>
                  <Select
                    multiple
                    value={form.courseIds || []}
                    onChange={(e) => set('courseIds', e.target.value)}
                    input={<OutlinedInput label="دوره‌های اختصاص‌یافته" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((cId) => {
                          const course = (courses || []).find((c) => c.id === cId);
                          return <Chip key={cId} size="small" label={course?.name || cId} />;
                        })}
                      </Box>
                    )}
                  >
                    {(courses || []).map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        <Checkbox checked={(form.courseIds || []).includes(c.id)} />
                        <ListItemText primary={c.name} secondary={c.level ? `سطح: ${c.level}` : ''} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  دستیار آموزشی فقط به دوره‌های انتخاب شده دسترسی خواهد داشت.
                </Typography>
              </Grid>
            </Grid>
            <FormError error={error} />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>انصراف</Button>
        <Button type="submit" form="ta-form" variant="contained" disabled={saving}>
          {saving ? 'در حال ذخیره...' : 'ذخیره دستیار'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AdminTAs() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTA, setEditingTA] = useState(null);
  const [notice, setNotice] = useState(null);

  const tas = useApi(() => adminApi.listTAs());
  const courses = useApi(() => adminApi.listCourses());

  if (!isSuperAdmin()) {
    return <Alert severity="warning">دسترسی به این بخش فقط برای مدیر ارشد مجاز است.</Alert>;
  }

  const handleEdit = (ta) => {
    const courseIds = (ta.taAssignedCourses || []).map((c) => c.id);
    setEditingTA({
      id: ta.id,
      username: ta.username,
      name: ta.name || '',
      email: ta.email || '',
      phoneNumber: ta.phoneNumber || '',
      status: ta.status || 'active',
      courseIds
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('آیا از حذف این دستیار آموزشی اطمینان دارید؟')) return;
    try {
      await adminApi.deleteTA(id);
      setNotice('دستیار آموزشی با موفقیت حذف شد');
      tas.reload();
    } catch (err) {
      setNotice(`خطا: ${err.message}`);
    }
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="دستیاران آموزشی (TAs)"
        subtitle="مدیریت دستیاران و انتساب دوره‌های مجاز برای نظارت و تدریس"
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

      {notice && <Alert severity="success" onClose={() => setNotice(null)}>{notice}</Alert>}

      {tas.loading && <ListRowSkeleton count={3} />}
      {tas.error && (
        <Alert severity="error">
          خطا: {tas.error} <Button size="small" onClick={tas.reload}>تلاش مجدد</Button>
        </Alert>
      )}

      {!tas.loading && tas.isEmpty && (
        <Alert severity="info">هیچ دستیار آموزشی ثبت نشده است.</Alert>
      )}

      <Grid container spacing={1.5}>
        {(tas.data || []).map((ta) => (
          <Grid key={ta.id} size={12}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                flexWrap: { xs: 'wrap', md: 'nowrap' },
                gap: 2
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    bgcolor: 'primary.light',
                    color: 'primary.dark',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0
                  }}
                >
                  <TAIcon />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography fontWeight={700} fontSize={15} noWrap>
                      {ta.name || ta.username}
                    </Typography>
                    <Chip
                      size="small"
                      label={ta.status === 'active' ? 'فعال' : 'غیرفعال'}
                      color={ta.status === 'active' ? 'success' : 'default'}
                      sx={{ height: 20, fontSize: 11 }}
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary" dir="ltr" sx={{ display: 'block', mt: 0.25 }}>
                    @{ta.username} {ta.phoneNumber ? `| ${ta.phoneNumber}` : ''} {ta.email ? `| ${ta.email}` : ''}
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ flex: 1, px: { md: 2 } }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  دوره‌های مجاز ({(ta.taAssignedCourses || []).length}):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(ta.taAssignedCourses || []).length > 0 ? (
                    ta.taAssignedCourses.map((c) => (
                      <Chip key={c.id} label={c.name} size="small" variant="outlined" />
                    ))
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      دوره‌ای اختصاص نیافته
                    </Typography>
                  )}
                </Box>
              </Box>

              <RowActions
                onEdit={() => handleEdit(ta)}
                onDelete={() => handleDelete(ta.id)}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>

      {modalOpen && (
        <TAModal
          open={modalOpen}
          initial={editingTA}
          courses={courses.data || []}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            tas.reload();
            setNotice('اطلاعات دستیار آموزشی با موفقیت بروزرسانی شد');
          }}
        />
      )}
    </Stack>
  );
}
