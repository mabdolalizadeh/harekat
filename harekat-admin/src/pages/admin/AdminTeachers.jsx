import { useState } from 'react';
import { adminApi } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { Card, FormError, RowActions, PageHeader, Field, TeacherCardSkeleton } from './adminUi.jsx';
import { Box, Stack, Button, TextField, Typography, Grid, Alert, Avatar, Chip, Paper, Divider, LinearProgress, Link, FormControlLabel, Switch } from '@mui/material';
import { Add as AddIcon, Person as PersonIcon, CloudUpload as CloudUploadIcon, Delete as DeleteIcon, Description as DescriptionIcon } from '@mui/icons-material';
import ImagePicker from '../../components/ImagePicker.jsx';

const EMPTY = { firstName: '', lastName: '', email: '', resume: '', resumeFile: '', avatar: '', categoryIds: [], showOnLanding: false };

function TeacherForm({ initial, categories, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState(null);
  const [fileUploading, setFileUploading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleCategory = (id) => setForm((f) => ({ ...f, categoryIds: f.categoryIds.includes(id) ? f.categoryIds.filter((c) => c !== id) : [...f.categoryIds, id] }));

  const handleResumeFile = async (file) => {
    if (!file) return;
    setFileUploading(true); setError(null);
    try {
      const url = await adminApi.uploadFile(file);
      set('resumeFile', url);
    } catch (e) { setError(e.message); } finally { setFileUploading(false); }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim() && !form.lastName.trim()) { setError('نام یا نام خانوادگی الزامی است'); return; }
    if (!form.resume.trim()) { setError('رزومه/سوابق الزامی است'); return; }
    if (!form.categoryIds || form.categoryIds.length === 0) { setError('حداقل یک دسته برای مدرس انتخاب کنید'); return; }
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) { setError('ایمیل معتبر نیست'); return; }
    setError(null); await onSubmit(form, setError);
  };
  return (
    <Box component="form" onSubmit={submit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}><TextField label="نام" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><TextField label="نام خانوادگی" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><TextField label="ایمیل" dir="ltr" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="name@example.com" /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Field label="تصویر مدرس"><ImagePicker value={form.avatar} onChange={(v) => set('avatar', v)} /></Field>
        </Grid>
        <Grid size={12}>
          <Field label="سوابق / رزومه * (Markdown)" hint="از Markdown پشتیبانی می‌شود — مثلا # عنوان، **پررنگ**، *کج*، - لیست">
            <TextField multiline rows={8} value={form.resume} onChange={(e) => set('resume', e.target.value)} placeholder={'# درباره استاد\n\nمتن رزومه با Markdown...'} slotProps={{ input: { sx: { fontFamily: 'monospace', lineHeight: 1.8 } } }} />
          </Field>
        </Grid>
        <Grid size={12}>
          <Field label="فایل رزومه (PDF/Word) — اختیاری" hint="فایل رزومه کامل را آپلود کنید، لینک آن در صفحه مدرس نمایش داده می‌شود">
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Button component="label" variant="outlined" size="small" startIcon={<CloudUploadIcon />} disabled={fileUploading}>
                انتخاب فایل
                <input type="file" hidden accept=".pdf,.doc,.docx" onChange={(e) => handleResumeFile(e.target.files[0])} />
              </Button>
              {fileUploading && <LinearProgress sx={{ flex: 1, minWidth: 80 }} />}
              {form.resumeFile && !fileUploading && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <DescriptionIcon fontSize="small" color="primary" />
                  <Link href={form.resumeFile} target="_blank" rel="noreferrer" underline="hover" variant="caption" dir="ltr">{form.resumeFile.slice(0, 50)}</Link>
                  <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => set('resumeFile', '')}>حذف فایل</Button>
                </Stack>
              )}
            </Stack>
            <Box mt={1}><TextField label="لینک فایل رزومه (اختیاری)" dir="ltr" value={form.resumeFile ?? ''} onChange={(e) => set('resumeFile', e.target.value)} placeholder="https://.../resume.pdf" size="small" /></Box>
          </Field>
        </Grid>
        <Grid size={12}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: 12, mb: 1, display: 'block' }}>دسته‌بندی‌ها * (یک یا چند دسته)</Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {categories.map((c) => (
              <Chip key={c.id} label={c.name} onClick={() => toggleCategory(c.id)} color={form.categoryIds.includes(c.id) ? 'primary' : 'default'} variant={form.categoryIds.includes(c.id) ? 'filled' : 'outlined'} size="small" clickable />
            ))}
            {categories.length === 0 && <Typography variant="caption" color="text.secondary">دسته‌ای ثبت نشده — ابتدا از تب دسته‌ها دسته بسازید.</Typography>}
          </Stack>
        </Grid>
        <Grid size={12}>
          <FormControlLabel control={<Switch checked={!!form.showOnLanding} onChange={(e) => set('showOnLanding', e.target.checked)} />} label="نمایش در صفحه اصلی (لندینگ)" />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>به‌صورت پیش‌فرض مخفی است؛ در صورت فعال‌سازی در لندینگ نمایش داده می‌شود.</Typography>
        </Grid>
        <Grid size={12}><FormError error={error} /></Grid>
        <Grid size={12}><Stack direction="row" spacing={1}><Button type="submit" variant="contained" disabled={saving || fileUploading}>{saving ? 'در حال ذخیره...' : 'ذخیره'}</Button><Button variant="text" onClick={onCancel}>انصراف</Button></Stack></Grid>
      </Grid>
    </Box>
  );
}

