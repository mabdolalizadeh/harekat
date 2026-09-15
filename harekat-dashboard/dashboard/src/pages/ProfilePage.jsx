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
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.4rem', md: '1.75rem' }, mb: 0.5 }}>
          پروفایل کاربری و تنظیمات
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          مدیریت اطلاعات فردی، سطح پیشرفت و دستاوردهای آموزشی
        </Typography>
      </Box>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3, borderRadius: '16px' }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3.5}>
        {/* Left Column: Profile Card & Achievements */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              p: 3,
              borderRadius: '24px',
              border: '1px solid #eef2f7',
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
              textAlign: 'center'
            }}
          >
            <Avatar
              src={assetUrl(avatar || user?.avatar)}
              alt={firstName || 'کاربر'}
              sx={{
                width: 96,
                height: 96,
                mx: 'auto',
                mb: 2,
                border: '3px solid #2563eb',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                fontSize: '2rem'
              }}
            >
              {firstName?.[0] || 'ح'}
            </Avatar>

            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
              {firstName && lastName ? `${firstName} ${lastName}` : 'دانش‌آموز حرکت'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
              {toPersianDigits(phoneNumber || user?.phoneNumber || '')}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* Badges and Points */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Box sx={{ p: 1.5, backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #eef2f7' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                    <MilitaryTechOutlinedIcon sx={{ color: '#0d9488', fontSize: 20 }} />
                    <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f766e' }}>
                      {toPersianDigits(studyPoints)}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    امتیاز کل
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box sx={{ p: 1.5, backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #eef2f7' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                    <DiamondOutlinedIcon sx={{ color: '#7c3aed', fontSize: 20 }} />
                    <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#7c3aed' }}>
                      {toPersianDigits(rubies)}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    یاقوت‌ها
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Level Progress */}
            <Box sx={{ textAlign: 'right', mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>
                  رسیدن به سطح پیشرفته:
                </Typography>
                <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 800 }}>
                  {toPersianDigits(progressPercent)}٪
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#e2e8f0',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #10b981 0%, #0d9488 100%)'
                  }
                }}
              />
            </Box>
          </Card>
        </Grid>

        {/* Right Column: Edit Profile Form */}
        <Grid item xs={12} md={8}>
          <Card
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: 3.5,
              borderRadius: '24px',
              border: '1px solid #eef2f7',
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
              ویرایش اطلاعات فردی
            </Typography>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  نام:
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="مثلاً علی"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  نام خانوادگی:
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="مثلاً محمدی"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  شماره موبایل:
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="09123456789"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  آدرس آواتار / تصویر پروفایل:
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={saving}
                startIcon={<SaveOutlinedIcon />}
                sx={{ borderRadius: '14px', px: 4, py: 1.2, fontWeight: 700 }}
              >
                {saving ? <CircularProgress size={22} color="inherit" /> : 'ذخیره تغییرات'}
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
