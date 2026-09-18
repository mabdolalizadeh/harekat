import { useState } from 'react';
import { adminApi } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { Card, FormError, RowActions, StatusDot, PageHeader, ListRowSkeleton } from './adminUi.jsx';
import { Box, Stack, Button, TextField, Select, MenuItem, FormControl, InputLabel, FormControlLabel, Checkbox, Typography, Alert, Paper, Divider } from '@mui/material';
import { Add as AddIcon, LocalOffer as OfferIcon } from '@mui/icons-material';

const EMPTY = { code: '', discountType: 'percent', discountValue: '', isActive: true, expiresAt: '', usageLimit: '', minimumOrderAmount: '' };

function CouponForm({ initial, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) { setError('کد تخفیف الزامی است'); return; }
    const v = Number(form.discountValue);
    if (!Number.isFinite(v) || v <= 0) { setError('مقدار تخفیف باید عدد مثبت باشد'); return; }
    if (form.discountType === 'percent' && v > 100) { setError('درصد تخفیف حداکثر ۱۰۰ است'); return; }
    setError(null);
    await onSubmit({
      code: form.code.trim(), discountType: form.discountType, discountValue: v,
      isActive: !!form.isActive, expiresAt: form.expiresAt || null,
      usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
      minimumOrderAmount: form.minimumOrderAmount === '' ? null : Number(form.minimumOrderAmount),
    }, setError);
  };
  return (
    <Box component="form" onSubmit={submit}>
      <Stack spacing={2}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField label="کد *" value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} dir="ltr" placeholder="HAREKAT10" />
          <FormControl size="small" fullWidth>
            <InputLabel>نوع تخفیف</InputLabel>
            <Select value={form.discountType} label="نوع تخفیف" onChange={(e) => set('discountType', e.target.value)}>
              <MenuItem value="percent">درصدی (٪)</MenuItem>
              <MenuItem value="fixed">مبلغ ثابت (تومان)</MenuItem>
            </Select>
          </FormControl>
          <TextField label="مقدار تخفیف *" value={form.discountValue} onChange={(e) => set('discountValue', e.target.value)} dir="ltr" placeholder="10" />
          <TextField label="تاریخ انقضا" type="date" value={form.expiresAt ? String(form.expiresAt).slice(0, 10) : ''} onChange={(e) => set('expiresAt', e.target.value)} dir="ltr" InputLabelProps={{ shrink: true }} />
          <TextField label="سقف استفاده (خالی = نامحدود)" type="number" value={form.usageLimit} onChange={(e) => set('usageLimit', e.target.value)} dir="ltr" />
          <TextField label="حداقل مبلغ سفارش (تومان)" value={form.minimumOrderAmount} onChange={(e) => set('minimumOrderAmount', e.target.value)} dir="ltr" />
          <FormControlLabel control={<Checkbox checked={!!form.isActive} onChange={(e) => set('isActive', e.target.checked)} />} label="فعال" />
        </Box>
        <FormError error={error} />
        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="contained" disabled={saving}>{saving ? '...' : 'ذخیره'}</Button>
          <Button variant="text" onClick={onCancel}>انصراف</Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default function AdminCoupons() {
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const coupons = useApi(() => adminApi.listCoupons());
  const save = async (payload, setError) => {
    setSaving(true);
    try {
      if (editing === 'new') await adminApi.createCoupon(payload);
      else await adminApi.updateCoupon(editing, payload);
      setEditing(null); coupons.reload();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };
  const remove = async (id) => {
    if (!window.confirm('حذف شود؟')) return;
    try { await adminApi.deleteCoupon(id); coupons.reload(); } catch { /* */ }
  };
  const toggle = async (c) => {
    try { await adminApi.updateCoupon(c.id, { isActive: !c.isActive }); coupons.reload(); } catch { /* */ }
  };
  return (
    <Stack spacing={3}>
      <PageHeader title="کدهای تخفیف" subtitle="مدیریت کدهای تخفیف و اعتبارسنجی سبد خرید" action={!editing && <Button variant="contained" startIcon={<AddIcon />} onClick={() => setEditing('new')}>کد جدید</Button>} />
      {editing && (
        <Card><Typography fontWeight={700} mb={2}>{editing === 'new' ? 'کد جدید' : 'ویرایش کد'}</Typography><Divider sx={{ mb: 2.5 }} />
          <CouponForm initial={editing === 'new' ? EMPTY : {
            code: coupons.data.find((c) => c.id === editing)?.code ?? '',
            discountType: coupons.data.find((c) => c.id === editing)?.discountType ?? 'percent',
            discountValue: coupons.data.find((c) => c.id === editing)?.discountValue ?? '',
            isActive: coupons.data.find((c) => c.id === editing)?.isActive ?? true,
            expiresAt: coupons.data.find((c) => c.id === editing)?.expiresAt ?? '',
            usageLimit: coupons.data.find((c) => c.id === editing)?.usageLimit ?? '',
            minimumOrderAmount: coupons.data.find((c) => c.id === editing)?.minimumOrderAmount ?? '',
          }} onSubmit={save} onCancel={() => setEditing(null)} saving={saving} />
        </Card>
      )}
      {coupons.loading && <ListRowSkeleton count={4} circularAvatar={false} />}
      {coupons.error && <Alert severity="error">خطا: {coupons.error} <Button onClick={coupons.reload} size="small">تلاش مجدد</Button></Alert>}
      {coupons.isEmpty && !editing && <Alert severity="info">کدی ثبت نشده است.</Alert>}
      <Stack spacing={1.5}>
        {(coupons.data ?? []).map((c) => (
          <Paper key={c.id} elevation={0} sx={{ p: 1.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid', borderColor: 'divider', borderRadius: 2.5, gap: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: 'primary.50', color: 'primary.main', border: '1px solid', borderColor: 'divider' }}><OfferIcon fontSize="small" /></Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography fontFamily="monospace" fontWeight={700} fontSize={14} dir="ltr">{c.code}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {c.discountType === 'percent' ? `${c.discountValue}٪` : `${Number(c.discountValue).toLocaleString('en-US')} تومان`}
                  {' · '}استفاده: {c.usageCount}{c.usageLimit ? `/${c.usageLimit}` : ''}
                  {c.expiresAt ? ` · انقضا: ${String(c.expiresAt).slice(0, 10)}` : ''}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1} flexShrink={0}>
              <Box onClick={() => toggle(c)} sx={{ cursor: 'pointer' }}><StatusDot active={c.isActive} /></Box>
              <RowActions onEdit={() => setEditing(c.id)} onDelete={() => remove(c.id)} />
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
}
