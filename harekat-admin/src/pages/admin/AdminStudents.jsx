import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Stack,
  Button,
  TextField,
  Typography,
  Grid,
  Alert,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
  Avatar,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  LockOpen as GrantIcon,
  Lock as RevokeIcon,
  Star as StarIcon,
  Security as AccessIcon,
  CheckCircle as ActiveIcon,
  Edit as EditIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { adminApi, isSuperAdmin } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import StatusChip from '../../components/admin/StatusChip.jsx';

function StudentAccessModal({ open, student, courses, onClose, onUpdated }) {
  const { showSuccess, showError } = useNotification();
  const [accessData, setAccessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Grant Form
  const [grantCourseId, setGrantCourseId] = useState('');
  const [grantExpiresDays, setGrantExpiresDays] = useState('');
  const [granting, setGranting] = useState(false);

  // Revoke state
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revoking, setRevoking] = useState(false);

  const fetchAccess = useCallback(async () => {
    if (!student?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.inspectStudentAccess(student.id);
      setAccessData(res.data);
    } catch (err) {
      setError(err.message || 'خطا در بارگذاری دسترسی‌ها');
    } finally {
      setLoading(false);
    }
  }, [student]);

  useEffect(() => {
    let ignore = false;
    if (open && student?.id) {
      adminApi.inspectStudentAccess(student.id)
        .then((res) => {
          if (!ignore) {
            setAccessData(res.data);
          }
        })
        .catch((err) => {
          if (!ignore) setError(err.message || 'خطا در بارگذاری دسترسی‌ها');
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }
    return () => {
      ignore = true;
    };
  }, [open, student?.id]);

  const handleGrant = async (e) => {
    e.preventDefault();
    if (!grantCourseId) {
      showError('لطفاً دوره مورد نظر را انتخاب کنید');
      return;
    }

    setGranting(true);
    try {
      let expiresAt = null;
      if (grantExpiresDays && Number(grantExpiresDays) > 0) {
        expiresAt = new Date(Date.now() + Number(grantExpiresDays) * 86400000).toISOString();
      }
      await adminApi.grantAccess({
        userId: student.id,
        courseId: grantCourseId,
        expiresAt,
      });
      showSuccess('دسترسی به دوره با موفقیت اعطا شد');
      setGrantCourseId('');
      setGrantExpiresDays('');
      await fetchAccess();
      onUpdated();
    } catch (err) {
      showError(err.message || 'خطا در اعطای دسترسی');
    } finally {
      setGranting(false);
    }
  };

  const handleConfirmRevoke = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      await adminApi.revokeAccess({
        userId: student.id,
        courseId: revokeTarget.courseId,
        sourceType: revokeTarget.sourceType,
        sourceId: revokeTarget.sourceId,
      });
      showSuccess('دسترسی با موفقیت لغو شد');
      setRevokeTarget(null);
      await fetchAccess();
      onUpdated();
    } catch (err) {
      showError(err.message || 'خطا در لغو دسترسی');
    } finally {
      setRevoking(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth dir="rtl">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <AccessIcon color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={700}>
                مدیریت دسترسی‌ها: {student?.firstName || ''} {student?.lastName || ''}
              </Typography>
              <Typography variant="caption" color="text.secondary" dir="ltr" display="block">
                {student?.phoneNumber || 'بدون شماره تلفن'}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}

            {/* Grant Access Section */}
            <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'action.hover', borderRadius: 2.5 }}>
              <Typography fontWeight={700} fontSize="0.9rem" mb={1.5} display="flex" alignItems="center" gap={1}>
                <GrantIcon fontSize="small" color="primary" />
                اعطای دسترسی دستی به دوره
              </Typography>
              <Box component="form" onSubmit={handleGrant}>
                <Grid container spacing={2} alignItems="center">
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
                      label="مدت اعتبار (روز)"
                      placeholder="خالی = دائمی"
                      type="number"
                      value={grantExpiresDays}
                      onChange={(e) => setGrantExpiresDays(e.target.value)}
                      dir="ltr"
                      fullWidth
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={granting || !grantCourseId}
                      startIcon={granting ? <CircularProgress size={16} color="inherit" /> : <GrantIcon />}
                    >
                      {granting ? 'در حال ثبت...' : 'اعطای دسترسی'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>

            {/* Active Courses Summary */}
            <Box>
              <Typography fontWeight={700} fontSize="0.9rem" mb={1}>
                دوره‌های دارای دسترسی فعال ({accessData?.activeCourseIds?.length || 0})
              </Typography>
              {accessData?.activeCourses?.length > 0 ? (
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {accessData.activeCourses.map((c) => (
                    <Chip
                      key={c.id}
                      icon={<ActiveIcon sx={{ fontSize: 16 }} />}
                      label={c.name}
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: '0.8rem' }}
                    />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  این دانشجو در حال حاضر به دوره‌ای دسترسی ندارد.
                </Typography>
              )}
            </Box>

            <Divider />

            {/* Detailed Access Records */}
            <Box>
              <Typography fontWeight={700} fontSize="0.9rem" mb={1.5}>
                ریز سوابق و منابع دسترسی (خرید مستقیم، پکیج، اشتراک، دستی)
              </Typography>
              {loading ? (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <CircularProgress size={28} />
                </Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>نام دوره</TableCell>
                      <TableCell>منبع دسترسی</TableCell>
                      <TableCell>وضعیت</TableCell>
                      <TableCell>تاریخ انقضا</TableCell>
                      <TableCell align="left">عملیات</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(accessData?.accessRecords || []).length > 0 ? (
                      accessData.accessRecords.map((rec) => (
                        <TableRow key={rec.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{rec.course?.name || rec.courseId}</TableCell>
                          <TableCell>
                            <StatusChip status={rec.sourceType} />
                          </TableCell>
                          <TableCell>
                            <StatusChip status={rec.status === 'active'} label={rec.status === 'active' ? 'فعال' : rec.status} />
                          </TableCell>
                          <TableCell dir="ltr" sx={{ fontSize: '0.8rem' }}>
                            {rec.expiresAt ? new Date(rec.expiresAt).toLocaleDateString('fa-IR') : 'دائمی'}
                          </TableCell>
                          <TableCell align="left">
                            {rec.status === 'active' && (
                              <Tooltip title="لغو این منبع دسترسی">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => setRevokeTarget(rec)}
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
                          رکوردی ثبت نشده است.
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
          <Button onClick={onClose} variant="outlined">
            بستن
          </Button>
        </DialogActions>
      </Dialog>

      {/* Revoke confirmation dialog */}
      <ConfirmDialog
        open={Boolean(revokeTarget)}
        title="لغو دسترسی به دوره"
        message={`آیا مطمئن هستید که می‌خواهید دسترسی این کاربر به دوره «${revokeTarget?.course?.name || revokeTarget?.courseId}» را لغو کنید؟`}
        confirmText="لغو دسترسی"
        cancelText="انصراف"
        severity="error"
        loading={revoking}
        onConfirm={handleConfirmRevoke}
        onClose={() => setRevokeTarget(null)}
      />
    </>
  );
}

function StudentEditModal({ open, student, onClose, onUpdated }) {
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    nationalId: '',
    gradeLevel: '',
    dateOfBirth: '',
    schoolName: '',
    age: '',
    parentPhone: '',
    fatherName: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        phoneNumber: student.phoneNumber || '',
        nationalId: student.nationalId || '',
        gradeLevel: student.gradeLevel || '',
        dateOfBirth: student.dateOfBirth || '',
        schoolName: student.schoolName || '',
        age: student.age !== undefined && student.age !== null ? String(student.age) : '',
        parentPhone: student.parentPhone || '',
        fatherName: student.fatherName || '',
      });
    }
  }, [student]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (formData.nationalId && !/^\d{10}$/.test(formData.nationalId.trim())) {
        showError('کد ملی باید دقیقا ۱۰ رقم باشد.');
        setSaving(false);
        return;
      }
      if (formData.parentPhone && !/^09\d{9}$/.test(formData.parentPhone.trim())) {
        showError('شماره همراه والد باید با ۰۹ شروع شده و ۱۱ رقم باشد.');
        setSaving(false);
        return;
      }

      await adminApi.updateStudent(student.id, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        nationalId: formData.nationalId.trim(),
        gradeLevel: formData.gradeLevel.trim(),
        dateOfBirth: formData.dateOfBirth.trim(),
        schoolName: formData.schoolName.trim(),
        age: formData.age ? parseInt(formData.age, 10) : null,
        parentPhone: formData.parentPhone.trim(),
        fatherName: formData.fatherName.trim(),
      });
      showSuccess('مشخصات دانش‌آموز با موفقیت ذخیره و ثبت گردید.');
      onUpdated();
      onClose();
    } catch (err) {
      showError(err.message || 'خطا در ذخیره مشخصات دانش‌آموز');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>
        ویرایش و ثبت پرونده هویتی دانش‌آموز: {student?.firstName} {student?.lastName}
      </DialogTitle>
      <DialogContent dividers>
        <Box component="form" onSubmit={handleSave} sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="نام"
                value={formData.firstName}
                onChange={handleChange('firstName')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="نام خانوادگی"
                value={formData.lastName}
                onChange={handleChange('lastName')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="کد ملی (۱۰ رقم)"
                value={formData.nationalId}
                onChange={handleChange('nationalId')}
                slotProps={{ htmlInput: { dir: 'ltr', maxLength: 10 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="نام پدر"
                value={formData.fatherName}
                onChange={handleChange('fatherName')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="پایه / مقطع تحصیلی"
                value={formData.gradeLevel}
                onChange={handleChange('gradeLevel')}
                placeholder="مثال: دهم تجربی"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="نام مدرسه"
                value={formData.schoolName}
                onChange={handleChange('schoolName')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="تاریخ تولد (YYYY/MM/DD)"
                value={formData.dateOfBirth}
                onChange={handleChange('dateOfBirth')}
                slotProps={{ htmlInput: { dir: 'ltr' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="سن"
                value={formData.age}
                onChange={handleChange('age')}
                slotProps={{ htmlInput: { dir: 'ltr' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="شماره موبایل دانش‌آموز"
                value={formData.phoneNumber}
                onChange={handleChange('phoneNumber')}
                slotProps={{ htmlInput: { dir: 'ltr' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="شماره موبایل والد / سرپرست"
                value={formData.parentPhone}
                onChange={handleChange('parentPhone')}
                slotProps={{ htmlInput: { dir: 'ltr' } }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          انصراف
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {saving ? 'در حال ثبت...' : 'ذخیره پرونده'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AdminStudents() {
  const { showSuccess, showError } = useNotification();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Recommended course state
  const [recommendedCourseOverride, setRecommendedCourseOverride] = useState(null);
  const [savingRec, setSavingRec] = useState(false);

  const students = useApi(() => adminApi.listStudents());
  const courses = useApi(() => adminApi.listCourses());
  const currentRec = useApi(() => adminApi.getRecommendedCourse());

  const recommendedCourseId = recommendedCourseOverride ?? (currentRec.data?.id || '');
  const setRecommendedCourseId = setRecommendedCourseOverride;

  const handleSaveRecommended = async () => {
    setSavingRec(true);
    try {
      await adminApi.setRecommendedCourse(recommendedCourseId);
      showSuccess('دوره پیشنهادی داشبورد دانشجو با موفقیت بروزرسانی شد');
      currentRec.reload();
    } catch (err) {
      showError(err.message || 'خطا در ثبت دوره پیشنهادی');
    } finally {
      setSavingRec(false);
    }
  };

  const columns = useMemo(() => [
    {
      id: 'name',
      label: 'نام و نام خانوادگی',
      render: (row) => {
        const fullName = `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'کاربر بدون نام';
        return (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.light', fontSize: '0.8rem', fontWeight: 700 }}>
              {fullName[0]}
            </Avatar>
            <Box>
              <Typography fontWeight={700} fontSize="0.84rem">
                {fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary" dir="ltr" display="block">
                ID: {row.id.slice(0, 8)}
              </Typography>
            </Box>
          </Stack>
        );
      },
    },
    {
      id: 'fatherName',
      label: 'نام پدر',
      render: (row) => (
        <Typography fontSize="0.84rem">
          {row.fatherName || '—'}
        </Typography>
      ),
    },
    {
      id: 'gradeLevel',
      label: 'پایه تحصیلی / مدرسه',
      render: (row) => (
        <Box>
          <Typography fontSize="0.84rem" fontWeight={600}>
            {row.gradeLevel || '—'}
          </Typography>
          {row.schoolName && (
            <Typography variant="caption" color="text.secondary" display="block">
              {row.schoolName}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'nationalId',
      label: 'کد ملی',
      render: (row) => (
        <Typography dir="ltr" sx={{ fontFamily: 'monospace', fontSize: '0.84rem' }}>
          {row.nationalId || '—'}
        </Typography>
      ),
    },
    {
      id: 'phoneNumber',
      label: 'شماره دانش‌آموز / والد',
      render: (row) => (
        <Box>
          <Typography dir="ltr" sx={{ fontFamily: 'monospace', fontWeight: 500, fontSize: '0.84rem' }}>
            {row.phoneNumber || '—'}
          </Typography>
          {row.parentPhone && (
            <Typography dir="ltr" variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', display: 'block' }}>
              والد: {row.parentPhone}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'courses',
      label: 'دوره‌های ثبت‌نامی',
      render: (row) => {
        const count = row.courses?.length || 0;
        return (
          <Chip
            size="small"
            label={`${count} دوره`}
            color={count > 0 ? 'primary' : 'default'}
            variant={count > 0 ? 'filled' : 'outlined'}
          />
        );
      },
    },
    {
      id: 'actions',
      label: 'عملیات و پرونده',
      sortable: false,
      align: 'left',
      render: (row) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="ویرایش پرونده دانش‌آموز">
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                setEditStudent(row);
                setEditModalOpen(true);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AccessIcon fontSize="small" />}
            onClick={() => {
              setSelectedStudent(row);
              setModalOpen(true);
            }}
            sx={{ borderRadius: 2 }}
          >
            دسترسی‌ها
          </Button>
        </Stack>
      ),
    },
  ], []);

  if (!isSuperAdmin()) {
    return <Alert severity="warning">دسترسی به این بخش فقط برای مدیر ارشد سامانه مجاز است.</Alert>;
  }

  return (
    <Stack spacing={3.5}>
      <PageHeader
        title="دانشجویان و مدیریت دسترسی‌ها"
        subtitle="بررسی مشخصات دانشجویان، مشاهده و اعطای دوره‌ها، و تعیین دوره پیشنهادی داشبورد"
      />

      {/* Recommended Course Configuration Banner */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
            <StarIcon sx={{ color: 'warning.main' }} />
            <Typography variant="h6" fontWeight={700} fontSize="1rem">
              دوره پیشنهادی داشبورد دانشجو
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" mb={2}>
            این دوره به عنوان پیشنهاد ویژه در داشبورد دانشجویانی که هنوز به آن دسترسی ندارند نمایش داده خواهد شد.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <FormControl fullWidth size="small">
              <InputLabel>انتخاب دوره پیشنهادی</InputLabel>
              <Select
                value={recommendedCourseId}
                label="انتخاب دوره پیشنهادی"
                onChange={(e) => setRecommendedCourseId(e.target.value)}
              >
                <MenuItem value="">-- بدون دوره پیشنهادی خاص (انتخاب خودکار سیستم) --</MenuItem>
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
              sx={{ minWidth: 150, flexShrink: 0 }}
            >
              {savingRec ? 'در حال ثبت...' : 'ذخیره پیشنهاد'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Students DataTable */}
      <DataTable
        columns={columns}
        rows={students.data || []}
        loading={students.loading}
        error={students.error}
        onReload={students.reload}
        searchPlaceholder="جستجوی نام، موبایل، کد ملی..."
        searchFilter={(row, term) => {
          const name = `${row.firstName || ''} ${row.lastName || ''}`.toLowerCase();
          const phone = (row.phoneNumber || '').toLowerCase();
          const natId = (row.nationalId || '').toLowerCase();
          return name.includes(term) || phone.includes(term) || natId.includes(term);
        }}
        emptyTitle="دانشجویی یافت نشد"
        emptyDescription="هیچ دانشجویی با عبارت جستجوی واردشده تطابق ندارد."
        initialPageSize={10}
      />

      {/* Modal for student access */}
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

      {/* Modal for student profile editor */}
      {editModalOpen && editStudent && (
        <StudentEditModal
          open={editModalOpen}
          student={editStudent}
          onClose={() => {
            setEditModalOpen(false);
            setEditStudent(null);
          }}
          onUpdated={() => {
            students.reload();
          }}
        />
      )}
    </Stack>
  );
}
