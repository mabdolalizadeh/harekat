import { useState } from 'react';
import { adminApi } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { formatToman } from '../../utils/format.js';
import { Card, Field, FormError, RowActions, StatusDot, PageHeader, ListRowSkeleton } from './adminUi.jsx';
import {
  Box, Stack, Button, TextField, FormControlLabel, Checkbox, Typography, Grid, Alert,
  Paper, Divider, Chip, FormControl, InputLabel, Select, MenuItem, OutlinedInput, ListItemText
} from '@mui/material';
import { Add as AddIcon, WorkspacePremium as BadgeIcon } from '@mui/icons-material';
import ImagePicker from '../../components/ImagePicker.jsx';

const EMPTY_SUBSCRIPTION = {
  name: '',
  price: '',
  salePrice: '',
  image: '',
  buttonLink: '',
  buttonText: '',
  description: '',
  durationMonths: 1,
  badgeLabel: '',
  badgeIconSvg: '',
  includedCourseIds: [],
  isActive: true,
  sortOrder: 0
};

function SubscriptionForm({ initial, courses, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price.toString().trim()) {
      setError('نام و قیمت اصلی الزامی است');
      return;
    }
    if (form.salePrice !== '' && form.salePrice !== null) {
      const p = Number(String(form.price).replace(/[,٬]/g, ''));
      const s = Number(String(form.salePrice).replace(/[,٬]/g, ''));
      if (!Number.isFinite(s) || s < 0) {
        setError('قیمت فروش معتبر نیست');
        return;
      }
      if (Number.isFinite(p) && s > p) {
        setError('قیمت فروش نباید از قیمت اصلی بیشتر باشد');
        return;
      }
    }
    setError(null);
    const payload = {
      ...form,
      durationMonths: Number(form.durationMonths) || 1,
      salePrice: form.salePrice === '' ? null : form.salePrice,
      sortOrder: Number(form.sortOrder) || 0
    };
    await onSubmit(payload, setError);
  };

  return (
    <Box component="form" onSubmit={submit}>
      <Stack spacing={2.5}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="نام اشتراک *"
              value={form.name}
              onChange={(e) => {
                set('name', e.target.value);
                if (!form.badgeLabel) set('badgeLabel', e.target.value);
              }}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="قیمت اصلی *"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              placeholder="99000"
              dir="ltr"
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="قیمت فروش (خالی = بدون تخفیف)"
              value={form.salePrice ?? ''}
              onChange={(e) => set('salePrice', e.target.value)}
              placeholder="79000"
              dir="ltr"
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="مدت زمان (ماه) *"
              type="number"
              value={form.durationMonths}
              onChange={(e) => set('durationMonths', e.target.value)}
              dir="ltr"
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Field label="تصویر — عمودی/پورتره">
              <ImagePicker value={form.image} onChange={(v) => set('image', v)} />
            </Field>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="لینک دکمه (اختیاری)"
              value={form.buttonLink ?? ''}
              onChange={(e) => set('buttonLink', e.target.value)}
              dir="ltr"
              placeholder="https://..."
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="متن دکمه (اختیاری)"
              value={form.buttonText ?? ''}
              onChange={(e) => set('buttonText', e.target.value)}
              placeholder="مشاهده جزئیات"
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="ترتیب نمایش"
              type="number"
              value={form.sortOrder}
              onChange={(e) => set('sortOrder', e.target.value)}
              dir="ltr"
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={<Checkbox checked={!!form.isActive} onChange={(e) => set('isActive', e.target.checked)} />}
              label="پلن اشتراک فعال باشد"
            />
          </Grid>

          {/* Included Courses Multi-select */}
          <Grid size={12}>
            <FormControl fullWidth size="small">
              <InputLabel>دوره‌های شامل این اشتراک</InputLabel>
              <Select
                multiple
                value={form.includedCourseIds || []}
                onChange={(e) => set('includedCourseIds', e.target.value)}
                input={<OutlinedInput label="دوره‌های شامل این اشتراک" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((cId) => {
                      const course = (courses || []).find((c) => c.id === cId);
                      return <Chip key={cId} size="small" label={course?.name || cId} />;
                    })}
                  </Box>
                )}
              >
                {(courses || []).map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    <Checkbox checked={(form.includedCourseIds || []).includes(c.id)} />
                    <ListItemText primary={c.name} secondary={c.level ? `سطح: ${c.level}` : ''} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              پس از خرید این اشتراک توسط دانشجو، دسترسی به تمامی دوره‌های انتخاب‌شده به صورت خودکار فعال خواهد شد.
            </Typography>
          </Grid>
        </Grid>

        <Divider />

        {/* Dynamic Badge Configuration */}
        <Typography fontWeight={700} fontSize={15}>
          تنظیمات نشان (Badge) داینامیک اشتراک برای حساب کاربری دانشجو
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="عنوان نشان (Badge Label) *"
              value={form.badgeLabel}
              onChange={(e) => set('badgeLabel', e.target.value)}
              placeholder="مثلاً: جهش، بمب، طلایی، حرفه‌ای..."
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {/* Live Badge Preview */}
            <Box sx={{ p: 1.5, border: '1px dashed', borderColor: 'primary.main', borderRadius: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="caption" sx={{ display: 'block', mb: 1, opacity: 0.9 }}>
                پیش‌نمایش نشان در پنل کاربری:
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" display="inline-flex" sx={{ bgcolor: 'rgba(255,255,255,0.2)', px: 1.5, py: 0.5, borderRadius: 999 }}>
                {form.badgeIconSvg ? (
                  <Box
                    sx={{ width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', '& svg': { width: 18, height: 18, fill: 'currentColor' } }}
                    dangerouslySetInnerHTML={{ __html: form.badgeIconSvg }}
                  />
                ) : (
                  <BadgeIcon sx={{ fontSize: 18 }} />
                )}
                <Typography fontWeight={700} fontSize={13}>
                  {form.badgeLabel || form.name || 'عنوان نشان'}
                </Typography>
              </Stack>
            </Box>
          </Grid>
          <Grid size={12}>
            <TextField
              label="کد آیکون نشان به صورت SVG (Subscription Icon SVG)"
              multiline
              rows={4}
              value={form.badgeIconSvg}
              onChange={(e) => set('badgeIconSvg', e.target.value)}
              placeholder="<svg viewBox='0 0 24 24' ...><path .../></svg>"
              dir="ltr"
              fullWidth
              helperText="کد SVG وارد شده در سرور از نظر امنیت و XSS پاکسازی (Sanitize) شده و در حساب دانشجو نمایش می‌یابد."
            />
          </Grid>
        </Grid>

        <TextField
          label="توضیحات پلن"
          multiline
          rows={3}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />

        <FormError error={error} />
        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'در حال ذخیره...' : 'ذخیره اشتراک'}
          </Button>
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
  const courses = useApi(() => adminApi.listCourses());

  const saveSubscription = async (payload, setError) => {
    setSaving(true);
    try {
      if (editing === 'new') await adminApi.createSubscription(payload);
      else await adminApi.updateSubscription(editing, payload);
      setEditing(null);
      setNotice('اشتراک با موفقیت ذخیره شد');
      subscriptions.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteSubscription = async (id) => {
    if (!window.confirm('آیا از حذف این اشتراک اطمینان دارید؟')) return;
    try {
      await adminApi.deleteSubscription(id);
      subscriptions.reload();
      setNotice('اشتراک با موفقیت حذف شد');
    } catch (e) {
      setNotice(`خطا: ${e.message}`);
    }
  };

  const toForm = (s) => ({
    name: s.name ?? '',
    price: s.price ?? '',
    salePrice: s.salePrice ?? '',
    image: s.image ?? '',
    buttonLink: s.buttonLink ?? '',
    buttonText: s.buttonText ?? '',
    description: s.description ?? '',
    durationMonths: s.durationMonths ?? 1,
    badgeLabel: s.badgeLabel ?? s.name ?? '',
    badgeIconSvg: s.badgeIconSvg ?? '',
    includedCourseIds: (s.subscriptionIncludedCourses || []).map((c) => c.id),
    isActive: s.isActive ?? true,
    sortOrder: s.sortOrder ?? 0
  });

  return (
    <Stack spacing={3}>
      <PageHeader
        title="اشتراک‌ها و پلن‌ها"
        subtitle="مدیریت پلن‌های اشتراک، دوره‌های تحت پوشش و نشان (Badge) داینامیک"
        action={!editing && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditing('new');
              setNotice(null);
            }}
          >
            اشتراک جدید
          </Button>
        )}
      />

      {notice && <Alert severity="success" onClose={() => setNotice(null)}>{notice}</Alert>}

      {editing && (
        <Card>
          <Typography fontWeight={700} mb={2}>
            {editing === 'new' ? 'اشتراک جدید' : 'ویرایش اشتراک'}
          </Typography>
          <Divider sx={{ mb: 2.5 }} />
          <SubscriptionForm
            initial={editing === 'new' ? EMPTY_SUBSCRIPTION : toForm(subscriptions.data.find((s) => s.id === editing))}
            courses={courses.data || []}
            onSubmit={saveSubscription}
            onCancel={() => setEditing(null)}
            saving={saving}
          />
        </Card>
      )}

      {subscriptions.loading && <ListRowSkeleton count={4} circularAvatar={true} />}
      {subscriptions.error && (
        <Alert severity="error">
          خطا: {subscriptions.error} <Button onClick={subscriptions.reload} size="small">تلاش مجدد</Button>
        </Alert>
      )}
      {subscriptions.isEmpty && !editing && <Alert severity="info">اشتراکی ثبت نشده است.</Alert>}

      <Grid container spacing={1.5}>
        {(subscriptions.data ?? []).map((s) => (
          <Grid key={s.id} size={12}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                flexWrap: { xs: 'wrap', sm: 'nowrap' }
              }}
            >
              {s.image && (
                <Box
                  component="img"
                  src={s.image}
                  alt={s.name}
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    objectFit: 'cover',
                    flexShrink: 0
                  }}
                />
              )}
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                  <Typography fontWeight={700} fontSize={15} noWrap>
                    {s.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={`${s.durationMonths || 1} ماهه`}
                    variant="outlined"
                    sx={{ height: 20, fontSize: 11 }}
                  />
                  {s.badgeLabel && (
                    <Chip
                      size="small"
                      color="primary"
                      label={s.badgeLabel}
                      sx={{ height: 20, fontSize: 11, fontWeight: 700 }}
                    />
                  )}
                </Stack>
                <Typography variant="caption" color="text.secondary" noWrap display="block">
                  {formatToman(s.salePrice ?? s.price)}
                  {s.salePrice && Number(s.salePrice) < Number(s.price) && (
                    <Box component="span" sx={{ textDecoration: 'line-through', mr: 1 }}>
                      {formatToman(s.price)}
                    </Box>
                  )}
                  {' | '}
                  دوره‌های پوشش داده شده: {(s.subscriptionIncludedCourses || []).length} دوره
                </Typography>
              </Box>

              <Stack direction="row" alignItems="center" spacing={1} flexShrink={0}>
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