export default function AdminTeachers() {
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const teachers = useApi(() => adminApi.listTeachers());
  const categories = useApi(() => adminApi.listCategories());
  const save = async (payload, setError) => {
    setSaving(true);
    try {
      const clean = { ...payload, firstName: payload.firstName?.trim() || null, lastName: payload.lastName?.trim() || null, email: payload.email?.trim() || null, resume: payload.resume?.trim(), resumeFile: payload.resumeFile?.trim() || null, avatar: payload.avatar?.trim() || null, categoryIds: payload.categoryIds ?? [], showOnLanding: !!payload.showOnLanding };
      if (!clean.categoryIds || clean.categoryIds.length === 0) throw new Error('حداقل یک دسته انتخاب کنید');
      if (editing === 'new') await adminApi.createTeacher(clean);
      else await adminApi.updateTeacher(editing, clean);
      setEditing(null); setNotice('مدرس ذخیره شد'); teachers.reload();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };
  const remove = async (id) => {
    if (!window.confirm('این مدرس حذف شود؟')) return;
    try { await adminApi.deleteTeacher(id); teachers.reload(); } catch (e) { setNotice(`خطا: ${e.message}`); }
  };
  const toForm = (t) => ({ firstName: t.firstName ?? '', lastName: t.lastName ?? '', email: t.email ?? '', resume: t.resume ?? '', resumeFile: t.resumeFile ?? '', avatar: t.avatar ?? '', categoryIds: (t.categories ?? []).map((c) => c.id), showOnLanding: !!t.showOnLanding });
  return (
    <Stack spacing={3}>
      <PageHeader title="مدرسان" subtitle="مدیریت مدرسان و انتساب به دوره‌ها" action={!editing && <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing('new'); setNotice(null); }}>مدرس جدید</Button>} />
      {notice && <Alert severity="success" onClose={() => setNotice(null)}>{notice}</Alert>}
      {editing && (
        <Card><Typography sx={{ fontWeight: 700 }} mb={2}>{editing === 'new' ? 'مدرس جدید' : 'ویرایش مدرس'}</Typography><Divider sx={{ mb: 2.5 }} />
          <TeacherForm initial={editing === 'new' ? EMPTY : toForm(teachers.data?.find((t) => t.id === editing))} categories={categories.data ?? []} onSubmit={save} onCancel={() => setEditing(null)} saving={saving} />
        </Card>
      )}
      {teachers.loading && <TeacherCardSkeleton count={4} />}
      {teachers.error && <Alert severity="error">خطا: {teachers.error} <Button onClick={teachers.reload} size="small">تلاش مجدد</Button></Alert>}
      {teachers.isEmpty && !editing && <Alert severity="info">مدرسی ثبت نشده است.</Alert>}
      <Grid container spacing={2}>
        {(teachers.data ?? []).map((t) => {
          const name = `${t.firstName ?? ''} ${t.lastName ?? ''}`.trim() || '—';
          const catNames = (t.categories ?? []).map((c) => c.name).join('، ') || 'بدون دسته';
          return (
            <Grid key={t.id} size={{ xs: 12, md: 6 }}>
              <Paper elevation={0} sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', border: '1px solid', borderColor: t.showOnLanding ? 'primary.main' : 'divider', borderRadius: 2.5, bgcolor: t.showOnLanding ? 'action.hover' : 'background.paper' }}>
                {t.avatar ? <Avatar src={t.avatar} alt={name} sx={{ width: 48, height: 48 }} /> : <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}><PersonIcon /></Avatar>}
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }} noWrap>{name}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ maxWidth: 220 }}>{catNames}</Typography>
                  {t.email && <Typography variant="caption" color="text.secondary" dir="ltr" noWrap display="block">{t.email}</Typography>}
                  {t.resumeFile && <Typography variant="caption" color="primary" noWrap display="block" sx={{ maxWidth: 220 }}><Link href={t.resumeFile} target="_blank" underline="hover" dir="ltr">فایل رزومه</Link></Typography>}
                </Box>
                <Stack sx={{ alignItems: 'flex-end' }} spacing={1} flexShrink={0}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Chip label={t.showOnLanding ? 'لندینگ' : 'مخفی'} color={t.showOnLanding ? 'primary' : 'default'} size="small" sx={{ height: 20, fontSize: 10 }} />
                    <Chip label={`${(t.courses ?? []).length} دوره`} size="small" variant="outlined" sx={{ height: 22, fontSize: 11 }} />
                  </Stack>
                  <RowActions onEdit={() => setEditing(t.id)} onDelete={() => remove(t.id)} />
                </Stack>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
}
