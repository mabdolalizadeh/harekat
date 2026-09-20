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
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Grid,
  Rating,
  Avatar,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  RateReview as EvaluationIcon,
  Settings as SettingsIcon,
  Star as StarIcon,
  BarChart as StatsIcon,
} from '@mui/icons-material';
import { adminApi } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';
import DataTable from '../../components/admin/DataTable.jsx';

export default function AdminEvaluations() {
  const { showSuccess, showError } = useNotification();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [summaryData, setSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Config modal
  const [configModal, setConfigModal] = useState(false);
  const [evaluationRequired, setEvaluationRequired] = useState(true);
  const [evaluationTriggerSession, setEvaluationTriggerSession] = useState(4);
  const [savingConfig, setSavingConfig] = useState(false);

  const coursesApi = useApi(() => adminApi.listCourses());
  const courses = coursesApi.data || [];

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  const loadSummary = async (courseId) => {
    if (!courseId) return;
    setLoadingSummary(true);
    try {
      const res = await adminApi.getCourseEvaluationSummary(courseId);
      setSummaryData(res.data || null);
      if (res.data?.course) {
        setEvaluationRequired(Boolean(res.data.course.evaluationRequired));
        setEvaluationTriggerSession(res.data.course.evaluationTriggerSession || 4);
      }
    } catch (err) {
      showError(err.message || 'خطا در دریافت نتایج ارزیابی');
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      loadSummary(selectedCourseId);
    }
  }, [selectedCourseId]);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await adminApi.configureCourseEvaluation(selectedCourseId, {
        evaluationRequired,
        evaluationTriggerSession: Number(evaluationTriggerSession) || 4,
      });
      showSuccess('تنظیمات گیت ارزیابی با موفقیت ذخیره شد');
      setConfigModal(false);
      loadSummary(selectedCourseId);
    } catch (err) {
      showError(err.message || 'خطا در ذخیره تنظیمات ارزیابی');
    } finally {
      setSavingConfig(false);
    }
  };

  const columns = useMemo(() => [
    {
      id: 'student',
      label: 'دانشجو',
      render: (row) => {
        const user = row.user;
        return (
          <Typography fontWeight={700} fontSize="0.84rem">
            {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.phoneNumber : '—'}
          </Typography>
        );
      },
    },
    {
      id: 'overallRating',
      label: 'امتیاز کلی دوره',
      render: (row) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Rating value={row.overallRating || 0} readOnly size="small" />
          <Typography variant="caption" fontWeight={700}>
            {row.overallRating} / ۵
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'teachingRating',
      label: 'کیفیت تدریس استاد',
      render: (row) => (
        <Rating value={row.teachingRating || 0} readOnly size="small" />
      ),
    },
    {
      id: 'contentRating',
      label: 'کیفیت محتوا',
      render: (row) => (
        <Rating value={row.contentRating || 0} readOnly size="small" />
      ),
    },
    {
      id: 'feedback',
      label: 'نظرات و پیشنهادات',
      render: (row) => (
        <Typography variant="body2" sx={{ maxWidth: 300, whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
          {row.feedback || 'بدون متن'}
        </Typography>
      ),
    },
    {
      id: 'createdAt',
      label: 'تاریخ ثبت',
      render: (row) => (
        <Typography variant="caption" color="text.secondary">
          {new Date(row.createdAt).toLocaleDateString('fa-IR')}
        </Typography>
      ),
    },
  ], []);

  const stats = summaryData?.stats || {
    totalResponses: 0,
    avgOverallRating: '0.0',
    avgTeachingRating: '0.0',
    avgContentRating: '0.0',
  };

  return (
    <Stack spacing={3.5}>
      <PageHeader
        title="ارزیابی اساتید و دوره‌ها"
        subtitle="مدیریت گیت ارزیابی (اجبار نظرسنجی قبل از ادامه جلسات) و مشاهده میانگین نمرات و نظرات دانشجویان"
        action={
          <Button
            variant="contained"
            startIcon={<SettingsIcon />}
            onClick={() => setConfigModal(true)}
            disabled={!selectedCourseId}
          >
            تنظیمات گیت ارزیابی
          </Button>
        }
      />

      {/* Course Selector */}
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

      {/* Stats Cards */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={3}>
          <Card variant="outlined" sx={{ p: 2.5, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={1}>
              تعداد کل نظرات
            </Typography>
            <Typography variant="h4" fontWeight={800} color="primary.main">
              {stats.totalResponses}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card variant="outlined" sx={{ p: 2.5, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={1}>
              میانگین رضایت کلی
            </Typography>
            <Typography variant="h4" fontWeight={800} color="warning.main">
              {stats.avgOverallRating} <Typography component="span" variant="h6">/ ۵</Typography>
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card variant="outlined" sx={{ p: 2.5, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={1}>
              میانگین تدریس استاد
            </Typography>
            <Typography variant="h4" fontWeight={800} color="info.main">
              {stats.avgTeachingRating} <Typography component="span" variant="h6">/ ۵</Typography>
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card variant="outlined" sx={{ p: 2.5, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={1}>
              میانگین کیفیت محتوا
            </Typography>
            <Typography variant="h4" fontWeight={800} color="success.main">
              {stats.avgContentRating} <Typography component="span" variant="h6">/ ۵</Typography>
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Responses Table */}
      <DataTable
        columns={columns}
        rows={summaryData?.responses || []}
        loading={loadingSummary}
        onReload={() => loadSummary(selectedCourseId)}
        searchPlaceholder="جستجوی نظر..."
        searchFilter={(row, term) => {
          const name = `${row.user?.firstName || ''} ${row.user?.lastName || ''}`.toLowerCase();
          const fb = (row.feedback || '').toLowerCase();
          return name.includes(term) || fb.includes(term);
        }}
        emptyTitle="نظری برای این دوره ثبت نشده است"
        emptyDescription="هنوز دانشجویی برای این دوره فرم ارزیابی را پر نکرده است."
      />

      {/* Config Evaluation Gate Modal */}
      {configModal && (
        <Dialog open onClose={() => setConfigModal(false)} maxWidth="xs" fullWidth dir="rtl">
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              تنظیمات گیت ارزیابی دوره
            </Typography>
          </DialogTitle>
          <Box component="form" onSubmit={handleSaveConfig}>
            <DialogContent dividers sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={evaluationRequired}
                      onChange={(e) => setEvaluationRequired(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="فعال‌سازی گیت ارزیابی اجباری برای این دوره"
                />

                <Typography variant="caption" color="text.secondary">
                  در صورت فعال بودن، دانشجو تا زمانی که فرم ارزیابی استاد را تکمیل نکند، امکان مشاهده جلسات بعدی را نخواهد داشت.
                </Typography>

                <TextField
                  label="جلسه شروع گیت ارزیابی (شماره)"
                  type="number"
                  value={evaluationTriggerSession}
                  onChange={(e) => setEvaluationTriggerSession(e.target.value)}
                  helperText="جلسات مسدود شونده: از این جلسه به بعد"
                  fullWidth
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setConfigModal(false)} variant="outlined">
                انصراف
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={savingConfig}
                startIcon={savingConfig && <CircularProgress size={16} color="inherit" />}
              >
                {savingConfig ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      )}
    </Stack>
  );
}
