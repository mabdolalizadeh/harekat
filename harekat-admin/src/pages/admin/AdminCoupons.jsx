import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Stack,
  Button,
  TextField,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  CircularProgress,
  Autocomplete,
  RadioGroup,
  Radio,
  FormLabel,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  LocalOffer as CouponIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Public as PublicIcon,
} from '@mui/icons-material';
import { adminApi } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { formatToman } from '../../utils/format.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import StatusChip from '../../components/admin/StatusChip.jsx';

const EMPTY_COUPON = {
  code: '',
  discountType: 'percent',
  discountValue: '',
  targetType: 'all',
  targetCourseId: '',
  targetUserIds: [],
  isActive: true,
  expiresAt: '',
  usageLimit: '',
  minimumOrderAmount: '',
};

function parseUserIds(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function CouponModal({ open, initial, onClose, onSaved }) {
  const { showSuccess, showError } = useNotification();
  const [form, setForm] = useState(() => {
    if (initial) {
      return {
        ...initial,
        targetType: initial.targetType || 'all',
        targetCourseId: initial.targetCourseId || '',
        targetUserIds: parseUserIds(initial.targetUserIds),
      };
    }
    return EMPTY_COUPON;
  });

  const [saving, setSaving] = useState(false);
  const [coursesList, setCoursesList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingLookups(true);
    Promise.all([
      adminApi.listCourses().catch(() => ({ data: [] })),
      adminApi.listStudents().catch(() => ({ data: [] })),
    ])
      .then(([coursesRes, studentsRes]) => {
        if (!cancelled) {
          setCoursesList(coursesRes?.data || []);
          setStudentsList(studentsRes?.data || []);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingLookups(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) return showError('کد تخفیف الزامی است');

    const v = Number(form.discountValue);
    if (!Number.isFinite(v) || v <= 0) return showError('مقدار تخفیف باید عددی مثبت باشد');
    if (form.discountType === 'percent' && v > 100) return showError('درصد تخفیف حداکثر ۱۰۰ درصد است');

    if (form.targetType === 'course' && !form.targetCourseId) {
      return showError('لطفاً دوره آموزشی هدف را انتخاب نمایید');
    }

    if (form.targetType === 'users' && (!form.targetUserIds || form.targetUserIds.length === 0)) {
      return showError('لطفاً حداقل یک کاربر را انتخاب نمایید');
    }

    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: v,
        targetType: form.targetType,
        targetCourseId: form.targetType === 'course' ? form.targetCourseId : null,
        targetUserIds: form.targetType === 'users' ? form.targetUserIds : null,
        isActive: !!form.isActive,
        expiresAt: form.expiresAt || null,
        usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
        minimumOrderAmount: form.minimumOrderAmount === '' ? null : Number(form.minimumOrderAmount),
      };

      if (initial?.id) {
        await adminApi.updateCoupon(initial.id, payload);
        showSuccess('کد تخفیف با موفقیت ویرایش شد');
      } else {
        await adminApi.createCoupon(payload);
        showSuccess('کد تخفیف جدید با موفقیت ایجاد شد');
      }
      onSaved();
      onClose();
    } catch (err) {
      showError(err.message || 'خطا در ذخیره کد تخفیف');
    } finally {
      setSaving(false);
    }
  };

  const selectedStudents = useMemo(() => {
    const ids = new Set(form.targetUserIds || []);
    return studentsList.filter((s) => ids.has(s.id));
  }, [form.targetUserIds, studentsList]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth dir="rtl">
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          {initial?.id ? 'ویرایش کد تخفیف' : 'تعریف کد تخفیف جدید'}
        </Typography>
      </DialogTitle>

      <Box component="form" id="coupon-form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={2.5}>
            {/* Code */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="کد تخفیف *"
                value={form.code}
                onChange={(e) => set('code', e.target.value.toUpperCase())}
                dir="ltr"
                placeholder="NOROOZ1404"
                helperText="حروف بزرگ انگلیسی و اعداد"
              />
            </Grid>

            {/* Discount Type */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>نوع محاسبه تخفیف</InputLabel>
                <Select
                  value={form.discountType}
                  label="نوع محاسبه تخفیف"
                  onChange={(e) => set('discountType', e.target.value)}
                >
                  <MenuItem value="percent">درصدی (٪)</MenuItem>
                  <MenuItem value="fixed">مبلغ ثابت (تومان)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Discount Value */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="مقدار تخفیف *"
                type="number"
                value={form.discountValue}
                onChange={(e) => set('discountValue', e.target.value)}
                dir="ltr"
                placeholder={form.discountType === 'percent' ? 'مثال: 20' : 'مثال: 100000'}
                helperText={form.discountType === 'percent' ? 'درصد (بین ۱ تا ۱۰۰)' : 'مبلغ به تومان'}
              />
            </Grid>

            {/* Expires At */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="تاریخ انقضا"
                type="date"
                value={form.expiresAt ? String(form.expiresAt).slice(0, 10) : ''}
                onChange={(e) => set('expiresAt', e.target.value)}
                dir="ltr"
                slotProps={{ inputLabel: { shrink: true } }}
                helperText="خالی = بدون انقضا"
              />
            </Grid>

            {/* Target Audience Section */}
            <Grid size={12}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend" sx={{ fontWeight: 700, fontSize: '0.88rem', mb: 1, color: 'text.primary' }}>
                    جامعه هدف و دسترسی کد تخفیف
                  </FormLabel>
                  <RadioGroup
                    row
                    value={form.targetType}
                    onChange={(e) => set('targetType', e.target.value)}
                    sx={{ gap: 2, mb: 1.5 }}
                  >
                    <FormControlLabel
                      value="all"
                      control={<Radio size="small" />}
                      label={
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <PublicIcon fontSize="small" color="primary" />
                          <Typography fontSize="0.84rem" fontWeight={600}>همه کاربران (عمومی)</Typography>
                        </Stack>
                      }
                    />
                    <FormControlLabel
                      value="course"
                      control={<Radio size="small" />}
                      label={
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <SchoolIcon fontSize="small" color="info" />
                          <Typography fontSize="0.84rem" fontWeight={600}>دانشجویان یک دوره خاص</Typography>
                        </Stack>
                      }
                    />
                    <FormControlLabel
                      value="users"
                      control={<Radio size="small" />}
                      label={
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <PeopleIcon fontSize="small" color="secondary" />
                          <Typography fontSize="0.84rem" fontWeight={600}>کاربران خاص (منتخب)</Typography>
                        </Stack>
                      }
                    />
                  </RadioGroup>
                </FormControl>

                {/* Targeted Course Dropdown */}
                {form.targetType === 'course' && (
                  <Box sx={{ mt: 1 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>انتخاب دوره آموزشی هدف *</InputLabel>
                      <Select
                        value={form.targetCourseId}
                        label="انتخاب دوره آموزشی هدف *"
                        onChange={(e) => set('targetCourseId', e.target.value)}
                        disabled={loadingLookups}
                      >
                        {coursesList.map((course) => (
                          <MenuItem key={course.id} value={course.id}>
                            <Typography fontSize="0.85rem">
                              {course.name} {course.level ? `(${course.level})` : ''}
                            </Typography>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      فقط دانشجویانی که ثبت‌نام فعال در این دوره دارند می‌توانند از این کد استفاده نمایند.
                    </Typography>
                  </Box>
                )}

                {/* Targeted Specific Users Multi-select */}
                {form.targetType === 'users' && (
                  <Box sx={{ mt: 1 }}>
                    <Autocomplete
                      multiple
                      options={studentsList}
                      getOptionLabel={(option) => {
                        const name = [option.firstName, option.lastName].filter(Boolean).join(' ') || option.name || '';
                        const phone = option.phoneNumber || option.phone || '';
                        return `${name} (${phone})`.trim();
                      }}
                      value={selectedStudents}
                      onChange={(_, newValue) => {
                        set('targetUserIds', newValue.map((u) => u.id));
                      }}
                      isOptionEqualToValue={(option, val) => option.id === val.id}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="انتخاب کاربران مجاز *"
                          placeholder="جستجوی نام یا شماره همراه دانشجو..."
                          size="small"
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                          const name = [option.firstName, option.lastName].filter(Boolean).join(' ') || option.phoneNumber || 'کاربر';
                          return (
                            <Chip
                              {...getTagProps({ index })}
                              key={option.id}
                              label={name}
                              size="small"
                              variant="outlined"
                            />
                          );
                        })
                      }
                      disabled={loadingLookups}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      فقط کاربران انتخاب‌شده در این لیست هنگام ورود به حساب خود امکان اعمال کد را دارند.
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Usage Limit */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="سقف دفعات استفاده"
                type="number"
                value={form.usageLimit ?? ''}
                onChange={(e) => set('usageLimit', e.target.value)}
                dir="ltr"
                placeholder="خالی = نامحدود"
              />
            </Grid>

            {/* Minimum Order Amount */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="حداقل مبلغ سفارش (تومان)"
                type="number"
                value={form.minimumOrderAmount ?? ''}
                onChange={(e) => set('minimumOrderAmount', e.target.value)}
                dir="ltr"
                placeholder="خالی = بدون شرط"
              />
            </Grid>

            {/* Active Toggle */}
            <Grid size={12}>
              <FormControlLabel
                control={<Checkbox checked={!!form.isActive} onChange={(e) => set('isActive', e.target.checked)} />}
                label="کد فعال و قابل استفاده در سبد خرید باشد"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} variant="outlined">
            انصراف
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            startIcon={saving && <CircularProgress size={16} color="inherit" />}
          >
            {saving ? 'در حال ذخیره...' : 'ذخیره کد'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default function AdminCoupons() {
  const { showSuccess, showError } = useNotification();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const coupons = useApi(() => adminApi.listCoupons());

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteCoupon(deleteTarget.id);
      showSuccess('کد تخفیف با موفقیت حذف شد');
      setDeleteTarget(null);
      coupons.reload();
    } catch (err) {
      showError(err.message || 'خطا در حذف کد تخفیف');
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo(() => [
    {
      id: 'code',
      label: 'کد تخفیف',
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'warning.light', color: 'warning.dark', borderRadius: 2 }}>
            <CouponIcon sx={{ fontSize: 18 }} />
          </Avatar>
          <Chip
            label={row.code}
            variant="outlined"
            sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.84rem' }}
          />
        </Stack>
      ),
    },
    {
      id: 'targetType',
      label: 'جامعه هدف',
      render: (row) => {
        const targetType = row.targetType || 'all';
        if (targetType === 'course') {
          return (
            <Chip
              size="small"
              icon={<SchoolIcon sx={{ fontSize: '14px !important' }} />}
              label={`دانشجویان: ${row.targetCourse?.name || 'دوره خاص'}`}
              color="info"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: '0.76rem' }}
            />
          );
        }
        if (targetType === 'users') {
          const count = parseUserIds(row.targetUserIds).length;
          return (
            <Chip
              size="small"
              icon={<PeopleIcon sx={{ fontSize: '14px !important' }} />}
              label={`${count} کاربر منتخب`}
              color="secondary"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: '0.76rem' }}
            />
          );
        }
        return (
          <Chip
            size="small"
            icon={<PublicIcon sx={{ fontSize: '14px !important' }} />}
            label="همه کاربران"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: '0.76rem' }}
          />
        );
      },
    },
    {
      id: 'discountValue',
      label: 'میزان تخفیف',
      render: (row) => (
        <Typography fontWeight={700} fontSize="0.84rem">
          {row.discountType === 'percent' ? `${row.discountValue}٪` : formatToman(row.discountValue)}
        </Typography>
      ),
    },
    {
      id: 'discountType',
      label: 'نوع تخفیف',
      render: (row) => (
        <Chip
          size="small"
          label={row.discountType === 'percent' ? 'درصدی' : 'مبلغ ثابت'}
          variant="outlined"
        />
      ),
    },
    {
      id: 'minimumOrderAmount',
      label: 'حداقل مبلغ سفارش',
      render: (row) => (
        row.minimumOrderAmount ? (
          <Typography fontSize="0.8rem">
            {formatToman(row.minimumOrderAmount)}
          </Typography>
        ) : (
          <Typography variant="caption" color="text.disabled">بدون محدودیت</Typography>
        )
      ),
    },
    {
      id: 'expiresAt',
      label: 'تاریخ انقضا',
      render: (row) => (
        <Typography variant="caption" color="text.secondary">
          {row.expiresAt ? new Date(row.expiresAt).toLocaleDateString('fa-IR') : 'نامحدود'}
        </Typography>
      ),
    },
    {
      id: 'isActive',
      label: 'وضعیت',
      render: (row) => <StatusChip status={!!row.isActive} />,
    },
    {
      id: 'actions',
      label: 'عملیات',
      sortable: false,
      align: 'left',
      render: (row) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="ویرایش">
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                setEditingCoupon(row);
                setModalOpen(true);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="حذف">
            <IconButton
              size="small"
              color="error"
              onClick={() => setDeleteTarget(row)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], []);

  return (
    <Stack spacing={3.5}>
      <PageHeader
        title="کدهای تخفیف"
        subtitle="تعریف، سقف‌گذاری و هدفمندسازی کدهای تخفیف عمومی، ویژه دانشجویان یک دوره یا کاربران منتخب"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingCoupon(null);
              setModalOpen(true);
            }}
          >
            کد جدید
          </Button>
        }
      />

      {/* Coupons DataTable */}
      <DataTable
        columns={columns}
        rows={coupons.data || []}
        loading={coupons.loading}
        error={coupons.error}
        onReload={coupons.reload}
        searchPlaceholder="جستجوی کد تخفیف..."
        searchFilter={(row, term) => (row.code || '').toLowerCase().includes(term)}
        emptyTitle="کد تخفیفی ثبت نشده است"
        emptyDescription="برای ایجاد اولین کد تخفیف روی دکمه کد جدید کلیک کنید."
      />

      {/* Create / Edit Modal */}
      {modalOpen && (
        <CouponModal
          open={modalOpen}
          initial={editingCoupon}
          onClose={() => {
            setModalOpen(false);
            setEditingCoupon(null);
          }}
          onSaved={() => coupons.reload()}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف کد تخفیف"
        message={`آیا مطمئن هستید که می‌خواهید کد تخفیف «${deleteTarget?.code}» را حذف کنید؟`}
        confirmText="حذف کد"
        cancelText="انصراف"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Stack>
  );
}
