import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  TextField,
  Button,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  LinearProgress,
  Chip
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import CardMembershipOutlinedIcon from '@mui/icons-material/CardMembershipOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { useAuth } from '../contexts/AuthContext.jsx';
import { userApi } from '../api/userApi.js';
import { subscriptionsApi } from '../api/subscriptionsApi.js';
import { sanitizeSvg } from '../utils/sanitizeSvg.js';
import { assetUrl, formatDate, toPersianDigits } from '../utils/formatters.js';

export default function ProfilePage() {
  const { user, updateProfile, rubies, studyPoints } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [nationalId, setNationalId] = useState(user?.nationalId || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || '');
  const [education, setEducation] = useState(user?.education || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  // Sync avatar if user context changes
  useEffect(() => {
    if (user?.avatar !== undefined) {
      setAvatar(user.avatar || '');
    }
  }, [user?.avatar]);

  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'فقط فایل‌های تصویری (JPG, PNG, WebP و ...) مجاز هستند.' });
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'حجم تصویر نباید بیشتر از ۱۵ مگابایت باشد.' });
      return;
    }

    try {
      setUploadingAvatar(true);
      setMessage(null);
      const res = await userApi.uploadAvatar(file);
      const newAvatarUrl = res?.data?.imageUrl;
      if (newAvatarUrl) {
        setAvatar(newAvatarUrl);
        await updateProfile({ avatar: newAvatarUrl });
        setMessage({ type: 'success', text: 'تصویر نمایه شما با موفقیت آپلود و ذخیره شد.' });
      } else {
        throw new Error('پاسخی از سرور دریافت نشد');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'خطا در بارگذاری تصویر نمایه' });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setUploadingAvatar(true);
      setMessage(null);
      setAvatar('');
      await updateProfile({ avatar: '' });
      setMessage({ type: 'success', text: 'تصویر نمایه با موفقیت حذف شد.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'خطا در حذف تصویر نمایه' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Dynamic Subscription data from backend
  const [subData, setSubData] = useState(null);
  const [loadingSub, setLoadingSub] = useState(true);

  useEffect(() => {
    async function loadSubscription() {
      try {
        setLoadingSub(true);
        const res = await subscriptionsApi.getMySubscription();
        if (res?.ok && res.data) {
          setSubData(res.data);
        }
      } catch (err) {
        console.warn('Could not load active subscription:', err);
      } finally {
        setLoadingSub(false);
      }
    }
    loadSubscription();
  }, []);

  // Profile completion calculation
  const fields = [
    { name: 'نام', val: firstName },
    { name: 'نام خانوادگی', val: lastName },
    { name: 'شماره همراه', val: phoneNumber },
    { name: 'کد ملی', val: nationalId },
    { name: 'درباره من', val: bio },
    { name: 'تحصیلات', val: education }
  ];
  const filledCount = fields.filter((f) => Boolean(f.val && f.val.trim())).length;
  const completionPercentage = Math.round((filledCount / fields.length) * 100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        nationalId: nationalId.trim(),
        bio: bio.trim(),
        jobTitle: jobTitle.trim(),
        education: education.trim(),
        avatar: avatar.trim()
      });
      setMessage({ type: 'success', text: 'اطلاعات حساب کاربری شما با موفقیت ذخیره شد.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'خطا در ثبت اطلاعات' });
    } finally {
      setSaving(false);
    }
  };

  const hasActiveSub = subData?.hasActiveSubscription && subData.subscription;
  const badgeLabel = subData?.subscription?.badgeLabel;
  const sanitizedBadgeSvg = sanitizeSvg(subData?.subscription?.badgeIconSvg);

  return (
    <Box>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.75rem' }, color: '#171715', mb: 0.5 }}>
          حساب کاربری و نشان اشتراک
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b6b63' }}>
          مدیریت اطلاعات هویتی، درصد تکمیل پروفایل و نشان پویای اشتراک فعال
        </Typography>
      </Box>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3, borderRadius: '16px' }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
        {/* Left Column: Avatar + Profile Meter + Dynamic Subscription Badge */}
        <Grid item xs={12} md={4.5} sx={{ display: 'flex', flexDirection: 'column' }}>
          {/* User ID & Profile completion card */}
          <Card
            sx={{
              p: 3,
              borderRadius: '24px',
              border: '1px solid #deddd7',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              textAlign: 'center',
              mb: 3
            }}
          >
            {/* Interactive Avatar with Upload overlay & badge */}
            <Box sx={{ position: 'relative', display: 'inline-block', mx: 'auto', mb: 1.5 }}>
              <Avatar
                src={assetUrl(avatar || user?.avatar)}
                alt={firstName || 'کاربر'}
                onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
                sx={{
                  width: 96,
                  height: 96,
                  mx: 'auto',
                  border: '3px solid #f47c20',
                  backgroundColor: '#ffa33f',
                  boxShadow: '0 4px 14px rgba(244, 124, 32, 0.25)',
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  cursor: uploadingAvatar ? 'wait' : 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    opacity: 0.88,
                    transform: 'scale(1.02)'
                  }
                }}
              >
                {firstName?.[0] || 'ح'}
              </Avatar>

              {uploadingAvatar ? (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(2px)'
                  }}
                >
                  <CircularProgress size={30} sx={{ color: '#f47c20' }} />
                </Box>
              ) : (
                <IconButton
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  title="بارگذاری و تغییر تصویر آواتار"
                  sx={{
                    position: 'absolute',
                    bottom: 2,
                    left: 2,
                    backgroundColor: '#f47c20',
                    color: '#ffffff',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                    border: '2px solid #ffffff',
                    width: 32,
                    height: 32,
                    '&:hover': {
                      backgroundColor: '#df5b13'
                    }
                  }}
                >
                  <PhotoCameraOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              )}
            </Box>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarFileSelect}
            />

            {/* Avatar action buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                disabled={uploadingAvatar}
                onClick={() => fileInputRef.current?.click()}
                startIcon={uploadingAvatar ? <CircularProgress size={14} color="inherit" /> : <PhotoCameraOutlinedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  borderColor: '#f47c20',
                  color: '#f47c20',
                  py: 0.4,
                  px: 1.5,
                  '&:hover': {
                    borderColor: '#df5b13',
                    backgroundColor: '#fff8ed'
                  }
                }}
              >
                {uploadingAvatar ? 'در حال آپلود...' : (avatar || user?.avatar ? 'تغییر تصویر' : 'آپلود تصویر')}
              </Button>
              {(avatar || user?.avatar) && (
                <Button
                  variant="text"
                  size="small"
                  disabled={uploadingAvatar}
                  onClick={handleRemoveAvatar}
                  startIcon={<DeleteOutlineIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    borderRadius: '10px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#dc2626',
                    py: 0.4,
                    px: 1,
                    '&:hover': {
                      backgroundColor: '#fee2e2'
                    }
                  }}
                >
                  حذف
                </Button>
              )}
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 800, color: '#171715', mb: 0.5 }}>
              {firstName && lastName ? `${firstName} ${lastName}` : 'کاربر حرکت'}
            </Typography>

            <Typography variant="body2" sx={{ color: '#6b6b63', mb: 2 }}>
              {phoneNumber || '۰۹۱۲۳۴۵۶۷۸۹'}
            </Typography>

            <Divider sx={{ my: 2, borderColor: '#deddd7' }} />

            {/* Profile Completion Meter */}
            <Box sx={{ textAlign: 'right', mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#171715' }}>
                  میزان تکمیل پروفایل:
                </Typography>
                <Chip
                  label={`${toPersianDigits(completionPercentage)}٪`}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    backgroundColor: completionPercentage >= 80 ? '#dcfce7' : '#fff8ed',
                    color: completionPercentage >= 80 ? '#15803d' : '#b94410'
                  }}
                />
              </Box>

              <LinearProgress
                variant="determinate"
                value={completionPercentage}
                sx={{
                  height: 9,
                  borderRadius: 5,
                  backgroundColor: '#f1f5f9',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 5,
                    background: completionPercentage >= 80
                      ? 'linear-gradient(90deg, #16a34a 0%, #22c55e 100%)'
                      : 'linear-gradient(90deg, #f47c20 0%, #df5b13 100%)'
                  }
                }}
              />

              {completionPercentage < 100 && (
                <Typography variant="caption" sx={{ color: '#9b9b92', mt: 0.8, display: 'block' }}>
                  برای صدور مدارک رسمی پایان دوره‌ها، تکمیل کد ملی و نام کامل الزامی است.
                </Typography>
              )}
            </Box>

            {/* Rubies & Points Grid */}
            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <Box
                  sx={{
                    p: 1.5,
                    backgroundColor: '#fff8ed',
                    border: '1px solid #ffdda8',
                    borderRadius: '16px',
                    textAlign: 'center'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: '#df5b13', mb: 0.3 }}>
                    <EmojiEventsOutlinedIcon sx={{ fontSize: 18 }} />
                    <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
                      {toPersianDigits(studyPoints)}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#6b6b63', fontWeight: 600 }}>
                    امتیاز کل
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box
                  sx={{
                    p: 1.5,
                    backgroundColor: '#ffefd3',
                    border: '1px solid #ffdda8',
                    borderRadius: '16px',
                    textAlign: 'center'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: '#b94410', mb: 0.3 }}>
                    <DiamondOutlinedIcon sx={{ fontSize: 18, color: '#f47c20' }} />
                    <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
                      {toPersianDigits(rubies)}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#6b6b63', fontWeight: 600 }}>
                    یاقوت‌ها
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>

          {/* DYNAMIC SUBSCRIPTION BADGE (Configured by Admin, never hardcoded) */}
          <Card
            sx={{
              p: 3,
              borderRadius: '24px',
              border: hasActiveSub ? '2px solid #f47c20' : '1px solid #deddd7',
              backgroundColor: hasActiveSub ? '#fffdfa' : '#ffffff',
              boxShadow: hasActiveSub ? '0 8px 24px -4px rgba(244, 124, 32, 0.15)' : 'none',
              flex: { xs: 'none', md: 1 },
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CardMembershipOutlinedIcon sx={{ color: '#f47c20', fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#171715', fontSize: '1rem' }}>
                نشان اشتراک عضویت
              </Typography>
            </Box>

            {loadingSub ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, py: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : hasActiveSub ? (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  {/* Dynamic Badge Display: Label + Sanitized SVG icon from backend */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '18px',
                      backgroundColor: '#fff8ed',
                      border: '1px solid #ffdda8',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      mb: 2
                    }}
                  >
                    {/* Dynamic SVG Icon rendered safely */}
                    {sanitizedBadgeSvg ? (
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          '& svg': { width: '100%', height: '100%' }
                        }}
                        dangerouslySetInnerHTML={{ __html: sanitizedBadgeSvg }}
                      />
                    ) : (
                      <VerifiedUserOutlinedIcon sx={{ fontSize: 36, color: '#f47c20' }} />
                    )}

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="caption" sx={{ color: '#b94410', fontWeight: 600 }}>
                        نشان ویژه شما:
                      </Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#171715' }}>
                        {badgeLabel || subData.subscription.title}
                      </Typography>
                    </Box>

                    <Chip
                      label="فعال"
                      size="small"
                      color="success"
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" sx={{ color: '#6b6b63' }}>پلن اشتراک:</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {subData.subscription.title}
                      </Typography>
                    </Box>
                    {subData.userSubscription?.endDate && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ color: '#6b6b63' }}>اعتبار تا:</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {formatDate(subData.userSubscription.endDate)}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" sx={{ color: '#6b6b63' }}>دوره‌های تحت پوشش:</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {toPersianDigits(subData.includedCourses?.length || 0)} دوره
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Button
                  component={NavLink}
                  to="/subscriptions"
                  variant="outlined"
                  fullWidth
                  size="small"
                  sx={{ borderRadius: '12px', fontWeight: 700, borderColor: '#deddd7', color: '#f47c20', mt: 'auto' }}
                >
                  مشاهده جزئیات اشتراک
                </Button>
              </Box>
            ) : (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'center', pt: 1, pb: 0 }}>
                <Typography variant="body2" sx={{ color: '#6b6b63', mb: 2, lineHeight: 1.8 }}>
                  شما در حال حاضر فاقد اشتراک ویژه هستید. با فعال‌سازی اشتراک، نشان اختصاصی در کاربری شما درج خواهد شد.
                </Typography>
                <Button
                  component={NavLink}
                  to="/subscriptions"
                  variant="contained"
                  fullWidth
                  sx={{
                    borderRadius: '14px',
                    backgroundColor: '#f47c20',
                    fontWeight: 700,
                    mt: 'auto',
                    '&:hover': { backgroundColor: '#df5b13' }
                  }}
                >
                  مشاهده و خرید پلن اشتراک
                </Button>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Right Column: Edit Profile Form */}
        <Grid item xs={12} md={7.5} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Card
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: '24px',
              border: '1px solid #deddd7',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#171715', mb: 3 }}>
              ویرایش اطلاعات هویتی و تحصیلی
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Grid container spacing={2.5}>
                {/* First Name */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#171715' }}>
                    نام:
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="مثال: علی"
                  />
                </Grid>

                {/* Last Name */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#171715' }}>
                    نام خانوادگی:
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="مثال: محمدی"
                  />
                </Grid>

                {/* National ID (کد ملی) */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#171715' }}>
                    کد ملی (جهت صدور گواهینامه):
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="۰۰۱۲۳۴۵۶۷۸"
                    dir="ltr"
                  />
                </Grid>

                {/* Phone Number */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#171715' }}>
                    شماره همراه:
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    dir="ltr"
                  />
                </Grid>

                {/* Job Title */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#171715' }}>
                    موقعیت شغلی / عنوان حرفه‌ای:
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="مثال: طراح رابط کاربری"
                  />
                </Grid>

                {/* Education */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#171715' }}>
                    آخرین مقطع تحصیلی:
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="مثال: کارشناسی مهندسی نرم‌افزار"
                  />
                </Grid>

                {/* Avatar URL & Direct Upload */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#171715' }}>
                      تصویر نمایه (آواتار):
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b6b63' }}>
                      فرمت بهینه WebP خودکار
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="آدرس تصویر یا مسیر فایل آپلود شده..."
                      dir="ltr"
                    />
                    <Button
                      variant="outlined"
                      disabled={uploadingAvatar}
                      onClick={() => fileInputRef.current?.click()}
                      startIcon={uploadingAvatar ? <CircularProgress size={16} color="inherit" /> : <CloudUploadOutlinedIcon />}
                      sx={{
                        whiteSpace: 'nowrap',
                        minWidth: '135px',
                        height: '40px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        borderColor: '#f47c20',
                        color: '#f47c20',
                        flexShrink: 0,
                        '&:hover': {
                          borderColor: '#df5b13',
                          backgroundColor: '#fff8ed'
                        }
                      }}
                    >
                      {uploadingAvatar ? 'در حال آپلود...' : 'آپلود فایل'}
                    </Button>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#9b9b92', mt: 0.8, display: 'block' }}>
                    با انتخاب فایل، تصویر شما در سرور فشرده‌سازی شده و به فرمت بهینه WebP تبدیل و ذخیره می‌شود.
                  </Typography>
                </Grid>

                {/* Bio */}
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#171715' }}>
                    درباره من / بیوگرافی کوتاه:
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="چند جمله درباره علاقه‌مندی‌ها و سوابق آموزشی خود بنویسید..."
                  />
                </Grid>

              </Grid>

              {/* Submit button pinned to bottom */}
              <Box sx={{ mt: 'auto', pt: 3, display: 'flex', justifyContent: 'flex-start' }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />}
                  sx={{
                    py: 1.2,
                    px: 4,
                    borderRadius: '14px',
                    backgroundColor: '#f47c20',
                    color: '#ffffff',
                    fontWeight: 700,
                    '&:hover': { backgroundColor: '#df5b13' }
                  }}
                >
                  {saving ? 'در حال ذخیره اطلاعات...' : 'ذخیره تغییرات حساب'}
                </Button>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
