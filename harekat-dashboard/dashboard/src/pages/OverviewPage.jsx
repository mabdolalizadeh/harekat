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

// Realistic syllabus sessions for LMS preview (reproducing the Dribbble reference columns)
const DEFAULT_CURRICULUM = [
  {
    id: 'lesson-1',
    lessonNumber: 4,
    title: 'مفاهیم پیشرفته کامپوننت‌ها و هوک‌های سفارشی',
    duration: '۴۵ دقیقه',
    timeInfo: 'تکمیل شده',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'آشنایی با هوک‌های اختصاصی، بازاستفاده منطق و چرخه حیات کامپوننت.',
    longDescription: '# جلسه چهارم: هوک‌های سفارشی\n\nدر این جلسه با نحوه تعریف Custom Hooks و جداسازی منطق بیزینس از لایه نمایش آشنا شدیم.',
    initialStatus: 'completed'
  },
  {
    id: 'lesson-2',
    lessonNumber: 5,
    title: 'مدیریت وضعیت سراسری با React Context و Reducer',
    duration: '۵۰ دقیقه',
    timeInfo: 'تکمیل شده',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'پیاده‌سازی استیت منیجمنت یکپارچه و بهینه‌سازی دفعات رندر مجدد.',
    longDescription: '# جلسه پنجم: مدیریت وضعیت\n\nپیاده‌سازی کانتکست‌های مجزا برای احراز هویت، تم و سبد خرید.',
    initialStatus: 'completed'
  },
  {
    id: 'lesson-3',
    lessonNumber: 6,
    title: 'ارسال تمرین فرم‌های پیشرفته و اعتبارسنجی ورودی‌ها',
    duration: '۳۵ دقیقه',
    timeInfo: '۴ روز پیش',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'اعتبارسنجی ورودی‌های کاربر با کتابخانه‌های فرم و ارسال پاسخ به سرور.',
    longDescription: '# جلسه ششم: اعتبارسنجی و فرم‌ها\n\nتکلیف این جلسه ارسال شده و توسط استاد در حال بررسی است.',
    initialStatus: 'on_check'
  },
  {
    id: 'lesson-4',
    lessonNumber: 7,
    title: 'اتصال به REST API، کشینگ داده‌ها و هندل خطاها',
    duration: '۲:۳۲:۰۸',
    timeInfo: '۲:۳۲:۰۸ باقی‌مانده',
    image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'اتصال پروژه به وب‌سرویس‌های واقعی و مدیریت لودینگ، ارور و خالی بودن داده‌ها.',
    longDescription: '# جلسه هفتم: ارتباط با بک‌اند و REST API\n\n- تنظیم کلاینت اختصاصی Fetch با Bearer Token\n- مدیریت خطاهای شبکه و توکن منقضی\n- تمرین کلاسی: پیاده‌سازی اتصال سبد خرید به سرور',
    initialStatus: 'in_progress'
  },
  {
    id: 'lesson-5',
    lessonNumber: 8,
    title: 'پیاده‌سازی تست‌های واحد و کامپوننت با Vitest',
    duration: '۴۰ دقیقه',
    timeInfo: '۱۹ اردیبهشت، ساعت ۱۹:۰۰',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'نوشتن تست‌های اتوماتیک برای کامپوننت‌های فرم و جریان خرید.',
    longDescription: '# جلسه هشتم: تست نرم‌افزار\n\nجلسه آنلاین در تاریخ ۱۹ اردیبهشت برگزار خواهد شد.',
    initialStatus: 'soon'
  },
  {
    id: 'lesson-6',
    lessonNumber: 9,
    title: 'بهینه‌سازی عملکرد (Performance) و تکنیک‌های Bundle Splitting',
    duration: '۴۵ دقیقه',
    timeInfo: '۲۱ اردیبهشت، ساعت ۱۹:۰۰',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'کاهش حجم باندل فرانت‌اند، Lazy loading و استراتژی‌های کش مرورگر.',
    longDescription: '# جلسه نهم: بهینه‌سازی سرعت و حجم باندل\n\nجلسه آنلاین در تاریخ ۲۱ اردیبهشت برگزار خواهد شد.',
    initialStatus: 'soon'
  },
  {
    id: 'lesson-7',
    lessonNumber: 10,
    title: 'پروژه نهایی: استقرار پروداکشن و سئو در وب مدرن',
    duration: '۶۰ دقیقه',
    timeInfo: '۲۵ اردیبهشت، ساعت ۲۰:۰۰',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'استقرار روی سرورهای ابری، بیلد و ارائه گواهینامه معتبر پایان دوره.',
    longDescription: '# جلسه دهم: استقرار نهایی و دریافت گواهینامه\n\nجلسه اختتامیه و ارزیابی پروژه‌های دانش‌آموزان.',
    initialStatus: 'soon'
  }
];

