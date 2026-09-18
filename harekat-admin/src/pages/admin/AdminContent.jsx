import { useState } from 'react';
import { adminApi } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { Card, Field, FormError, RowActions, StatusDot, PageHeader, ListRowSkeleton } from './adminUi.jsx';
import { Box, Stack, Button, TextField, FormControlLabel, Checkbox, Typography, Alert, Paper, Divider } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import ImagePicker from '../../components/ImagePicker.jsx';

const EMPTY = { key: '', title: '', body: '', imageUrl: '', linkUrl: '', linkText: '', sortOrder: 0, isActive: true };

function ContentForm({ initial, lockKey, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e) => {
    e.preventDefault();
    if (!form.key.trim()) { setError('کلید الزامی است'); return; }
    setError(null);
    const payload = Object.fromEntries(Object.entries({ ...form, sortOrder: Number(form.sortOrder) || 0 }).map(([k, v]) => [k, v === '' ? null : v]));
    payload.key = form.key.trim();
    await onSubmit(payload, setError);
  };
  return (
    <Box component="form" onSubmit={submit}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <TextField label="کلید * (لاتین، یکتا)" value={form.key} disabled={lockKey} onChange={(e) => set('key', e.target.value)} dir="ltr" placeholder="hero-title" />
        <TextField label="عنوان" value={form.title ?? ''} onChange={(e) => set('title', e.target.value)} />
        <Box sx={{ gridColumn: { sm: '1 / -1' } }}><TextField label="متن" multiline rows={3} value={form.body ?? ''} onChange={(e) => set('body', e.target.value)} /></Box>
        <Box><Field label="تصویر"><ImagePicker value={form.imageUrl} onChange={(v) => set('imageUrl', v)} /></Field></Box>
        <TextField label="آدرس لینک" value={form.linkUrl ?? ''} onChange={(e) => set('linkUrl', e.target.value)} dir="ltr" />
        <TextField label="متن لینک" value={form.linkText ?? ''} onChange={(e) => set('linkText', e.target.value)} />
        <TextField label="ترتیب" type="number" value={form.sortOrder ?? 0} onChange={(e) => set('sortOrder', e.target.value)} dir="ltr" />
        <FormControlLabel control={<Checkbox checked={!!form.isActive} onChange={(e) => set('isActive', e.target.checked)} />} label="فعال (نمایش در سایت)" />
      </Box>
      <Box mt={2}><FormError error={error} /></Box>
      <Stack direction="row" spacing={1} mt={2}>
        <Button type="submit" variant="contained" disabled={saving}>{saving ? '...' : 'ذخیره'}</Button>
        <Button variant="text" onClick={onCancel}>انصراف</Button>
      </Stack>
    </Box>
  );
}

export default function AdminContent() {
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const content = useApi(() => adminApi.listContent());
  const save = async (payload, setError) => {
    setSaving(true);
    try { await adminApi.upsertContent(payload); setEditing(null); content.reload(); } catch (e) { setError(e.message); } finally { setSaving(false); }
  };
  const remove = async (key) => { if (!window.confirm(`بلوک «${key}» حذف شود؟`)) return; await adminApi.deleteContent(key).then(() => content.reload()).catch(() => {}); };
  const blocks = [...(content.data ?? [])].sort((a, b) => (a.sortOrder - b.sortOrder));
  return (
    <Stack spacing={3}>
      <PageHeader title="محتوای سایت" subtitle="هر بلوک با یک کلید یکتا (مثل hero-title) در سایت خوانده می‌شود. ویرایش بلافاصله اعمال می‌شود." action={!editing && <Button variant="contained" startIcon={<AddIcon />} onClick={() => setEditing('new')}>بلوک جدید</Button>} />
      {editing && (
        <Card><Typography fontWeight={700} mb={2}>{editing === 'new' ? 'بلوک جدید' : `ویرایش ${editing}`}</Typography><Divider sx={{ mb: 2.5 }} />
          <ContentForm initial={editing === 'new' ? EMPTY : blocks.find((b) => b.key === editing)} lockKey={editing !== 'new'} onSubmit={save} onCancel={() => setEditing(null)} saving={saving} />
        </Card>
      )}
      {content.loading && <ListRowSkeleton count={4} showAvatar={false} circularAvatar={false} />}
      {content.error && <Alert severity="error">خطا: {content.error} <Button onClick={content.reload} size="small">تلاش مجدد</Button></Alert>}
      {content.isEmpty && !editing && <Alert severity="info">بلوکی ثبت نشده است.</Alert>}
      <Stack spacing={1.5}>
        {blocks.map((b) => (
          <Paper key={b.key} elevation={0} sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2.5, opacity: b.isActive ? 1 : 0.6 }}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography fontSize={13}><Box component="code" sx={{ fontFamily: 'monospace', fontWeight: 700, bgcolor: 'action.hover', px: 0.75, py: 0.25, borderRadius: 1, fontSize: 12 }} dir="ltr">{b.key}</Box>{b.title && <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>— {b.title}</Box>}</Typography>
              {b.body && <Typography variant="caption" color="text.secondary" noWrap display="block" mt={0.5}>{b.body}</Typography>}
            </Box>
            <Stack direction="row" alignItems="center" spacing={1} flexShrink={0}>
              <StatusDot active={b.isActive} />
              <RowActions onEdit={() => setEditing(b.key)} onDelete={() => remove(b.key)} />
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
}
