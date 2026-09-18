import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminApi, isTA } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { formatToman } from '../../utils/format.js';
import { Card, Field, FormError, RowActions, StatusDot, PageHeader, ListRowSkeleton, CategoryListSkeleton } from './adminUi.jsx';
import ImagePicker from '../../components/ImagePicker.jsx';
import {
  Box, Stack, Tabs, Tab, Button, TextField, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Chip, Grid, Alert, Divider, FormControl, InputLabel, Checkbox, FormControlLabel, Paper,
  Table, TableHead, TableRow, TableCell, TableBody, OutlinedInput, ListItemText, IconButton, Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  VideoLibrary as VideoLibraryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const EMPTY_PRODUCT = {
  name: '', price: '', salePrice: '', image: '', level: 'مقدماتی',
  duration: '', typeOfAttendence: 'آنلاین', statusOfRegistration: 'در حال ثبت نام',
  description: '', videoUrl: '', longDescription: '', teacherId: '', teacherIds: [],
  includedCourseIds: [], isActive: true, sortOrder: 0, categoryIds: [], kind: 'regular',
};

function SessionsDialog({ open, course, onClose }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSession, setEditingSession] = useState(null);
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
    sortOrder: 0
  });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const fetchSessions = async () => {
    if (!course?.id) return;
    setLoading(true);
    try {
      const res = await adminApi.listSessions(course.id);
      setSessions(res.data || []);
    } catch (err) {
      alert(`خطا: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && course) {
      fetchSessions();
      setEditingSession(null);
      setNotice(null);
    }
  }, [open, course]);

  const handleOpenCreate = () => {
    setSessionForm({
      sessionNumber: (sessions.length + 1),
      title: `جلسه ${sessions.length + 1}`,
      description: '',
      sessionLink: '',
      videoLink: '',
      googleDriveLink: '',
      groupLink: '',
      porslineLink: '',
      isFinal: false,
      sortOrder: sessions.length + 1
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
      sortOrder: s.sortOrder || 0
    });
    setEditingSession(s);
  };

  const handleSaveSession = async (e) => {
    e.preventDefault();
    if (!sessionForm.title?.trim()) return alert('عنوان جلسه الزامی است');
    setSaving(true);
    try {
      if (editingSession && editingSession !== 'new') {
        await adminApi.updateSession(editingSession.id, sessionForm);
      } else {
        await adminApi.createSession(course.id, sessionForm);
      }
      setEditingSession(null);
      setNotice('جلسه با موفقیت ذخیره شد');
      await fetchSessions();
    } catch (err) {
      alert(`خطا: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm('آیا از حذف این جلسه اطمینان دارید؟')) return;
    try {
      await adminApi.deleteSession(id);
      fetchSessions();
      setNotice('جلسه با موفقیت حذف شد');
    } catch (err) {
      alert(`خطا: ${err.message}`);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth dir="rtl">
      <DialogTitle fontWeight={700}>
        مدیریت جلسات دوره — {course?.name}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          {notice && <Alert severity="success" onClose={() => setNotice(null)}>{notice}</Alert>}

          {!editingSession && (
            <Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreate}
                size="small"
              >
                افزودن جلسه جدید
              </Button>
            </Box>
          )}

          {editingSession && (
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
              <Typography fontWeight={700} fontSize={14} mb={2}>
                {editingSession === 'new' ? 'جلسه جدید' : 'ویرایش جلسه'}
              </Typography>
              <Box component="form" onSubmit={handleSaveSession}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <TextField
                      label="شماره جلسه *"
                      type="number"
                      size="small"
                      value={sessionForm.sessionNumber}
                      onChange={(e) => setSessionForm((f) => ({ ...f, sessionNumber: Number(e.target.value) }))}
                      dir="ltr"
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 9 }}>
                    <TextField
                      label="عنوان جلسه *"
                      size="small"
                      value={sessionForm.title}
                      onChange={(e) => setSessionForm((f) => ({ ...f, title: e.target.value }))}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="توضیحات جلسه"
                      size="small"
                      multiline
                      rows={2}
                      value={sessionForm.description}
                      onChange={(e) => setSessionForm((f) => ({ ...f, description: e.target.value }))}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="لینک ورود به کلاس آنلاین (Session Link)"
                      size="small"
                      value={sessionForm.sessionLink}
                      onChange={(e) => setSessionForm((f) => ({ ...f, sessionLink: e.target.value }))}
                      dir="ltr"
                      placeholder="https://skyroom.online/..."
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="لینک استریم / دانلود ویدیو (Video Link)"
                      size="small"
                      value={sessionForm.videoLink}
                      onChange={(e) => setSessionForm((f) => ({ ...f, videoLink: e.target.value }))}
                      dir="ltr"
                      placeholder="https://.../lesson.mp4"
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="لینک ویدیو گوگل درایو (Google Drive Link)"
                      size="small"
                      value={sessionForm.googleDriveLink}
                      onChange={(e) => setSessionForm((f) => ({ ...f, googleDriveLink: e.target.value }))}
                      dir="ltr"
                      placeholder="https://drive.google.com/..."
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="لینک گروه پشتیبانی/ارتباطی (Group Link)"
                      size="small"
                      value={sessionForm.groupLink}
                      onChange={(e) => setSessionForm((f) => ({ ...f, groupLink: e.target.value }))}
                      dir="ltr"
                      placeholder="https://t.me/... یا ایتا"
                      fullWidth
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="لینک فرم نظرسنجی پرس‌لاین (Porsline Link)"
                      size="small"
                      value={sessionForm.porslineLink}
                      onChange={(e) => setSessionForm((f) => ({ ...f, porslineLink: e.target.value }))}
                      dir="ltr"
                      placeholder="https://survey.porsline.ir/..."
                      fullWidth
                      helperText="قانون دسترسی: لینک پرس‌لاین فقط از جلسه ۴ به بعد به صورت خودکار توسط سرور در اختیار دانشجو قرار می‌گیرد."
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={sessionForm.isFinal}
                          onChange={(e) => setSessionForm((f) => ({ ...f, isFinal: e.target.checked }))}
                        />
                      }
                      label="این جلسه، جلسه پایانی دوره است (فعال‌کننده آزمون)"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="ترتیب نمایش"
                      type="number"
                      size="small"
                      value={sessionForm.sortOrder}
                      onChange={(e) => setSessionForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                      dir="ltr"
                      fullWidth
                    />
                  </Grid>
                  <Grid size={12}>
                    <Stack direction="row" spacing={1}>
                      <Button type="submit" variant="contained" disabled={saving}>
                        {saving ? 'در حال ذخیره...' : 'ذخیره جلسه'}
                      </Button>
                      <Button variant="text" onClick={() => setEditingSession(null)}>انصراف</Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          )}

          {/* Sessions Table */}
          {loading ? (
            <Typography variant="body2">در حال بارگذاری جلسات...</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={70}>جلسه</TableCell>
                  <TableCell>عنوان</TableCell>
                  <TableCell>لینک‌ها</TableCell>
                  <TableCell>پرس‌لاین</TableCell>
                  <TableCell>پایانی</TableCell>
                  <TableCell align="left">عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.length > 0 ? (
                  sessions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell sx={{ fontWeight: 700 }}>#{s.sessionNumber}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{s.title}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          {s.sessionLink && <Chip label="کلاس" size="small" variant="outlined" />}
                          {s.videoLink && <Chip label="ویدیو" size="small" color="primary" variant="outlined" />}
                          {s.googleDriveLink && <Chip label="درایو" size="small" color="info" variant="outlined" />}
                          {s.groupLink && <Chip label="گروه" size="small" color="success" variant="outlined" />}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {s.porslineLink ? (
                          <Chip
                            label={s.sessionNumber >= 4 ? 'فعال (جلسه ۴+)' : 'قفل سرور (<۴)'}
                            size="small"
                            color={s.sessionNumber >= 4 ? 'success' : 'default'}
                          />
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        {s.isFinal ? <Chip label="جلسه آخر" size="small" color="secondary" /> : '—'}
                      </TableCell>
                      <TableCell align="left">
                        <Stack direction="row" spacing={0.5}>
                          <IconButton size="small" onClick={() => handleOpenEdit(s)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeleteSession(s.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      جلسه‌ای برای این دوره تعریف نشده است.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>بستن</Button>
      </DialogActions>
    </Dialog>
  );
}

function TeacherModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', resume: '', avatar: '' });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((c) => ({ ...c, [k]: v }));
  const submit = async () => {
    if (!form.firstName.trim() && !form.lastName.trim()) return setError('نام یا نام خانوادگی الزامی است');
    if (!form.resume.trim()) return setError('رزومه/سوابق الزامی است');
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError('ایمیل معتبر نیست');
    setSaving(true); setError(null);
    try {
      const res = await adminApi.createTeacher(Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim() || null])));
      onCreated(res.data);
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };
  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth dir="rtl">
      <DialogTitle>تعریف مدرس جدید</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <Typography variant="caption" color="text.secondary">مدرس ساخته می‌شود و برای این دوره انتخاب خواهد شد.</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="نام" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} fullWidth /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="نام خانوادگی" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} fullWidth /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="ایمیل" dir="ltr" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="name@example.com" fullWidth /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="تصویر (URL)" dir="ltr" value={form.avatar} onChange={(e) => set('avatar', e.target.value)} placeholder="https://..." fullWidth /></Grid>
            <Grid size={12}><TextField label="سوابق / رزومه *" multiline rows={3} value={form.resume} onChange={(e) => set('resume', e.target.value)} fullWidth /></Grid>
          </Grid>
          <FormError error={error} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>انصراف</Button>
        <Button variant="contained" onClick={submit} disabled={saving}>{saving ? 'در حال ذخیره...' : 'تعریف و انتخاب'}</Button>
      </DialogActions>
    </Dialog>
  );
}

