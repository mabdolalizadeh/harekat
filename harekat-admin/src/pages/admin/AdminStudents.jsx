import { useState, useEffect } from 'react';
import { adminApi, isSuperAdmin } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { Card, Field, FormError, PageHeader, ListRowSkeleton } from './adminUi.jsx';
import {
  Box, Stack, Button, TextField, Typography, Grid, Alert, Paper, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, FormControl, InputLabel,
  Select, MenuItem, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Tooltip
} from '@mui/material';
import {
  LockOpen as GrantIcon,
  Lock as RevokeIcon,
  Star as StarIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

function StudentAccessModal({ open, student, courses, onClose, onUpdated }) {
  const [accessData, setAccessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Grant Form
  const [grantCourseId, setGrantCourseId] = useState('');
  const [grantExpiresDays, setGrantExpiresDays] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAccess = async () => {
    if (!student?.id) return;
    setLoading(true);
    try {
      const res = await adminApi.inspectStudentAccess(student.id);
      setAccessData(res.data);
    } catch (err) {
      setError(err.message || 'خطا در بارگذاری دسترسی‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && student) {
      fetchAccess();
    }
  }, [open, student]);

  const handleGrant = async () => {
    if (!grantCourseId) return alert('لطفاً دوره را انتخاب کنید');
    setActionLoading(true);
    try {
      let expiresAt = null;
      if (grantExpiresDays && Number(grantExpiresDays) > 0) {
        expiresAt = new Date(Date.now() + Number(grantExpiresDays) * 86400000).toISOString();
      }
      await adminApi.grantAccess({
        userId: student.id,
        courseId: grantCourseId,
        expiresAt
      });
      setGrantCourseId('');
      setGrantExpiresDays('');
      await fetchAccess();
      onUpdated();
    } catch (err) {
      alert(`خطا: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async (courseId, sourceType, sourceId) => {
    if (!window.confirm('آیا از لغو دسترسی به این دوره اطمینان دارید؟')) return;
    setActionLoading(true);
    try {
      await adminApi.revokeAccess({
        userId: student.id,
        courseId,
        sourceType,
        sourceId
      });
      await fetchAccess();
      onUpdated();
    } catch (err) {
      alert(`خطا: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getSourceLabel = (src) => {
    switch (src) {
      case 'direct': return 'خرید مستقیم';
      case 'package': return 'پکیج مهارتی';
      case 'subscription': return 'اشتراک';
      case 'admin': return 'اعطای دستی مدیر';
      default: return src;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth dir="rtl">
      <DialogTitle fontWeight={700}>
        مدیریت دسترسی‌های دوره — {student?.firstName || ''} {student?.lastName || ''} ({student?.phoneNumber})
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}

          {/* Grant section */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
            <Typography fontWeight={700} fontSize={14} mb={1.5}>
              اعطای دسترسی مستقیم / دستی به دوره
            </Typography>
            <Grid container spacing={1.5} alignItems="center">
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>انتخاب دوره</InputLabel>
                  <Select
                    value={grantCourseId}
                    label="انتخاب دوره"
                    onChange={(e) => setGrantCourseId(e.target.value)}
                  >
                    {(courses || []).map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name} ({c.level || 'عمومی'})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  size="small"
                  label="مدت اعتبار (روز، خالی = دائمی)"
                  type="number"
                  value={grantExpiresDays}
                  onChange={(e) => setGrantExpiresDays(e.target.value)}
                  dir="ltr"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<GrantIcon />}
                  disabled={actionLoading || !grantCourseId}
                  onClick={handleGrant}
                >
                  اعطای دسترسی
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Active Courses Summary */}
          <Box>
            <Typography fontWeight={700} fontSize={15} mb={1}>
              دوره‌های دارای دسترسی فعال ({accessData?.activeCourseIds?.length || 0})
            </Typography>
            {accessData?.activeCourses?.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {accessData.activeCourses.map((c) => (
                  <Chip
                    key={c.id}
                    label={c.name}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                این دانشجو دسترسی فعالی به هیچ دوره‌ای ندارد.
              </Typography>
            )}
          </Box>

          <Divider />

          {/* Detailed Access Records */}
          <Box>
            <Typography fontWeight={700} fontSize={14} mb={1}>
              ریز سوابق و منابع دسترسی (تکثر منابع و اشتراک‌ها)
            </Typography>
            {loading ? (
              <Typography variant="body2">در حال بارگذاری سوابق...</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>دوره</TableCell>
                    <TableCell>منبع دسترسی</TableCell>
                    <TableCell>وضعیت</TableCell>
                    <TableCell>تاریخ انقضا</TableCell>
                    <TableCell align="left">عملیات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(accessData?.accessRecords || []).length > 0 ? (
                    accessData.accessRecords.map((rec) => (
                      <TableRow key={rec.id}>
                        <TableCell sx={{ fontWeight: 600 }}>{rec.course?.name || rec.courseId}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={getSourceLabel(rec.sourceType)}
                            variant="outlined"
                            sx={{ height: 22, fontSize: 11 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={rec.status === 'active' ? 'فعال' : rec.status}
                            color={rec.status === 'active' ? 'success' : 'default'}
                            sx={{ height: 20, fontSize: 10 }}
                          />
                        </TableCell>
                        <TableCell dir="ltr" sx={{ fontSize: 12 }}>
                          {rec.expiresAt ? new Date(rec.expiresAt).toLocaleDateString('fa-IR') : 'دائمی'}
                        </TableCell>
                        <TableCell align="left">
                          {rec.status === 'active' && (
                            <Tooltip title="لغو این منبع دسترسی">
                              <IconButton
                                size="small"
                                color="error"
                                disabled={actionLoading}
                                onClick={() => handleRevoke(rec.courseId, rec.sourceType, rec.sourceId)}
                              >
                                <RevokeIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary', py: 3 }}>
                        رکوردی ثبت نشده است
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>بستن</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AdminStudents() {
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState(null);

  // Recommended course state
  const [recommendedCourseId, setRecommendedCourseId] = useState('');
  const [savingRec, setSavingRec] = useState(false);

  const students = useApi(() => adminApi.listStudents());
  const courses = useApi(() => adminApi.listCourses());
  const currentRec = useApi(() => adminApi.getRecommendedCourse());

  useEffect(() => {
    if (currentRec.data?.id) {
      setRecommendedCourseId(currentRec.data.id);
    }
  }, [currentRec.data]);

  if (!isSuperAdmin()) {
    return <Alert severity="warning">دسترسی به این بخش فقط برای مدیر ارشد مجاز است.</Alert>;
  }

  const handleSaveRecommended = async () => {
    setSavingRec(true);
    try {
      await adminApi.setRecommendedCourse(recommendedCourseId);
      setNotice('دوره پیشنهادی داشبورد دانشجو با موفقیت بروزرسانی شد');
      currentRec.reload();
    } catch (err) {
      setNotice(`خطا: ${err.message}`);
    } finally {
      setSavingRec(false);
    }
  };

  const filteredStudents = (students.data || []).filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const name = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
    const phone = (s.phoneNumber || '').toLowerCase();
    const nationalId = (s.nationalId || '').toLowerCase();
    return name.includes(q) || phone.includes(q) || nationalId.includes(q);
  });

  return (
    <Stack spacing={3}>
      <PageHeader
        title="دانشجویان و مدیریت دسترسی‌ها"
        subtitle="بررسی و کنترل دسترسی دوره‌ها برای هر دانشجو و تنظیم دوره پیشنهادی داشبورد"
      />

      {notice && <Alert severity="success" onClose={() => setNotice(null)}>{notice}</Alert>}

      {/* Recommended Course Configuration */}
      <Card>
        <Typography fontWeight={700} fontSize={15} mb={1}>
          <StarIcon sx={{ color: 'warning.main', verticalAlign: 'middle', mr: 1 }} />
          دوره پیشنهادی داشبورد دانشجویان
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          دقیقاً یک دوره برای نمایش در داشبورد دانشجویانی که هنوز به آن دسترسی ندارند تنظیم کنید.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <FormControl fullWidth size="small">
            <InputLabel>انتخاب دوره پیشنهادی</InputLabel>
            <Select
              value={recommendedCourseId}
              label="انتخاب دوره پیشنهادی"
              onChange={(e) => setRecommendedCourseId(e.target.value)}
            >
              <MenuItem value="">-- بدون دوره پیشنهادی خاص (انتخاب خودکار) --</MenuItem>
              {(courses.data || []).map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name} ({c.level || 'عمومی'})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            disabled={savingRec}
            onClick={handleSaveRecommended}
            sx={{ minWidth: 140 }}
          >
            {savingRec ? 'در حال ثبت...' : 'ذخیره پیشنهاد'}
          </Button>
        </Stack>
      </Card>

      {/* Students List */}
      <Card>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center" mb={2}>
          <Typography fontWeight={700} fontSize={16}>
            لیست کاربران و دانشجویان ({filteredStudents.length})
          </Typography>
          <TextField
            size="small"
            placeholder="جستجوی نام، موبایل، کدملی..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{ input: { startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> } }}
            sx={{ width: { xs: '100%', sm: 280 } }}
          />
        </Stack>

        {students.loading && <ListRowSkeleton count={5} />}
        {students.error && (
          <Alert severity="error">
            خطا: {students.error} <Button size="small" onClick={students.reload}>تلاش مجدد</Button>
          </Alert>
        )}

        {!students.loading && filteredStudents.length === 0 && (
          <Alert severity="info">دانشجویی یافت نشد.</Alert>
        )}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>نام و نام خانوادگی</TableCell>
              <TableCell>شماره موبایل</TableCell>
              <TableCell>کد ملی</TableCell>
              <TableCell>تاریخ عضویت</TableCell>
              <TableCell align="left">مدیریت دسترسی</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map((s) => (
              <TableRow key={s.id}>
                <TableCell sx={{ fontWeight: 600 }}>
                  {`${s.firstName || ''} ${s.lastName || ''}`.trim() || 'بدون نام'}
                </TableCell>
                <TableCell dir="ltr">{s.phoneNumber || '—'}</TableCell>
                <TableCell dir="ltr">{s.nationalId || '—'}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>
                  {s.createdAt ? new Date(s.createdAt).toLocaleDateString('fa-IR') : '—'}
                </TableCell>
                <TableCell align="left">
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<GrantIcon />}
                    onClick={() => {
                      setSelectedStudent(s);
                      setModalOpen(true);
                    }}
                  >
                    مدیریت دسترسی‌ها
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {modalOpen && selectedStudent && (
        <StudentAccessModal
          open={modalOpen}
          student={selectedStudent}
          courses={courses.data || []}
          onClose={() => setModalOpen(false)}
          onUpdated={() => {
            students.reload();
          }}
        />
      )}
    </Stack>
  );
}
