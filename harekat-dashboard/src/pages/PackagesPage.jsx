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
  Tabs,
  Tab,
  CircularProgress,
  Divider,
  Alert,
  Avatar
} from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { packagesApi } from '../api/packagesApi.js';
import { cartApi } from '../api/cartApi.js';
import { ordersApi } from '../api/ordersApi.js';
import { paymentsApi } from '../api/paymentsApi.js';
import { formatPrice, formatDuration, assetUrl, toPersianDigits } from '../utils/formatters.js';

export default function PackagesPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0); // 0: My Packages, 1: Available Packages
  const [myPackages, setMyPackages] = useState([]);
  const [allPackages, setAllPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [myRes, allRes] = await Promise.allSettled([
          packagesApi.getMyPackages(),
          packagesApi.listPackages()
        ]);

        if (myRes.status === 'fulfilled' && myRes.value?.ok) {
          setMyPackages(myRes.value.data || []);
        }
        if (allRes.status === 'fulfilled' && allRes.value?.ok) {
          setAllPackages(allRes.value.data || []);
        }
      } catch (err) {
        console.error('Error loading packages:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDirectPurchase = async (pkg) => {
    try {
      setAddingId(pkg.id);
      const effectivePrice = pkg.salePrice || pkg.price;
      await cartApi.addToCart(pkg.id, 'course', 1, effectivePrice);
      const orderRes = await ordersApi.createOrder();
      if (orderRes?.ok && orderRes.data?.id) {
        await paymentsApi.initiatePayment(orderRes.data.id, 'mock');
      }
      navigate('/payments');
    } catch (err) {
      console.error(err);
      navigate('/payments');
    } finally {
      setAddingId(null);
    }
  };

  const myPackageIds = new Set(myPackages.map((p) => p.id));

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
          پکیج‌های مهارت حرکت
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b6b63' }}>
          پکیج‌های جامع شامل چندین دوره آموزشی مکمل برای یادگیری پیوسته و هدفمند
        </Typography>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(e, val) => setTab(val)}
        sx={{
          mb: 3,
          borderBottom: '1px solid #deddd7',
          '& .MuiTab-root': { fontWeight: 700, fontSize: '0.9rem' }
        }}
      >
        <Tab
          icon={<LayersOutlinedIcon sx={{ fontSize: 18 }} />}
          iconPosition="start"
          label={`پکیج‌های من (${toPersianDigits(myPackages.length)})`}
        />
        <Tab
          icon={<SchoolOutlinedIcon sx={{ fontSize: 18 }} />}
          iconPosition="start"
          label="همه پکیج‌های آموزشی"
        />
      </Tabs>

      {/* Tab 0: My Packages */}
      {tab === 0 && (
        <Box>
          {myPackages.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                px: 2,
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                border: '1px dashed #deddd7'
              }}
            >
              <SchoolOutlinedIcon sx={{ fontSize: 60, color: '#f47c20', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#171715' }}>
                شما هنوز پکیج مهارتی فعالی ندارید
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b6b63', mb: 3, maxWidth: 440, mx: 'auto' }}>
                پکیج‌های مهارت شامل مجموعه‌ای از دوره‌های مکمل به همراه پروژه‌های عملی و پشتیبانی ویژه هستند.
              </Typography>
              <Button
                variant="contained"
                onClick={() => setTab(1)}
                sx={{
                  borderRadius: '14px',
                  px: 3.5,
                  py: 1.2,
                  backgroundColor: '#f47c20',
                  fontWeight: 700,
                  '&:hover': { backgroundColor: '#df5b13' }
                }}
              >
                مشاهده پکیج‌های پیشنهادی
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {myPackages.map((pkg) => (
                <Grid item xs={12} key={pkg.id}>
                  <Card
                    sx={{
                      p: 3,
                      borderRadius: '24px',
                      border: '1px solid #ffdda8',
                      backgroundColor: '#fffdfa',
                      boxShadow: '0 2px 10px rgba(244, 124, 32, 0.08)'
                    }}
                  >
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} md={4}>
                        <Box
                          component="img"
                          src={assetUrl(pkg.image) || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'}
                          alt={pkg.name}
                          sx={{
                            width: '100%',
                            height: 190,
                            borderRadius: '18px',
                            objectFit: 'cover'
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={8}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Chip
                            label="پکیج خریداری شده"
                            size="small"
                            color="success"
                            icon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
                            sx={{ fontWeight: 700 }}
                          />
                          <Chip
                            label={`${toPersianDigits(pkg.packageIncludedCourses?.length || 0)} دوره در پکیج`}
                            size="small"
                            sx={{ backgroundColor: '#fff8ed', color: '#b94410', fontWeight: 600 }}
                          />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#171715', mb: 1 }}>
                          {pkg.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#55554f', mb: 2, lineHeight: 1.7 }}>
                          {pkg.description || 'پکیج مهارتی جامع با دسترسی کامل به تمامی جلسات و سرفصل‌های پیوست.'}
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* Included Courses Section */}
                    {pkg.packageIncludedCourses && pkg.packageIncludedCourses.length > 0 && (
                      <Box sx={{ mt: 3, pt: 2.5, borderTop: '1px dashed #deddd7' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#171715', mb: 2 }}>
                          دوره‌های موجود در این پکیج:
                        </Typography>
                        <Grid container spacing={2}>
                          {pkg.packageIncludedCourses.map((incCourse) => (
                            <Grid item xs={12} sm={6} md={4} key={incCourse.id}>
                              <Card
                                sx={{
                                  p: 2,
                                  borderRadius: '16px',
                                  border: '1px solid #deddd7',
                                  backgroundColor: '#ffffff',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 1.5
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Avatar
                                    src={assetUrl(incCourse.image)}
                                    variant="rounded"
                                    sx={{ width: 44, height: 44, borderRadius: '10px' }}
                                  />
                                  <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography
                                      sx={{
                                        fontWeight: 700,
                                        fontSize: '0.86rem',
                                        color: '#171715',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                      }}
                                    >
                                      {incCourse.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#9b9b92' }}>
                                      {incCourse.level || 'عمومی'} • {toPersianDigits(formatDuration(incCourse.duration))}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Button
                                  component={NavLink}
                                  to={`/courses/${incCourse.id}`}
                                  size="small"
                                  variant="outlined"
                                  startIcon={<PlayCircleOutlineIcon sx={{ fontSize: 16 }} />}
                                  sx={{
                                    borderRadius: '10px',
                                    fontWeight: 700,
                                    fontSize: '0.78rem',
                                    borderColor: '#deddd7',
                                    color: '#f47c20',
                                    '&:hover': { borderColor: '#f47c20', backgroundColor: '#fff8ed' }
                                  }}
                                >
                                  ورود به کلاس و جلسات
                                </Button>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Tab 1: All / Available Packages */}
      {tab === 1 && (
        <Grid container spacing={3}>
          {allPackages.map((pkg) => {
            const isOwned = myPackageIds.has(pkg.id);
            return (
              <Grid item xs={12} sm={6} md={4} key={pkg.id}>
                <Card
                  sx={{
                    borderRadius: '24px',
                    border: isOwned ? '2px solid #16a34a' : '1px solid #deddd7',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={assetUrl(pkg.image) || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'}
                      alt={pkg.name}
                    />
                    <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                      {isOwned ? (
                        <Chip
                          label="مالک پکیج"
                          color="success"
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      ) : (
                        <Chip
                          label="پکیج مهارت"
                          size="small"
                          sx={{ backgroundColor: 'rgba(23, 23, 21, 0.8)', color: '#ffffff', fontWeight: 700 }}
                        />
                      )}
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#171715', mb: 1 }}>
                      {pkg.name}
                    </Typography>

                    <Typography variant="body2" sx={{ color: '#6b6b63', mb: 2, flex: 1, lineHeight: 1.7 }}>
                      {pkg.description || 'یادگیری چند مهارت مرتبط در قالب یک برنامه آموزشی یکپارچه.'}
                    </Typography>

                    {pkg.packageIncludedCourses && pkg.packageIncludedCourses.length > 0 && (
                      <Box sx={{ mb: 2, p: 1.5, backgroundColor: '#f7f5f0', borderRadius: '12px' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#171715', display: 'block', mb: 0.5 }}>
                          شامل {toPersianDigits(pkg.packageIncludedCourses.length)} دوره آموزشی:
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                          {pkg.packageIncludedCourses.slice(0, 3).map((c) => (
                            <Typography key={c.id} variant="caption" sx={{ color: '#55554f' }}>
                              • {c.name}
                            </Typography>
                          ))}
                          {pkg.packageIncludedCourses.length > 3 && (
                            <Typography variant="caption" sx={{ color: '#f47c20', fontWeight: 600 }}>
                              + {toPersianDigits(pkg.packageIncludedCourses.length - 3)} دوره دیگر
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}

                    <Divider sx={{ my: 1.5, borderColor: '#deddd7' }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="caption" sx={{ color: '#9b9b92', fontWeight: 600 }}>
                        شهریه پکیج:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#f47c20' }}>
                          {formatPrice(pkg.salePrice || pkg.price)}
                        </Typography>
                        {pkg.salePrice && (
                          <Typography sx={{ textDecoration: 'line-through', color: '#9b9b92', fontSize: '0.85rem' }}>
                            {formatPrice(pkg.price)}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {isOwned ? (
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => setTab(0)}
                        sx={{
                          py: 1,
                          borderRadius: '14px',
                          fontWeight: 700,
                          borderColor: '#16a34a',
                          color: '#16a34a'
                        }}
                      >
                        مشاهده در پکیج‌های من
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        fullWidth
                        disabled={addingId === pkg.id}
                        onClick={() => handleDirectPurchase(pkg)}
                        startIcon={addingId === pkg.id ? <CircularProgress size={18} color="inherit" /> : <CreditCardOutlinedIcon />}
                        sx={{
                          py: 1.1,
                          borderRadius: '14px',
                          backgroundColor: '#f47c20',
                          fontWeight: 700,
                          '&:hover': { backgroundColor: '#df5b13' }
                        }}
                      >
                        {addingId === pkg.id ? 'در حال ثبت...' : 'خرید و فعال‌سازی پکیج'}
                      </Button>
                    )}
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