function ProductForm({ initial, categories, teachers, allCourses, onTeacherCreated, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState(null);
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleCategory = (id) => setForm((f) => ({ ...f, categoryIds: f.categoryIds.includes(id) ? f.categoryIds.filter((c) => c !== id) : [...f.categoryIds, id] }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price.toString().trim()) { setError('نام و قیمت اصلی الزامی است'); return; }
    if (form.salePrice !== '' && form.salePrice !== null) {
      const p = Number(String(form.price).replace(/[,٬]/g, ''));
      const s = Number(String(form.salePrice).replace(/[,٬]/g, ''));
      if (!Number.isFinite(s) || s < 0) { setError('قیمت فروش معتبر نیست'); return; }
      if (Number.isFinite(p) && s > p) { setError('قیمت فروش نباید از قیمت اصلی بیشتر باشد'); return; }
    }
    setError(null);
    const selectedTeacherIds = form.kind === 'skill' ? (form.teacherIds ?? []) : (form.teacherId ? [form.teacherId] : []);
    if (form.kind === 'skill' && selectedTeacherIds.length === 0) { setError('پکیج مهارتی باید حداقل یک مدرس داشته باشد'); return; }
    const payload = {
      ...form,
      teacherId: selectedTeacherIds[0] || null,
      teacherIds: selectedTeacherIds,
      level: form.kind === 'skill' ? '' : form.level,
      salePrice: form.salePrice === '' ? null : form.salePrice,
      sortOrder: Number(form.sortOrder) || 0
    };
    await onSubmit(payload, setError);
  };

  return (
    <Box component="form" onSubmit={submit}>
      <Stack spacing={2.5}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}><Field label="نام محصول *"><TextField value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="دوره جامع حرکت" fullWidth /></Field></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><Field label="قیمت اصلی *"><TextField value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="450000" dir="ltr" fullWidth /></Field></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><Field label="قیمت فروش (خالی = بدون تخفیف)"><TextField value={form.salePrice ?? ''} onChange={(e) => set('salePrice', e.target.value)} placeholder="360000" dir="ltr" fullWidth /></Field></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><Field label="تصویر"><ImagePicker value={form.image} onChange={(v) => set('image', v)} /></Field></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><Field label="لینک ویدیو پیش‌نمایش (اختیاری)"><TextField value={form.videoUrl ?? ''} onChange={(e) => set('videoUrl', e.target.value)} dir="ltr" placeholder="https://..." fullWidth /></Field></Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Field label={form.kind === 'skill' ? 'مدرس‌ها (حداقل یک مدرس)' : 'مدرس'}>
              <FormControl fullWidth size="small">
                <InputLabel>{form.kind === 'skill' ? 'مدرس‌ها' : 'مدرس'}</InputLabel>
                <Select
                  multiple={form.kind === 'skill'}
                  value={form.kind === 'skill' ? (form.teacherIds ?? []) : (form.teacherId ?? '')}
                  label={form.kind === 'skill' ? 'مدرس‌ها' : 'مدرس'}
                  onChange={(e) => form.kind === 'skill' ? set('teacherIds', e.target.value) : set('teacherId', e.target.value || null)}
                  renderValue={form.kind === 'skill' ? (selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((id) => { const teacher = teachers.find((item) => item.id === id); return <Chip key={id} size="small" label={`${teacher?.firstName ?? ''} ${teacher?.lastName ?? ''}`.trim() || 'مدرس بدون نام'} />; })}
                    </Box>
                  ) : undefined}
                >
                  {form.kind !== 'skill' && <MenuItem value="">بدون مدرس</MenuItem>}
                  {teachers.map((t) => <MenuItem key={t.id} value={t.id}>{form.kind === 'skill' && <Checkbox checked={(form.teacherIds ?? []).includes(t.id)} />}{`${t.firstName ?? ''} ${t.lastName ?? ''}`.trim() || 'مدرس بدون نام'}</MenuItem>)}
                </Select>
              </FormControl>
              <Button size="small" onClick={() => setTeacherModalOpen(true)} sx={{ mt: 0.5, fontSize: 11 }}>مدرس در فهرست نیست؟ تعریف مدرس جدید</Button>
            </Field>
          </Grid>

          {/* If package (skill), select included courses */}
          {form.kind === 'skill' && (
            <Grid size={12}>
              <Field label="دوره‌های شامل این پکیج مهارتی">
                <FormControl fullWidth size="small">
                  <InputLabel>دوره‌های این پکیج</InputLabel>
                  <Select
                    multiple
                    value={form.includedCourseIds || []}
                    onChange={(e) => set('includedCourseIds', e.target.value)}
                    input={<OutlinedInput label="دوره‌های این پکیج" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((id) => {
                          const c = (allCourses || []).find((item) => item.id === id);
                          return <Chip key={id} size="small" label={c?.name || id} />;
                        })}
                      </Box>
                    )}
                  >
                    {(allCourses || []).filter((c) => c.kind !== 'skill').map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        <Checkbox checked={(form.includedCourseIds || []).includes(c.id)} />
                        <ListItemText primary={c.name} secondary={c.level || ''} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  دانشجو با خرید این پکیج، دسترسی به تک‌تک دوره‌های بالا را دریافت خواهد کرد.
                </Typography>
              </Field>
            </Grid>
          )}

          {form.kind !== 'skill' && <Grid size={{ xs: 12, sm: 6 }}>
            <Field label="سطح">
              <FormControl fullWidth size="small">
                <InputLabel>سطح</InputLabel>
                <Select value={form.level ?? 'مقدماتی'} label="سطح" onChange={(e) => set('level', e.target.value)}>
                  <MenuItem value="پایه">پایه</MenuItem>
                  <MenuItem value="مقدماتی">مقدماتی</MenuItem>
                  <MenuItem value="پیشرفته">پیشرفته</MenuItem>
                </Select>
              </FormControl>
            </Field>
          </Grid>}
          <Grid size={{ xs: 12, sm: 6 }}><Field label="مدت"><TextField value={form.duration} onChange={(e) => set('duration', e.target.value)} placeholder="۵ ساعت" fullWidth /></Field></Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Field label="نوع برگزاری">
              <FormControl fullWidth size="small">
                <InputLabel>نوع برگزاری</InputLabel>
                <Select value={form.typeOfAttendence ?? 'آنلاین'} label="نوع برگزاری" onChange={(e) => set('typeOfAttendence', e.target.value)}>
                  <MenuItem value="آنلاین">آنلاین</MenuItem>
                  <MenuItem value="آفلاین">آفلاین</MenuItem>
                </Select>
              </FormControl>
            </Field>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Field label="وضعیت ثبت‌نام">
              <FormControl fullWidth size="small">
                <InputLabel>وضعیت</InputLabel>
                <Select value={form.statusOfRegistration ?? ''} label="وضعیت" onChange={(e) => set('statusOfRegistration', e.target.value)}>
                  <MenuItem value="">انتخاب وضعیت</MenuItem>
                  <MenuItem value="در حال ثبت نام">در حال ثبت‌نام</MenuItem>
                  <MenuItem value="تکمیل ظرفیت">تکمیل ظرفیت</MenuItem>
                  <MenuItem value="به اتمام رسیده">به اتمام رسیده</MenuItem>
                </Select>
              </FormControl>
            </Field>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}><Field label="ترتیب"><TextField type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} dir="ltr" fullWidth /></Field></Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'center' }}><FormControlLabel control={<Checkbox checked={!!form.isActive} onChange={(e) => set('isActive', e.target.checked)} />} label="فعال باشد" /></Grid>
        </Grid>

        <Field label="توضیح کوتاه"><TextField multiline rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} fullWidth /></Field>
        <Field label="توضیحات کامل (Markdown)"><TextField multiline rows={5} value={form.longDescription} onChange={(e) => set('longDescription', e.target.value)} fullWidth /></Field>

        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>دسته‌بندی‌ها</Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {categories.map((cat) => (
              <Chip
                key={cat.id}
                label={cat.name}
                clickable
                color={form.categoryIds.includes(cat.id) ? 'primary' : 'default'}
                variant={form.categoryIds.includes(cat.id) ? 'filled' : 'outlined'}
                onClick={() => toggleCategory(cat.id)}
              />
            ))}
          </Stack>
        </Box>

        <FormError error={error} />
        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="contained" disabled={saving}>{saving ? '...' : 'ذخیره محصول'}</Button>
          <Button variant="text" onClick={onCancel}>انصراف</Button>
        </Stack>
      </Stack>
      {teacherModalOpen && <TeacherModal onClose={() => setTeacherModalOpen(false)} onCreated={(t) => { onTeacherCreated(t); set('teacherId', t.id); setTeacherModalOpen(false); }} />}
    </Box>
  );
}

