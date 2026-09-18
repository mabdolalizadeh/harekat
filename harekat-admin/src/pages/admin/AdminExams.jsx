import { useState, useEffect } from 'react';
import { adminApi, isTA, getAdminUser } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { Card, PageHeader, ListRowSkeleton } from './adminUi.jsx';
import {
  Box, Stack, Typography, Grid, Alert, Paper, Chip,
  Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem,
  FormControlLabel, Checkbox, Divider
} from '@mui/material';
import { Quiz as ExamIcon, Grade as GradeIcon, Settings as ConfigIcon } from '@mui/icons-material';

export default function AdminExams() {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [examConfigOpen, setExamConfigOpen] = useState(false);
  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    examUrl: '',
    minPassingScore: 70,
    maxScore: 100,
    status: 'published'
  });
  const [savingExam, setSavingExam] = useState(false);

  // Grading state
  const [gradingResult, setGradingResult] = useState(null);
  const [gradeScore, setGradeScore] = useState('');
  const [publishScore, setPublishScore] = useState(true);
  const [savingGrade, setSavingGrade] = useState(false);
  const [notice, setNotice] = useState(null);

  const courses = useApi(() => adminApi.listCourses());
  const submissions = useApi(
    () => (selectedCourseId ? adminApi.listSubmissions(selectedCourseId) : Promise.resolve({ data: [] })),
    [selectedCourseId]
  );

  useEffect(() => {
    if (courses.data && courses.data.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses.data[0].id);
    }
  }, [courses.data]);

  const handleSaveExamConfig = async (e) => {
    e.preventDefault();
    if (!selectedCourseId || !examForm.title.trim()) return;
    setSavingExam(true);
    try {
      await adminApi.upsertExam(selectedCourseId, examForm);
      setNotice('تنظیمات آزمون دوره با موفقیت ذخیره شد');
      setExamConfigOpen(false);
    } catch (err) {
      alert(`خطا: ${err.message}`);
    } finally {
      setSavingExam(false);
    }
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    const scoreNum = Number(gradeScore);
    if (!Number.isFinite(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      return alert('نمره باید عددی بین ۰ تا ۱۰۰ باشد');
    }

    setSavingGrade(true);
    try {
      const res = await adminApi.gradeSubmission(gradingResult.id, {
        score: scoreNum,
        published: publishScore
      });
      setNotice(res.message || 'نمره ثبت شد و در صورت قبولی مدرک صادر گردید');
      setGradingResult(null);
      submissions.reload();
    } catch (err) {
      alert(`خطا: ${err.message}`);
    } finally {
      setSavingGrade(false);
    }
  };

  const selectedCourse = (courses.data || []).find((c) => c.id === selectedCourseId);

  return (
    <Stack spacing={3}>
      <PageHeader
        title="آزمون‌ها و نمره‌دهی"
        subtitle="تعریف آزمون پایانی دوره‌ها، بررسی پاسخ‌های دانشجویان و انتشار نمرات برای صدور گواهینامه"
        action={
          <Button
            variant="contained"
            startIcon={<ConfigIcon />}
            disabled={!selectedCourseId}
            onClick={() => setExamConfigOpen(true)}
          >
            تنظیم آزمون دوره
          </Button>
        }
      />

      {notice && <Alert severity="success" onClose={() => setNotice(null)}>{notice}</Alert>}

      {/* Course Selector */}
      <Card>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <FormControl fullWidth size="small">
            <InputLabel>انتخاب دوره</InputLabel>
            <Select
              value={selectedCourseId}
              label="انتخاب دوره"
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              {(courses.data || []).map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name} ({c.level || 'عمومی'})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Card>

      {/* Submissions List */}
      <Card>
        <Typography fontWeight={700} fontSize={16} mb={2}>
          پاسخ‌ها و نتایج آزمون — {selectedCourse?.name || 'انتخاب دوره'}
        </Typography>

        {submissions.loading && <ListRowSkeleton count={3} />}
        {submissions.error && (
          <Alert severity="error">
            خطا: {submissions.error} <Button size="small" onClick={submissions.reload}>تلاش مجدد</Button>
          </Alert>
        )}

        {!submissions.loading && submissions.isEmpty && (
          <Alert severity="info">هیچ پاسخی برای آزمون این دوره ثبت نشده است.</Alert>
        )}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>دانشجو</TableCell>
              <TableCell>شماره موبایل</TableCell>
              <TableCell>وضعیت آزمون</TableCell>
              <TableCell>نمره (از ۱۰۰)</TableCell>
              <TableCell>وضعیت انتشار</TableCell>
              <TableCell>تاریخ ثبت</TableCell>
              <TableCell align="left">نمره‌دهی</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(submissions.data || []).map((sub) => {
              const user = sub.user;
              const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.phoneNumber : 'کاربر';
              const passed = sub.published && (sub.score >= (sub.exam?.minPassingScore || 70));

              return (
                <TableRow key={sub.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{userName}</TableCell>
                  <TableCell dir="ltr">{user?.phoneNumber || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={sub.status === 'completed' ? 'ارسال شده' : sub.status}
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {sub.score !== null && sub.score !== undefined ? (
                      <Chip
                        size="small"
                        label={sub.score}
                        color={passed ? 'success' : 'error'}
                        sx={{ fontWeight: 700 }}
                      />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={sub.published ? 'منتشر شده' : 'پیش‌نویس'}
                      color={sub.published ? 'success' : 'default'}
                      sx={{ height: 20, fontSize: 10 }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>
                    {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString('fa-IR') : '—'}
                  </TableCell>
                  <TableCell align="left">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<GradeIcon />}
                      onClick={() => {
                        setGradingResult(sub);
                        setGradeScore(sub.score !== null ? String(sub.score) : '');
                        setPublishScore(sub.published ?? true);
                      }}
                    >
                      ثبت نمره
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Exam Configuration Modal */}
      {examConfigOpen && (
        <Dialog open onClose={() => setExamConfigOpen(false)} maxWidth="sm" fullWidth dir="rtl">
          <DialogTitle fontWeight={700}>
            تنظیمات آزمون پایانی — {selectedCourse?.name}
          </DialogTitle>
          <DialogContent dividers>
            <Box component="form" id="exam-cfg-form" onSubmit={handleSaveExamConfig}>
              <Stack spacing={2} mt={1}>
                <TextField
                  label="عنوان آزمون *"
                  value={examForm.title}
                  onChange={(e) => setExamForm((f) => ({ ...f, title: e.target.value }))}
                  fullWidth
                  placeholder="آزمون پایانی دوره"
                />
                <TextField
                  label="توضیحات آزمون"
                  multiline
                  rows={2}
                  value={examForm.description}
                  onChange={(e) => setExamForm((f) => ({ ...f, description: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="لینک پرس‌لاین یا سامانه آزمون (اختیاری)"
                  value={examForm.examUrl}
                  onChange={(e) => setExamForm((f) => ({ ...f, examUrl: e.target.value }))}
                  dir="ltr"
                  placeholder="https://survey.porsline.ir/..."
                  fullWidth
                />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="حداقل نمره قبولی (از ۱۰۰)"
                      type="number"
                      value={examForm.minPassingScore}
                      onChange={(e) => setExamForm((f) => ({ ...f, minPassingScore: Number(e.target.value) }))}
                      dir="ltr"
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="حداکثر نمره"
                      type="number"
                      value={examForm.maxScore}
                      onChange={(e) => setExamForm((f) => ({ ...f, maxScore: Number(e.target.value) }))}
                      dir="ltr"
                      fullWidth
                    />
                  </Grid>
                </Grid>
                <FormControl fullWidth size="small">
                  <InputLabel>وضعیت انتشار</InputLabel>
                  <Select
                    value={examForm.status}
                    label="وضعیت انتشار"
                    onChange={(e) => setExamForm((f) => ({ ...f, status: e.target.value }))}
                  >
                    <MenuItem value="published">منتشر شده (قابل مشاهده در جلسه آخر)</MenuItem>
                    <MenuItem value="draft">پیش‌نویس (غیرفعال)</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setExamConfigOpen(false)}>انصراف</Button>
            <Button type="submit" form="exam-cfg-form" variant="contained" disabled={savingExam}>
              {savingExam ? 'در حال ذخیره...' : 'ذخیره تنظیمات آزمون'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Grading Modal */}
      {gradingResult && (
        <Dialog open onClose={() => setGradingResult(null)} maxWidth="xs" fullWidth dir="rtl">
          <DialogTitle fontWeight={700}>
            ثبت نمره آزمون
          </DialogTitle>
          <DialogContent dividers>
            <Box component="form" id="grade-form" onSubmit={handleGrade}>
              <Stack spacing={2} mt={1}>
                <Typography variant="body2">
                  دانشجو: <strong>{gradingResult.user?.firstName} {gradingResult.user?.lastName}</strong> ({gradingResult.user?.phoneNumber})
                </Typography>
                <TextField
                  label="نمره دانشجو (۰ تا ۱۰۰) *"
                  type="number"
                  value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                  dir="ltr"
                  autoFocus
                  fullWidth
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={publishScore}
                      onChange={(e) => setPublishScore(e.target.checked)}
                    />
                  }
                  label="انتشار نمره برای دانشجو (صدور خودکار مدرک در صورت قبولی)"
                />
              </Stack>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setGradingResult(null)}>انصراف</Button>
            <Button type="submit" form="grade-form" variant="contained" disabled={savingGrade || !gradeScore}>
              {savingGrade ? 'در حال ثبت...' : 'ثبت و انتشار'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  );
}
