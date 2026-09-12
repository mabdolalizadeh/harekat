import { useState } from 'react';
import { adminApi } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { formatToman } from '../../utils/format.js';
import { Card, Field, FormError, RowActions, StatusDot, PageHeader } from './adminUi.jsx';
import ImagePicker from '../../components/ImagePicker.jsx';
import {
  Box, Stack, Tabs, Tab, Button, TextField, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Chip, Grid, Alert, Skeleton, Divider, FormControl, InputLabel, Checkbox, FormControlLabel, Paper
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const EMPTY_PRODUCT = {
  name: '', price: '', salePrice: '', image: '', level: 'مقدماتی',
  duration: '', typeOfAttendence: 'آنلاین', statusOfRegistration: 'در حال ثبت نام',
  description: '', videoUrl: '', longDescription: '', teacherId: '', teacherIds: [], isActive: true, sortOrder: 0, categoryIds: [], kind: 'regular',
};

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
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>تعریف مدرس جدید</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <Typography variant="caption" color="text.secondary">مدرس ساخته می‌شود و برای این دوره انتخاب خواهد شد.</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="نام" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="نام خانوادگی" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="ایمیل" dir="ltr" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="name@example.com" /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="تصویر (URL)" dir="ltr" value={form.avatar} onChange={(e) => set('avatar', e.target.value)} placeholder="https://..." /></Grid>
            <Grid size={12}><TextField label="سوابق / رزومه *" multiline rows={3} value={form.resume} onChange={(e) => set('resume', e.target.value)} /></Grid>
          </Grid>
          <FormError error={error} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>انصراف</Button>
        <Button variant="contained" onClick={submit} disabled={saving}>{saving ? 'در حال ذخیره...' : 'تعریف و انتخاب'}</Button>
      </DialogActions>
    </Dialog>
  );
}

function ProductForm({ initial, categories, teachers, onTeacherCreated, onSubmit, onCancel, saving }) {
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
    const payload = { ...form, teacherId: selectedTeacherIds[0] || null, teacherIds: selectedTeacherIds, level: form.kind === 'skill' ? '' : form.level, salePrice: form.salePrice === '' ? null : form.salePrice, sortOrder: Number(form.sortOrder) || 0 };
    await onSubmit(payload, setError);
  };
  return (
    <Box component="form" onSubmit={submit}>
      <Stack spacing={2.5}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}><Field label="نام محصول *"><TextField value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="دوره جامع حرکت" /></Field></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><Field label="قیمت اصلی *"><TextField value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="450000" dir="ltr" /></Field></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><Field label="قیمت فروش (خالی = بدون تخفیف)"><TextField value={form.salePrice ?? ''} onChange={(e) => set('salePrice', e.target.value)} placeholder="360000" dir="ltr" /></Field></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><Field label="تصویر"><ImagePicker value={form.image} onChange={(v) => set('image', v)} /></Field></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><Field label="لینک ویدیو (اختیاری)"><TextField value={form.videoUrl ?? ''} onChange={(e) => set('videoUrl', e.target.value)} dir="ltr" placeholder="https://..." /></Field></Grid>
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
          <Grid size={{ xs: 12, sm: 6 }}><Field label="مدت"><TextField value={form.duration} onChange={(e) => set('duration', e.target.value)} placeholder="۵ ساعت" /></Field></Grid>
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
                  <MenuItem value="در حال ثبت نام">در حال ثبت نام</MenuItem>
                  <MenuItem value="بزودی">بزودی</MenuItem>
                  <MenuItem value="تکمیل ظرفیت">تکمیل ظرفیت</MenuItem>
                </Select>
              </FormControl>
            </Field>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}><Field label="ترتیب نمایش"><TextField type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} dir="ltr" /></Field></Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel control={<Checkbox checked={!!form.isActive} onChange={(e) => set('isActive', e.target.checked)} />} label="فعال" />
          </Grid>
        </Grid>

        <Field label="توضیحات کوتاه"><TextField multiline rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} /></Field>
        <Field label="توضیحات کامل (Markdown)" hint="Markdown بدون تبدیل در فیلد longDescription ذخیره می‌شود.">
          <TextField multiline rows={8} value={typeof form.longDescription === 'string' ? form.longDescription : ''} onChange={(e) => set('longDescription', e.target.value)} placeholder={'# عنوان دوره\n\nمتن Markdown خود را اینجا وارد کنید...'} slotProps={{ input: { sx: { fontFamily: 'monospace', lineHeight: 1.8 } } }} />
        </Field>

        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>دسته‌بندی‌ها</Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
            {categories.map((c) => (
              <Chip key={c.id} label={c.name} onClick={() => toggleCategory(c.id)} color={form.categoryIds.includes(c.id) ? 'primary' : 'default'} variant={form.categoryIds.includes(c.id) ? 'filled' : 'outlined'} size="small" clickable />
            ))}
            {categories.length === 0 && <Typography variant="caption" color="text.secondary">دسته‌ای ثبت نشده است.</Typography>}
          </Stack>
        </Box>

        <FormError error={error} />
        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="contained" disabled={saving}>{saving ? 'در حال ذخیره...' : 'ذخیره'}</Button>
          <Button variant="text" onClick={onCancel}>انصراف</Button>
        </Stack>
      </Stack>
      {teacherModalOpen && <TeacherModal onClose={() => setTeacherModalOpen(false)} onCreated={(t) => { onTeacherCreated(t); form.kind === 'skill' ? set('teacherIds', [...(form.teacherIds ?? []), t.id]) : set('teacherId', t.id); setTeacherModalOpen(false); }} />}
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
        <Grid size={{ xs: 12, sm: 6 }}><TextField label="نام *" value={form.name} onChange={(e) => set('name', e.target.value)} /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><TextField label="اسلاگ (لاتین)" value={form.slug ?? ''} onChange={(e) => set('slug', e.target.value)} dir="ltr" placeholder="skill-packages" /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><TextField label="ترتیب" type="number" value={form.sortOrder ?? 0} onChange={(e) => set('sortOrder', e.target.value)} dir="ltr" /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><FormControlLabel control={<Checkbox checked={!!form.isActive} onChange={(e) => set('isActive', e.target.checked)} />} label="فعال" /></Grid>
        <Grid size={12}><FormError error={error} /></Grid>
        <Grid size={12}><Stack direction="row" spacing={1}><Button type="submit" variant="contained" disabled={saving}>{saving ? '...' : 'ذخیره'}</Button><Button variant="text" onClick={onCancel}>انصراف</Button></Stack></Grid>
      </Grid>
    </Box>
  );
}

