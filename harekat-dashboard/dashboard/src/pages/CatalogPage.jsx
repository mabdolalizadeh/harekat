import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  CircularProgress,
  IconButton
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { coursesApi } from '../api/coursesApi.js';
import { useCart } from '../contexts/CartContext.jsx';
import { formatPrice, formatDuration, assetUrl, toPersianDigits } from '../utils/formatters.js';

export default function CatalogPage() {
  const { addToCart } = useCart();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    async function loadCatalog() {
      try {
        setLoading(true);
        const [coursesRes, catsRes] = await Promise.all([
          coursesApi.getCourses(),
          coursesApi.getCategories()
        ]);
        if (coursesRes?.ok && coursesRes.data) setCourses(coursesRes.data);
        if (catsRes?.ok && catsRes.data) setCategories(catsRes.data);
      } catch (err) {
        console.error('Failed to load catalog:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const handleAddToCart = async (e, course) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setAddingId(course.id);
      const effectivePrice = course.salePrice || course.price;
      await addToCart(course.id, 'course', 1, effectivePrice);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingId(null);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'all' ||
      c.categories?.some((cat) => String(cat.id) === String(selectedCategory) || cat.slug === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Title & Search bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.4rem', md: '1.75rem' }, mb: 0.5 }}>
            کاوش دوره‌های آموزشی
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            دوره‌های تخصصی، بسته‌های مهارتی و آموزش‌های کپسولی حرکت مدیا ({toPersianDigits(courses.length)} دوره)
          </Typography>
        </Box>

        <TextField
          size="small"
          placeholder="جستجوی دوره یا مهارت..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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

      {/* Category Tabs */}
      <Box sx={{ borderBottom: '1px solid #eef2f7', mb: 3.5, overflowX: 'auto' }}>
        <Tabs
          value={selectedCategory}
          onChange={(_, val) => setSelectedCategory(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 700,
              fontSize: '0.9rem',
              minHeight: 48,
              textTransform: 'none'
            }
          }}
        >
          <Tab label="همه دوره‌ها" value="all" />
          {categories.map((cat) => (
            <Tab key={cat.id} label={cat.name} value={cat.id} />
          ))}
        </Tabs>
      </Box>

      {/* Grid of Courses */}
      {filteredCourses.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, backgroundColor: '#f8fafc', borderRadius: '24px', border: '1px dashed #cbd5e1' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#475569', mb: 1 }}>
            دوره‌ای با این مشخصات پیدا نشد
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            دسته‌بندی دیگری را انتخاب کنید یا عبارت دیگری جستجو نمایید.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredCourses.map((course) => (
            <Grid item xs={12} sm={6} lg={4} key={course.id}>
              <Card
                component={NavLink}
                to={`/courses/${course.id}`}
                sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                  borderRadius: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  border: '1px solid #eef2f7',
                  boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
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
                    height="180"
                    image={assetUrl(course.image) || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'}
                    alt={course.name}
                    sx={{ backgroundColor: '#f1f5f9' }}
                  />
                  {course.level && (
                    <Chip
                      label={course.level}
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
                  )}
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
                    {course.description || 'آموزش تخصصی و جامع همراه با سرفصل کاربردی و تمرین‌های عملی.'}
                  </Typography>

                  {/* Teacher & Duration */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, mt: 'auto' }}>
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

                  {/* Price & Add to Cart button */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.5, borderTop: '1px solid #deddd7' }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#6b6b63', display: 'block', fontSize: '0.72rem' }}>
                        شهریه دوره
                      </Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#f47c20' }}>
                        {formatPrice(course.salePrice || course.price)}
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<ShoppingBagOutlinedIcon sx={{ fontSize: 18 }} />}
                      disabled={addingId === course.id}
                      onClick={(e) => handleAddToCart(e, course)}
                      sx={{ borderRadius: '12px', px: 2, py: 0.8, fontWeight: 700 }}
                    >
                      {addingId === course.id ? <CircularProgress size={16} color="inherit" /> : 'خرید'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
