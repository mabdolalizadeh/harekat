import { useState } from 'react';
import { adminApi } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { Card, FormError, RowActions, StatusDot, PageHeader, BannerListSkeleton } from './adminUi.jsx';
import ImagePicker from '../../components/ImagePicker.jsx';
import { Add as AddIcon, Image as ImageIcon } from '@mui/icons-material';
import { Alert, Box, Button, Checkbox, Divider, FormControlLabel, Paper, Stack, TextField, Typography } from '@mui/material';

const blank = { imageUrl: '', tabletImageUrl: '', mobileImageUrl: '', linkUrl: '', duration: 3, sortOrder: 0, isActive: true };

function BannerForm({ initial, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState({ ...blank, ...initial });
  const [error, setError] = useState(null);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    if (!form.imageUrl) { setError('تصویر بنر الزامی است'); return; }
    const duration = Number(form.duration);
    if (!Number.isFinite(duration) || duration < 1) { setError('مدت نمایش باید حداقل ۱ ثانیه باشد'); return; }
    setError(null);
    await onSubmit({ ...form, duration: Math.round(duration), sortOrder: Number(form.sortOrder) || 0, linkUrl: form.linkUrl.trim() || null }, setError);
  };
  return <Box component="form" onSubmit={submit}>
    <Stack spacing={2}>
      <Typography variant="caption" color="text.secondary">برای بهترین نمایش در همه دستگاه‌ها، تصویر مناسب هر اندازه را جداگانه بارگذاری کنید. اگر نسخه‌ای انتخاب نشود، تصویر دسکتاپ استفاده می‌شود.</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        <Box><Typography fontWeight={700} fontSize={13} mb={1}>دسکتاپ — نسبت ۱۶:۹ *</Typography><ImagePicker value={form.imageUrl} onChange={(value) => set('imageUrl', value)} alt="پیش‌نمایش بنر دسکتاپ" /></Box>
        <Box><Typography fontWeight={700} fontSize={13} mb={1}>تبلت — نسبت ۴:۳</Typography><ImagePicker value={form.tabletImageUrl} onChange={(value) => set('tabletImageUrl', value)} alt="پیش‌نمایش بنر تبلت" /></Box>
        <Box><Typography fontWeight={700} fontSize={13} mb={1}>موبایل — نسبت ۴:۵</Typography><ImagePicker value={form.mobileImageUrl} onChange={(value) => set('mobileImageUrl', value)} alt="پیش‌نمایش بنر موبایل" /></Box>
      </Box>
      <TextField label="لینک مقصد (اختیاری)" value={form.linkUrl ?? ''} onChange={(e) => set('linkUrl', e.target.value)} dir="ltr" placeholder="https://example.com یا /products" />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <TextField label="مدت نمایش (ثانیه)" type="number" inputProps={{ min: 1, step: 1 }} value={form.duration} onChange={(e) => set('duration', e.target.value)} dir="ltr" helperText="پیش‌فرض: ۳ ثانیه" />
        <TextField label="ترتیب نمایش" type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} dir="ltr" />
      </Box>
      <FormControlLabel control={<Checkbox checked={!!form.isActive} onChange={(e) => set('isActive', e.target.checked)} />} label="فعال (نمایش در صفحه اصلی)" />
      <FormError error={error} />
      <Stack direction="row" spacing={1}><Button type="submit" variant="contained" disabled={saving}>{saving ? 'در حال ذخیره...' : 'ذخیره بنر'}</Button><Button type="button" onClick={onCancel}>انصراف</Button></Stack>
    </Stack>
  </Box>;
}

export default function AdminBanners() {
  const banners = useApi(() => adminApi.listBanners());
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const items = [...(banners.data ?? [])].sort((a, b) => (a.sortOrder - b.sortOrder) || a.id.localeCompare(b.id));
  const save = async (payload, setError) => {
    setSaving(true);
    try { editing === 'new' ? await adminApi.createBanner(payload) : await adminApi.updateBanner(editing.id, payload); setEditing(null); setNotice('بنر ذخیره شد'); banners.reload(); }
    catch (error) { setError(error.message); } finally { setSaving(false); }
  };
  const remove = async (banner) => { if (!window.confirm('این بنر حذف شود؟')) return; await adminApi.deleteBanner(banner.id).then(() => banners.reload()).catch((error) => setNotice(error.message)); };
  return <Stack spacing={3}>
    <PageHeader title="بنرهای صفحه اصلی" subtitle="بنر تصویر، لینک مقصد و مدت نمایش اسلایدها را مدیریت کنید." action={!editing && <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing('new'); setNotice(null); }}>بنر جدید</Button>} />
    {notice && <Alert severity="success" onClose={() => setNotice(null)}>{notice}</Alert>}
    {editing && <Card><Typography fontWeight={700} mb={2}>{editing === 'new' ? 'بنر جدید' : 'ویرایش بنر'}</Typography><Divider sx={{ mb: 2.5 }} /><BannerForm initial={editing === 'new' ? { ...blank, sortOrder: items.length } : editing} onSubmit={save} onCancel={() => setEditing(null)} saving={saving} /></Card>}
    {banners.loading && <BannerListSkeleton count={3} />}
    {banners.error && <Alert severity="error">خطا: {banners.error} <Button onClick={banners.reload} size="small">تلاش مجدد</Button></Alert>}
    {banners.isEmpty && !editing && <Alert severity="info">هنوز بنری ثبت نشده است.</Alert>}
    <Stack spacing={1.5}>{items.map((banner) => <Paper key={banner.id} elevation={0} sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2.5, opacity: banner.isActive ? 1 : 0.6 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
        {banner.imageUrl ? <Box component="img" src={banner.imageUrl} alt="بنر" sx={{ width: 110, height: 58, borderRadius: 1.5, objectFit: 'contain', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }} /> : <Box sx={{ width: 110, height: 58, display: 'grid', placeItems: 'center', bgcolor: 'action.hover' }}><ImageIcon color="disabled" /></Box>}
        <Box sx={{ minWidth: 0 }}><Typography fontSize={13} noWrap dir="ltr">{banner.linkUrl || 'بدون لینک'}</Typography><Typography variant="caption" color="text.secondary">{banner.duration} ثانیه · ترتیب {banner.sortOrder}</Typography></Box>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center"><StatusDot active={banner.isActive} /><RowActions onEdit={() => setEditing(banner)} onDelete={() => remove(banner)} /></Stack>
    </Paper>)}</Stack>
  </Stack>;
}
