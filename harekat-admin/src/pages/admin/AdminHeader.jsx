import { useState } from 'react';
import { adminApi } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { Card, FormError, RowActions, StatusDot, PageHeader, ListRowSkeleton } from './adminUi.jsx';
import { Box, Stack, Button, TextField, FormControlLabel, Checkbox, Typography, IconButton, Alert, Paper, Divider } from '@mui/material';
import { Add as AddIcon, ArrowUpward as UpIcon, ArrowDownward as DownIcon } from '@mui/icons-material';

const EMPTY = { label: '', link: '', scrollId: '', sortOrder: 0, isActive: true };

function MenuForm({ initial, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e) => {
    e.preventDefault();
    if (!form.label.trim() || !form.link.trim()) { setError('عنوان و لینک الزامی است'); return; }
    setError(null);
    await onSubmit({ ...form, scrollId: form.scrollId || null, sortOrder: Number(form.sortOrder) || 0 }, setError);
  };
  return (
    <Box component="form" onSubmit={submit}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <TextField label="عنوان *" value={form.label} onChange={(e) => set('label', e.target.value)} placeholder="دوره‌ها" />
        <TextField label="لینک *" value={form.link} onChange={(e) => set('link', e.target.value)} dir="ltr" placeholder="/#courses" />
        <TextField label="شناسه اسکرول (اختیاری)" value={form.scrollId ?? ''} onChange={(e) => set('scrollId', e.target.value)} dir="ltr" placeholder="courses" />
        <TextField label="ترتیب" type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} dir="ltr" />
        <FormControlLabel control={<Checkbox checked={!!form.isActive} onChange={(e) => set('isActive', e.target.checked)} />} label="فعال (نمایش در سربرگ)" />
      </Box>
      <Box mt={2}><FormError error={error} /></Box>
      <Stack direction="row" spacing={1} mt={2}>
        <Button type="submit" variant="contained" disabled={saving}>{saving ? '...' : 'ذخیره'}</Button>
        <Button variant="text" onClick={onCancel}>انصراف</Button>
      </Stack>
    </Box>
  );
}

export default function AdminHeader() {
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const menu = useApi(() => adminApi.listMenu());
  const items = [...(menu.data ?? [])].sort((a, b) => (a.sortOrder - b.sortOrder));
  const save = async (payload, setError) => {
    setSaving(true);
    try {
      if (editing === 'new') await adminApi.createMenuItem(payload);
      else await adminApi.updateMenuItem(editing, payload);
      setEditing(null); menu.reload();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };
  const remove = async (id) => { if (!window.confirm('حذف شود؟')) return; await adminApi.deleteMenuItem(id).then(() => menu.reload()).catch(() => {}); };
  const move = async (item, dir) => { await adminApi.updateMenuItem(item.id, { sortOrder: (item.sortOrder ?? 0) + dir }).then(() => menu.reload()).catch(() => {}); };
  return (
    <Stack spacing={3}>
      <PageHeader title="مدیریت سربرگ" subtitle="ترتیب آیتم‌ها با «ترتیب» یا دکمه‌های بالا/پایین تغییر می‌کند. آیتم غیرفعال در سایت نمایش داده نمی‌شود." action={!editing && <Button variant="contained" startIcon={<AddIcon />} onClick={() => setEditing('new')}>آیتم جدید</Button>} />
      {editing && (
        <Card><Typography fontWeight={700} mb={2}>{editing === 'new' ? 'آیتم جدید' : 'ویرایش آیتم'}</Typography><Divider sx={{ mb: 2.5 }} />
          <MenuForm initial={editing === 'new' ? EMPTY : items.find((m) => m.id === editing)} onSubmit={save} onCancel={() => setEditing(null)} saving={saving} />
        </Card>
      )}
      {menu.loading && <ListRowSkeleton count={4} showAvatar={false} circularAvatar={false} />}
      {menu.error && <Alert severity="error">خطا: {menu.error}</Alert>}
      {menu.isEmpty && !editing && <Alert severity="info">آیتمی ثبت نشده است.</Alert>}
      <Stack spacing={1.5}>
        {items.map((m) => (
          <Paper key={m.id} elevation={0} sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2.5, opacity: m.isActive ? 1 : 0.6 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={600} fontSize={14}>{m.label}</Typography>
              <Typography variant="caption" color="text.secondary" dir="ltr" noWrap display="block">{m.link}{m.scrollId ? ` (#${m.scrollId})` : ''} · ترتیب {m.sortOrder}</Typography>
            </Box>
            <Stack direction="row" alignItems="center" spacing={0.5} flexShrink={0}>
              <IconButton size="small" onClick={() => move(m, -1)}><UpIcon fontSize="small" /></IconButton>
              <IconButton size="small" onClick={() => move(m, 1)}><DownIcon fontSize="small" /></IconButton>
              <StatusDot active={m.isActive} />
              <RowActions onEdit={() => setEditing(m.id)} onDelete={() => remove(m.id)} />
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
}
