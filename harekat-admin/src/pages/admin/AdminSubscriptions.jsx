import { useState } from 'react';
import { adminApi } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { formatToman } from '../../utils/format.js';
import { Card, Field, FormError, RowActions, StatusDot, PageHeader } from './adminUi.jsx';
import { Box, Stack, Button, TextField, FormControlLabel, Checkbox, Typography, Grid, Alert, Skeleton, Paper, Divider } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import ImagePicker from '../../components/ImagePicker.jsx';

const EMPTY_SUBSCRIPTION = { name: '', price: '', salePrice: '', image: '', buttonLink: '', buttonText: '', description: '', isActive: true, sortOrder: 0 };

function SubscriptionForm({ initial, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
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
    const payload = { ...form, salePrice: form.salePrice === '' ? null : form.salePrice, sortOrder: Number(form.sortOrder) || 0 };
    await onSubmit(payload, setError);
  };
  return (
    <Box component="form" onSubmit={submit}>
      <Stack spacing={2.5}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}><TextField label="نام اشتراک *" value={form.name} onChange={(e) => set('name', e.target.value)} /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><TextField label="قیمت اصلی *" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="99000" dir="ltr" /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><TextField label="قیمت فروش (خالی = بدون تخفیف)" value={form.salePrice ?? ''} onChange={(e) => set('salePrice', e.target.value)} placeholder="79000" dir="ltr" /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><Field label="تصویر — عمودی/پورتره"><ImagePicker value={form.image} onChange={(v) => set('image', v)} /></Field></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><TextField label="لینک دکمه (اختیاری)" value={form.buttonLink ?? ''} onChange={(e) => set('buttonLink', e.target.value)} dir="ltr" placeholder="https://..." /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><TextField label="متن دکمه (اختیاری)" value={form.buttonText ?? ''} onChange={(e) => set('buttonText', e.target.value)} placeholder="مشاهده جزئیات" /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><TextField label="ترتیب نمایش" type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} dir="ltr" /></Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'center' }}><FormControlLabel control={<Checkbox checked={!!form.isActive} onChange={(e) => set('isActive', e.target.checked)} />} label="فعال" /></Grid>
        </Grid>
        <TextField label="توضیحات" multiline rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
        <FormError error={error} />
        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="contained" disabled={saving}>{saving ? 'در حال ذخیره...' : 'ذخیره'}</Button>
          <Button variant="text" onClick={onCancel}>انصراف</Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default function AdminSubscriptions() {
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const subscriptions = useApi(() => adminApi.listSubscriptions());
  const saveSubscription = async (payload, setError) => {
    setSaving(true);
    try {
      if (editing === 'new') await adminApi.createSubscription(payload);
      else await adminApi.updateSubscription(editing, payload);
      setEditing(null); setNotice('اشتراک ذخیره شد'); subscriptions.reload();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };
  const deleteSubscription = async (id) => {
    if (!window.confirm('حذف شود؟')) return;
    try { await adminApi.deleteSubscription(id); subscriptions.reload(); } catch (e) { setNotice(`خطا: ${e.message}`); }
  };
  const toForm = (s) => ({ name: s.name ?? '', price: s.price ?? '', salePrice: s.salePrice ?? '', image: s.image ?? '', buttonLink: s.buttonLink ?? '', buttonText: s.buttonText ?? '', description: s.description ?? '', isActive: s.isActive ?? true, sortOrder: s.sortOrder ?? 0 });
  return (
    <Stack spacing={3}>
      <PageHeader title="اشتراک‌ها" subtitle="مدیریت پلن‌های اشتراک و قیمت‌گذاری" action={!editing && <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing('new'); setNotice(null); }}>اشتراک جدید</Button>} />
      {notice && <Alert severity="success" onClose={() => setNotice(null)}>{notice}</Alert>}
      {editing && (
        <Card><Typography fontWeight={700} mb={2}>{editing === 'new' ? 'اشتراک جدید' : 'ویرایش اشتراک'}</Typography><Divider sx={{ mb: 2.5 }} />
          <SubscriptionForm initial={editing === 'new' ? EMPTY_SUBSCRIPTION : toForm(subscriptions.data.find((s) => s.id === editing))} onSubmit={saveSubscription} onCancel={() => setEditing(null)} saving={saving} />
        </Card>
      )}
      {subscriptions.loading && <Skeleton variant="rounded" height={80} />}
      {subscriptions.error && <Alert severity="error">خطا: {subscriptions.error} <Button onClick={subscriptions.reload} size="small">تلاش مجدد</Button></Alert>}
      {subscriptions.isEmpty && !editing && <Alert severity="info">اشتراکی ثبت نشده است.</Alert>}
      <Grid container spacing={1.5}>
        {(subscriptions.data ?? []).map((s) => (
          <Grid key={s.id} size={12}>
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
              {s.image && (
                <Box
                  component="img"
                  src={s.image}
                  alt={s.name}
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
                <Typography fontWeight={700} fontSize={14} noWrap sx={{ lineHeight: 1.35 }}>
                  {s.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ fontSize: 12 }}>
                  {formatToman(s.salePrice ?? s.price)}
                  {s.salePrice && Number(s.salePrice) < Number(s.price) && (
                    <Box component="span" sx={{ textDecoration: 'line-through', mr: 1 }}>
                      {formatToman(s.price)}
                    </Box>
                  )}
                </Typography>
              </Box>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                flexShrink={0}
                sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}
              >
                <StatusDot active={s.isActive} />
                <RowActions onEdit={() => setEditing(s.id)} onDelete={() => deleteSubscription(s.id)} />
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
