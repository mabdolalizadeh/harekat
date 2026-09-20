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
  Card,
  CardContent,
  Chip,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  Quiz as QuizIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Timer as TimerIcon,
  FactCheck as QuestionIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { adminApi } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';

export default function AdminQuizzes() {
  const { showSuccess, showError } = useNotification();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [quizzesList, setQuizzesList] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  // Form states
  const [openModal, setOpenModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    durationMinutes: 15,
    passingScore: 70,
    sessionNumber: '',
    maxAttempts: 3,
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        score: 1,
      },
    ],
  });
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Attempts state
  const [viewingQuiz, setViewingQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  const coursesApi = useApi(() => adminApi.listCourses());
  const courses = coursesApi.data || [];

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  const loadQuizzes = async (courseId) => {
    if (!courseId) return;
    setLoadingQuizzes(true);
    try {
      const res = await adminApi.listQuizzes(courseId);
      setQuizzesList(res.data || []);
    } catch (err) {
      showError(err.message || 'خطا در دریافت آزمونک‌ها');
    } finally {
      setLoadingQuizzes(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      loadQuizzes(selectedCourseId);
    }
  }, [selectedCourseId]);

  const handleOpenCreate = () => {
    setEditingQuiz(null);
    setFormData({
      title: '',
      description: '',
      durationMinutes: 15,
      passingScore: 70,
      sessionNumber: '',
      maxAttempts: 3,
      questions: [
        {
          question: '',
          options: ['', '', '', ''],
          correctOptionIndex: 0,
          score: 1,
        },
      ],
    });
    setOpenModal(true);
  };

  const handleOpenEdit = async (quiz) => {
    try {
      const fullRes = await adminApi.getQuiz(quiz.id);
      const q = fullRes.data || quiz;
      setEditingQuiz(q);
      setFormData({
        title: q.title || '',
        description: q.description || '',
        durationMinutes: q.durationMinutes || 15,
        passingScore: q.passingScore || 70,
        sessionNumber: q.sessionNumber || '',
        maxAttempts: q.maxAttempts || 3,
        questions: Array.isArray(q.questions) && q.questions.length > 0 ? q.questions : [
          { question: '', options: ['', '', '', ''], correctOptionIndex: 0, score: 1 }
        ],
      });
      setOpenModal(true);
    } catch (err) {
      showError(err.message || 'خطا در باز کردن آزمونک');
    }
  };

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correctOptionIndex: 0,
          score: 1,
        },
      ],
    });
  };

  const handleRemoveQuestion = (idx) => {
    if (formData.questions.length <= 1) return;
    const newQuestions = [...formData.questions];
    newQuestions.splice(idx, 1);
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleQuestionChange = (idx, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[idx] = { ...newQuestions[idx], [field]: value };
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleOptionChange = (qIdx, optIdx, value) => {
    const newQuestions = [...formData.questions];
    const newOptions = [...newQuestions[qIdx].options];
    newOptions[optIdx] = value;
    newQuestions[qIdx].options = newOptions;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showError('عنوان آزمونک الزامی است');
      return;
    }
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.question.trim()) {
        showError(`متن سوال شماره ${i + 1} نمی‌تواند خالی باشد`);
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description,
        durationMinutes: Number(formData.durationMinutes) || 15,
        passingScore: Number(formData.passingScore) || 70,
        sessionNumber: formData.sessionNumber ? Number(formData.sessionNumber) : null,
        maxAttempts: Number(formData.maxAttempts) || 3,
        questions: formData.questions,
      };

      if (editingQuiz) {
        await adminApi.updateQuiz(editingQuiz.id, payload);
        showSuccess('آزمونک با موفقیت ویرایش شد');
      } else {
        await adminApi.createQuiz(selectedCourseId, payload);
        showSuccess('آزمونک جدید با موفقیت ایجاد شد');
      }
      setOpenModal(false);
      loadQuizzes(selectedCourseId);
    } catch (err) {
      showError(err.message || 'خطا در ذخیره آزمونک');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.deleteQuiz(deleteId);
      showSuccess('آزمونک با موفقیت حذف شد');
      setDeleteId(null);
      loadQuizzes(selectedCourseId);
    } catch (err) {
      showError(err.message || 'خطا در حذف آزمونک');
    } finally {
      setDeleting(false);
    }
  };

  const handleViewAttempts = async (quiz) => {
    setViewingQuiz(quiz);
    setLoadingAttempts(true);
    try {
      const res = await adminApi.listQuizAttempts(quiz.id);
      setAttempts(res.data || []);
    } catch (err) {
      showError(err.message || 'خطا در دریافت تلاش‌های آزمونک');
    } finally {
      setLoadingAttempts(false);
    }
  };

  const columns = useMemo(() => [
    {
      id: 'title',
      label: 'عنوان آزمونک',
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.light', color: 'secondary.dark', borderRadius: 2 }}>
            <QuizIcon sx={{ fontSize: 18 }} />
          </Avatar>
          <Box>
            <Typography fontWeight={700} fontSize="0.84rem">
              {row.title}
            </Typography>
            {row.sessionNumber && (
              <Typography variant="caption" color="text.secondary">
                جلسه {row.sessionNumber}
              </Typography>
            )}
          </Box>
        </Stack>
      ),
    },
    {
      id: 'duration',
      label: 'مدت زمان',
      render: (row) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <TimerIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography fontSize="0.84rem">
            {row.durationMinutes ? `${row.durationMinutes} دقیقه` : 'نامحدود'}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'passingScore',
      label: 'حد نصاب قبولی',
      render: (row) => (
        <Typography fontWeight={600} fontSize="0.84rem">
          {row.passingScore}٪
        </Typography>
      ),
    },
    {
      id: 'attempts',
      label: 'نتایج دانشجویان',
      render: (row) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<ViewIcon sx={{ fontSize: 16 }} />}
          onClick={() => handleViewAttempts(row)}
          sx={{ fontSize: '0.75rem', py: 0.25 }}
        >
          مشاهده نتایج
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
          <Tooltip title="ویرایش آزمونک">
            <IconButton size="small" color="primary" onClick={() => handleOpenEdit(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="حذف آزمونک">
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
        title="آزمونک‌ها و کوییزها"
        subtitle="طراحی آزمونک‌های تستی چندگزینه‌ای، تصحیح خودکار سرور و مشاهده نمرات دانشجویان"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            disabled={!selectedCourseId}
          >
            آزمونک جدید
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

      {/* Quizzes Table */}
      <DataTable
        columns={columns}
        rows={quizzesList}
        loading={loadingQuizzes}
        onReload={() => loadQuizzes(selectedCourseId)}
        searchPlaceholder="جستجوی عنوان آزمونک..."
        searchFilter={(row, term) => (row.title || '').toLowerCase().includes(term)}
        emptyTitle="آزمونکی برای این دوره یافت نشد"
        emptyDescription="با کلیک روی دکمه «آزمونک جدید» می‌توانید اولین کوئیز تستی این دوره را طراحی کنید."
      />

      {/* Create / Edit Quiz Modal */}
      {openModal && (
        <Dialog open onClose={() => setOpenModal(false)} maxWidth="md" fullWidth dir="rtl">
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              {editingQuiz ? 'ویرایش آزمونک تستی' : 'طراحی آزمونک جدید'}
            </Typography>
          </DialogTitle>
          <Box component="form" onSubmit={handleSave}>
            <DialogContent dividers sx={{ p: 3, maxHeight: '75vh' }}>
              <Stack spacing={2.5}>
                <TextField
                  label="عنوان آزمونک"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  fullWidth
                />

                <TextField
                  label="توضیحات یا نکات آزمونک"
                  multiline
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="توضیحاتی برای راهنمایی دانشجو قبل از شروع..."
                  fullWidth
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="مدت زمان (دقیقه)"
                      type="number"
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="درصد قبولی (مثلا 70)"
                      type="number"
                      value={formData.passingScore}
                      onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="مربوط به جلسه (شماره)"
                      type="number"
                      value={formData.sessionNumber}
                      onChange={(e) => setFormData({ ...formData, sessionNumber: e.target.value })}
                      placeholder="اختیاری"
                      fullWidth
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 1 }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight={700}>
                    سوالات آزمونک ({formData.questions.length} سوال)
                  </Typography>
                  <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={handleAddQuestion}>
                    افزودن سوال
                  </Button>
                </Stack>

                {/* Questions list builder */}
                <Stack spacing={2.5}>
                  {formData.questions.map((q, qIdx) => (
                    <Card key={qIdx} variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                        <Typography fontWeight={700} fontSize="0.9rem" color="primary">
                          سوال {qIdx + 1}
                        </Typography>
                        {formData.questions.length > 1 && (
                          <IconButton size="small" color="error" onClick={() => handleRemoveQuestion(qIdx)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>

                      <TextField
                        label={`متن سوال ${qIdx + 1}`}
                        value={q.question}
                        onChange={(e) => handleQuestionChange(qIdx, 'question', e.target.value)}
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                      />

                      <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={1}>
                        گزینه‌ها (گزینه صحیح را با رادیوباتن انتخاب کنید):
                      </Typography>

                      <RadioGroup
                        value={q.correctOptionIndex}
                        onChange={(e) => handleQuestionChange(qIdx, 'correctOptionIndex', Number(e.target.value))}
                      >
                        <Grid container spacing={1.5}>
                          {q.options.map((opt, optIdx) => (
                            <Grid item xs={12} sm={6} key={optIdx}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Radio value={optIdx} size="small" />
                                <TextField
                                  size="small"
                                  placeholder={`گزینه ${optIdx + 1}`}
                                  value={opt}
                                  onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                                  fullWidth
                                />
                              </Stack>
                            </Grid>
                          ))}
                        </Grid>
                      </RadioGroup>
                    </Card>
                  ))}
                </Stack>
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
                {saving ? 'در حال ذخیره...' : 'ذخیره آزمونک'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      )}

      {/* Attempts Viewer Modal */}
      {viewingQuiz && (
        <Dialog open onClose={() => setViewingQuiz(null)} maxWidth="md" fullWidth dir="rtl">
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              نتایج شرکت‌کنندگان: {viewingQuiz.title}
            </Typography>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            {loadingAttempts ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : attempts.length === 0 ? (
              <Typography textAlign="center" color="text.secondary" py={4}>
                هنوز هیچ دانشجویی در این آزمونک شرکت نکرده است.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {attempts.map((att) => (
                  <Card key={att.id} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography fontWeight={700}>
                          {att.user?.firstName || ''} {att.user?.lastName || ''} ({att.user?.phoneNumber || '—'})
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          زمان ثبت: {new Date(att.completedAt || att.startedAt).toLocaleString('fa-IR')} | تلاش شماره {att.attemptNumber}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Typography fontWeight={800} fontSize="1rem" color={att.passed ? 'success.main' : 'error.main'}>
                          {att.score}٪
                        </Typography>
                        <Chip
                          size="small"
                          label={att.passed ? 'قبول' : 'مردود'}
                          color={att.passed ? 'success' : 'error'}
                        />
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setViewingQuiz(null)} variant="outlined">
              بستن
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="حذف آزمونک"
        message="آیا از حذف این آزمونک و تمام نتایج ثبت‌شده اطمینان دارید؟"
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
