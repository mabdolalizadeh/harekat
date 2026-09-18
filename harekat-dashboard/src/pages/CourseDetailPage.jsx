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
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import PollOutlinedIcon from '@mui/icons-material/PollOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';

import { sessionsApi } from '../api/sessionsApi.js';
import { examsApi } from '../api/examsApi.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { formatDuration, assetUrl, formatDate, toPersianDigits } from '../utils/formatters.js';

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [courseData, setCourseData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [exam, setExam] = useState(null);
  const [license, setLicense] = useState(null);
  const [activeSession, setActiveSession] = useState(null);

  // Exam dialog state
  const [examDialogOpen, setExamDialogOpen] = useState(false);
  const [submittingExam, setSubmittingExam] = useState(false);
  const [examSubmittedMessage, setExamSubmittedMessage] = useState(null);

  // License dialog state
  const [licenseDialogOpen, setLicenseDialogOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setAccessDenied(false);

        const res = await sessionsApi.getCourseSessions(id);
        if (res?.ok && res.data) {
          setCourseData(res.data.course);
          const rawSessions = res.data.sessions || [];
          setSessions(rawSessions);
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
    }
    loadData();
  }, [id]);

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

  // If student does not have active access (enforced by backend 403)
  if (accessDenied || !courseData) {
    return (
      <Box sx={{ py: 6, textAlign: 'center', maxWidth: 540, mx: 'auto' }}>
        <Card sx={{ p: 4, borderRadius: '24px', border: '1px solid #ffdda8', backgroundColor: '#fff8ed' }}>
          <LockOutlinedIcon sx={{ fontSize: 56, color: '#f47c20', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#171715' }}>
            عدم دسترسی به محتوای دوره
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b6b63', mb: 3, lineHeight: 1.8 }}>
            شما هنوز دسترسی فعالی به این دوره یا جلسات آن ندارید. برای مشاهده جلسات و ویدیوها، دوره را خریداری فرمایید یا از طریق پکیج‌های مهارتی اقدام نمایید.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              component={NavLink}
              to="/catalog"
              variant="contained"
              sx={{
                borderRadius: '14px',
                px: 3,
                py: 1.2,
                backgroundColor: '#f47c20',
                fontWeight: 700,
                '&:hover': { backgroundColor: '#df5b13' }
              }}
            >
              مشاهده کاتالوگ دوره‌ها
            </Button>
            <Button
              component={NavLink}
              to="/courses"
              variant="outlined"
              sx={{ borderRadius: '14px', px: 3, py: 1.2, borderColor: '#deddd7', color: '#55554f' }}
            >
              دوره‌های من
            </Button>
          </Box>
        </Card>
      </Box>
    );
  }

  const currentVideoUrl = activeSession?.videoLink || courseData.videoUrl;

  return (
    <Box>
      {/* Top Bar: Back & Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Button
          component={NavLink}
          to="/courses"
          startIcon={<ArrowForwardIcon />}
          sx={{ color: '#6b6b63', fontWeight: 600, fontSize: '0.85rem' }}
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

      {/* Main Content Layout */}
      <Grid container spacing={3}>
        {/* Left Column: Video Player & Active Session Details */}
        <Grid item xs={12} lg={8}>
          {/* Video Player */}
          <Box
            sx={{
              width: '100%',
              height: { xs: 220, sm: 400 },
              borderRadius: '24px',
              overflow: 'hidden',
              backgroundColor: '#0f172a',
              mb: 3,
              boxShadow: '0 12px 30px -5px rgba(15, 23, 42, 0.2)'
            }}
          >
            {currentVideoUrl ? (
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
          <Card sx={{ p: 3, borderRadius: '24px', border: '1px solid #deddd7', backgroundColor: '#ffffff', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label={activeSession ? `جلسه شماره ${toPersianDigits(activeSession.sessionNumber)}` : 'جلسه اول'}
                size="small"
                sx={{ backgroundColor: '#fff8ed', color: '#b94410', fontWeight: 700 }}
              />
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: 16, color: '#16a34a !important' }} />}
                label="دسترسی مجاز"
                size="small"
                sx={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 700 }}
              />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 800, color: '#171715', mb: 1.5 }}>
              {activeSession ? activeSession.title : courseData.name}
            </Typography>

            <Typography variant="body1" sx={{ color: '#55554f', lineHeight: 1.8, mb: 3 }}>
              {activeSession?.description || courseData.description}
            </Typography>

            {/* Quick Action Links for Active Session */}
            {activeSession && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, pt: 2, borderTop: '1px solid #deddd7' }}>
                {/* 1. Live Session Link */}
                {activeSession.sessionLink && (
                  <Button
                    variant="outlined"
                    size="small"
                    component="a"
                    href={activeSession.sessionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                    sx={{ borderRadius: '12px', fontWeight: 700, borderColor: '#deddd7', color: '#f47c20' }}
                  >
                    لینک کلاس آنلاین
                  </Button>
                )}

                {/* 2. Google Drive Link */}
                {activeSession.googleDriveLink && (
                  <Button
                    variant="outlined"
                    size="small"
                    component="a"
                    href={activeSession.googleDriveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<CloudDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
                    sx={{ borderRadius: '12px', fontWeight: 700, borderColor: '#deddd7', color: '#2563eb' }}
                  >
                    فایل‌های درایو جلسه
                  </Button>
                )}

                {/* 3. Group Link */}
                {activeSession.groupLink && (
                  <Button
                    variant="outlined"
                    size="small"
                    component="a"
                    href={activeSession.groupLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<ForumOutlinedIcon sx={{ fontSize: 16 }} />}
                    sx={{ borderRadius: '12px', fontWeight: 700, borderColor: '#deddd7', color: '#16a34a' }}
                  >
                    گروه تعاملی کلاسی
                  </Button>
                )}

                {/* 4. Porsline Link (Gated strictly on backend session >= 4) */}
                {activeSession.porslineAvailable && activeSession.porslineLink ? (
                  <Button
                    variant="contained"
                    size="small"
                    component="a"
                    href={activeSession.porslineLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<PollOutlinedIcon sx={{ fontSize: 16 }} />}
                    sx={{ borderRadius: '12px', fontWeight: 700, backgroundColor: '#f47c20', '&:hover': { backgroundColor: '#df5b13' } }}
                  >
                    پرس‌لاین و نظرسنجی جلسه
                  </Button>
                ) : (
                  <Tooltip title="فرم نظرسنجی پرس‌لاین از جلسه ۴ به بعد فعال می‌شود" arrow>
                    <span>
                      <Button
                        variant="outlined"
                        disabled
                        size="small"
                        startIcon={<LockOutlinedIcon sx={{ fontSize: 16 }} />}
                        sx={{ borderRadius: '12px', fontWeight: 600 }}
                      >
                        پرس‌لاین (قفل تا جلسه ۴)
                      </Button>
                    </span>
                  </Tooltip>
                )}
              </Box>
            )}
          </Card>
        </Grid>

        {/* Right Column: Sessions List & Exam Card */}
        <Grid item xs={12} lg={4}>
          {/* Sessions List Accordion / Card */}
          <Card sx={{ p: 2.5, borderRadius: '24px', border: '1px solid #deddd7', backgroundColor: '#ffffff', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#171715', mb: 2 }}>
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
                      border: isSelected ? '2px solid #f47c20' : '1px solid #deddd7',
                      backgroundColor: isSelected ? '#fff8ed' : '#ffffff',
                      transition: 'all 0.2s ease',
                      '&:hover': { backgroundColor: isSelected ? '#fff8ed' : '#f7f5f0' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PlayCircleOutlineIcon sx={{ fontSize: 18, color: isSelected ? '#f47c20' : '#72726a' }} />
                        <Typography sx={{ fontWeight: 700, fontSize: '0.86rem', color: isSelected ? '#f47c20' : '#171715' }}>
                          جلسه {toPersianDigits(sess.sessionNumber)}: {sess.title}
                        </Typography>
                      </Box>
                      {isFinal && (
                        <Chip
                          label="پایانی"
                          size="small"
                          sx={{ height: 20, fontSize: '0.65rem', backgroundColor: '#fef3c7', color: '#b45309', fontWeight: 700 }}
                        />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 3 }}>
                      {sess.porslineAvailable ? (
                        <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 600 }}>
                          ✓ پرس‌لاین فعال
                        </Typography>
                      ) : (
                        <Typography variant="caption" sx={{ color: '#9b9b92' }}>
                          پرس‌لاین قفل
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Card>

          {/* Exam Card (Locked until final session) */}
          <Card
            sx={{
              p: 2.5,
              borderRadius: '24px',
              border: exam ? '2px solid #3b82f6' : '1px solid #deddd7',
              backgroundColor: exam ? '#f0f7ff' : '#ffffff'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <AssignmentTurnedInOutlinedIcon sx={{ color: '#2563eb', fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#171715', fontSize: '1rem' }}>
                آزمون نهایی دوره
              </Typography>
            </Box>

            {exam ? (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#171715', mb: 0.5 }}>
                  {exam.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#55554f', fontSize: '0.82rem', mb: 2 }}>
                  {exam.description || 'برای قبولی در این دوره، کسب حداقل نمره ۷۰ از ۱۰۰ الزامی است.'}
                </Typography>

                {exam.hasTaken ? (
                  <Box sx={{ p: 1.8, borderRadius: '14px', backgroundColor: '#ffffff', border: '1px solid #bfdbfe', mb: 2 }}>
                    <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 700, display: 'block', mb: 0.5 }}>
                      وضعیت آزمون:
                    </Typography>
                    {exam.resultPublished ? (
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: exam.passed ? '#15803d' : '#e11d48' }}>
                          نمره شما: {toPersianDigits(exam.score)} از {toPersianDigits(exam.maxScore)} ({exam.passed ? 'قبول شده ✓' : 'مردود'})
                        </Typography>
                        {exam.passed && (
                          <Typography variant="caption" sx={{ color: '#15803d', display: 'block', mt: 0.5 }}>
                            تبریک! گواهینامه معتبر شما صادر گردید.
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.82rem' }}>
                        آزمون شما ثبت شده و هم‌اکنون در انتظار بررسی و تصحیح توسط مدرس دوره است.
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => setExamDialogOpen(true)}
                    sx={{
                      py: 1,
                      borderRadius: '14px',
                      backgroundColor: '#2563eb',
                      fontWeight: 700,
                      '&:hover': { backgroundColor: '#1d4ed8' }
                    }}
                  >
                    شروع و ثبت پاسخ آزمون
                  </Button>
                )}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: '#6b6b63', fontSize: '0.84rem' }}>
                آزمون نهایی این دوره پس از اتمام تمامی جلسات آموزشی توسط مدیر منتشر خواهد شد.
              </Typography>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Exam Submission Dialog */}
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
              <Typography variant="body2" sx={{ color: '#55554f', mb: 2 }}>
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
              <Button onClick={() => setExamDialogOpen(false)} sx={{ borderRadius: '12px', color: '#6b6b63' }}>
                انصراف
              </Button>
              <Button
                variant="contained"
                disabled={submittingExam}
                onClick={handleSubmitExam}
                sx={{ borderRadius: '12px', backgroundColor: '#2563eb', fontWeight: 700 }}
              >
                {submittingExam ? <CircularProgress size={20} color="inherit" /> : 'ثبت و ارسال نهایی'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* License Certificate Dialog ("Get License" / "دریافت مدرک") */}
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
              <WorkspacePremiumOutlinedIcon sx={{ fontSize: 64, color: '#f47c20', mb: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#171715', mb: 1 }}>
                گواهینامه پایان دوره {courseData.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#55554f', mb: 3 }}>
                این مدرک نشان‌دهنده قبولی موفقیت‌آمیز شما در آزمون نهایی و اتمام سرفصل‌های دوره است.
              </Typography>

              <Card sx={{ p: 2.5, backgroundColor: '#f8fafc', borderRadius: '18px', textAlign: 'right', mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>شماره گواهینامه:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>{license.licenseNumber}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>تاریخ صدور:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatDate(license.issueDate)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>وضعیت:</Typography>
                  <Chip label="معتبر و تایید شده" color="success" size="small" sx={{ fontWeight: 700 }} />
                </Box>
              </Card>

              {license.certificateUrl ? (
                <Button
                  variant="contained"
                  component="a"
                  href={license.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<CloudDownloadOutlinedIcon />}
                  sx={{ borderRadius: '14px', px: 3, py: 1.2, backgroundColor: '#f47c20', fontWeight: 700 }}
                >
                  دانلود نسخه رسمی مدرک (PDF)
                </Button>
              ) : (
                <Alert severity="info" sx={{ borderRadius: '12px' }}>
                  فایل نهایی مدرک توسط آموزشگاه تایید شده و برای شما فعال است.
                </Alert>
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