function CategoryForm({ initial, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('نام دسته الزامی است'); return; }
    setError(null);
    await onSubmit({ ...form, sortOrder: Number(form.sortOrder) || 0 }, setError);
  };
  return (
    <Box component="form" onSubmit={submit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}><TextField label="نام *" value={form.name} onChange={(e) => set('name', e.target.value)} fullWidth /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><TextField label="اسلاگ (لاتین)" value={form.slug ?? ''} onChange={(e) => set('slug', e.target.value)} dir="ltr" placeholder="skill-packages" fullWidth /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><TextField label="ترتیب" type="number" value={form.sortOrder ?? 0} onChange={(e) => set('sortOrder', e.target.value)} dir="ltr" fullWidth /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><FormControlLabel control={<Checkbox checked={!!form.isActive} onChange={(e) => set('isActive', e.target.checked)} />} label="فعال" /></Grid>
        <Grid size={12}><FormError error={error} /></Grid>
        <Grid size={12}><Stack direction="row" spacing={1}><Button type="submit" variant="contained" disabled={saving}>{saving ? '...' : 'ذخیره'}</Button><Button variant="text" onClick={onCancel}>انصراف</Button></Stack></Grid>
      </Grid>
    </Box>
  );
}

export default function AdminProducts({ defaultTab = 'products' }) {
  const navigate = useNavigate();
  const location = useLocation();

  const tab = location.pathname.startsWith('/capsules')
    ? 'capsule'
    : location.pathname.startsWith('/packages')
    ? 'skill'
    : location.pathname.startsWith('/categories')
    ? 'categories'
    : location.pathname.startsWith('/courses')
    ? 'products'
    : defaultTab;

  const handleTabChange = (_, v) => {
    setEditing(null);
    const routes = {
      products: '/courses',
      capsule: '/capsules',
      skill: '/packages',
      categories: '/categories'
    };
    if (routes[v]) navigate(routes[v]);
  };

  const [editing, setEditing] = useState(null);
  const [editingCat, setEditingCat] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  // Sessions modal state
  const [sessionsCourse, setSessionsCourse] = useState(null);

  const courses = useApi(() => adminApi.listCourses());
  const categories = useApi(() => adminApi.listCategories());
  const teachers = useApi(() => adminApi.listTeachers());

  const saveProduct = async (payload, setError) => {
    setSaving(true);
    try {
      if (editing === 'new') await adminApi.createCourse(payload);
      else await adminApi.updateCourse(editing, payload);
      setEditing(null); setNotice('محصول با موفقیت ذخیره شد'); courses.reload();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('آیا از حذف این مورد اطمینان دارید؟')) return;
    try { await adminApi.deleteCourse(id); courses.reload(); setNotice('دوره با موفقیت حذف شد'); } catch (e) { setNotice(`خطا: ${e.message}`); }
  };

  const saveCategory = async (payload, setError) => {
    setSaving(true);
    try {
      if (editingCat === 'new') await adminApi.createCategory(payload);
      else await adminApi.updateCategory(editingCat, payload);
      setEditingCat(null); categories.reload(); setNotice('دسته‌بندی ذخیره شد');
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('حذف شود؟')) return;
    try { await adminApi.deleteCategory(id); categories.reload(); setNotice(`دسته حذف شد`); } catch (e) { setNotice(`خطا: ${e.message}`); }
  };

  const addTeacherToList = (t) => teachers.setData([...(teachers.data ?? []), t]);

  const toForm = (c) => ({
    name: c.name ?? '', price: c.price ?? '', salePrice: c.salePrice ?? '',
    image: c.image ?? '', level: c.level ?? 'مقدماتی', duration: c.duration ?? '',
    typeOfAttendence: c.typeOfAttendence ?? 'آنلاین', statusOfRegistration: c.statusOfRegistration === 'درحال ثبت نام' ? 'در حال ثبت نام' : (c.statusOfRegistration ?? ''),
    description: c.description ?? '', videoUrl: c.videoUrl ?? '', longDescription: c.longDescription ?? '',
    teacherId: c.teacherId ?? c.teacher?.id ?? '', teacherIds: (c.teachers?.length ? c.teachers : (c.teacher ? [c.teacher] : [])).map((teacher) => teacher.id),
    includedCourseIds: (c.packageIncludedCourses || []).map((x) => x.id),
    isActive: c.isActive ?? true, sortOrder: c.sortOrder ?? 0,
    kind: c.kind ?? 'regular',
    categoryIds: (c.categories ?? []).map((x) => x.id),
  });

  const filteredByKind = (kind) => (courses.data ?? []).filter((c) => (c.kind ?? 'regular') === kind);

  const getPageTitle = () => {
    if (tab === 'capsule') return { title: 'دوره‌های کپسولی', subtitle: 'مدیریت آموزش‌های فشرده و کاربردی کپسولی' };
    if (tab === 'skill') return { title: 'پکیج‌های مهارتی', subtitle: 'مدیریت پکیج‌های جامع مهارتی و چند استاده' };
    if (tab === 'categories') return { title: 'دسته‌بندی‌ها', subtitle: 'مدیریت دسته‌بندی‌های دوره‌ها و اساتید' };
    return { title: 'دوره‌های آموزشی', subtitle: 'مدیریت دوره‌ها، جلسات و جزئیات آموزش‌ها' };
  };
  const pageMeta = getPageTitle();

  return (
    <Stack spacing={3}>
      <PageHeader
        title={pageMeta.title}
        subtitle={pageMeta.subtitle}
        action={
          <Paper elevation={0} sx={{ display: 'flex', p: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'auto' }}>
            <Tabs value={tab} onChange={handleTabChange} sx={{ minHeight: 36 }} variant="scrollable" scrollButtons="auto">
              <Tab label="دوره‌ها" value="products" />
              <Tab label="کپسولی" value="capsule" />
              <Tab label="پکیج مهارتی" value="skill" />
              {!isTA() && <Tab label="دسته‌ها" value="categories" />}
            </Tabs>
          </Paper>
        }
      />
      {notice && <Alert severity="success" onClose={() => setNotice(null)}>{notice}</Alert>}

      {tab === 'products' && (
        <Stack spacing={2}>
          {!editing && <Box><Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing('new'); setNotice(null); }}>دوره جدید</Button></Box>}
          {editing && (
            <Card>
              <Typography sx={{ fontWeight: 700 }} mb={2}>{editing === 'new' ? 'دوره جدید' : 'ویرایش دوره'}</Typography>
              <Divider sx={{ mb: 2.5 }} />
              <ProductForm initial={editing === 'new' ? { ...EMPTY_PRODUCT, kind: 'regular' } : toForm(courses.data.find((c) => c.id === editing))} categories={categories.data ?? []} teachers={teachers.data ?? []} allCourses={courses.data ?? []} onTeacherCreated={addTeacherToList} onSubmit={saveProduct} onCancel={() => setEditing(null)} saving={saving} />
            </Card>
          )}
          {courses.loading && <ListRowSkeleton count={4} circularAvatar={true} />}
          {courses.error && <Alert severity="error">خطا: {courses.error} <Button onClick={courses.reload} size="small">تلاش مجدد</Button></Alert>}
          {filteredByKind('regular').length === 0 && !courses.loading && !editing && <Alert severity="info">دوره‌ای در این بخش ثبت نشده است.</Alert>}
          <Grid container spacing={1.5}>
            {filteredByKind('regular').map((c) => (
              <Grid key={c.id} size={12}>
                <Paper
                  elevation={0}
                  sx={{
                    px: { xs: 1.5, sm: 2 },
                    py: 1.25,
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 1.25, sm: 2 },
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 999,
                    overflow: 'hidden',
                    minWidth: 0,
                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  }}
                >
                  {c.image && (
                    <Box
                      component="img"
                      src={c.image}
                      alt={c.name}
                      sx={{
                        width: { xs: 40, sm: 44 },
                        height: { xs: 40, sm: 44 },
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1px solid',
                        borderColor: 'divider',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <Box sx={{ minWidth: 0, flex: 1, textAlign: 'right' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 14 }} noWrap>
                      {c.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ fontSize: 12, lineHeight: 1.6 }}>
                      {formatToman(c.salePrice ?? c.price)}
                      {c.salePrice && Number(c.salePrice) < Number(c.price) && (
                        <Box component="span" sx={{ textDecoration: 'line-through', mr: 1 }}>
                          {formatToman(c.price)}
                        </Box>
                      )}
                      {' · '}{c.level} · {c.typeOfAttendence}
                      {' · '}
                      {(c.categories ?? []).map((x) => x.name).join('، ') || 'بدون دسته'}
                    </Typography>
                  </Box>
                  <Stack
                    direction="row"
                    sx={{ alignItems: 'center' }}
                    spacing={1}
                    flexShrink={0}
                  >
                    <StatusDot active={c.isActive} />
                    <RowActions
                      extra={
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VideoLibraryIcon sx={{ fontSize: 15 }} />}
                          onClick={() => setSessionsCourse(c)}
                          sx={{ fontSize: 11, py: 0.25, px: 1, height: 28 }}
                        >
                          جلسات ({(c.sessions || []).length})
                        </Button>
                      }
                      onEdit={() => setEditing(c.id)}
                      onDelete={() => deleteProduct(c.id)}
                    />
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Stack>
      )}

      {tab === 'capsule' && (
        <Stack spacing={2}>
          {!editing && <Box><Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing('new'); setNotice(null); }}>آموزش کپسولی جدید</Button></Box>}
          {editing && (
            <Card>
              <Typography sx={{ fontWeight: 700 }} mb={2}>{editing === 'new' ? 'آموزش کپسولی جدید' : 'ویرایش آموزش کپسولی'}</Typography>
              <Divider sx={{ mb: 2.5 }} />
              <ProductForm initial={editing === 'new' ? { ...EMPTY_PRODUCT, kind: 'capsule', duration: 'کپسولی' } : toForm(courses.data.find((c) => c.id === editing))} categories={categories.data ?? []} teachers={teachers.data ?? []} allCourses={courses.data ?? []} onTeacherCreated={addTeacherToList} onSubmit={saveProduct} onCancel={() => setEditing(null)} saving={saving} />
            </Card>
          )}
          {courses.loading && <ListRowSkeleton count={4} circularAvatar={true} />}
          {filteredByKind('capsule').length === 0 && !courses.loading && !editing && <Alert severity="info">آموزش کپسولی ثبت نشده است.</Alert>}
          <Grid container spacing={1.5}>
            {filteredByKind('capsule').map((c) => (
              <Grid key={c.id} size={12}>
                <Paper elevation={0} sx={{ px: { xs: 1.5, sm: 2 }, py: 1.25, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid', borderColor: 'divider', borderRadius: 999 }}>
                  {c.image && <Box component="img" src={c.image} alt={c.name} sx={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '1px solid', borderColor: 'divider' }} />}
                  <Box sx={{ minWidth: 0, flex: 1 }}><Typography sx={{ fontWeight: 700, fontSize: 14 }} noWrap>{c.name}</Typography><Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ fontSize: 12 }}>{formatToman(c.salePrice ?? c.price)}{c.level ? ` · ${c.level}` : ''}</Typography></Box>
                  <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}>
                    <StatusDot active={c.isActive} />
                    <RowActions
                      extra={
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VideoLibraryIcon sx={{ fontSize: 15 }} />}
                          onClick={() => setSessionsCourse(c)}
                          sx={{ fontSize: 11, py: 0.25, px: 1, height: 28 }}
                        >
                          جلسات ({(c.sessions || []).length})
                        </Button>
                      }
                      onEdit={() => setEditing(c.id)}
                      onDelete={() => deleteProduct(c.id)}
                    />
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Stack>
      )}

      {tab === 'skill' && (
        <Stack spacing={2}>
          {!editing && <Box><Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing('new'); setNotice(null); }}>پکیج مهارتی جدید</Button></Box>}
          {editing && (
            <Card>
              <Typography sx={{ fontWeight: 700 }} mb={2}>{editing === 'new' ? 'پکیج مهارتی جدید' : 'ویرایش پکیج مهارتی'}</Typography>
              <Divider sx={{ mb: 2.5 }} />
              <ProductForm initial={editing === 'new' ? { ...EMPTY_PRODUCT, kind: 'skill' } : toForm(courses.data.find((c) => c.id === editing))} categories={categories.data ?? []} teachers={teachers.data ?? []} allCourses={courses.data ?? []} onTeacherCreated={addTeacherToList} onSubmit={saveProduct} onCancel={() => setEditing(null)} saving={saving} />
            </Card>
          )}
          {courses.loading && <ListRowSkeleton count={4} circularAvatar={true} />}
          {filteredByKind('skill').length === 0 && !courses.loading && !editing && <Alert severity="info">پکیج مهارتی ثبت نشده است.</Alert>}
          <Grid container spacing={1.5}>
            {filteredByKind('skill').map((c) => (
              <Grid key={c.id} size={12}>
                <Paper elevation={0} sx={{ px: { xs: 1.5, sm: 2 }, py: 1.25, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid', borderColor: 'divider', borderRadius: 999 }}>
                  {c.image && <Box component="img" src={c.image} alt={c.name} sx={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '1px solid', borderColor: 'divider' }} />}
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 14 }} noWrap>{c.name}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ fontSize: 12 }}>
                      {formatToman(c.salePrice ?? c.price)}
                      {' · '}شامل {(c.packageIncludedCourses || []).length} دوره
                    </Typography>
                  </Box>
                  <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}>
                    <StatusDot active={c.isActive} />
                    <RowActions
                      extra={
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VideoLibraryIcon sx={{ fontSize: 15 }} />}
                          onClick={() => setSessionsCourse(c)}
                          sx={{ fontSize: 11, py: 0.25, px: 1, height: 28 }}
                        >
                          جلسات ({(c.sessions || []).length})
                        </Button>
                      }
                      onEdit={() => setEditing(c.id)}
                      onDelete={() => deleteProduct(c.id)}
                    />
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Stack>
      )}

      {tab === 'categories' && (
        <Stack spacing={2}>
          {!editingCat && <Box><Button variant="contained" startIcon={<AddIcon />} onClick={() => setEditingCat('new')}>دسته جدید</Button></Box>}
          {editingCat && (
            <Card><Typography fontWeight={700} mb={2}>{editingCat === 'new' ? 'دسته جدید' : 'ویرایش دسته'}</Typography><Divider sx={{ mb: 2.5 }} />
              <CategoryForm initial={editingCat === 'new' ? { name: '', slug: '', sortOrder: 0, isActive: true } : categories.data.find((c) => c.id === editingCat)} onSubmit={saveCategory} onCancel={() => setEditingCat(null)} saving={saving} />
            </Card>
          )}
          {categories.loading && <CategoryListSkeleton count={4} />}
          {categories.error && <Alert severity="error">خطا: {categories.error}</Alert>}
          {(categories.data ?? []).map((c) => (
            <Paper key={c.id} elevation={0} sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}>
              <Box>
                <Typography fontWeight={600} fontSize={14}>{c.name}</Typography>
                <Typography variant="caption" color="text.secondary" dir="ltr">{c.slug ?? '—'}</Typography>
              </Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <StatusDot active={c.isActive} />
                <RowActions onEdit={() => setEditingCat(c.id)} onDelete={() => deleteCategory(c.id)} />
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Sessions Dialog */}
      {sessionsCourse && (
        <SessionsDialog
          open={!!sessionsCourse}
          course={sessionsCourse}
          onClose={() => {
            setSessionsCourse(null);
            courses.reload();
          }}
        />
      )}
    </Stack>
  );
}