export default function OverviewPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [superfocus, setSuperfocus] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState(() => {
    try {
      const saved = localStorage.getItem('completedLessons');
      return saved ? JSON.parse(saved) : ['lesson-1', 'lesson-2'];
    } catch {
      return ['lesson-1', 'lesson-2'];
    }
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await coursesApi.getCourses();
        if (res?.ok && res.data && res.data.length > 0) {
          setCourses(res.data);
        }
      } catch (err) {
        console.warn('Using preview curriculum for overview:', err);
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

  // Base lessons from realistic curriculum, blended with real course metadata if available
  const activeCourse = (courses.length > 0 ? courses[0] : null) || user?.courses?.[0];

  const lessons = DEFAULT_CURRICULUM.map((item) => {
    if (activeCourse && item.id === 'lesson-4') {
      return {
        ...item,
        title: `${item.title} — ${activeCourse.name}`,
        image: activeCourse.image || item.image,
        videoUrl: activeCourse.videoUrl || item.videoUrl
      };
    }
    return item;
  });

  // Distribute into Dribbble columns: SOON, IN PROGRESS, ON CHECK, COMPLETED
  const soonLessons = lessons.filter((l) => l.initialStatus === 'soon' && !completedLessonIds.includes(l.id));
  const inProgressLessons = lessons.filter((l) => l.initialStatus === 'in_progress' && !completedLessonIds.includes(l.id));
  const onCheckLessons = lessons.filter((l) => l.initialStatus === 'on_check' && !completedLessonIds.includes(l.id));
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
            backgroundColor: superfocus ? '#fff8ed' : '#ffffff',
            border: superfocus ? '1px solid #ffdda8' : '1px solid #deddd7',
            borderRadius: '9999px',
            px: 2,
            py: 0.4,
            transition: 'all 0.2s ease',
            gap: 0.8
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={superfocus}
                onChange={(e) => setSuperfocus(e.target.checked)}
                size="small"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#f47c20'
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#ffa33f'
                  }
                }}
              />
            }
            label={
              <Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: superfocus ? '#f47c20' : '#55554f' }}>
                حالت تمرکز (Superfocus)
              </Typography>
            }
            sx={{ m: 0 }}
          />
          <FlashOnIcon sx={{ color: superfocus ? '#f47c20' : '#d99400', fontSize: 18 }} />
        </Box>
      </Box>

      {/* Kanban Columns Grid matching Dribbble reference */}
      <Grid container spacing={2.5}>
        {/* Column 1: SOON */}
        {!superfocus && (
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip
                label={`به زودی: ${toPersianDigits(soonLessons.length)}`}
                size="small"
                sx={{
                  backgroundColor: '#ffffff',
                  color: '#6b6b63',
                  border: '1px solid #deddd7',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  py: 0.5,
                  px: 0.5
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

              <Button
                endIcon={<ExpandMoreIcon />}
                fullWidth
                sx={{ color: '#6b6b63', fontSize: '0.8rem', fontWeight: 600, py: 1, '&:hover': { color: '#f47c20' } }}
              >
                نمایش جلسات بیشتر
              </Button>
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
                backgroundColor: '#fff8ed',
                color: '#b94410',
                border: '1px solid #ffdda8',
                fontWeight: 700,
                fontSize: '0.75rem',
                py: 0.5,
                px: 0.5
              }}
            />
          </Box>

          {/* Dribbble Reference: Interactive Featured Card */}
          <Box
            sx={{
              p: 2.2,
              mb: 2,
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #f47c20 0%, #df5b13 100%)',
              color: '#ffffff',
              boxShadow: '0 8px 24px -4px rgba(244, 124, 32, 0.35)',
              position: 'relative'
            }}
          >
            <Typography sx={{ fontSize: '0.78rem', opacity: 0.9, mb: 0.5 }}>
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
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: '9999px',
                  px: 1.2,
                  py: 0.4
                }}
              >
                <Typography sx={{ fontSize: '0.74rem', fontWeight: 700 }}>پاداش: +۱</Typography>
                <DiamondOutlinedIcon sx={{ fontSize: 14 }} />
              </Box>

              <IconButton
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  borderRadius: '10px',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.4)' }
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
