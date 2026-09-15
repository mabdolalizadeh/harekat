import { useState } from 'react';
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
  TextField,
  InputAdornment
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useAuth } from '../contexts/AuthContext.jsx';
import { formatDuration, assetUrl, toPersianDigits } from '../utils/formatters.js';

export default function MyCoursesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const enrolledCourses = user?.courses || [];

  const filteredCourses = enrolledCourses.filter((course) =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      {/* Header & Search */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3.5 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.4rem', md: '1.75rem' }, mb: 0.5 }}>
            دوره‌های من
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            دوره‌های آموزشی فعال و در حال یادگیری شما ({toPersianDigits(enrolledCourses.length)} دوره)
          </Typography>
        </Box>

        <TextField
          size="small"
          placeholder="جستجو در دوره‌های من..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: '14px',
              backgroundColor: '#f8fafc',
              minWidth: { xs: '100%', sm: 260 }
            }
          }}
        />
      </Box>

      {/* Courses List */}
      {filteredCourses.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10, px: 2, backgroundColor: '#f8fafc', borderRadius: '24px', border: '1px dashed #cbd5e1' }}>
          <SchoolOutlinedIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#334155' }}>
            {searchTerm ? 'دوره‌ای با این عنوان یافت نشد' : 'هنوز در دوره‌ای ثبت‌نام نکرده‌اید'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 3, maxWidth: 460, mx: 'auto' }}>
            {searchTerm
              ? 'لطفاً عبارت دیگری را جستجو کنید.'
              : 'از کاتالوگ دوره‌های حرکت دیدن کنید و یادگیری تخصصی خود را آغاز نمایید.'}
          </Typography>
          {!searchTerm && (
            <Button
              component={NavLink}
              to="/catalog"
              variant="contained"
              sx={{ borderRadius: '14px', px: 3.5, py: 1.2, fontWeight: 700 }}
            >
              کاوش و ثبت‌نام در دوره‌ها
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredCourses.map((course, index) => {
            const progress = 45 + (index * 25) % 55; // Realistic active learning progress
            return (
              <Grid item xs={12} sm={6} lg={4} key={course.id}>
                <Card
                  sx={{
                    borderRadius: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    border: '1px solid #eef2f7',
                    boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 30px -4px rgba(15, 23, 42, 0.1)'
                    }
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="170"
                      image={assetUrl(course.image) || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'}
                      alt={course.name}
                      sx={{ backgroundColor: '#f1f5f9' }}
                    />
                    <Chip
                      label={course.typeOfAttendence || 'آنلاین'}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        color: '#ffffff',
                        backdropFilter: 'blur(4px)',
                        fontWeight: 700,
                        fontSize: '0.72rem'
                      }}
                    />
                  </Box>

                  <CardContent sx={{ flex: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.4, mb: 1 }}>
                      {course.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748b',
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {course.description || 'آموزش تخصصی و جامع حرکت مدیا همراه با پروژه‌های عملی.'}
                    </Typography>

                    {/* Teacher & Duration */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, mt: 'auto' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          src={assetUrl(course.teacher?.avatar)}
                          sx={{ width: 28, height: 28, fontSize: '0.8rem' }}
                        >
                          {course.teacher?.firstName?.[0] || 'م'}
                        </Avatar>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155' }}>
                          {course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : 'استاد حرکت'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#94a3b8' }}>
                        <AccessTimeIcon sx={{ fontSize: 15 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {toPersianDigits(formatDuration(course.duration))}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                          میزان پیشرفت:
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 800 }}>
                          {toPersianDigits(progress)}٪
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 7,
                          borderRadius: 4,
                          backgroundColor: '#e2e8f0',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)'
                          }
                        }}
                      />
                    </Box>

                    <Button
                      component={NavLink}
                      to={`/courses/${course.id}`}
                      variant="contained"
                      fullWidth
                      startIcon={<PlayArrowIcon />}
                      sx={{ borderRadius: '14px', py: 1.1, fontWeight: 700 }}
                    >
                      ادامه یادگیری
                    </Button>
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
