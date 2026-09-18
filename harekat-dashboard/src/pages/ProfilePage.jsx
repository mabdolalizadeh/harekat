import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  TextField,
  Button,
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

import { useAuth } from '../contexts/AuthContext.jsx';
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
  const [message, setMessage] = useState(null);

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

      <Grid container spacing={3}>
        {/* Left Column: Avatar + Profile Meter + Dynamic Subscription Badge */}
        <Grid item xs={12} md={4.5}>
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
            <Avatar
              src={assetUrl(avatar || user?.avatar)}
              alt={firstName || 'کاربر'}
              sx={{
                width: 92,
                height: 92,
                mx: 'auto',
                mb: 2,
                border: '3px solid #f47c20',
                backgroundColor: '#ffa33f',
                boxShadow: '0 4px 14px rgba(244, 124, 32, 0.25)',
                fontSize: '1.8rem',
                fontWeight: 700
              }}
            >
              {firstName?.[0] || 'ح'}
            </Avatar>

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
              boxShadow: hasActiveSub ? '0 8px 24px -4px rgba(244, 124, 32, 0.15)' : 'none'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CardMembershipOutlinedIcon sx={{ color: '#f47c20', fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#171715', fontSize: '1rem' }}>
                نشان اشتراک عضویت
              </Typography>
            </Box>

            {loadingSub ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : hasActiveSub ? (
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

                <Button
                  component={NavLink}
                  to="/subscriptions"
                  variant="outlined"
                  fullWidth
                  size="small"
                  sx={{ borderRadius: '12px', fontWeight: 700, borderColor: '#deddd7', color: '#f47c20' }}
                >
                  مشاهده جزئیات اشتراک
                </Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" sx={{ color: '#6b6b63', mb: 2 }}>
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
        <Grid item xs={12} md={7.5}>
          <Card
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: '24px',
              border: '1px solid #deddd7',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#171715', mb: 3 }}>
              ویرایش اطلاعات هویتی و تحصیلی
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
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

                {/* Avatar URL */}
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#171715' }}>
                    آدرس تصویر آواتار:
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://..."
                    dir="ltr"
                  />
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

                {/* Submit button */}
                <Grid item xs={12} sx={{ pt: 1.5 }}>
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
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
