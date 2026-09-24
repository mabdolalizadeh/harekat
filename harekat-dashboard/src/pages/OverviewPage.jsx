import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Grid,
  Button,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Divider,
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';

import { useAuth } from '../contexts/AuthContext.jsx';
import { accessApi } from '../api/accessApi.js';
import { sessionsApi } from '../api/sessionsApi.js';
import LessonCard from '../components/courses/LessonCard.jsx';
import LessonModal from '../components/courses/LessonModal.jsx';
import AnimatedPage from '../components/ui/AnimatedPage.jsx';
import SpotlightCard from '../components/ui/SpotlightCard.jsx';
import AnimatedNumber from '../components/ui/AnimatedNumber.jsx';
import { formatPrice, formatDuration, assetUrl, toPersianDigits } from '../utils/formatters.js';

export default function OverviewPage() {
  const { user } = useAuth();
  const [accessibleCourses, setAccessibleCourses] = useState([]);
  const [recommendedCourse, setRecommendedCourse] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [superfocus, setSuperfocus] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState(() => {
    try {
      const saved = localStorage.getItem('completedLessons');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        // Fetch accessible courses and recommended course in parallel
        const [coursesRes, recRes] = await Promise.allSettled([
          accessApi.getMyAccessibleCourses(),
          accessApi.getRecommendedCourse(),
        ]);

        let myCourses = [];
        if (coursesRes.status === 'fulfilled' && coursesRes.value?.ok) {
          myCourses = coursesRes.value.data || [];
          setAccessibleCourses(myCourses);
        }

        if (recRes.status === 'fulfilled' && recRes.value?.ok && recRes.value.data) {
          setRecommendedCourse(recRes.value.data);
        }

        // Fetch sessions for the first active course
        if (myCourses.length > 0) {
          try {
            const firstCourseId = myCourses[0].id;
            const sessionsRes = await sessionsApi.getCourseSessions(firstCourseId);
            if (sessionsRes?.ok && sessionsRes.data?.sessions) {
              const sessionsList = sessionsRes.data.sessions.map((s) => ({
                id: s.id,
                courseId: s.courseId,
                courseName: myCourses[0].name,
                lessonNumber: s.sessionNumber,
                title: s.title,
                duration: '۴۵ دقیقه',
                timeInfo: s.isCompleted ? 'تکمیل شده' : 'در حال یادگیری',
                image: myCourses[0].image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
                videoUrl: s.videoLink || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                description: s.description || 'جلسه آموزشی دوره آنلاین مدرسه حرکت',
                longDescription: s.description || '',
                initialStatus: s.isCompleted ? 'completed' : 'in_progress',
                isCompleted: s.isCompleted,
                sessionLink: s.sessionLink,
                googleDriveLink: s.googleDriveLink,
                groupLink: s.groupLink,
                porslineLink: s.porslineLink,
                porslineAvailable: s.porslineAvailable,
                isFinal: s.isFinal,
              }));

              setUpcomingSessions(sessionsList);
            }
          } catch (sessionErr) {
            console.warn('Could not fetch sessions for active course:', sessionErr);
          }
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const toggleLessonComplete = async (lessonId) => {
    const current = upcomingSessions.find((s) => s.id === lessonId);
    const newStatus = !(current?.isCompleted || completedLessonIds.includes(lessonId));

    try {
      await sessionsApi.updateProgress(lessonId, { isCompleted: newStatus, progressPercent: newStatus ? 100 : 0 });
    } catch (e) {
      console.warn('Could not sync progress to backend:', e);
    }

    setUpcomingSessions((prev) =>
      prev.map((s) =>
        s.id === lessonId
          ? { ...s, isCompleted: newStatus, initialStatus: newStatus ? 'completed' : 'in_progress', timeInfo: newStatus ? 'تکمیل شده' : 'در حال یادگیری' }
          : s
      )
    );

    setCompletedLessonIds((prev) => {
      const exists = prev.includes(lessonId);
      const updated = newStatus ? (exists ? prev : [...prev, lessonId]) : prev.filter((id) => id !== lessonId);
      localStorage.setItem('completedLessons', JSON.stringify(updated));
      return updated;
    });
  };

  // Divide sessions into Kanban columns
  const soonLessons = upcomingSessions.filter((l) => !l.isCompleted && l.initialStatus === 'soon' && !completedLessonIds.includes(l.id));
  const inProgressLessons = upcomingSessions.filter((l) => !l.isCompleted && l.initialStatus === 'in_progress' && !completedLessonIds.includes(l.id));
  const onCheckLessons = upcomingSessions.filter((l) => !l.isCompleted && l.initialStatus === 'on_check' && !completedLessonIds.includes(l.id));
  const completedLessons = upcomingSessions.filter((l) => l.isCompleted || completedLessonIds.includes(l.id) || l.initialStatus === 'completed');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AnimatedPage>
      {/* Top Header: "All lessons" + Superfocus toggle */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3.5,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.35rem', sm: '1.5rem', md: '1.75rem' }, color: 'text.primary', mb: 0.5 }}>
            میز کار و جلسات آموزشی من
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            دسترسی به دوره‌های فعال (<AnimatedNumber value={accessibleCourses.length} /> دوره) و پیگیری جلسات کلاسی
          </Typography>
        </Box>

        {/* Superfocus Switch */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: superfocus ? 'primary.main' : 'divider',
            borderRadius: '9999px',
            px: 2,
            py: 0.4,
            transition: 'all 0.2s ease',
          }}
        >
          <FlashOnIcon sx={{ color: superfocus ? 'primary.main' : 'warning.main', fontSize: 18, mr: 0.5 }} />
          <FormControlLabel
            control={
              <Switch
                checked={superfocus}
                onChange={(e) => setSuperfocus(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: superfocus ? 'primary.main' : 'text.secondary' }}>
                حالت تمرکز (Superfocus)
              </Typography>
            }
            sx={{ m: 0 }}
          />
        </Box>
      </Box>

      {/* RECOMMENDED COURSE */}
      {recommendedCourse && (
        <SpotlightCard
          sx={{
            p: { xs: 2.5, sm: 3 },
            mb: 4,
            borderRadius: '24px',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'primary.light',
            boxShadow: '0 4px 20px -2px rgba(244, 124, 32, 0.12)',
            position: 'relative',
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3.5}>
              <Box
                component="img"
                src={assetUrl(recommendedCourse.image) || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'}
                alt={recommendedCourse.name}
                sx={{
                  width: '100%',
                  height: 170,
                  borderRadius: '18px',
                  objectFit: 'cover',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
                  bgcolor: 'action.hover',
                }}
              />
            </Grid>

            <Grid item xs={12} md={8.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                <Chip
                  icon={<AutoAwesomeIcon sx={{ fontSize: 16, color: 'primary.main' }} />}
                  label="پیشنهاد ویژه مدیر آموزشی برای شما"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.76rem',
                  }}
                />
                {recommendedCourse.level && (
                  <Chip
                    label={`سطح: ${recommendedCourse.level}`}
                    size="small"
                    variant="outlined"
                  />
                )}
                {recommendedCourse.duration && (
                  <Chip
                    icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
                    label={toPersianDigits(formatDuration(recommendedCourse.duration))}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 1, fontSize: { xs: '1.2rem', sm: '1.4rem' } }}>
                {recommendedCourse.name}
              </Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5, lineHeight: 1.7, maxWidth: 700 }}>
                {recommendedCourse.description || 'با ثبت‌نام در این دوره پیشنهادی، مهارت‌های تخصصی خود را به سطح بالاتری برسانید.'}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    شهریه:
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: 'primary.main' }}>
                    {formatPrice(recommendedCourse.salePrice || recommendedCourse.price)}
                  </Typography>
                  {recommendedCourse.salePrice && (
                    <Typography sx={{ textDecoration: 'line-through', color: 'text.disabled', fontSize: '0.85rem' }}>
                      {formatPrice(recommendedCourse.price)}
                    </Typography>
                  )}
                </Box>

                <Button
                  component={NavLink}
                  to={`/courses/${recommendedCourse.id}`}
                  variant="contained"
                  endIcon={<ArrowBackIcon />}
                  sx={{
                    borderRadius: '14px',
                    px: 3,
                    py: 1,
                    fontWeight: 700,
                  }}
                >
                  مشاهده و ثبت‌نام در دوره پیشنهادی
                </Button>
              </Box>
            </Grid>
          </Grid>
        </SpotlightCard>
      )}

      {/* Accessible Courses Overview Bar */}
      {accessibleCourses.length === 0 ? (
        <Card
          sx={{
            p: { xs: 4, sm: 6 },
            textAlign: 'center',
            borderRadius: '24px',
            border: '1px dashed',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            mb: 4,
          }}
        >
          <SchoolOutlinedIcon sx={{ fontSize: 56, color: 'primary.main', mb: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
            شما هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, maxWidth: 460, mx: 'auto', lineHeight: 1.7 }}>
            برای مشاهده جلسات، ویدیوها و دریافت مدرک، پکیج‌های مهارت حرکت یا اشتراک ویژه را فعال فرمایید.
          </Typography>
          <Button
            component={NavLink}
            to="/packages"
            variant="contained"
            sx={{
              borderRadius: '14px',
              px: 3.5,
              py: 1.2,
              fontWeight: 700,
            }}
          >
            مشاهده پکیج‌های مهارت
          </Button>
        </Card>
      ) : (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
              دوره‌های در حال یادگیری شما
            </Typography>
            <Button
              component={NavLink}
              to="/courses"
              size="small"
              sx={{ color: 'primary.main', fontWeight: 700 }}
            >
              مشاهده همه ({toPersianDigits(accessibleCourses.length)})
            </Button>
          </Box>

          <Grid container spacing={2.5}>
            {accessibleCourses.slice(0, 3).map((course, idx) => {
              const progressVal = 40 + (idx * 25) % 60;
              return (
                <Grid item xs={12} sm={6} md={4} key={course.id}>
                  <Card
                    component={NavLink}
                    to={`/courses/${course.id}`}
                    sx={{
                      p: 2,
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <Avatar
                      src={assetUrl(course.image)}
                      variant="rounded"
                      sx={{ width: 56, height: 56, borderRadius: '14px', bgcolor: 'action.hover' }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: 'text.primary',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          mb: 0.5,
                        }}
                      >
                        {course.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          پیشرفت: {toPersianDigits(progressVal)}٪
                        </Typography>
                        <Chip
                          label="ادامه یادگیری"
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            bgcolor: 'action.hover',
                            color: 'primary.main',
                          }}
                        />
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Kanban Columns Grid for Sessions */}
      {upcomingSessions.length > 0 && (
        <>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventNoteOutlinedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
              جلسات کلاسی و برنامه‌ریزی هفتگی
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {/* Column 1: SOON */}
            {!superfocus && (
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label={`به زودی: ${toPersianDigits(soonLessons.length)}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      py: 0.5,
                      px: 0.5,
                    }}
                  />
                </Box>

                <Box>
                  {soonLessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      status="soon"
                      onPlay={(l) => setSelectedLesson(l)}
                    />
                  ))}
                </Box>
              </Grid>
            )}

            {/* Column 2: IN PROGRESS */}
            <Grid item xs={12} sm={6} md={superfocus ? 12 : 3}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Chip
                  label={`در حال یادگیری: ${toPersianDigits(inProgressLessons.length)}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    py: 0.5,
                    px: 0.5,
                  }}
                />
              </Box>

              {/* Feedback Card */}
              <Box
                sx={{
                  p: 2.2,
                  mb: 2,
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #f47c20 0%, #df5b13 100%)',
                  color: '#ffffff',
                  boxShadow: '0 8px 24px -4px rgba(244, 124, 32, 0.35)',
                  position: 'relative',
                }}
              >
                <Typography sx={{ fontSize: '0.78rem', opacity: 0.9, mb: 0.5 }}>
                  پرس‌لاین و بازخورد دوره
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.4, mb: 1.5 }}>
                  از جلسه ۴ به بعد، فرم ارزیابی اساتید را پر کنید و یاقوت پاداش بگیرید!
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(4px)',
                      borderRadius: '9999px',
                      px: 1.2,
                      py: 0.3,
                    }}
                  >
                    <DiamondOutlinedIcon sx={{ fontSize: 14 }} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>+۱ یاقوت</Typography>
                  </Box>
                </Box>
              </Box>

              <Box>
                {inProgressLessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    status="in_progress"
                    onPlay={(l) => setSelectedLesson(l)}
                  />
                ))}
              </Box>
            </Grid>

            {/* Column 3: ON CHECK */}
            {!superfocus && (
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label={`در حال بررسی: ${toPersianDigits(onCheckLessons.length)}`}
                    size="small"
                    color="info"
                    variant="outlined"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      py: 0.5,
                      px: 0.5,
                    }}
                  />
                </Box>

                <Box>
                  {onCheckLessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      status="on_check"
                      onPlay={(l) => setSelectedLesson(l)}
                    />
                  ))}
                </Box>
              </Grid>
            )}

            {/* Column 4: COMPLETED */}
            {!superfocus && (
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label={`تکمیل شده: ${toPersianDigits(completedLessons.length)}`}
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      py: 0.5,
                      px: 0.5,
                    }}
                  />
                </Box>

                <Box>
                  {completedLessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      status="completed"
                      onPlay={(l) => setSelectedLesson(l)}
                    />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </>
      )}

      {/* Lesson Detail Modal */}
      <LessonModal
        lesson={selectedLesson}
        open={Boolean(selectedLesson)}
        onClose={() => setSelectedLesson(null)}
        isCompleted={selectedLesson ? completedLessonIds.includes(selectedLesson.id) : false}
        onToggleComplete={(id) => toggleLessonComplete(id)}
      />
    </AnimatedPage>
  );
}
