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
  CircularProgress,
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { accessApi } from '../api/accessApi.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { assetUrl, toPersianDigits } from '../utils/formatters.js';

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
        <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.35rem', sm: '1.5rem', md: '1.75rem' }, mb: 0.5, color: 'text.primary' }}>
          دوره‌های من
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          دوره‌های با دسترسی فعال شما در مدرسه حرکت ({toPersianDigits(courses.length)} دوره)
        </Typography>
      </Box>

      {/* Courses List */}
      {courses.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: { xs: 6, sm: 8, md: 10 }, px: 3, borderRadius: '24px', border: '1px dashed', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <SchoolOutlinedIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
            هنوز در دوره‌ای ثبت‌نام نکرده‌اید
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, maxWidth: 460, mx: 'auto', lineHeight: 1.7 }}>
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
              fontWeight: 700,
            }}
          >
            مشاهده پکیج‌های مهارت
          </Button>
        </Card>
      ) : (
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {courses.map((course) => {
            const progress = course.progress !== undefined ? course.progress : 0;
            return (
              <Grid item xs={12} sm={6} lg={4} key={course.id}>
                <Card
                  sx={{
                    borderRadius: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    transition: 'all 0.25s ease',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.15)',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={assetUrl(course.image) || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'}
                      alt={course.name}
                      sx={{ bgcolor: 'action.hover' }}
                    />
                    <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                      <Chip
                        icon={<CheckCircleIcon sx={{ fontSize: 14, color: '#16a34a !important' }} />}
                        label="دسترسی فعال"
                        size="small"
                        sx={{
                          bgcolor: 'background.paper',
                          color: 'success.main',
                          fontWeight: 700,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        }}
                      />
                    </Box>
                  </Box>

                  <CardContent sx={{ p: { xs: 2, sm: 2.5 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        label={course.level || 'عمومی'}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                      />
                      <Chip
                        label={course.typeOfAttendence || 'آنلاین'}
                        size="small"
                        sx={{ bgcolor: 'action.hover', color: 'text.secondary', fontSize: '0.72rem' }}
                      />
                    </Box>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        fontSize: '1rem',
                        lineHeight: 1.45,
                        mb: 1.5,
                        color: 'text.primary',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {course.name}
                    </Typography>

                    {/* Learning progress meter */}
                    <Box sx={{ mb: 2, mt: 'auto' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          پیشرفت دوره:
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
                          {toPersianDigits(progress)}٪
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 7,
                          borderRadius: 4,
                          bgcolor: 'action.hover',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            bgcolor: progress === 100 ? 'success.main' : 'primary.main',
                          },
                        }}
                      />
                    </Box>

                    {/* Teacher & CTA Button */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
                        <Avatar
                          src={assetUrl(course.teacher?.avatar)}
                          alt={course.teacher?.firstName || 'مدرس'}
                          sx={{ width: 28, height: 28, bgcolor: 'primary.light', color: '#ffffff' }}
                        >
                          <PersonOutlineIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }} noWrap>
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
                          px: 1.75,
                          py: 0.75,
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          flexShrink: 0,
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
