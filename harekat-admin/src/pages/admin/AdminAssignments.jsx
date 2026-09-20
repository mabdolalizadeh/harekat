import { useState, useMemo, useEffect } from 'react';
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
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Grid,
  Divider,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Grade as GradeIcon,
  AttachFile as AttachFileIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { adminApi } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';

export default function AdminAssignments() {
  const { showSuccess, showError } = useNotification();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [assignmentsList, setAssignmentsList] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // Form states
  const [openModal, setOpenModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxScore: 100,
    allowLateSubmissions: true,
    fileAttachmentUrl: '',
    sessionNumber: '',
  });
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Submissions state
  const [viewingAssignment, setViewingAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [submittingGrade, setSubmittingGrade] = useState(false);

  const coursesApi = useApi(() => adminApi.listCourses());
  const courses = coursesApi.data || [];

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  const loadAssignments = async (courseId) => {
    if (!courseId) return;
    setLoadingAssignments(true);
    try {
      const res = await adminApi.listAssignments(courseId);
      setAssignmentsList(res.data || []);
    } catch (err) {
      showError(err.message || 'خطا در دریافت لیست تکالیف');
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      loadAssignments(selectedCourseId);
    }
  }, [selectedCourseId]);

  const handleOpenCreate = () => {
    setEditingAssignment(null);
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      maxScore: 100,
      allowLateSubmissions: true,
      fileAttachmentUrl: '',
      sessionNumber: '',
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title || '',
      description: assignment.description || '',
      dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 16) : '',
      maxScore: assignment.maxScore || 100,
      allowLateSubmissions: assignment.allowLateSubmissions ?? true,
      fileAttachmentUrl: assignment.fileAttachmentUrl || '',
      sessionNumber: assignment.sessionNumber || '',
    });
    setOpenModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showError('عنوان تکلیف الزامی است');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        maxScore: Number(formData.maxScore) || 100,
        allowLateSubmissions: Boolean(formData.allowLateSubmissions),
        fileAttachmentUrl: formData.fileAttachmentUrl.trim() || null,
        sessionNumber: formData.sessionNumber ? Number(formData.sessionNumber) : null,
      };

      if (editingAssignment) {
        await adminApi.updateAssignment(editingAssignment.id, payload);
        showSuccess('تکلیف با موفقیت ویرایش شد');
      } else {
        await adminApi.createAssignment(selectedCourseId, payload);
        showSuccess('تکلیف جدید با موفقیت ایجاد شد');
      }
      setOpenModal(false);
      loadAssignments(selectedCourseId);
    } catch (err) {
      showError(err.message || 'خطا در ذخیره تکلیف');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.deleteAssignment(deleteId);
      showSuccess('تکلیف با موفقیت حذف شد');
      setDeleteId(null);
      loadAssignments(selectedCourseId);
    } catch (err) {
      showError(err.message || 'خطا در حذف تکلیف');
    } finally {
      setDeleting(false);
    }
  };

  const handleViewSubmissions = async (assignment) => {
    setViewingAssignment(assignment);
    setLoadingSubmissions(true);
    try {
      const res = await adminApi.listAssignmentSubmissions(assignment.id);
      setSubmissions(res.data || []);
    } catch (err) {
      showError(err.message || 'خطا در دریافت پاسخ‌های دانشجویان');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleOpenGrade = (sub) => {
    setGradingSubmission(sub);
    setGradeScore(sub.score !== null ? String(sub.score) : '');
    setGradeFeedback(sub.feedback || '');
  };

  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    if (!gradingSubmission) return;
    setSubmittingGrade(true);
    try {
      await adminApi.gradeAssignmentSubmission(gradingSubmission.id, {
        score: Number(gradeScore),
        feedback: gradeFeedback.trim(),
      });
      showSuccess('نمره و بازخورد با موفقیت ثبت شد');
      setGradingSubmission(null);
      if (viewingAssignment) {
        handleViewSubmissions(viewingAssignment);
      }
    } catch (err) {
      showError(err.message || 'خطا در ثبت نمره');
    } finally {
      setSubmittingGrade(false);
    }
  };

  const columns = useMemo(() => [
    {
      id: 'title',
      label: 'عنوان تکلیف',
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.light', color: 'primary.dark', borderRadius: 2 }}>
            <AssignmentIcon sx={{ fontSize: 18 }} />
          </Avatar>
          <Box>
            <Typography fontWeight={700} fontSize="0.84rem">
              {row.title}
            </Typography>
            {row.sessionNumber && (
              <Typography variant="caption" color="text.secondary">
                مربوط به جلسه {row.sessionNumber}
              </Typography>
            )}
          </Box>
        </Stack>
      ),
    },
    {
      id: 'maxScore',
      label: 'بارم نمره',
      render: (row) => (
        <Typography fontWeight={600} fontSize="0.84rem">
          {row.maxScore} نمره
        </Typography>
      ),
    },
    {
      id: 'dueDate',
      label: 'مهلت تحویل',
      render: (row) => (
        <Typography variant="caption" color={row.dueDate && new Date(row.dueDate) < new Date() ? 'error.main' : 'text.secondary'}>
          {row.dueDate ? new Date(row.dueDate).toLocaleString('fa-IR') : 'نامحدود'}
        </Typography>
      ),
    },
    {
      id: 'submissions',
      label: 'پاسخ‌ها',
      render: (row) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<ViewIcon sx={{ fontSize: 16 }} />}
          onClick={() => handleViewSubmissions(row)}
          sx={{ fontSize: '0.75rem', py: 0.25 }}
        >
          مشاهده ارسال‌ها
        </Button>
      ),
    },
    {
      id: 'actions',
      label: 'عملیات',
      sortable: false,
      align: 'left',
      render: (row) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="ویرایش تکلیف">
            <IconButton size="small" color="primary" onClick={() => handleOpenEdit(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="حذف تکلیف">
            <IconButton size="small" color="error" onClick={() => setDeleteId(row.id)}>
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
        title="تکالیف و تمرین‌ها"
        subtitle="تعریف تکالیف دوره‌ها، بررسی فایل‌های ارسالی دانشجویان و نمره‌دهی توسط اساتید و دستیاران آموزشی"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            disabled={!selectedCourseId}
          >
            تکلیف جدید
          </Button>
        }
      />

      {/* Course Selector Bar */}
      <Card variant="outlined" sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <Typography variant="subtitle2" fontWeight={700}>
            انتخاب دوره آموزشی:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 260 }}>
            <Select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              displayEmpty
            >
              {courses.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Card>

      {/* Assignments Table */}
      <DataTable
        columns={columns}
        rows={assignmentsList}
        loading={loadingAssignments}
        onReload={() => loadAssignments(selectedCourseId)}
        searchPlaceholder="جستجوی عنوان تکلیف..."
        searchFilter={(row, term) => (row.title || '').toLowerCase().includes(term)}
        emptyTitle="تکلیفی برای این دوره یافت نشد"
        emptyDescription="با کلیک روی دکمه «تکلیف جدید» می‌توانید اولین تکلیف این دوره را ایجاد کنید."
      />

      {/* Create / Edit Modal */}
      {openModal && (
        <Dialog open onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth dir="rtl">
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              {editingAssignment ? 'ویرایش تکلیف' : 'ایجاد تکلیف جدید'}
            </Typography>
          </DialogTitle>
          <Box component="form" onSubmit={handleSave}>
            <DialogContent dividers sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <TextField
                  label="عنوان تکلیف"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  fullWidth
                />

                <TextField
                  label="توضیحات و دستورالعمل تکلیف"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="متن سوال، نیازمندی‌ها یا توضیحات نحوه ارسال..."
                  fullWidth
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="مهلت تحویل (اختیاری)"
                      type="datetime-local"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="بارم نمره"
                      type="number"
                      value={formData.maxScore}
                      onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                      fullWidth
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="مربوط به جلسه (شماره)"
                      type="number"
                      value={formData.sessionNumber}
                      onChange={(e) => setFormData({ ...formData, sessionNumber: e.target.value })}
                      placeholder="مثال: 3"
                      helperText="اختیاری — نمایش در جلسه مربوطه"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="لینک فایل ضمیمه یا صورت مسئله"
                      dir="ltr"
                      value={formData.fileAttachmentUrl}
                      onChange={(e) => setFormData({ ...formData, fileAttachmentUrl: e.target.value })}
                      placeholder="https://..."
                      helperText="اختیاری (PDF یا فایل پروژه)"
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setOpenModal(false)} variant="outlined">
                انصراف
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                startIcon={saving && <CircularProgress size={16} color="inherit" />}
              >
                {saving ? 'در حال ذخیره...' : 'ذخیره تکلیف'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      )}

      {/* Submissions Viewer Modal */}
      {viewingAssignment && (
        <Dialog open onClose={() => setViewingAssignment(null)} maxWidth="md" fullWidth dir="rtl">
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              پاسخ‌های ارسالی: {viewingAssignment.title}
            </Typography>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            {loadingSubmissions ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : submissions.length === 0 ? (
              <Typography textAlign="center" color="text.secondary" py={4}>
                هنوز هیچ دانشجویی پاسخی برای این تکلیف ارسال نکرده است.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {submissions.map((sub) => (
                  <Card key={sub.id} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Box>
                        <Typography fontWeight={700}>
                          {sub.user?.firstName || ''} {sub.user?.lastName || ''} ({sub.user?.phoneNumber || '—'})
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          زمان ارسال: {new Date(sub.submittedAt).toLocaleString('fa-IR')}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          size="small"
                          label={sub.status === 'graded' ? `نمره: ${sub.score} از ${viewingAssignment.maxScore}` : 'در انتظار تصحیح'}
                          color={sub.status === 'graded' ? 'success' : 'warning'}
                        />
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<GradeIcon sx={{ fontSize: 16 }} />}
                          onClick={() => handleOpenGrade(sub)}
                        >
                          ثبت نمره / بازخورد
                        </Button>
                      </Stack>
                    </Stack>

                    {sub.submissionText && (
                      <Box sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: 1.5, mb: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                          متن ارسالی دانشجو:
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {sub.submissionText}
                        </Typography>
                      </Box>
                    )}

                    {sub.fileUrl && (
                      <Button
                        component="a"
                        href={sub.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        size="small"
                        variant="outlined"
                        startIcon={<AttachFileIcon />}
                        sx={{ dir: 'ltr', mt: 0.5 }}
                      >
                        دانلود فایل ارسالی دانشجو
                      </Button>
                    )}

                    {sub.feedback && (
                      <Box sx={{ mt: 1.5, pl: 1, borderLeft: '3px solid', borderColor: 'primary.main' }}>
                        <Typography variant="caption" color="primary" fontWeight={700}>
                          بازخورد ثبت شده:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {sub.feedback}
                        </Typography>
                      </Box>
                    )}
                  </Card>
                ))}
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setViewingAssignment(null)} variant="outlined">
              بستن
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Grade Submission Modal */}
      {gradingSubmission && (
        <Dialog open onClose={() => setGradingSubmission(null)} maxWidth="xs" fullWidth dir="rtl">
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              ثبت نمره و بازخورد
            </Typography>
          </DialogTitle>
          <Box component="form" onSubmit={handleSubmitGrade}>
            <DialogContent dividers sx={{ p: 3 }}>
              <Stack spacing={2}>
                <TextField
                  label={`نمره (از ${viewingAssignment?.maxScore || 100})`}
                  type="number"
                  value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                  required
                  fullWidth
                  autoFocus
                />
                <TextField
                  label="بازخورد و راهنمایی برای دانشجو"
                  multiline
                  rows={3}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  placeholder="نقاط قوت و موارد قابل بهبود دانشجو..."
                  fullWidth
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setGradingSubmission(null)} variant="outlined">
                انصراف
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submittingGrade}
                startIcon={submittingGrade && <CircularProgress size={16} color="inherit" />}
              >
                {submittingGrade ? 'در حال ثبت...' : 'ثبت نمره'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="حذف تکلیف"
        message="آیا از حذف این تکلیف و تمام پاسخ‌های ارسال شده اطمینان دارید؟ این عملیات غیرقابل بازگشت است."
        confirmText="حذف"
        cancelText="انصراف"
        severity="error"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </Stack>
  );
}
