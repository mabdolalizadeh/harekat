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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Paper,
  CircularProgress,
  Chip,
  Grid,
} from '@mui/material';
import {
  Grade as GradeIcon,
  Settings as ConfigIcon,
  CheckCircle as PassIcon,
  Cancel as FailIcon,
  HourglassEmpty as PendingIcon,
} from '@mui/icons-material';
import { adminApi } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';
import DataTable from '../../components/admin/DataTable.jsx';

export default function AdminExams() {
  const { showSuccess, showError } = useNotification();
  const [courseIdOverride, setCourseIdOverride] = useState(null);
  const [examConfigOpen, setExamConfigOpen] = useState(false);
  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    examUrl: '',
    minPassingScore: 70,
    maxScore: 100,
    status: 'published',
  });
  const [savingExam, setSavingExam] = useState(false);

  // Grading modal state
  const [gradingResult, setGradingResult] = useState(null);
  const [gradeScore, setGradeScore] = useState('');
  const [publishScore, setPublishScore] = useState(true);
  const [savingGrade, setSavingGrade] = useState(false);

  const courses = useApi(() => adminApi.listCourses());
  const selectedCourseId = courseIdOverride ?? (courses.data?.[0]?.id || '');
  const setSelectedCourseId = setCourseIdOverride;

  const submissions = useApi(
    () => (selectedCourseId ? adminApi.listSubmissions(selectedCourseId) : Promise.resolve({ data: [] })),
    [selectedCourseId]
  );

  const handleOpenConfig = () => {
    setExamConfigOpen(true);
  };

  const handleSaveExamConfig = async (e) => {
    e.preventDefault();
    if (!selectedCourseId || !examForm.title.trim()) {
      showError('عنوان آزمون الزامی است');
      return;
    }
    setSavingExam(true);
    try {
      await adminApi.upsertExam(selectedCourseId, examForm);
      showSuccess('تنظیمات آزمون دوره با موفقیت ثبت شد');
      setExamConfigOpen(false);
    } catch (err) {
      showError(err.message || 'خطا در ثبت آزمون');
    } finally {
      setSavingExam(false);
    }
  };

  const handleOpenGrading = (sub) => {
    setGradingResult(sub);
    setGradeScore(sub.score !== undefined && sub.score !== null ? String(sub.score) : '');
    setPublishScore(true);
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    const scoreNum = Number(gradeScore);
    if (!Number.isFinite(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      showError('نمره باید عددی بین ۰ تا ۱۰۰ باشد');
      return;
    }

    setSavingGrade(true);
    try {
      const res = await adminApi.gradeSubmission(gradingResult.id, {
        score: scoreNum,
        published: publishScore,
      });
      showSuccess(res.message || 'نمره با موفقیت ثبت شد و در صورت قبولی گواهینامه صادر گردید');
      setGradingResult(null);
      submissions.reload();
    } catch (err) {
      showError(err.message || 'خطا در ثبت نمره');
    } finally {
      setSavingGrade(false);
    }
  };

  const selectedCourse = (courses.data || []).find((c) => c.id === selectedCourseId);

  const columns = useMemo(() => [
    {
      id: 'student',
      label: 'نام و نام خانوادگی دانشجو',
      render: (row) => {
        const user = row.user;
        const name = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.phoneNumber : 'دانشجو';
        return (
          <Box>
            <Typography fontWeight={700} fontSize="0.84rem">
              {name}
            </Typography>
            {user?.phoneNumber && (
              <Typography variant="caption" color="text.secondary" dir="ltr" display="block">
                {user.phoneNumber}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      id: 'nationalId',
      label: 'کد ملی',
      render: (row) => (
        <Typography dir="ltr" sx={{ fontFamily: 'monospace', fontSize: '0.84rem' }}>
          {row.user?.nationalId || '—'}
        </Typography>
      ),
    },
    {
      id: 'score',
      label: 'نمره آزمون',
      render: (row) => (
        row.score !== null && row.score !== undefined ? (
          <Typography fontWeight={700} fontSize="0.9rem" color={row.score >= 70 ? 'success.main' : 'error.main'}>
            {row.score} / ۱۰۰
          </Typography>
        ) : (
          <Chip label="ثبت نشده" size="small" variant="outlined" />
        )
      ),
    },
    {
      id: 'status',
      label: 'نتیجه آزمون',
      render: (row) => {
        if (row.score === null || row.score === undefined) {
          return <Chip size="small" label="در انتظار تصحیح" color="warning" icon={<PendingIcon />} />;
        }
        const passed = row.score >= 70;
        return passed ? (
          <Chip size="small" label="قبول (مدرک صادر شد)" color="success" icon={<PassIcon />} />
        ) : (
          <Chip size="small" label="مردود" color="error" icon={<FailIcon />} />
        );
      },
    },
    {
      id: 'createdAt',
      label: 'تاریخ شرکت',
      render: (row) => (
        <Typography variant="caption" color="text.secondary">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString('fa-IR') : '—'}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'نمره‌دهی',
      sortable: false,
      align: 'left',
      render: (row) => (
        <Button
          size="small"
          variant="contained"
          color="primary"
          startIcon={<GradeIcon fontSize="small" />}
          onClick={() => handleOpenGrading(row)}
          sx={{ borderRadius: 2 }}
        >
          ثبت نمره
        </Button>
      ),
    },
  ], []);

  return (
    <Stack spacing={3.5}>
      <PageHeader
        title="آزمون‌ها و ثبت نمرات"
        subtitle="تعریف آزمون پایانی دوره‌ها، بررسی پاسخ‌ها و صدور خودکار مدرک پس از ثبت نمره قبولی"
        action={
          <Button
            variant="contained"
            startIcon={<ConfigIcon />}
            disabled={!selectedCourseId}
            onClick={handleOpenConfig}
          >
            تنظیم آزمون این دوره
          </Button>
        }
      />

      {/* Course Selector Filter Card */}
      <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>انتخاب دوره جهت مشاهده آزمون</InputLabel>
              <Select
                value={selectedCourseId}
                label="انتخاب دوره جهت مشاهده آزمون"
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                {(courses.data || []).map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name} ({c.level || 'عمومی'})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            {selectedCourse && (
              <Typography variant="body2" color="text.secondary">
                دوره فعال: <strong>{selectedCourse.name}</strong> · حداقل نمره قبولی: ۷۰ از ۱۰۰
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Submissions DataTable */}
      <DataTable
        columns={columns}
        rows={submissions.data || []}
        loading={submissions.loading}
        error={submissions.error}
        onReload={submissions.reload}
        searchPlaceholder="جستجوی نام دانشجو، شماره تلفن یا کد ملی..."
        emptyTitle="آزمونی ثبت نشده است"
        emptyDescription="هنوز دانشجویی در آزمون این دوره شرکت نکرده یا پاسخی ثبت نشده است."
      />

      {/* Exam Configuration Dialog */}
      {examConfigOpen && (
        <Dialog open onClose={() => setExamConfigOpen(false)} maxWidth="sm" fullWidth dir="rtl">
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              تنظیم آزمون پایانی دوره: {selectedCourse?.name}
            </Typography>
          </DialogTitle>
          <Box component="form" onSubmit={handleSaveExamConfig}>
            <DialogContent dividers sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <TextField
                  label="عنوان آزمون *"
                  value={examForm.title}
                  onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                  placeholder="مثال: آزمون جامع پایان دوره"
                />

                <TextField
                  label="لینک پرسشنامه آزمون (پرس‌لاین / گوگل فرم)"
                  dir="ltr"
                  value={examForm.examUrl}
                  onChange={(e) => setExamForm({ ...examForm, examUrl: e.target.value })}
                  placeholder="https://survey.porsline.ir/..."
                  helperText="دانشجویان در جلسه پایانی به این لینک هدایت خواهند شد"
                />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="حداقل نمره قبولی"
                      type="number"
                      value={examForm.minPassingScore}
                      onChange={(e) => setExamForm({ ...examForm, minPassingScore: Number(e.target.value) })}
                      dir="ltr"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="حداکثر نمره آزمون"
                      type="number"
                      value={examForm.maxScore}
                      onChange={(e) => setExamForm({ ...examForm, maxScore: Number(e.target.value) })}
                      dir="ltr"
                    />
                  </Grid>
                </Grid>

                <TextField
                  label="توضیحات و راهنمای شرکت در آزمون"
                  multiline
                  rows={3}
                  value={examForm.description}
                  onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setExamConfigOpen(false)} variant="outlined">
                انصراف
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={savingExam}
                startIcon={savingExam && <CircularProgress size={16} color="inherit" />}
              >
                {savingExam ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      )}

      {/* Grading Dialog */}
      {gradingResult && (
        <Dialog open onClose={() => setGradingResult(null)} maxWidth="xs" fullWidth dir="rtl">
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              ثبت نمره دانشجو
            </Typography>
            <Typography variant="caption" color="text.secondary">
              دانشجو: {gradingResult.user ? `${gradingResult.user.firstName || ''} ${gradingResult.user.lastName || ''}`.trim() || gradingResult.user.phoneNumber : ''}
            </Typography>
          </DialogTitle>
          <Box component="form" onSubmit={handleGrade}>
            <DialogContent dividers sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <TextField
                  autoFocus
                  label="نمره آزمون (از ۱۰۰) *"
                  type="number"
                  inputProps={{ min: 0, max: 100 }}
                  value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                  dir="ltr"
                  helperText="نمره ۷۰ و بالاتر قبولی محسوب شده و گواهینامه معتبر صادر خواهد شد."
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={publishScore}
                      onChange={(e) => setPublishScore(e.target.checked)}
                    />
                  }
                  label="انتشار نمره (قابل مشاهده در پنل دانشجو)"
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setGradingResult(null)} variant="outlined">
                انصراف
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={savingGrade || !gradeScore}
                startIcon={savingGrade && <CircularProgress size={16} color="inherit" />}
              >
                {savingGrade ? 'در حال ثبت...' : 'ثبت نمره'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      )}
    </Stack>
  );
}
