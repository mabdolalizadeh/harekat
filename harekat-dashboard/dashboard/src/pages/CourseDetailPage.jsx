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
  Alert
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { coursesApi } from '../api/coursesApi.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import { formatPrice, formatDuration, assetUrl, toPersianDigits } from '../utils/formatters.js';

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  useEffect(() => {
    async function loadCourse() {
      try {
        setLoading(true);
        setError(null);
        const res = await coursesApi.getCourseById(id);
        if (res?.ok && res.data) {
          setCourse(res.data);
        } else {
          setError('دوره مورد نظر یافت نشد.');
        }
      } catch (err) {
        setError(err.message || 'خطا در بارگذاری اطلاعات دوره');
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [id]);

  const isEnrolled = user?.courses?.some((c) => c.id === id);

  const handleAddToCart = async () => {
    if (!course) return;
    try {
      setAddingToCart(true);
      const effectivePrice = course.salePrice || course.price;
      await addToCart(course.id, 'course', 1, effectivePrice);
      setCartSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !course) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Alert severity="error" sx={{ maxWidth: 500, mx: 'auto', mb: 3, borderRadius: '16px' }}>
          {error || 'دوره یافت نشد'}
        </Alert>
        <Button component={NavLink} to="/courses" endIcon={<ArrowForwardIcon />} variant="outlined">
          بازگشت به دوره‌های من
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Back button */}
      <Button
        component={NavLink}
        to="/courses"
        endIcon={<ArrowForwardIcon />}
        sx={{ mb: 3, color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}
      >
        بازگشت به لیست دوره‌ها
      </Button>

      <Grid container spacing={3.5}>
        {/* Main Left/Center column: Video Player & Syllabus */}
        <Grid item xs={12} lg={8}>
          {/* Video Player */}
          {course.videoUrl ? (
            <Box
              sx={{
                width: '100%',
                height: { xs: 240, sm: 420 },
                borderRadius: '24px',
                overflow: 'hidden',
                backgroundColor: '#0f172a',
                mb: 3,
                boxShadow: '0 15px 35px -5px rgba(15, 23, 42, 0.2)'
              }}
            >
              {course.videoUrl.includes('youtube.com') || course.videoUrl.includes('aparat.com') ? (
                <iframe
                  src={course.videoUrl}
                  title={course.name}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                />
              ) : (
                <video
                  src={course.videoUrl}
                  controls
                  poster={assetUrl(course.image)}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              )}
            </Box>
          ) : (
            <Box
              component="img"
              src={assetUrl(course.image) || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
              alt={course.name}
              sx={{
                width: '100%',
                height: { xs: 220, sm: 360 },
                objectFit: 'cover',
                borderRadius: '24px',
                mb: 3,
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
              }}
            />
          )}

          {/* Title & Badges */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
              {isEnrolled && (
                <Chip
                  icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                  label="ثبت‌نام شده"
                  color="success"
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              )}
              {course.level && (
                <Chip
                  label={`سطح: ${course.level}`}
                  size="small"
                  sx={{ backgroundColor: '#fff8ed', color: '#b94410', border: '1px solid #ffdda8', fontWeight: 600 }}
                />
              )}
              <Chip
                label={course.typeOfAttendence || 'آنلاین'}
                size="small"
                sx={{ backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 600 }}
              />
              {course.categories?.map((cat) => (
                <Chip
                  key={cat.id}
                  label={cat.name}
                  size="small"
                  sx={{ backgroundColor: '#f8fafc', color: '#64748b' }}
                />
              ))}
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.4rem', md: '1.8rem' }, mb: 1.5 }}>
              {course.name}
            </Typography>

            <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.8 }}>
              {course.description || 'در این دوره تخصصی، مهارت‌های کلیدی به همراه تمرین‌های کاربردی و پشتیبانی مداوم اساتید آموزش داده می‌شود.'}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Syllabus / Long Description */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              سرفصل‌ها و توضیحات تکمیلی دوره
            </Typography>
            <Card sx={{ p: 3, borderRadius: '20px', backgroundColor: '#f8fafc', border: '1px solid #eef2f7' }}>
              <Typography variant="body1" sx={{ color: '#334155', lineHeight: 1.9, whiteSpace: 'pre-line' }}>
                {course.longDescription || 'سرفصل‌های این دوره به صورت منظم در پنل بارگذاری می‌شود و شامل تمرین‌های هفتگی و جلسات رفع اشکال است.'}
              </Typography>
            </Card>
          </Box>
        </Grid>

        {/* Sidebar Column: Enrollment & Teacher card */}
        <Grid item xs={12} lg={4}>
          <Card
            sx={{
              p: 3,
              borderRadius: '24px',
              border: '1px solid #eef2f6',
              boxShadow: '0 8px 30px -4px rgba(15, 23, 42, 0.06)',
              position: 'sticky',
              top: 20
            }}
          >
            {/* Pricing if not enrolled */}
            {!isEnrolled && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                  شهریه دوره:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#f47c20' }}>
                    {formatPrice(course.salePrice || course.price)}
                  </Typography>
                  {course.salePrice && (
                    <Typography sx={{ textDecoration: 'line-through', color: '#9b9b92', fontSize: '0.9rem' }}>
                      {formatPrice(course.price)}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {/* Action button */}
            {isEnrolled ? (
              <Button
                variant="contained"
                fullWidth
                size="large"
                endIcon={<PlayCircleOutlineIcon />}
                sx={{ py: 1.4, borderRadius: '16px', fontWeight: 700, mb: 2 }}
              >
                شروع / ادامه یادگیری
              </Button>
            ) : (
              <Button
                variant="contained"
                fullWidth
                size="large"
                endIcon={<ShoppingBagOutlinedIcon />}
                disabled={addingToCart}
                onClick={handleAddToCart}
                sx={{ py: 1.4, borderRadius: '16px', fontWeight: 700, mb: 2 }}
              >
                {addingToCart ? <CircularProgress size={22} color="inherit" /> : 'افزودن به سبد خرید'}
              </Button>
            )}

            {cartSuccess && (
              <Alert severity="success" sx={{ mb: 2, borderRadius: '12px', fontSize: '0.82rem' }}>
                دوره با موفقیت به سبد خرید افزوده شد!
              </Alert>
            )}

            <Divider sx={{ my: 2.5 }} />

            {/* Course Features */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
              مشخصات دوره:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>مدت آموزش:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {toPersianDigits(formatDuration(course.duration))}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>شیوه برگزاری:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {course.typeOfAttendence || 'آنلاین'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>سطح دوره:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {course.level || 'عمومی'}
                </Typography>
              </Box>
            </Box>

            {/* Teacher Details */}
            {course.teacher && (
              <>
                <Divider sx={{ my: 2.5 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  استاد دوره:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar
                    src={assetUrl(course.teacher.avatar)}
                    alt={course.teacher.firstName}
                    sx={{ width: 48, height: 48 }}
                  >
                    {course.teacher.firstName?.[0]}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>
                      {course.teacher.firstName} {course.teacher.lastName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {course.teacher.email || 'مدرس ارشد حرکت مدیا'}
                    </Typography>
                  </Box>
                </Box>
              </>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
