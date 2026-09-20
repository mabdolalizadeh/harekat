import { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  LinearProgress,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Rating,
  Radio,
  RadioGroup,
  FormControlLabel,
  Stack,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';
import GradeIcon from '@mui/icons-material/Grade';
import AttachFileIcon from '@mui/icons-material/AttachFile';

import { sessionsApi } from '../api/sessionsApi.js';
import { examsApi } from '../api/examsApi.js';
import { assignmentsApi } from '../api/assignmentsApi.js';
import { quizzesApi } from '../api/quizzesApi.js';
import { evaluationsApi } from '../api/evaluationsApi.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { assetUrl, formatDate, toPersianDigits } from '../utils/formatters.js';

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [courseData, setCourseData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({ totalSessions: 0, completedSessions: 0, completionPercentage: 0 });
  const [exam, setExam] = useState(null);
  const [license, setLicense] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [updatingProgress, setUpdatingProgress] = useState(false);

  // Active Tab: 0 = Sessions, 1 = Assignments, 2 = Quizzes, 3 = Exam, 4 = Evaluation, 5 = Certificate
  const [activeTab, setActiveTab] = useState(0);

  // Assignments state
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [submittingAssignment, setSubmittingAssignment] = useState(null);
  const [assignmentSubmissionText, setAssignmentSubmissionText] = useState('');
  const [assignmentFileUrl, setAssignmentFileUrl] = useState('');
  const [savingAssignment, setSavingAssignment] = useState(false);

  // Quizzes state
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [activeQuizModal, setActiveQuizModal] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Evaluation state
  const [evaluationData, setEvaluationData] = useState(null);
  const [loadingEvaluation, setLoadingEvaluation] = useState(false);
  const [overallRating, setOverallRating] = useState(5);
  const [teachingRating, setTeachingRating] = useState(5);
  const [contentRating, setContentRating] = useState(5);
  const [evaluationFeedback, setEvaluationFeedback] = useState('');
  const [submittingEvaluation, setSubmittingEvaluation] = useState(false);

  // Exam dialog state
  const [examDialogOpen, setExamDialogOpen] = useState(false);
  const [submittingExam, setSubmittingExam] = useState(false);
  const [examSubmittedMessage, setExamSubmittedMessage] = useState(null);

  // License dialog state
  const [licenseDialogOpen, setLicenseDialogOpen] = useState(false);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      setAccessDenied(false);

      const res = await sessionsApi.getCourseSessions(id);
      if (res?.ok && res.data) {
        setCourseData(res.data.course);
        const rawSessions = res.data.sessions || [];
        setSessions(rawSessions);
        if (res.data.stats) {
          setStats(res.data.stats);
        } else {
          const completedCount = rawSessions.filter((s) => s.isCompleted).length;
          setStats({
            totalSessions: rawSessions.length,
            completedSessions: completedCount,
            completionPercentage: rawSessions.length > 0 ? Math.round((completedCount / rawSessions.length) * 100) : 0,
          });
        }
        setExam(res.data.exam || null);
        setLicense(res.data.license || null);

        if (rawSessions.length > 0) {
          setActiveSession(rawSessions[0]);
        }
      }
    } catch (err) {
      if (err.status === 403) {
        setAccessDenied(true);
      } else {
        console.error('Error loading course sessions:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseData();
    loadAssignments();
    loadQuizzes();
    loadEvaluation();
  }, [id]);

  const loadAssignments = async () => {
    setLoadingAssignments(true);
    try {
      const res = await assignmentsApi.getCourseAssignments(id);
      setAssignments(res.data || []);
    } catch (err) {
      console.error('Error loading assignments:', err);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const loadQuizzes = async () => {
    setLoadingQuizzes(true);
    try {
      const res = await quizzesApi.getCourseQuizzes(id);
      setQuizzes(res.data || []);
    } catch (err) {
      console.error('Error loading quizzes:', err);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const loadEvaluation = async () => {
    setLoadingEvaluation(true);
    try {
      const res = await evaluationsApi.getMyEvaluation(id);
      setEvaluationData(res.data || null);
      if (res.data?.response) {
        setOverallRating(res.data.response.overallRating || 5);
        setTeachingRating(res.data.response.teachingRating || 5);
        setContentRating(res.data.response.contentRating || 5);
        setEvaluationFeedback(res.data.response.feedback || '');
      }
    } catch (err) {
      console.error('Error loading evaluation:', err);
    } finally {
      setLoadingEvaluation(false);
    }
  };

  const handleToggleSessionComplete = async (sessionId, currentCompleted) => {
    try {
      setUpdatingProgress(true);
      const newStatus = !currentCompleted;
      const res = await sessionsApi.updateProgress(sessionId, {
        isCompleted: newStatus,
        progressPercent: newStatus ? 100 : 0,
      });

      if (res?.ok) {
        setSessions((prev) => {
          const updated = prev.map((s) => (s.id === sessionId ? { ...s, isCompleted: newStatus, progressPercent: newStatus ? 100 : 0 } : s));
          const completedCount = updated.filter((s) => s.isCompleted).length;
          setStats({
            totalSessions: updated.length,
            completedSessions: completedCount,
            completionPercentage: updated.length > 0 ? Math.round((completedCount / updated.length) * 100) : 0,
          });
          return updated;
        });

        if (activeSession?.id === sessionId) {
          setActiveSession((prev) => ({ ...prev, isCompleted: newStatus, progressPercent: newStatus ? 100 : 0 }));
        }
      }
    } catch (err) {
      console.error('Error updating session progress:', err);
    } finally {
      setUpdatingProgress(false);
    }
  };

  const handleOpenSubmitAssignment = (asg) => {
    setSubmittingAssignment(asg);
    setAssignmentSubmissionText(asg.mySubmission?.submissionText || '');
    setAssignmentFileUrl(asg.mySubmission?.fileUrl || '');
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!submittingAssignment) return;
    setSavingAssignment(true);
    try {
      await assignmentsApi.submitAssignment(submittingAssignment.id, {
        submissionText: assignmentSubmissionText.trim(),
        fileUrl: assignmentFileUrl.trim() || null,
      });
      setSubmittingAssignment(null);
      loadAssignments();
    } catch (err) {
      alert(err.message || 'خطا در ثبت پاسخ تکلیف');
    } finally {
      setSavingAssignment(false);
    }
  };

  const handleStartQuiz = async (quiz) => {
    try {
      const res = await quizzesApi.takeQuiz(quiz.id);
      setActiveQuizModal(res.data || quiz);
      setQuizAnswers({});
      setQuizResult(null);
    } catch (err) {
      alert(err.message || 'خطا در شروع آزمونک');
    }
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuizModal) return;
    setSubmittingQuiz(true);
    try {
      const res = await quizzesApi.submitQuiz(activeQuizModal.id, {
        answers: quizAnswers,
        timeSpentSeconds: 60,
      });
      setQuizResult(res.data);
      loadQuizzes();
    } catch (err) {
      alert(err.message || 'خطا در ثبت پاسخ آزمونک');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    setSubmittingEvaluation(true);
    try {
      await evaluationsApi.submitEvaluation(id, {
        overallRating: Number(overallRating),
        teachingRating: Number(teachingRating),
        contentRating: Number(contentRating),
        feedback: evaluationFeedback.trim(),
      });
      loadEvaluation();
      loadCourseData(); // Reload sessions to unlock gated sessions
      alert('نظر شما با موفقیت ثبت شد. با تشکر از ارزیابی شما!');
    } catch (err) {
      alert(err.message || 'خطا در ثبت ارزیابی');
    } finally {
      setSubmittingEvaluation(false);
    }
  };

  const handleSubmitExam = async () => {
    try {
      setSubmittingExam(true);
      const res = await examsApi.submitExam(id);
      if (res?.ok) {
        setExamSubmittedMessage('پاسخ آزمون با موفقیت ارسال شد و پس از تصحیح توسط مدرس/مدیر نتیجه اعلام می‌گردد.');
        setExam((prev) => (prev ? { ...prev, hasTaken: true, status: 'completed' } : prev));
      }
    } catch (err) {
      alert(err.message || 'خطا در ثبت آزمون');
    } finally {
      setSubmittingExam(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (accessDenied || !courseData) {
    return (
      <Box sx={{ py: 6, textAlign: 'center', maxWidth: 540, mx: 'auto', px: 2 }}>
        <Card sx={{ p: { xs: 3, sm: 4 }, borderRadius: '24px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <LockOutlinedIcon sx={{ fontSize: 56, color: 'warning.main', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
            عدم دسترسی به محتوای دوره
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.8 }}>
            شما هنوز دسترسی فعالی به این دوره یا جلسات آن ندارید. برای مشاهده جلسات و ویدیوها، دوره را خریداری فرمایید یا از طریق پکیج‌های مهارتی اقدام نمایید.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              component={NavLink}
              to="/packages"
              variant="contained"
              sx={{
                borderRadius: '14px',
                px: 3,
                py: 1.2,
                fontWeight: 700,
              }}
            >
              مشاهده پکیج‌های مهارت
            </Button>
            <Button
              component={NavLink}
              to="/courses"
              variant="outlined"
              sx={{ borderRadius: '14px', px: 3, py: 1.2 }}
            >
              دوره‌های من
            </Button>
          </Stack>
        </Card>
      </Box>
    );
  }

  const currentVideoUrl = activeSession?.isLocked ? null : (activeSession?.videoLink || courseData.videoUrl);

  return (
    <Box>
      {/* Top Bar: Back & Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Button
          component={NavLink}
          to="/courses"
          startIcon={<ArrowForwardIcon />}
          sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.85rem' }}
        >
          بازگشت به دوره‌های من
        </Button>

        {license && (
          <Button
            variant="contained"
            color="success"
            startIcon={<WorkspacePremiumOutlinedIcon />}
            onClick={() => setLicenseDialogOpen(true)}
            sx={{ borderRadius: '14px', px: 2.5, py: 0.9, fontWeight: 800 }}
          >
            دریافت مدرک پایان دوره
          </Button>
        )}
      </Box>

      {/* Main Tabs Navigation */}
      <Card sx={{ mb: 3, borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: { xs: 1, sm: 2 },
            '& .MuiTab-root': { fontWeight: 700, fontSize: '0.86rem', py: { xs: 1.5, sm: 2 } },
          }}
        >
          <Tab icon={<VideoLibraryOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="جلسات آموزشی" />
          <Tab icon={<AssignmentTurnedInOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`تکالیف (${assignments.length})`} />
          <Tab icon={<FactCheckOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`آزمونک‌ها (${quizzes.length})`} />
          <Tab icon={<GradeIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="آزمون پایانی" />
          <Tab icon={<RateReviewOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="ارزیابی استاد" />
          {license && (
            <Tab icon={<WorkspacePremiumOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="گواهینامه پایان دوره" />
          )}
        </Tabs>
      </Card>

      {/* Tab 0: Sessions & Video Player */}
      {activeTab === 0 && (
        <Grid container spacing={{ xs: 2.5, md: 3 }}>
          {/* Left Column: Video Player & Active Session Details */}
          <Grid item xs={12} lg={8}>
            {/* Locked Session Banner if evaluation is required */}
            {activeSession?.isLocked && (
              <Alert
                severity="warning"
                sx={{ mb: 3, borderRadius: '16px', py: 1.5 }}
                action={
                  <Button color="inherit" size="small" variant="outlined" onClick={() => setActiveTab(4)}>
                    تکمیل ارزیابی استاد
                  </Button>
                }
              >
                {activeSession.lockReason || 'این جلسه به دلیل عدم تکمیل فرم ارزیابی استاد قفل است. لطفا ابتدا فرم ارزیابی را تکمیل فرمایید.'}
              </Alert>
            )}

            {/* Video Player */}
            <Box
              sx={{
                width: '100%',
                height: { xs: 210, sm: 340, md: 400 },
                borderRadius: '24px',
                overflow: 'hidden',
                backgroundColor: '#0f172a',
                mb: 3,
                boxShadow: '0 12px 30px -5px rgba(15, 23, 42, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {activeSession?.isLocked ? (
                <Box sx={{ textAlign: 'center', p: 3, color: '#ffffff' }}>
                  <LockOutlinedIcon sx={{ fontSize: 48, color: '#f59e0b', mb: 1.5 }} />
                  <Typography variant="h6" fontWeight={700}>
                    محتوای این جلسه قفل است
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
                    برای دسترسی به ویدیو و فایل‌های این جلسه، ارزیابی استاد را ثبت فرمایید.
                  </Typography>
                </Box>
              ) : currentVideoUrl ? (
                currentVideoUrl.includes('youtube.com') || currentVideoUrl.includes('aparat.com') ? (
                  <iframe
                    src={currentVideoUrl}
                    title={activeSession?.title || courseData.name}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                  />
                ) : (
                  <video
                    key={currentVideoUrl}
                    src={currentVideoUrl}
                    controls
                    poster={assetUrl(courseData.image)}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                )
              ) : (
                <Box
                  component="img"
                  src={assetUrl(courseData.image) || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                  alt={courseData.name}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </Box>

            {/* Active Session Info */}
            <Card sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: '24px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Chip
                  label={activeSession ? `جلسه شماره ${toPersianDigits(activeSession.sessionNumber)}` : 'جلسه اول'}
                  size="small"
                  sx={{ bgcolor: 'action.hover', fontWeight: 700 }}
                />
                <Chip
                  icon={activeSession?.isLocked ? <LockOutlinedIcon sx={{ fontSize: 16 }} /> : <CheckCircleIcon sx={{ fontSize: 16, color: '#16a34a !important' }} />}
                  label={activeSession?.isLocked ? 'قفل شده (گیت ارزیابی)' : 'دسترسی مجاز'}
                  size="small"
                  color={activeSession?.isLocked ? 'warning' : 'success'}
                  sx={{ fontWeight: 700 }}
                />
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 1.5, fontSize: { xs: '1.2rem', sm: '1.4rem' } }}>
                {activeSession ? activeSession.title : courseData.name}
              </Typography>

              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 3 }}>
                {activeSession?.description || courseData.description}
              </Typography>

              {/* Quick Action Links & Completion Toggle for Active Session */}
              {activeSession && !activeSession.isLocked && (
                <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Button
                      variant={activeSession.isCompleted ? 'contained' : 'outlined'}
                      color={activeSession.isCompleted ? 'success' : 'inherit'}
                      disabled={updatingProgress}
                      onClick={() => handleToggleSessionComplete(activeSession.id, activeSession.isCompleted)}
                      startIcon={activeSession.isCompleted ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                      sx={{
                        borderRadius: '12px',
                        fontWeight: 700,
                        px: 2,
                        py: 0.8,
                      }}
                    >
                      {activeSession.isCompleted ? 'جلسه تکمیل شد ✓' : 'علامت‌گذاری به عنوان تکمیل شده'}
                    </Button>
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {activeSession.sessionLink && (
                      <Button
                        variant="outlined"
                        size="small"
                        component="a"
                        href={activeSession.sessionLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                        sx={{ borderRadius: '12px', fontWeight: 700 }}
                      >
                        لینک کلاس آنلاین
                      </Button>
                    )}

                    {activeSession.googleDriveLink && (
                      <Button
                        variant="outlined"
                        size="small"
                        component="a"
                        href={activeSession.googleDriveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<CloudDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
                        sx={{ borderRadius: '12px', fontWeight: 700 }}
                      >
                        فایل‌های درایو جلسه
                      </Button>
                    )}

                    {activeSession.groupLink && (
                      <Button
                        variant="outlined"
                        size="small"
                        component="a"
                        href={activeSession.groupLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<ForumOutlinedIcon sx={{ fontSize: 16 }} />}
                        sx={{ borderRadius: '12px', fontWeight: 700 }}
                      >
                        گروه تعاملی کلاسی
                      </Button>
                    )}
                  </Box>
                </Box>
              )}
            </Card>
          </Grid>

          {/* Right Column: Sessions List & Progress */}
          <Grid item xs={12} lg={4}>
            {/* Course Progress Summary Card */}
            <Card sx={{ p: 2.5, borderRadius: '24px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  پیشرفت یادگیری دوره
                </Typography>
                <Chip
                  label={`${toPersianDigits(stats.completionPercentage)}٪`}
                  size="small"
                  color={stats.completionPercentage === 100 ? 'success' : 'primary'}
                  sx={{ fontWeight: 800, borderRadius: '8px' }}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={stats.completionPercentage}
                sx={{
                  height: 9,
                  borderRadius: 5,
                  bgcolor: 'action.hover',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 5,
                    bgcolor: stats.completionPercentage === 100 ? 'success.main' : 'primary.main',
                  },
                  mb: 1.5,
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {toPersianDigits(stats.completedSessions)} جلسه از مجموع {toPersianDigits(stats.totalSessions)} جلسه تکمیل شده است.
              </Typography>
            </Card>

            {/* Sessions List Accordion / Card */}
            <Card sx={{ p: 2.5, borderRadius: '24px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 2 }}>
                جلسات آموزشی ({toPersianDigits(sessions.length)} جلسه)
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                {sessions.map((sess, idx) => {
                  const isSelected = activeSession?.id === sess.id;
                  const isFinal = sess.isFinal || idx === sessions.length - 1;

                  return (
                    <Box
                      key={sess.id}
                      onClick={() => setActiveSession(sess)}
                      sx={{
                        p: 1.6,
                        borderRadius: '16px',
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        bgcolor: sess.isLocked ? 'action.hover' : isSelected ? 'action.selected' : 'background.paper',
                        opacity: sess.isLocked ? 0.75 : 1,
                        transition: 'all 0.2s ease',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {sess.isLocked ? (
                            <LockOutlinedIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                          ) : (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleSessionComplete(sess.id, sess.isCompleted);
                              }}
                              sx={{ p: 0.2 }}
                            >
                              {sess.isCompleted ? (
                                <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main' }} />
                              ) : (
                                <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                              )}
                            </IconButton>
                          )}
                          <Typography sx={{ fontWeight: 700, fontSize: '0.86rem', color: isSelected ? 'primary.main' : 'text.primary' }}>
                            جلسه {toPersianDigits(sess.sessionNumber)}: {sess.title}
                          </Typography>
                        </Box>
                        {isFinal && (
                          <Chip
                            label="پایانی"
                            size="small"
                            sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'warning.light', color: 'warning.dark', fontWeight: 700 }}
                          />
                        )}
                      </Box>
                      {sess.isLocked && (
                        <Typography variant="caption" color="warning.main" sx={{ pl: 3.5, display: 'block' }}>
                          نیازمند ارزیابی استاد
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Assignments */}
      {activeTab === 1 && (
        <Stack spacing={3}>
          <Typography variant="h6" fontWeight={800} color="text.primary">
            تکالیف و تمرین‌های دوره
          </Typography>
          {loadingAssignments ? (
            <CircularProgress size={32} />
          ) : assignments.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center', borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Typography color="text.secondary">هنوز تکلیفی برای این دوره تعریف نشده است.</Typography>
            </Card>
          ) : (
            <Grid container spacing={2.5}>
              {assignments.map((asg) => (
                <Grid item xs={12} md={6} key={asg.id}>
                  <Card sx={{ p: 3, borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                      <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                        {asg.title}
                      </Typography>
                      <Chip
                        size="small"
                        label={asg.mySubmission ? (asg.mySubmission.status === 'graded' ? `نمره: ${asg.mySubmission.score} از ${asg.maxScore}` : 'ارسال شده (در انتظار بررسی)') : 'ارسال نشده'}
                        color={asg.mySubmission ? (asg.mySubmission.status === 'graded' ? 'success' : 'info') : 'default'}
                      />
                    </Stack>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1, whiteSpace: 'pre-wrap' }}>
                      {asg.description}
                    </Typography>

                    {asg.fileAttachmentUrl && (
                      <Button
                        component="a"
                        href={asg.fileAttachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        size="small"
                        startIcon={<AttachFileIcon />}
                        sx={{ alignSelf: 'flex-start', mb: 2 }}
                      >
                        دانلود صورت مسئله / ضمیمه
                      </Button>
                    )}

                    {asg.mySubmission?.feedback && (
                      <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: '12px', border: '1px solid', borderColor: 'divider', mb: 2 }}>
                        <Typography variant="caption" color="success.main" fontWeight={700} display="block">
                          بازخورد استاد/دستیار:
                        </Typography>
                        <Typography variant="body2" color="text.primary">{asg.mySubmission.feedback}</Typography>
                      </Box>
                    )}

                    <Button
                      variant={asg.mySubmission ? 'outlined' : 'contained'}
                      onClick={() => handleOpenSubmitAssignment(asg)}
                      sx={{ borderRadius: '12px', fontWeight: 700 }}
                    >
                      {asg.mySubmission ? 'ویرایش ارسال تکلیف' : 'ارسال پاسخ تکلیف'}
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
      )}

      {/* Tab 2: Quizzes */}
      {activeTab === 2 && (
        <Stack spacing={3}>
          <Typography variant="h6" fontWeight={800} color="text.primary">
            آزمونک‌های تستی دوره
          </Typography>
          {loadingQuizzes ? (
            <CircularProgress size={32} />
          ) : quizzes.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center', borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Typography color="text.secondary">هنوز آزمونکی برای این دوره تعریف نشده است.</Typography>
            </Card>
          ) : (
            <Grid container spacing={2.5}>
              {quizzes.map((quiz) => (
                <Grid item xs={12} md={6} key={quiz.id}>
                  <Card sx={{ p: 3, borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                      <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                        {quiz.title}
                      </Typography>
                      <Chip
                        size="small"
                        label={quiz.myBestAttempt ? `بهترین نمره: ${quiz.myBestAttempt.score}٪ (${quiz.myBestAttempt.passed ? 'قبول' : 'مردود'})` : 'شرکت نکرده'}
                        color={quiz.myBestAttempt ? (quiz.myBestAttempt.passed ? 'success' : 'warning') : 'default'}
                      />
                    </Stack>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                      {quiz.description || `تعداد سوالات: ${quiz.questionsCount || (quiz.questions ? quiz.questions.length : 0)} | مدت: ${quiz.durationMinutes} دقیقه`}
                    </Typography>

                    <Button
                      variant="contained"
                      onClick={() => handleStartQuiz(quiz)}
                      sx={{ borderRadius: '12px', fontWeight: 700 }}
                    >
                      {quiz.myBestAttempt ? 'شرکت مجدد در آزمونک' : 'شروع آزمونک'}
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
      )}

      {/* Tab 3: Final Exam */}
      {activeTab === 3 && (
        <Card sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: '24px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', maxWidth: 640 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <AssignmentTurnedInOutlinedIcon sx={{ color: 'primary.main', fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
              آزمون پایان ترم دوره
            </Typography>
          </Box>

          {exam ? (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                {exam.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.8 }}>
                {exam.description || 'برای قبولی در این دوره و دریافت گواهینامه معتبر، پاسخ و پروژه نهایی خود را ارسال فرمایید.'}
              </Typography>

              {exam.hasTaken ? (
                <Box sx={{ p: 2, borderRadius: '14px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', mb: 2 }}>
                  <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, display: 'block', mb: 0.5 }}>
                    وضعیت آزمون پایان ترم:
                  </Typography>
                  {exam.resultPublished ? (
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: exam.passed ? 'success.main' : 'error.main' }}>
                        نمره شما: {toPersianDigits(exam.score)} از {toPersianDigits(exam.maxScore)} ({exam.passed ? 'قبول شده ✓' : 'مردود'})
                      </Typography>
                      {exam.passed && (
                        <Typography variant="caption" sx={{ color: 'success.main', display: 'block', mt: 0.5 }}>
                          تبریک! گواهینامه پایان دوره شما با موفقیت صادر شد.
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      پاسخ آزمون شما ثبت شده و در انتظار بررسی و ثبت نمره توسط مدرس دوره است.
                    </Typography>
                  )}
                </Box>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => setExamDialogOpen(true)}
                  sx={{ borderRadius: '14px', px: 3, py: 1.2, fontWeight: 700 }}
                >
                  ارسال پروژه و ثبت آزمون پایان ترم
                </Button>
              )}
            </Box>
          ) : (
            <Typography color="text.secondary">
              آزمون نهایی این دوره پس از پایان جلسات فعال خواهد شد.
            </Typography>
          )}
        </Card>
      )}

      {/* Tab 4: Evaluation */}
      {activeTab === 4 && (
        <Card sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: '24px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', maxWidth: 640 }}>
          <Typography variant="h6" fontWeight={800} color="text.primary" mb={1}>
            فرم نظرسنجی و ارزیابی استاد دوره
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            نظرات شما به ارتقای کیفیت آموزش کمک شایانی می‌کند. لطفاً با دقت به گزینه‌های زیر امتیاز دهید.
          </Typography>

          {evaluationData?.hasCompleted && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: '14px' }}>
              شما قبلاً فرم ارزیابی این دوره را تکمیل کرده‌اید. در صورت تمایل می‌توانید امتیازات خود را ویرایش فرمایید.
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmitEvaluation}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" fontWeight={700} color="text.primary" mb={0.5}>
                  ۱. رضایت کلی از دوره آموزشی:
                </Typography>
                <Rating
                  value={overallRating}
                  onChange={(_, val) => setOverallRating(val || 1)}
                  size="large"
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" fontWeight={700} color="text.primary" mb={0.5}>
                  ۲. تسلط، شیوه بیان و کیفیت تدریس استاد:
                </Typography>
                <Rating
                  value={teachingRating}
                  onChange={(_, val) => setTeachingRating(val || 1)}
                  size="large"
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" fontWeight={700} color="text.primary" mb={0.5}>
                  ۳. کاربردی بودن محتوا و سرفصل‌های ارائه شده:
                </Typography>
                <Rating
                  value={contentRating}
                  onChange={(_, val) => setContentRating(val || 1)}
                  size="large"
                />
              </Box>

              <TextField
                label="نظرات، پیشنهادات یا انتقادات (اختیاری)"
                multiline
                rows={4}
                value={evaluationFeedback}
                onChange={(e) => setEvaluationFeedback(e.target.value)}
                placeholder="نقاط قوت دوره، پیشنهاد برای جلسات بعدی یا ارتقای کیفیت..."
                fullWidth
              />

              <Button
                type="submit"
                variant="contained"
                disabled={submittingEvaluation}
                sx={{ borderRadius: '14px', py: 1.2, fontWeight: 700 }}
              >
                {submittingEvaluation ? 'در حال ثبت...' : (evaluationData?.hasCompleted ? 'بروزرسانی ارزیابی' : 'ثبت نهایی ارزیابی')}
              </Button>
            </Stack>
          </Box>
        </Card>
      )}

      {/* Tab 5: License / Certificate */}
      {activeTab === 5 && license && (
        <Card sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: '24px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', maxWidth: 640, textAlign: 'center' }}>
          <WorkspacePremiumOutlinedIcon sx={{ fontSize: 72, color: 'primary.main', mb: 1.5 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
            گواهینامه پایان دوره {courseData.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            این گواهینامه رسمی نشان‌دهنده موفقیت شما در اتمام دوره و قبولی در آزمون پایانی است.
          </Typography>

          <Card sx={{ p: 2.5, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', borderRadius: '18px', textAlign: 'right', mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>شماره گواهینامه:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>{license.licenseNumber}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>تاریخ صدور:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{formatDate(license.issueDate)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>وضعیت:</Typography>
              <Chip label="معتبر و تایید شده" color="success" size="small" sx={{ fontWeight: 700 }} />
            </Box>
          </Card>

          {license.certificateUrl && (
            <Button
              variant="contained"
              component="a"
              href={license.certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<CloudDownloadOutlinedIcon />}
              sx={{ borderRadius: '14px', px: 3, py: 1.2, fontWeight: 700 }}
            >
              دانلود نسخه رسمی مدرک (PDF)
            </Button>
          )}
        </Card>
      )}

      {/* Assignment Submission Modal */}
      {submittingAssignment && (
        <Dialog open onClose={() => setSubmittingAssignment(null)} maxWidth="sm" fullWidth dir="rtl">
          <DialogTitle sx={{ fontWeight: 800 }}>
            ارسال پاسخ تکلیف: {submittingAssignment.title}
          </DialogTitle>
          <Box component="form" onSubmit={handleSubmitAssignment}>
            <DialogContent dividers>
              <Stack spacing={2.5}>
                <TextField
                  label="توضیحات یا متن پاسخ تکلیف"
                  multiline
                  rows={4}
                  value={assignmentSubmissionText}
                  onChange={(e) => setAssignmentSubmissionText(e.target.value)}
                  placeholder="توضیحات پروژه، لینک مخزن گیت‌هاب یا پاسخ تمرین..."
                  fullWidth
                />
                <TextField
                  label="لینک فایل ضمیمه (Google Drive / Dropbox / لینک مستقیم)"
                  value={assignmentFileUrl}
                  onChange={(e) => setAssignmentFileUrl(e.target.value)}
                  placeholder="https://..."
                  fullWidth
                  slotProps={{ htmlInput: { dir: 'ltr' } }}
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setSubmittingAssignment(null)}>انصراف</Button>
              <Button type="submit" variant="contained" disabled={savingAssignment}>
                {savingAssignment ? 'در حال ارسال...' : 'ثبت و ارسال'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      )}

      {/* Interactive Quiz Modal */}
      {activeQuizModal && (
        <Dialog open onClose={() => setActiveQuizModal(null)} maxWidth="md" fullWidth dir="rtl">
          <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>آزمونک: {activeQuizModal.title}</span>
            <IconButton onClick={() => setActiveQuizModal(null)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ maxHeight: '75vh' }}>
            {quizResult ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h5" fontWeight={800} color={quizResult.passed ? 'success.main' : 'error.main'} mb={1}>
                  {quizResult.passed ? 'تبریک! آزمونک را با موفقیت پاس کردید ✓' : 'متاسفانه به حد نصاب قبولی نرسیدید'}
                </Typography>
                <Typography variant="h4" fontWeight={800} mb={2}>
                  نمره شما: {quizResult.score}٪
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  حد نصاب قبولی: {activeQuizModal.passingScore}٪
                </Typography>
              </Box>
            ) : (
              <Stack spacing={3}>
                {(activeQuizModal.questions || []).map((q, qIdx) => (
                  <Card key={qIdx} variant="outlined" sx={{ p: 2.5, bgcolor: 'background.paper', borderColor: 'divider' }}>
                    <Typography fontWeight={700} fontSize="0.95rem" mb={1.5} color="text.primary">
                      {qIdx + 1}. {q.question}
                    </Typography>
                    <RadioGroup
                      value={quizAnswers[qIdx] !== undefined ? quizAnswers[qIdx] : ''}
                      onChange={(e) => setQuizAnswers({ ...quizAnswers, [qIdx]: Number(e.target.value) })}
                    >
                      <Grid container spacing={1}>
                        {(q.options || []).map((opt, optIdx) => (
                          <Grid item xs={12} sm={6} key={optIdx}>
                            <FormControlLabel
                              value={optIdx}
                              control={<Radio size="small" />}
                              label={opt}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </RadioGroup>
                  </Card>
                ))}
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            {quizResult ? (
              <Button variant="contained" onClick={() => setActiveQuizModal(null)}>
                بستن
              </Button>
            ) : (
              <>
                <Button onClick={() => setActiveQuizModal(null)}>انصراف</Button>
                <Button
                  variant="contained"
                  disabled={submittingQuiz}
                  onClick={handleSubmitQuiz}
                >
                  {submittingQuiz ? 'در حال محاسبه نمره...' : 'ثبت و پایان آزمونک'}
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      )}

      {/* Exam Dialog */}
      <Dialog
        open={examDialogOpen}
        onClose={() => setExamDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>ثبت آزمون نهایی: {exam?.title}</span>
          <IconButton onClick={() => setExamDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {examSubmittedMessage ? (
            <Alert severity="success" sx={{ borderRadius: '14px' }}>
              {examSubmittedMessage}
            </Alert>
          ) : (
            <Box sx={{ py: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                برای ثبت آزمون و ارسال پروژه نهایی برای مدرس، دکمه ارسال را تایید فرمایید.
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="لینک پروژه نهایی گیت‌هاب یا توضیحات تکمیلی آزمون..."
                sx={{ mb: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {examSubmittedMessage ? (
            <Button variant="contained" onClick={() => setExamDialogOpen(false)} sx={{ borderRadius: '12px' }}>
              بستن
            </Button>
          ) : (
            <>
              <Button onClick={() => setExamDialogOpen(false)} sx={{ borderRadius: '12px' }}>
                انصراف
              </Button>
              <Button
                variant="contained"
                disabled={submittingExam}
                onClick={handleSubmitExam}
                sx={{ borderRadius: '12px', fontWeight: 700 }}
              >
                {submittingExam ? <CircularProgress size={20} color="inherit" /> : 'ثبت و ارسال نهایی'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* License Certificate Dialog */}
      <Dialog
        open={licenseDialogOpen}
        onClose={() => setLicenseDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>گواهینامه رسمی پایان دوره حرکت</span>
          <IconButton onClick={() => setLicenseDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {license ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <WorkspacePremiumOutlinedIcon sx={{ fontSize: 64, color: 'primary.main', mb: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
                گواهینامه پایان دوره {courseData.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                این مدرک نشان‌دهنده قبولی موفقیت‌آمیز شما در آزمون نهایی و اتمام سرفصل‌های دوره است.
              </Typography>

              <Card sx={{ p: 2.5, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', borderRadius: '18px', textAlign: 'right', mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>شماره گواهینامه:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>{license.licenseNumber}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>تاریخ صدور:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{formatDate(license.issueDate)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>وضعیت:</Typography>
                  <Chip label="معتبر و تایید شده" color="success" size="small" sx={{ fontWeight: 700 }} />
                </Box>
              </Card>

              {license.certificateUrl && (
                <Button
                  variant="contained"
                  component="a"
                  href={license.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<CloudDownloadOutlinedIcon />}
                  sx={{ borderRadius: '14px', px: 3, py: 1.2, fontWeight: 700 }}
                >
                  دانلود نسخه رسمی مدرک (PDF)
                </Button>
              )}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => setLicenseDialogOpen(false)} sx={{ borderRadius: '12px' }}>
            بستن
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
