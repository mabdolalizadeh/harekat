import { useState } from 'react';
import { adminApi, isSuperAdmin } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { Card, PageHeader, ListRowSkeleton } from './adminUi.jsx';
import {
  Box, Stack, Typography, Grid, Alert, Chip,
  Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Verified as CertIcon, Edit as EditIcon } from '@mui/icons-material';

export default function AdminLicenses() {
  const [editingLicense, setEditingLicense] = useState(null);
  const [certUrl, setCertUrl] = useState('');
  const [status, setStatus] = useState('available');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const licenses = useApi(() => adminApi.listLicenses());

  const handleOpenEdit = (lic) => {
    setEditingLicense(lic);
    setCertUrl(lic.certificateUrl || '');
    setStatus(lic.status || 'available');
  };

  const handleSave = async () => {
    if (!editingLicense) return;
    setSaving(true);
    try {
      await adminApi.updateLicenseStatus(editingLicense.id, {
        status,
        certificateUrl: certUrl.trim() || null
      });
      setNotice('اطلاعات مدرک با موفقیت بروزرسانی شد');
      setEditingLicense(null);
      licenses.reload();
    } catch (err) {
      alert(`خطا: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="مدارک و گواهینامه‌ها"
        subtitle="مشاهده گواهینامه‌های صادرشده برای دانشجویان پذیرفته شده در آزمون‌ها"
      />

      {notice && <Alert severity="success" onClose={() => setNotice(null)}>{notice}</Alert>}

      <Card>
        {licenses.loading && <ListRowSkeleton count={4} />}
        {licenses.error && (
          <Alert severity="error">
            خطا: {licenses.error} <Button size="small" onClick={licenses.reload}>تلاش مجدد</Button>
          </Alert>
        )}

        {!licenses.loading && licenses.isEmpty && (
          <Alert severity="info">هیچ مدرکی تاکنون صادر نشده است.</Alert>
        )}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>شماره گواهینامه</TableCell>
              <TableCell>دانشجو</TableCell>
              <TableCell>کد ملی</TableCell>
              <TableCell>دوره</TableCell>
              <TableCell>نمره آزمون</TableCell>
              <TableCell>تاریخ صدور</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell align="left">ویرایش</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(licenses.data || []).map((lic) => {
              const user = lic.user;
              const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.phoneNumber : '—';

              return (
                <TableRow key={lic.id}>
                  <TableCell dir="ltr" sx={{ fontWeight: 700, fontSize: 12 }}>
                    {lic.licenseNumber}
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600} fontSize={13}>{userName}</Typography>
                    {user?.phoneNumber && (
                      <Typography variant="caption" color="text.secondary" dir="ltr" display="block">
                        {user.phoneNumber}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell dir="ltr">{user?.nationalId || '—'}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{lic.course?.name || '—'}</TableCell>
                  <TableCell>
                    {lic.examResult?.score !== undefined ? (
                      <Chip label={lic.examResult.score} color="success" size="small" sx={{ fontWeight: 700 }} />
                    ) : '—'}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>
                    {lic.issueDate ? new Date(lic.issueDate).toLocaleDateString('fa-IR') : '—'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={lic.status === 'available' ? 'معتبر / فعال' : 'لغو شده'}
                      color={lic.status === 'available' ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell align="left">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenEdit(lic)}
                    >
                      ویرایش
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Edit License Modal */}
      {editingLicense && (
        <Dialog open onClose={() => setEditingLicense(null)} maxWidth="sm" fullWidth dir="rtl">
          <DialogTitle fontWeight={700}>
            ویرایش مدرک {editingLicense.licenseNumber}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} mt={1}>
              <TextField
                label="لینک فایل دانلودی گواهینامه (PDF یا تصویر)"
                value={certUrl}
                onChange={(e) => setCertUrl(e.target.value)}
                dir="ltr"
                placeholder="https://.../certificate.pdf"
                fullWidth
              />
              <FormControl fullWidth size="small">
                <InputLabel>وضعیت گواهینامه</InputLabel>
                <Select
                  value={status}
                  label="وضعیت گواهینامه"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="available">معتبر و قابل دریافت (Available)</MenuItem>
                  <MenuItem value="revoked">لغو شده (Revoked)</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setEditingLicense(null)}>انصراف</Button>
            <Button variant="contained" disabled={saving} onClick={handleSave}>
              {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  );
}
