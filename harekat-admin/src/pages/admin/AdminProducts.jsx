import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Stack,
  Tabs,
  Tab,
  Button,
  TextField,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
  CircularProgress,
  Avatar,
  OutlinedInput,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  VideoLibrary as VideoLibraryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as CourseIcon,
  Bolt as CapsuleIcon,
  Workspaces as PackageIcon,
  Category as CategoryIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { adminApi } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { formatToman } from '../../utils/format.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import StatusChip from '../../components/admin/StatusChip.jsx';
import EmptyState from '../../components/admin/EmptyState.jsx';
import ImagePicker from '../../components/ImagePicker.jsx';

const EMPTY_PRODUCT = {
  name: '',
  price: '',
  salePrice: '',
  image: '',
  level: 'مقدماتی',
  duration: '',
  typeOfAttendence: 'آنلاین',
  statusOfRegistration: 'در حال ثبت نام',
  description: '',
  videoUrl: '',
  longDescription: '',
  teacherId: '',
  teacherIds: [],
  includedCourseIds: [],
  isActive: true,
  sortOrder: 0,
  categoryIds: [],
  kind: 'regular',
};

// Sessions Management Dialog
function SessionsDialog({ open, course, onClose }) {
  const { showSuccess, showError } = useNotification();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSession, setEditingSession] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [sessionForm, setSessionForm] = useState({
    sessionNumber: 1,
    title: '',
    description: '',
    sessionLink: '',
    videoLink: '',
    googleDriveLink: '',
    groupLink: '',
    porslineLink: '',
    isFinal: false,
    sortOrder: 0,
  });

  const fetchSessions = useCallback(async () => {
    if (!course?.id) return;
    setLoading(true);
    try {
      const res = await adminApi.listSessions(course.id);
      setSessions(res.data || []);
    } catch (err) {
      showError(err.message || 'خطا در بارگذاری جلسات');
    } finally {
      setLoading(false);
    }
  }, [course, showError]);

  useEffect(() => {
    let ignore = false;
    if (open && course?.id) {
      adminApi.listSessions(course.id)
        .then((res) => {
          if (!ignore) {
            setSessions(res.data || []);
            setEditingSession(null);
          }
        })
        .catch((err) => {
          if (!ignore) showError(err.message || 'خطا در بارگذاری جلسات');
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }
    return () => {
      ignore = true;
    };
  }, [open, course?.id, showError]);

  const handleOpenCreate = () => {
    setSessionForm({
      sessionNumber: sessions.length + 1,
      title: `جلسه ${sessions.length + 1}`,
      description: '',
      sessionLink: '',
      videoLink: '',
      googleDriveLink: '',
      groupLink: '',
      porslineLink: '',
      isFinal: false,
      sortOrder: sessions.length + 1,
    });
    setEditingSession('new');
  };

  const handleOpenEdit = (s) => {
    setSessionForm({
      sessionNumber: s.sessionNumber || 1,
      title: s.title || '',
      description: s.description || '',
      sessionLink: s.sessionLink || '',
      videoLink: s.videoLink || '',
      googleDriveLink: s.googleDriveLink || '',
      groupLink: s.groupLink || '',
      porslineLink: s.porslineLink || '',
      isFinal: !!s.isFinal,
      sortOrder: s.sortOrder || 0,
    });
    setEditingSession(s);
  };

  const handleSaveSession = async (e) => {
    e.preventDefault();
    if (!sessionForm.title.trim()) {
      showError('عنوان جلسه الزامی است');
      return;
    }
    setSaving(true);
    try {
      if (editingSession === 'new') {
        await adminApi.createSession(course.id, sessionForm);
        showSuccess('جلسه جدید با موفقیت اضافه شد');
      } else {
        await adminApi.updateSession(editingSession.id, sessionForm);
        showSuccess('جلسه با موفقیت ویرایش شد');
      }
      setEditingSession(null);
      fetchSessions();
    } catch (err) {
      showError(err.message || 'خطا در ذخیره جلسه');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteSession(deleteTarget.id);
      showSuccess('جلسه با موفقیت حذف شد');
      setDeleteTarget(null);
      fetchSessions();
    } catch (err) {
      showError(err.message || 'خطا در حذف جلسه');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth dir="rtl">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <VideoLibraryIcon color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={700}>
                جلسات آموزشی دوره: {course?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                مجموع {sessions.length} جلسه تعریف‌شده
              </Typography>
            </Box>
          </Stack>

          {!editingSession && (
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleOpenCreate}>
              جلسه جدید
            </Button>
          )}
        </DialogTitle>

        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
          {editingSession ? (
            <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'action.hover', borderRadius: 2.5 }}>
              <Typography fontWeight={700} fontSize="0.95rem" mb={2}>
                {editingSession === 'new' ? 'افزودن جلسه جدید' : `ویرایش جلسه: ${sessionForm.title}`}
              </Typography>

              <Box component="form" onSubmit={handleSaveSession}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <TextField
                      label="شماره جلسه"
                      type="number"
                      value={sessionForm.sessionNumber}
                      onChange={(e) => setSessionForm({ ...sessionForm, sessionNumber: Number(e.target.value) })}
                      dir="ltr"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 9 }}>
                    <TextField
                      label="عنوان جلسه *"
                      value={sessionForm.title}
                      onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="لینک ویدیو (آپارات / یوتیوب / مستقیم)"
                      dir="ltr"
                      value={sessionForm.videoLink}
                      onChange={(e) => setSessionForm({ ...sessionForm, videoLink: e.target.value })}
                      placeholder="https://..."
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="لینک گوگل درایو فایل‌ها"
                      dir="ltr"
                      value={sessionForm.googleDriveLink}
                      onChange={(e) => setSessionForm({ ...sessionForm, googleDriveLink: e.target.value })}
                      placeholder="https://drive.google.com/..."
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="لینک گروه پرسش و پاسخ"
                      dir="ltr"
                      value={sessionForm.groupLink}
                      onChange={(e) => setSessionForm({ ...sessionForm, groupLink: e.target.value })}
                      placeholder="https://t.me/..."
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="لینک پرس‌لاین (کوییز / نظرسنجی)"
                      dir="ltr"
                      value={sessionForm.porslineLink}
                      onChange={(e) => setSessionForm({ ...sessionForm, porslineLink: e.target.value })}
                      placeholder="https://survey.porsline.ir/..."
                    />
                  </Grid>

                  <Grid size={12}>
                    <TextField
                      label="توضیحات جلسه"
                      multiline
                      rows={2}
                      value={sessionForm.description}
                      onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={sessionForm.isFinal}
                          onChange={(e) => setSessionForm({ ...sessionForm, isFinal: e.target.checked })}
                        />
                      }
                      label="جلسه پایانی (آزمون نهایی)"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="ترتیب نمایش"
                      type="number"
                      value={sessionForm.sortOrder}
                      onChange={(e) => setSessionForm({ ...sessionForm, sortOrder: Number(e.target.value) })}
                      dir="ltr"
                    />
                  </Grid>

                  <Grid size={12}>
                    <Stack direction="row" spacing={1.5} justifyContent="flex-end" mt={1}>
                      <Button variant="outlined" onClick={() => setEditingSession(null)}>
                        انصراف
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={saving}
                        startIcon={saving && <CircularProgress size={16} color="inherit" />}
                      >
                        {saving ? 'در حال ذخیره...' : 'ذخیره جلسه'}
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          ) : (
            <Box>
              {loading ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <CircularProgress size={30} />
                </Box>
              ) : sessions.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width={60}>شماره</TableCell>
                      <TableCell>عنوان جلسه</TableCell>
                      <TableCell>لینک ویدیو</TableCell>
                      <TableCell>فایل‌ها</TableCell>
                      <TableCell>پایانی</TableCell>
                      <TableCell align="left">عملیات</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sessions.map((s) => (
                      <TableRow key={s.id} hover>
                        <TableCell sx={{ fontWeight: 700 }}>{s.sessionNumber}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{s.title}</TableCell>
                        <TableCell>
                          {s.videoLink ? (
                            <Chip size="small" label="ویدیو" color="primary" variant="outlined" icon={<LinkIcon />} />
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell>
                          {s.googleDriveLink ? (
                            <Chip size="small" label="درایو" color="info" variant="outlined" icon={<LinkIcon />} />
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell>
                          {s.isFinal && <Chip size="small" label="پایانی" color="warning" />}
                        </TableCell>
                        <TableCell align="left">
                          <Stack direction="row" spacing={0.5}>
                            <IconButton size="small" color="primary" onClick={() => handleOpenEdit(s)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => setDeleteTarget(s)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState
                  title="جلسه‌ای تعریف نشده است"
                  description="برای این دوره هنوز جلسه‌ای ثبت نشده است. می‌توانید با دکمه بالا جلسه جدید اضافه کنید."
                  actionText="افزودن اولین جلسه"
                  onAction={handleOpenCreate}
                />
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} variant="outlined">
            بستن
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete session confirm */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف جلسه آموزشی"
        message={`آیا مطمئن هستید که می‌خواهید جلسه «${deleteTarget?.title}» را حذف کنید؟`}
        confirmText="حذف جلسه"
        cancelText="انصراف"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}

// Product Form Modal (Used for Course, Capsule, and Skill Package)
function ProductFormModal({ open, initial, categories, teachers, allCourses, kind = 'regular', onClose, onSaved }) {
  const { showSuccess, showError } = useNotification();
  const [form, setForm] = useState(initial || EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const isPackage = kind === 'skill';

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      showError('نام دوره الزامی است');
      return;
    }
    if (!form.price?.toString().trim()) {
      showError('قیمت اصلی الزامی است');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        kind,
        price: String(form.price).replace(/[,٬]/g, ''),
        salePrice: form.salePrice ? String(form.salePrice).replace(/[,٬]/g, '') : null,
        sortOrder: Number(form.sortOrder) || 0,
        teacherId: form.teacherId || null,
        categoryIds: form.categoryIds || [],
        teacherIds: form.teacherIds || [],
        includedCourseIds: isPackage ? form.includedCourseIds || [] : [],
      };

      if (initial?.id) {
        await adminApi.updateCourse(initial.id, payload);
        showSuccess('دوره با موفقیت ویرایش شد');
      } else {
        await adminApi.createCourse(payload);
        showSuccess('دوره جدید با موفقیت ایجاد شد');
      }
      onSaved();
      onClose();
    } catch (err) {
      showError(err.message || 'خطا در ذخیره اطلاعات دوره');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth dir="rtl">
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          {initial?.id ? 'ویرایش دوره' : 'تعریف دوره جدید'} ({isPackage ? 'پکیج مهارتی' : kind === 'capsule' ? 'کپسولی' : 'دوره عادی'})
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Tabs
          value={tabIndex}
          onChange={(e, val) => setTabIndex(val)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="مشخصات اصلی" />
          <Tab label="قیمت و ثبت‌نام" />
          <Tab label="رسانه و تصویر" />
          <Tab label="توضیحات" />
          {isPackage && <Tab label="دوره‌های پکیج" />}
        </Tabs>

        <Box component="form" id="product-form" onSubmit={handleSubmit} sx={{ p: 3 }}>
          {tabIndex === 0 && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  label="نام دوره *"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="مثال: دوره جامع طراحی UI/UX"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>سطح دوره</InputLabel>
                  <Select value={form.level || 'مقدماتی'} label="سطح دوره" onChange={(e) => set('level', e.target.value)}>
                    <MenuItem value="مقدماتی">مقدماتی</MenuItem>
                    <MenuItem value="متوسط">متوسط</MenuItem>
                    <MenuItem value="پیشرفته">پیشرفته</MenuItem>
                    <MenuItem value="جامع">جامع</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>دسته‌بندی‌ها</InputLabel>
                  <Select
                    multiple
                    value={form.categoryIds || []}
                    onChange={(e) => set('categoryIds', e.target.value)}
                    input={<OutlinedInput label="دسته‌بندی‌ها" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((val) => {
                          const cat = categories.find((c) => c.id === val);
                          return <Chip key={val} label={cat?.name || val} size="small" />;
                        })}
                      </Box>
                    )}
                  >
                    {categories.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        <Checkbox checked={(form.categoryIds || []).includes(c.id)} />
                        <ListItemText primary={c.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>مدرس (استاد)</InputLabel>
                  <Select
                    value={form.teacherId || ''}
                    label="مدرس (استاد)"
                    onChange={(e) => set('teacherId', e.target.value)}
                  >
                    <MenuItem value="">-- بدون مدرس خاص --</MenuItem>
                    {teachers.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.firstName} {t.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                  label="فعال (نمایش در سایت)"
                  sx={{ mt: 1 }}
                />
              </Grid>
            </Grid>
          )}

          {tabIndex === 1 && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="قیمت اصلی (تومان) *"
                  value={form.price}
                  onChange={(e) => set('price', e.target.value)}
                  placeholder="2500000"
                  dir="ltr"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="قیمت فروش / تخفیف‌دار (تومان)"
                  value={form.salePrice ?? ''}
                  onChange={(e) => set('salePrice', e.target.value)}
                  placeholder="1900000 (خالی = بدون تخفیف)"
                  dir="ltr"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>وضعیت ثبت‌نام</InputLabel>
                  <Select
                    value={form.statusOfRegistration || 'در حال ثبت نام'}
                    label="وضعیت ثبت‌نام"
                    onChange={(e) => set('statusOfRegistration', e.target.value)}
                  >
                    <MenuItem value="در حال ثبت نام">در حال ثبت نام</MenuItem>
                    <MenuItem value="تکمیل ظرفیت">تکمیل ظرفیت</MenuItem>
                    <MenuItem value="به زودی">به زودی</MenuItem>
                    <MenuItem value="پایان دوره">پایان دوره</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>نوع برگزاری</InputLabel>
                  <Select
                    value={form.typeOfAttendence || 'آنلاین'}
                    label="نوع برگزاری"
                    onChange={(e) => set('typeOfAttendence', e.target.value)}
                  >
                    <MenuItem value="آنلاین">آنلاین</MenuItem>
                    <MenuItem value="حضوری">حضوری</MenuItem>
                    <MenuItem value="آفلاین">آفلاین / ضبط‌شده</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="طول مدت دوره"
                  value={form.duration || ''}
                  onChange={(e) => set('duration', e.target.value)}
                  placeholder="مثال: ۲۴ ساعت آموزش"
                />
              </Grid>
            </Grid>
          )}

          {tabIndex === 2 && (
            <Grid container spacing={2}>
              <Grid size={12}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" mb={1} display="block">
                  تصویر شاخص دوره
                </Typography>
                <ImagePicker value={form.image} onChange={(url) => set('image', url)} alt="تصویر دوره" />
              </Grid>

              <Grid size={12}>
                <TextField
                  label="آدرس ویدیو تیزر / معرفی دوره"
                  dir="ltr"
                  value={form.videoUrl || ''}
                  onChange={(e) => set('videoUrl', e.target.value)}
                  placeholder="https://aparat.com/v/..."
                  helperText="لینک معرفی در صفحه نمایش دوره نمایش داده می‌شود"
                />
              </Grid>
            </Grid>
          )}

          {tabIndex === 3 && (
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  label="توضیح کوتاه (خلاصه دوره)"
                  multiline
                  rows={2}
                  value={form.description || ''}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="خلاصه‌ای از دوره برای کارت دوره و نتایج جستجو..."
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  label="توضیحات جامع دوره (پشتیبانی از Markdown)"
                  multiline
                  rows={6}
                  value={form.longDescription || ''}
                  onChange={(e) => set('longDescription', e.target.value)}
                  placeholder="سرفصل‌ها، پیش‌نیازها و اهداف آموزشی با قالب Markdown..."
                />
              </Grid>
            </Grid>
          )}

          {isPackage && tabIndex === 4 && (
            <Box>
              <Typography fontWeight={700} fontSize="0.9rem" mb={1}>
                انتخاب دوره‌های زیرمجموعه این پکیج
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                دانشجویی که این پکیج مهارتی را خریداری کند به تمام دوره‌های انتخاب‌شده زیر دسترسی خواهد داشت.
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel>دوره‌های شامل</InputLabel>
                <Select
                  multiple
                  value={form.includedCourseIds || []}
                  onChange={(e) => set('includedCourseIds', e.target.value)}
                  input={<OutlinedInput label="دوره‌های شامل" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((val) => {
                        const crs = allCourses.find((c) => c.id === val);
                        return <Chip key={val} label={crs?.name || val} size="small" />;
                      })}
                    </Box>
                  )}
                >
                  {allCourses
                    .filter((c) => c.id !== initial?.id)
                    .map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        <Checkbox checked={(form.includedCourseIds || []).includes(c.id)} />
                        <ListItemText primary={c.name} secondary={`${c.level || 'عمومی'} · ${formatToman(c.price)}`} />
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} variant="outlined">
          انصراف
        </Button>
        <Button
          type="submit"
          form="product-form"
          variant="contained"
          disabled={saving}
          startIcon={saving && <CircularProgress size={16} color="inherit" />}
        >
          {saving ? 'در حال ذخیره...' : 'ذخیره دوره'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Category Dialog
function CategoryModal({ open, initial, onClose, onSaved }) {
  const { showSuccess, showError } = useNotification();
  const [name, setName] = useState(initial?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return showError('نام دسته‌بندی الزامی است');
    setSaving(true);
    try {
      if (initial?.id) {
        await adminApi.updateCategory(initial.id, { name: name.trim() });
        showSuccess('دسته‌بندی با موفقیت ویرایش شد');
      } else {
        await adminApi.createCategory({ name: name.trim() });
        showSuccess('دسته‌بندی با موفقیت ایجاد شد');
      }
      onSaved();
      onClose();
    } catch (err) {
      showError(err.message || 'خطا در ثبت دسته‌بندی');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth dir="rtl">
      <DialogTitle fontWeight={700}>
        {initial?.id ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers>
          <TextField
            autoFocus
            label="نام دسته‌بندی *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} variant="outlined">
            انصراف
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving || !name.trim()}
            startIcon={saving && <CircularProgress size={16} color="inherit" />}
          >
            {saving ? 'در حال ثبت...' : 'ذخیره'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default function AdminProducts({ defaultTab = 'products' }) {
  const { showSuccess, showError } = useNotification();
  const [tabOverride, setTabOverride] = useState(null);
  const [prevDefaultTab, setPrevDefaultTab] = useState(defaultTab);

  if (prevDefaultTab !== defaultTab) {
    setPrevDefaultTab(defaultTab);
    setTabOverride(null);
  }

  const tab = tabOverride ?? defaultTab;
  const setTab = setTabOverride;

  // Dialog states
  const [editingProduct, setEditingProduct] = useState(null);
  const [sessionsCourse, setSessionsCourse] = useState(null);
  const [categoryModal, setCategoryModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const courses = useApi(() => adminApi.listCourses());
  const categories = useApi(() => adminApi.listCategories());
  const teachers = useApi(() => adminApi.listTeachers());

  const allItems = useMemo(() => courses.data || [], [courses.data]);

  // Filter items by current tab kind
  const filteredProducts = useMemo(() => {
    if (tab === 'capsule') {
      return allItems.filter((c) => c.kind === 'capsule');
    }
    if (tab === 'skill') {
      return allItems.filter((c) => c.kind === 'skill');
    }
    if (tab === 'products') {
      return allItems.filter((c) => !c.kind || c.kind === 'regular');
    }
    return [];
  }, [allItems, tab]);

  const handleDeleteCourse = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      if (tab === 'categories') {
        await adminApi.deleteCategory(deleteConfirm.id);
        showSuccess('دسته‌بندی با موفقیت حذف شد');
        categories.reload();
      } else {
        await adminApi.deleteCourse(deleteConfirm.id);
        showSuccess('دوره با موفقیت حذف شد');
        courses.reload();
      }
      setDeleteConfirm(null);
    } catch (err) {
      showError(err.message || 'خطا در حذف');
    } finally {
      setDeleting(false);
    }
  };

  const courseColumns = useMemo(() => [
    {
      id: 'name',
      label: 'نام دوره و مشخصات',
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            variant="rounded"
            src={row.image}
            sx={{ width: 44, height: 44, borderRadius: 1.5, bgcolor: 'action.hover' }}
          >
            <CourseIcon />
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={700} fontSize="0.84rem" noWrap>
              {row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              سطح: {row.level || 'عمومی'} · برگزاری: {row.typeOfAttendence || 'آنلاین'}
            </Typography>
          </Box>
        </Stack>
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
      id: 'statusOfRegistration',
      label: 'وضعیت ثبت‌نام',
      render: (row) => (
        <Chip
          size="small"
          label={row.statusOfRegistration || 'در حال ثبت نام'}
          color={row.statusOfRegistration === 'در حال ثبت نام' ? 'success' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      id: 'isActive',
      label: 'وضعیت نمایش',
      render: (row) => <StatusChip status={!!row.isActive} />,
    },
    {
      id: 'actions',
      label: 'عملیات',
      sortable: false,
      align: 'left',
      render: (row) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="جلسات آموزشی">
            <IconButton size="small" color="info" onClick={() => setSessionsCourse(row)}>
              <VideoLibraryIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="ویرایش">
            <IconButton size="small" color="primary" onClick={() => setEditingProduct(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="حذف">
            <IconButton size="small" color="error" onClick={() => setDeleteConfirm(row)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], []);

  const categoryColumns = useMemo(() => [
    {
      id: 'name',
      label: 'نام دسته‌بندی',
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <CategoryIcon color="primary" fontSize="small" />
          <Typography fontWeight={700} fontSize="0.875rem">
            {row.name}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'id',
      label: 'شناسه',
      render: (row) => (
        <Typography dir="ltr" variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
          {row.id}
        </Typography>
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
            <IconButton size="small" color="primary" onClick={() => setCategoryModal(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="حذف">
            <IconButton size="small" color="error" onClick={() => setDeleteConfirm(row)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], []);

  const getPageHeaderInfo = () => {
    switch (tab) {
      case 'capsule':
        return {
          title: 'دوره‌های کپسولی',
          subtitle: 'مدیریت و انتشار آموزش‌های فشرده، پروژه‌محور و مهارت‌های کاربردی',
        };
      case 'skill':
        return {
          title: 'پکیج‌های مهارتی',
          subtitle: 'مدیریت پکیج‌های جامع چنداستاده و مسیرهای یادگیری تخصص‌محور',
        };
      case 'categories':
        return {
          title: 'دسته‌بندی‌های موضوعی',
          subtitle: 'مدیریت تگ‌ها و طبقه‌بندی‌های دوره‌ها و اساتید',
        };
      default:
        return {
          title: 'دوره‌های آموزشی',
          subtitle: 'مدیریت و بارگذاری تمام دوره‌ها، جلسات آموزشی و محتوای ویدیویی',
        };
    }
  };

  const headerInfo = getPageHeaderInfo();

  return (
    <Stack spacing={3.5}>
      <PageHeader
        title={headerInfo.title}
        subtitle={headerInfo.subtitle}
        action={
          <Stack direction="row" spacing={1.5}>
            {tab === 'categories' ? (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCategoryModal('new')}
              >
                دسته‌بندی جدید
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setEditingProduct('new')}
              >
                {tab === 'capsule'
                  ? 'دوره کپسولی جدید'
                  : tab === 'skill'
                  ? 'پکیج مهارتی جدید'
                  : 'دوره جدید'}
              </Button>
            )}
          </Stack>
        }
      />

      {/* Tabs */}
      <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', borderRadius: 2 }}>
        <Tabs
          value={tab}
          onChange={(e, val) => setTab(val)}
          sx={{ px: 2 }}
        >
          <Tab value="products" icon={<CourseIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="دوره‌های عادی" />
          <Tab value="capsule" icon={<CapsuleIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="دوره‌های کپسولی" />
          <Tab value="skill" icon={<PackageIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="پکیج‌های مهارتی" />
          <Tab value="categories" icon={<CategoryIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="دسته‌بندی‌ها" />
        </Tabs>
      </Paper>

      {/* Content Table */}
      {tab === 'categories' ? (
        <DataTable
          columns={categoryColumns}
          rows={categories.data || []}
          loading={categories.loading}
          error={categories.error}
          onReload={categories.reload}
          searchPlaceholder="جستجوی دسته‌بندی..."
          emptyTitle="دسته‌بندی یافت نشد"
          emptyDescription="هنوز هیچ دسته‌بندی ثبت نشده است."
        />
      ) : (
        <DataTable
          columns={courseColumns}
          rows={filteredProducts}
          loading={courses.loading}
          error={courses.error}
          onReload={courses.reload}
          searchPlaceholder="جستجوی نام دوره..."
          emptyTitle="دوره‌ای یافت نشد"
          emptyDescription="هیچ دوره‌ای در این بخش ثبت نشده است."
        />
      )}

      {/* Create / Edit Course Modal */}
      {editingProduct && (
        <ProductFormModal
          open={Boolean(editingProduct)}
          initial={editingProduct === 'new' ? EMPTY_PRODUCT : editingProduct}
          kind={tab === 'capsule' ? 'capsule' : tab === 'skill' ? 'skill' : 'regular'}
          categories={categories.data || []}
          teachers={teachers.data || []}
          allCourses={allItems}
          onClose={() => setEditingProduct(null)}
          onSaved={() => courses.reload()}
        />
      )}

      {/* Sessions Dialog */}
      {sessionsCourse && (
        <SessionsDialog
          open={Boolean(sessionsCourse)}
          course={sessionsCourse}
          onClose={() => setSessionsCourse(null)}
        />
      )}

      {/* Category Modal */}
      {categoryModal && (
        <CategoryModal
          open={Boolean(categoryModal)}
          initial={categoryModal === 'new' ? null : categoryModal}
          onClose={() => setCategoryModal(null)}
          onSaved={() => categories.reload()}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteConfirm)}
        title="تایید حذف"
        message={`آیا مطمئن هستید که می‌خواهید «${deleteConfirm?.name}» را حذف کنید؟ این عمل غیرقابل بازگشت است.`}
        confirmText="حذف مورد"
        cancelText="انصراف"
        loading={deleting}
        onConfirm={handleDeleteCourse}
        onClose={() => setDeleteConfirm(null)}
      />
    </Stack>
  );
}
