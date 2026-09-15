import { useState } from 'react';
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
  LinearProgress
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MilitaryTechOutlinedIcon from '@mui/icons-material/MilitaryTechOutlined';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import { useAuth } from '../contexts/AuthContext.jsx';
import { assetUrl, toPersianDigits } from '../utils/formatters.js';

export default function ProfilePage() {
  const { user, updateProfile, rubies, studyPoints } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        avatar: avatar.trim()
      });
      setMessage({ type: 'success', text: 'پروفایل شما با موفقیت به‌روزرسانی شد.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'خطا در ثبت اطلاعات' });
    } finally {
      setSaving(false);
    }
  };

  const enrolledCount = user?.courses?.length || 0;
  const targetPoints = 300;
  const progressPercent = Math.min(100, Math.round((studyPoints / targetPoints) * 100));

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.65rem' }, color: '#171715', mb: 0.5 }}>
          پروفایل کاربری و تنظیمات
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b6b63' }}>
          مدیریت اطلاعات فردی، سطح پیشرفت و دستاوردهای آموزشی در حرکت مدیا
        </Typography>
      </Box>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3, borderRadius: '14px' }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Card & Stats Column */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              p: 3,
              borderRadius: '20px',
              border: '1px solid #deddd7',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              textAlign: 'center'
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
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: '#df5b13', mb: 0.5 }}>
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
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: '#b94410', mb: 0.5 }}>
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

            {/* Progress to next tier */}
            <Box sx={{ mt: 2.5, textAlign: 'right' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#171715' }}>
                  رسیدن به سطح پیشرفته:
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#f47c20' }}>
                  {toPersianDigits(progressPercent)}٪
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#efede7',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #f47c20 0%, #df5b13 100%)'
                  }
                }}
              />
            </Box>
          </Card>
        </Grid>

        {/* Edit Form Column */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: '20px',
              border: '1px solid #deddd7',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#171715', mb: 3 }}>
              ویرایش اطلاعات فردی
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2.5}>
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

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#171715' }}>
                    شماره موبایل:
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

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#171715' }}>
                    آدرس آواتار / تصویر پروفایل:
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

                <Grid item xs={12} sx={{ pt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    endIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />}
                    sx={{
                      py: 1.2,
                      px: 3.5,
                      borderRadius: '14px',
                      backgroundColor: '#f47c20',
                      color: '#ffffff',
                      fontWeight: 700,
                      '&:hover': { backgroundColor: '#df5b13' }
                    }}
                  >
                    {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
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
