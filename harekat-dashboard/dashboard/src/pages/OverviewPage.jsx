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
  IconButton
} from '@mui/material';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuth } from '../contexts/AuthContext.jsx';
import { coursesApi } from '../api/coursesApi.js';
import LessonCard from '../components/courses/LessonCard.jsx';
import LessonModal from '../components/courses/LessonModal.jsx';
import { toPersianDigits } from '../utils/formatters.js';

export default function OverviewPage() {
  const { user, refreshUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [superfocus, setSuperfocus] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState(() => {
    try {
      const saved = localStorage.getItem('completedLessons');
      return saved ? JSON.parse(saved) : ['l_sample_completed'];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await coursesApi.getCourses();
        if (res?.ok && res.data) {
          setCourses(res.data);
        }
      } catch (err) {
        console.warn('Failed to load courses for overview:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleLessonComplete = (lessonId) => {
    setCompletedLessonIds((prev) => {
      const exists = prev.includes(lessonId);
      const updated = exists ? prev.filter((id) => id !== lessonId) : [...prev, lessonId];
      localStorage.setItem('completedLessons', JSON.stringify(updated));
      return updated;
    });
  };

  // Build lesson items from enrolled courses or catalog courses
  const enrolledCourses = user?.courses?.length > 0 ? user.courses : courses;

  const lessons = enrolledCourses.map((c, index) => ({
    id: c.id,
    lessonNumber: index + 1,
    title: c.name,
    duration: c.duration || '۲۰ ساعت',
    timeInfo: `${index + 6} عصر، ${index + 12} اردیبهشت`,
    image: c.image,
    videoUrl: c.videoUrl,
    description: c.description,
    longDescription: c.longDescription,
    level: c.level,
    teacher: c.teacher || (c.teachers && c.teachers[0]),
    isEnrolled: user?.courses?.some((uc) => uc.id === c.id)
  }));

  // Distribute into Dribbble columns: SOON, IN PROGRESS, ON CHECK, COMPLETED
  const soonLessons = lessons.filter((l, i) => i >= 3 && !completedLessonIds.includes(l.id));
  const inProgressLessons = lessons.filter((l, i) => (i === 0 || i === 1) && !completedLessonIds.includes(l.id));
  const onCheckLessons = lessons.filter((l, i) => i === 2 && !completedLessonIds.includes(l.id));
  const completedLessons = lessons.filter((l) => completedLessonIds.includes(l.id));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Top Header: "All lessons" + Superfocus toggle */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3.5
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.4rem', md: '1.75rem' }, color: '#0f172a' }}>
          تمام درس‌ها و جلسات
        </Typography>

        {/* Superfocus Switch matching Dribbble reference */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: superfocus ? '#eff6ff' : '#f8fafc',
            border: superfocus ? '1px solid #bfdbfe' : '1px solid #eef2f6',
            borderRadius: '9999px',
            px: 2,
            py: 0.4,
            transition: 'all 0.2s ease'
          }}
        >
          <FlashOnIcon sx={{ color: superfocus ? '#2563eb' : '#f59e0b', fontSize: 18, mr: 0.5 }} />
          <FormControlLabel
            control={
              <Switch
                checked={superfocus}
                onChange={(e) => setSuperfocus(e.target.checked)}
                size="small"
                color="primary"
              />
            }
            label={
              <Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: superfocus ? '#2563eb' : '#475569' }}>
                حالت تمرکز (Superfocus)
              </Typography>
            }
            sx={{ m: 0 }}
          />
        </Box>
      </Box>

      {/* Kanban Columns Grid */}
      <Grid container spacing={2.5}>
        {/* Column 1: SOON */}
        {!superfocus && (
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip
                label={`به زودی: ${toPersianDigits(soonLessons.length)}`}
                size="small"
                sx={{
                  backgroundColor: '#f1f5f9',
                  color: '#64748b',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  py: 0.5,
                  px: 0.5
                }}
              />
            </Box>

            <Box>
              {soonLessons.slice(0, 3).map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  status="soon"
                  onPlay={(l) => setSelectedLesson(l)}
                />
              ))}

              {soonLessons.length > 3 && (
                <Button
                  endIcon={<ExpandMoreIcon />}
                  fullWidth
                  sx={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, py: 1 }}
                >
                  نمایش بیشتر
                </Button>
              )}

              {soonLessons.length === 0 && (
                <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center', py: 3 }}>
                  درس آینده‌ای در این بخش نیست.
                </Typography>
              )}
            </Box>
          </Grid>
        )}

        {/* Column 2: IN PROGRESS (Featured column in Dribbble reference) */}
        <Grid item xs={12} sm={6} md={superfocus ? 12 : 3}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Chip
              label={`در حال یادگیری: ${toPersianDigits(inProgressLessons.length)}`}
              size="small"
              sx={{
                backgroundColor: '#fef3c7',
                color: '#b45309',
                fontWeight: 700,
                fontSize: '0.75rem',
                py: 0.5,
                px: 0.5
              }}
            />
          </Box>

          {/* Dribbble Reference: Blue Interactive Featured Card */}
          <Box
            sx={{
              p: 2.2,
              mb: 2,
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              boxShadow: '0 12px 28px -6px rgba(37, 99, 235, 0.35)',
              position: 'relative'
            }}
          >
            <Typography sx={{ fontSize: '0.78rem', opacity: 0.85, mb: 0.5 }}>
              نظرسنجی و ارزیابی
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.4, mb: 2 }}>
              فرم بازخورد دوره را تکمیل کنید تا یاقوت دریافت کنید!
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: '9999px',
                  px: 1.2,
                  py: 0.4
                }}
              >
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 600 }}>پاداش:</Typography>
                <DiamondOutlinedIcon sx={{ fontSize: 14 }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>+۱</Typography>
              </Box>

              <IconButton
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  borderRadius: '10px',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.35)' }
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>

          {/* Active in-progress lessons */}
          <Box>
            {inProgressLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                status="in_progress"
                onPlay={(l) => setSelectedLesson(l)}
              />
            ))}

            {inProgressLessons.length === 0 && (
              <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center', py: 3 }}>
                جلسه در حال یادگیری ندارید.
              </Typography>
            )}
          </Box>
        </Grid>

        {/* Column 3: ON CHECK */}
        {!superfocus && (
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip
                label={`در حال بررسی: ${toPersianDigits(onCheckLessons.length)}`}
                size="small"
                sx={{
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  py: 0.5,
                  px: 0.5
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

              {onCheckLessons.length === 0 && (
                <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center', py: 3 }}>
                  تکلیفی در انتظار بررسی نیست.
                </Typography>
              )}
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
                sx={{
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  py: 0.5,
                  px: 0.5
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

              {completedLessons.length === 0 && (
                <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center', py: 3 }}>
                  هنوز جلسه‌ای به پایان نرسیده است.
                </Typography>
              )}
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Interactive Lesson Modal */}
      <LessonModal
        lesson={selectedLesson}
        open={Boolean(selectedLesson)}
        onClose={() => setSelectedLesson(null)}
        isCompleted={selectedLesson ? completedLessonIds.includes(selectedLesson.id) : false}
        onToggleComplete={(id) => toggleLessonComplete(id)}
      />
    </Box>
  );
}
