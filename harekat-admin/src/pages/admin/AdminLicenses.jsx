import { useState, useMemo } from 'react';
import {
  Box,
  Stack,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  WorkspacePremium as LicenseIcon,
  Edit as EditIcon,
  OpenInNew as LinkIcon,
} from '@mui/icons-material';
import { adminApi } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import StatusChip from '../../components/admin/StatusChip.jsx';

export default function AdminLicenses() {
  const { showSuccess, showError } = useNotification();
  const [editingLicense, setEditingLicense] = useState(null);
  const [certUrl, setCertUrl] = useState('');
  const [status, setStatus] = useState('available');
  const [saving, setSaving] = useState(false);

  const licenses = useApi(() => adminApi.listLicenses());

  const handleOpenEdit = (lic) => {
    setEditingLicense(lic);
    setCertUrl(lic.certificateUrl || '');
    setStatus(lic.status || 'available');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingLicense) return;
    setSaving(true);
    try {
      await adminApi.updateLicenseStatus(editingLicense.id, {
        status,
        certificateUrl: certUrl.trim() || null,
      });
      showSuccess('اطلاعات گواهینامه با موفقیت بروزرسانی شد');
      setEditingLicense(null);
      licenses.reload();
    } catch (err) {
      showError(err.message || 'خطا در بروزرسانی مدرک');
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(() => [
    {
      id: 'licenseNumber',
      label: 'شماره سریال گواهینامه',
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'warning.light', color: 'warning.dark', borderRadius: 2 }}>
            <LicenseIcon sx={{ fontSize: 18 }} />
          </Avatar>
          <Typography dir="ltr" sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.84rem' }}>
            {row.licenseNumber}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'user',
      label: 'دانشجو',
      render: (row) => {
        const user = row.user;
        const name = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.phoneNumber : '—';
        return (
          <Box>
            <Typography fontWeight={700} fontSize="0.84rem">
              {name}
            </Typography>
            {user?.nationalId && (
              <Typography variant="caption" color="text.secondary" dir="ltr" display="block">
                کد ملی: {user.nationalId}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      id: 'course',
      label: 'دوره آموزشی',
      render: (row) => (
        <Typography fontWeight={600} fontSize="0.84rem">
          {row.course?.name || '—'}
        </Typography>
      ),
    },
    {
      id: 'score',
      label: 'نمره قبولی',
      render: (row) => (
        <Typography fontWeight={700} color="success.main" fontSize="0.84rem">
          {row.examResult?.score !== undefined ? `${row.examResult.score} / ۱۰۰` : 'تایید شده'}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'وضعیت مدرک',
      render: (row) => <StatusChip status={row.status || 'available'} />,
    },
    {
      id: 'createdAt',
      label: 'تاریخ صدور',
      render: (row) => (
        <Typography variant="caption" color="text.secondary">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString('fa-IR') : '—'}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'عملیات',
      sortable: false,
      align: 'left',
      render: (row) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          {row.certificateUrl && (
            <Tooltip title="مشاهده فایل گواهینامه">
              <IconButton
                size="small"
                component="a"
                href={row.certificateUrl}
                target="_blank"
                rel="noreferrer"
                color="info"
              >
                <LinkIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="ویرایش مدرک">
            <IconButton size="small" color="primary" onClick={() => handleOpenEdit(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], []);

  return (
    <Stack spacing={3.5}>
      <PageHeader
        title="مدارک و گواهینامه‌ها"
        subtitle="مشاهده و مدیریت گواهینامه‌های رسمی صادرشده برای دانشجویانی که در آزمون‌ها نمره قبولی کسب کرده‌اند"
      />

      {/* Licenses DataTable */}
      <DataTable
        columns={columns}
        rows={licenses.data || []}
        loading={licenses.loading}
        error={licenses.error}
        onReload={licenses.reload}
        searchPlaceholder="جستجوی شماره گواهینامه، نام دانشجو..."
        searchFilter={(row, term) => {
          const lic = (row.licenseNumber || '').toLowerCase();
          const user = row.user;
          const name = `${user?.firstName || ''} ${user?.lastName || ''}`.toLowerCase();
          const natId = (user?.nationalId || '').toLowerCase();
          const crs = (row.course?.name || '').toLowerCase();
          return lic.includes(term) || name.includes(term) || natId.includes(term) || crs.includes(term);
        }}
        emptyTitle="گواهینامه‌ای صادر نشده است"
        emptyDescription="هنوز برای دوره‌ای گواهینامه صادر نگردیده است."
      />

      {/* Edit License Modal */}
      {editingLicense && (
        <Dialog open onClose={() => setEditingLicense(null)} maxWidth="xs" fullWidth dir="rtl">
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              ویرایش گواهینامه #{editingLicense.licenseNumber}
            </Typography>
          </DialogTitle>
          <Box component="form" onSubmit={handleSave}>
            <DialogContent dividers sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <FormControl fullWidth size="small">
                  <InputLabel>وضعیت مدرک</InputLabel>
                  <Select
                    value={status}
                    label="وضعیت مدرک"
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <MenuItem value="available">معتبر و صادرشده</MenuItem>
                    <MenuItem value="revoked">باطل شده</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="آدرس فایل گواهینامه (PDF یا تصویر)"
                  dir="ltr"
                  value={certUrl}
                  onChange={(e) => setCertUrl(e.target.value)}
                  placeholder="https://.../cert.pdf"
                  helperText="لینک مستقیم جهت دانلود مدرک توسط دانشجو"
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setEditingLicense(null)} variant="outlined">
                انصراف
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                startIcon={saving && <CircularProgress size={16} color="inherit" />}
              >
                {saving ? 'در حال ذخیره...' : 'ذخیره مدرک'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      )}
    </Stack>
  );
}