export default function AdminProducts() {
  const [tab, setTab] = useState('products');
  const [editing, setEditing] = useState(null);
  const [editingCat, setEditingCat] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const courses = useApi(() => adminApi.listCourses());
  const categories = useApi(() => adminApi.listCategories());
  const teachers = useApi(() => adminApi.listTeachers());

  const saveProduct = async (payload, setError) => {
    setSaving(true);
    try {
      if (editing === 'new') await adminApi.createCourse(payload);
      else await adminApi.updateCourse(editing, payload);
      setEditing(null); setNotice('محصول ذخیره شد'); courses.reload();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };
  const deleteProduct = async (id) => {
    if (!window.confirm('حذف شود؟')) return;
    try { await adminApi.deleteCourse(id); courses.reload(); } catch (e) { setNotice(`خطا: ${e.message}`); }
  };
  const saveCategory = async (payload, setError) => {
    setSaving(true);
    try {
      if (editingCat === 'new') await adminApi.createCategory(payload);
      else await adminApi.updateCategory(editingCat, payload);
      setEditingCat(null); categories.reload();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };
  const deleteCategory = async (id) => {
    if (!window.confirm('حذف شود؟')) return;
    try { await adminApi.deleteCategory(id); categories.reload(); } catch (e) { setNotice(`خطا: ${e.message}`); }
  };
  const addTeacherToList = (t) => teachers.setData([...(teachers.data ?? []), t]);
  const toForm = (c) => ({
    name: c.name ?? '', price: c.price ?? '', salePrice: c.salePrice ?? '',
    image: c.image ?? '', level: c.level ?? 'مقدماتی', duration: c.duration ?? '',
    typeOfAttendence: c.typeOfAttendence ?? 'آنلاین', statusOfRegistration: c.statusOfRegistration === 'درحال ثبت نام' ? 'در حال ثبت نام' : (c.statusOfRegistration ?? ''),
    description: c.description ?? '', videoUrl: c.videoUrl ?? '', longDescription: c.longDescription ?? '',
    teacherId: c.teacherId ?? c.teacher?.id ?? '', teacherIds: (c.teachers?.length ? c.teachers : (c.teacher ? [c.teacher] : [])).map((teacher) => teacher.id), isActive: c.isActive ?? true, sortOrder: c.sortOrder ?? 0,
    kind: c.kind ?? 'regular',
    categoryIds: (c.categories ?? []).map((x) => x.id),
  });
  const filteredByKind = (kind) => (courses.data ?? []).filter((c) => (c.kind ?? 'regular') === kind);

  return (
    <Stack spacing={3}>
      <PageHeader
        title="محصولات و دسته‌ها"
        subtitle="محصولات، دسته‌بندی و ارتباط با مدرسان — سطح و نوع برگزاری از لیست انتخاب می‌شود؛ کپسولی و پکیج مهارتی در تب جداگانه"
        action={<Paper elevation={0} sx={{ display: 'flex', p: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'auto' }}><Tabs value={tab} onChange={(_, v) => { setTab(v); setEditing(null); }} sx={{ minHeight: 36 }} variant="scrollable" scrollButtons="auto"><Tab label="دوره‌ها" value="products" /><Tab label="کپسولی" value="capsule" /><Tab label="پکیج مهارتی" value="skill" /><Tab label="دسته‌ها" value="categories" /></Tabs></Paper>}
      />
      {notice && <Alert severity="success" onClose={() => setNotice(null)}>{notice}</Alert>}

      {tab === 'products' && (
        <Stack spacing={2}>
          {!editing && <Box><Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing('new'); setNotice(null); }}>دوره جدید</Button></Box>}
          {editing && (
            <Card><Typography sx={{ fontWeight: 700 }} mb={2}>{editing === 'new' ? 'دوره جدید (مقدماتی)' : 'ویرایش دوره'}</Typography><Divider sx={{ mb: 2.5 }} />
              <ProductForm initial={editing === 'new' ? { ...EMPTY_PRODUCT, kind: 'regular' } : toForm(courses.data.find((c) => c.id === editing))} categories={categories.data ?? []} teachers={teachers.data ?? []} onTeacherCreated={addTeacherToList} onSubmit={saveProduct} onCancel={() => setEditing(null)} saving={saving} />
            </Card>
          )}
          {courses.loading && <Skeleton variant="rounded" height={80} />}
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
                      {c.kind !== 'skill' && <> {' · '}{c.level}</>} · {c.typeOfAttendence}
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
                    <RowActions onEdit={() => setEditing(c.id)} onDelete={() => deleteProduct(c.id)} />
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
            <Card><Typography sx={{ fontWeight: 700 }} mb={2}>{editing === 'new' ? 'آموزش کپسولی جدید' : 'ویرایش آموزش کپسولی'}</Typography><Divider sx={{ mb: 2.5 }} />
              <ProductForm initial={editing === 'new' ? { ...EMPTY_PRODUCT, kind: 'capsule', duration: 'کپسولی' } : toForm(courses.data.find((c) => c.id === editing))} categories={categories.data ?? []} teachers={teachers.data ?? []} onTeacherCreated={addTeacherToList} onSubmit={saveProduct} onCancel={() => setEditing(null)} saving={saving} />
            </Card>
          )}
          {courses.loading && <Skeleton variant="rounded" height={80} />}
          {filteredByKind('capsule').length === 0 && !courses.loading && !editing && <Alert severity="info">آموزش کپسولی ثبت نشده است.</Alert>}
          <Grid container spacing={1.5}>
            {filteredByKind('capsule').map((c) => (
              <Grid key={c.id} size={12}>
                <Paper elevation={0} sx={{ px: { xs: 1.5, sm: 2 }, py: 1.25, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid', borderColor: 'divider', borderRadius: 999 }}>
                  {c.image && <Box component="img" src={c.image} alt={c.name} sx={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '1px solid', borderColor: 'divider' }} />}
                  <Box sx={{ minWidth: 0, flex: 1 }}><Typography sx={{ fontWeight: 700, fontSize: 14 }} noWrap>{c.name}</Typography><Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ fontSize: 12 }}>{formatToman(c.salePrice ?? c.price)}{c.level ? ` · ${c.level}` : ''}</Typography></Box>
                  <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}><StatusDot active={c.isActive} /><RowActions onEdit={() => setEditing(c.id)} onDelete={() => deleteProduct(c.id)} /></Stack>
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
            <Card><Typography sx={{ fontWeight: 700 }} mb={2}>{editing === 'new' ? 'پکیج مهارتی جدید' : 'ویرایش پکیج مهارتی'}</Typography><Divider sx={{ mb: 2.5 }} />
              <ProductForm initial={editing === 'new' ? { ...EMPTY_PRODUCT, kind: 'skill' } : toForm(courses.data.find((c) => c.id === editing))} categories={categories.data ?? []} teachers={teachers.data ?? []} onTeacherCreated={addTeacherToList} onSubmit={saveProduct} onCancel={() => setEditing(null)} saving={saving} />
            </Card>
          )}
          {courses.loading && <Skeleton variant="rounded" height={80} />}
          {filteredByKind('skill').length === 0 && !courses.loading && !editing && <Alert severity="info">پکیج مهارتی ثبت نشده است.</Alert>}
          <Grid container spacing={1.5}>
            {filteredByKind('skill').map((c) => (
              <Grid key={c.id} size={12}>
                <Paper elevation={0} sx={{ px: { xs: 1.5, sm: 2 }, py: 1.25, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid', borderColor: 'divider', borderRadius: 999 }}>
                  {c.image && <Box component="img" src={c.image} alt={c.name} sx={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '1px solid', borderColor: 'divider' }} />}
                  <Box sx={{ minWidth: 0, flex: 1 }}><Typography sx={{ fontWeight: 700, fontSize: 14 }} noWrap>{c.name}</Typography><Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ fontSize: 12 }}>{formatToman(c.salePrice ?? c.price)}</Typography></Box>
                  <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}><StatusDot active={c.isActive} /><RowActions onEdit={() => setEditing(c.id)} onDelete={() => deleteProduct(c.id)} /></Stack>
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
          {categories.loading && <Skeleton variant="rounded" height={80} />}
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
    </Stack>
  );
}
