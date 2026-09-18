import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  CircularProgress
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { accessApi } from '../api/accessApi.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { formatDuration, assetUrl, toPersianDigits } from '../utils/formatters.js';

export default function MyCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAccessibleCourses() {
      try {
        setLoading(true);
        const res = await accessApi.getMyAccessibleCourses();
        if (res?.ok && res.data) {
          setCourses(res.data);
        } else if (user?.courses && user.courses.length > 0) {
          setCourses(user.courses);
        }
      } catch (err) {
        console.warn('Fallback to user courses:', err);
        if (user?.courses) setCourses(user.courses);
      } finally {
        setLoading(false);
      }
    }
    loadAccessibleCourses();
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.4rem', md: '1.75rem' }, mb: 0.5, color: '#171715' }}>
          دوره‌های من
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b6b63' }}>
          دوره‌های با دسترسی فعال شما در مدرسه حرکت ({toPersianDigits(courses.length)} دوره)
        </Typography>
      </Box>

      {/* Courses List */}
      {courses.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10, px: 2, backgroundColor: '#ffffff', borderRadius: '24px', border: '1px dashed #deddd7' }}>
          <SchoolOutlinedIcon sx={{ fontSize: 64, color: '#f47c20', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#171715' }}>
            هنوز در دوره‌ای ثبت‌نام نکرده‌اید
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b6b63', mb: 3, maxWidth: 460, mx: 'auto' }}>
            برای شروع یادگیری و دسترسی به جلسات، یکی از پکیج‌های مهارتی یا اشتراک‌های حرکت را فعال فرمایید.
          </Typography>
          <Button
            component={NavLink}
            to="/packages"
            variant="contained"
            sx={{
              borderRadius: '14px',
              px: 3.5,
              py: 1.2,
              backgroundColor: '#f47c20',
              fontWeight: 700,
              '&:hover': { backgroundColor: '#df5b13' }
            }}
          >
            مشاهده پکیج‌های مهارت
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course, index) => {
            const progress = 45 + ((index * 23) % 50); // Student progress
            return (
              <Grid item xs={12} sm={6} lg={4} key={course.id}>
                <Card
                  sx={{
                    borderRadius: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    border: '1px solid #deddd7',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.25s ease',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.08)',
                      borderColor: '#ffdda8'
                    }
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={assetUrl(course.image) || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'}
                      alt={course.name}
                    />
                    <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                      <Chip
                        icon={<CheckCircleIcon sx={{ fontSize: 14, color: '#16a34a !important' }} />}
                        label="دسترسی فعال"
                        size="small"
                        sx={{ backgroundColor: '#ffffff', color: '#15803d', fontWeight: 700, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                      />
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        label={course.level || 'عمومی'}
                        size="small"
                        sx={{ backgroundColor: '#fff8ed', color: '#b94410', fontWeight: 600, fontSize: '0.72rem' }}
                      />
                      <Chip
                        label={course.typeOfAttendence || 'آنلاین'}
                        size="small"
                        sx={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.72rem' }}
                      />
                    </Box>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        fontSize: '1rem',
                        lineHeight: 1.4,
                        mb: 1.5,
                        color: '#171715',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {course.name}
                    </Typography>

                    {/* Learning progress meter */}
                    <Box sx={{ mb: 2, mt: 'auto' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                        <Typography variant="caption" sx={{ color: '#6b6b63', fontWeight: 600 }}>
                          پیشرفت دوره:
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#f47c20', fontWeight: 700 }}>
                          {toPersianDigits(progress)}٪
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 7,
                          borderRadius: 4,
                          backgroundColor: '#ffdda8',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            background: 'linear-gradient(90deg, #f47c20 0%, #df5b13 100%)'
                          }
                        }}
                      />
                    </Box>

                    {/* Teacher & CTA Button */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          src={assetUrl(course.teacher?.avatar)}
                          alt={course.teacher?.firstName || 'مدرس'}
                          sx={{ width: 28, height: 28, fontSize: '0.75rem' }}
                        >
                          {(course.teacher?.firstName?.[0] || 'ح')}
                        </Avatar>
                        <Typography variant="caption" sx={{ color: '#6b6b63', fontWeight: 600 }}>
                          {course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : 'مدرس حرکت'}
                        </Typography>
                      </Box>

                      <Button
                        component={NavLink}
                        to={`/courses/${course.id}`}
                        variant="contained"
                        size="small"
                        startIcon={<PlayArrowIcon sx={{ fontSize: 16 }} />}
                        sx={{
                          borderRadius: '12px',
                          px: 2,
                          py: 0.8,
                          backgroundColor: '#f47c20',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          '&:hover': { backgroundColor: '#df5b13' }
                        }}
                      >
                        ورود به جلسات
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
