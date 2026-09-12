import { useState } from 'react';
import { adminApi } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { Card, FormError, RowActions, StatusDot, PageHeader } from './adminUi.jsx';
import { Box, Stack, Button, TextField, FormControlLabel, Checkbox, Typography, IconButton, Alert, Skeleton, Paper, Divider } from '@mui/material';
import { Add as AddIcon, ArrowUpward as UpIcon, ArrowDownward as DownIcon, Image as ImageIcon } from '@mui/icons-material';

function SlideForm({ initial, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e) => {
    e.preventDefault();
    if (!form.imageUrl.trim()) { setError('آدرس تصویر اسلاید الزامی است'); return; }
    setError(null);
    await onSubmit({ ...form, title: form.title.trim() || null, sortOrder: Number(form.sortOrder) || 0 }, setError);
  };
  return (
    <Box component="form" onSubmit={submit}>
      <Stack spacing={2}>
        <TextField label="آدرس تصویر *" dir="ltr" value={form.imageUrl} onChange={(e) => set('imageUrl', e.target.value)} placeholder="https://images.unsplash.com/..." />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField label="عنوان (اختیاری — متن جایگزین)" value={form.title ?? ''} onChange={(e) => set('title', e.target.value)} placeholder="کارگاه خلاقیت" />
          <TextField label="ترتیب" type="number" dir="ltr" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} />
        </Box>
        <FormControlLabel control={<Checkbox checked={!!form.isActive} onChange={(e) => set('isActive', e.target.checked)} />} label="فعال (نمایش در نوار متحرک)" />
        <FormError error={error} />
        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="contained" disabled={saving}>{saving ? 'در حال ذخیره...' : 'ذخیره'}</Button>
          <Button variant="text" onClick={onCancel}>انصراف</Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function nextSlideKey(slides) {
  let max = 0;
  for (const s of slides ?? []) {
    const n = Number((s.key ?? '').replace(/^marquee-/, ''));
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `marquee-${max + 1}`;
}

export default function AdminMarquee() {
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const slides = useApi(() => adminApi.listMarqueeSlides());
  const items = [...(slides.data ?? [])].sort((a, b) => (a.sortOrder - b.sortOrder) || a.key.localeCompare(b.key));
  const save = async (payload, setError) => {
    setSaving(true);
    try {
      if (editing === 'new') {
        const key = nextSlideKey(items);
        await adminApi.upsertContent({ ...payload, key });
      } else {
        await adminApi.upsertContent({ ...payload, key: editing });
      }
      setEditing(null); setNotice('اسلاید ذخیره شد'); slides.reload();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };
  const remove = async (key) => { if (!window.confirm(`اسلاید «${key}» حذف شود؟`)) return; await adminApi.deleteContent(key).then(() => slides.reload()).catch(() => {}); };
  const move = async (item, dir) => { await adminApi.upsertContent({ key: item.key, sortOrder: (item.sortOrder ?? 0) + dir }).then(() => slides.reload()).catch(() => {}); };
  return (
    <Stack spacing={3}>
      <PageHeader title="نوار متحرک (مارکی)" subtitle="تصاویر در نوار متحرک بالای سایت نمایش داده می‌شوند." action={!editing && <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing('new'); setNotice(null); }}>اسلاید جدید</Button>} />
      {notice && <Alert severity="success" onClose={() => setNotice(null)}>{notice}</Alert>}
      {editing && (
        <Card><Typography fontWeight={700} mb={2}>{editing === 'new' ? 'اسلاید جدید' : `ویرایش ${editing}`}</Typography><Divider sx={{ mb: 2.5 }} />
          <SlideForm initial={editing === 'new' ? { imageUrl: '', title: '', sortOrder: items.length + 1, isActive: true } : items.find((s) => s.key === editing)} onSubmit={save} onCancel={() => setEditing(null)} saving={saving} />
        </Card>
      )}
      {slides.loading && <Skeleton variant="rounded" height={80} />}
      {slides.error && <Alert severity="error">خطا: {slides.error} <Button onClick={slides.reload} size="small">تلاش مجدد</Button></Alert>}
      {slides.isEmpty && !editing && <Alert severity="info">اسلایدی ثبت نشده است.</Alert>}
      <Stack spacing={1.5}>
        {items.map((s) => (
          <Paper key={s.key} elevation={0} sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2.5, opacity: s.isActive ? 1 : 0.6 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
              {s.imageUrl ? <Box component="img" src={s.imageUrl} alt={s.title ?? s.key} sx={{ width: 64, height: 48, borderRadius: 1.5, objectFit: 'cover', border: '1px solid', borderColor: 'divider', flexShrink: 0 }} /> : <Box sx={{ width: 64, height: 48, borderRadius: 1.5, bgcolor: 'action.hover', display: 'grid', placeItems: 'center', flexShrink: 0 }}><ImageIcon color="disabled" /></Box>}
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={500} fontSize={14} noWrap>{s.title || '(بدون عنوان)'}</Typography>
                <Typography variant="caption" color="text.secondary" dir="ltr" noWrap display="block">{s.key} · ترتیب {s.sortOrder}</Typography>
              </Box>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5} flexShrink={0}>
              <IconButton size="small" onClick={() => move(s, -1)}><UpIcon fontSize="small" /></IconButton>
              <IconButton size="small" onClick={() => move(s, 1)}><DownIcon fontSize="small" /></IconButton>
              <StatusDot active={s.isActive} />
              <RowActions onEdit={() => setEditing(s.key)} onDelete={() => remove(s.key)} />
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
}
