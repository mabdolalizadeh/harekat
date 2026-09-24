import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CardMembershipOutlinedIcon from '@mui/icons-material/CardMembershipOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { subscriptionsApi } from '../api/subscriptionsApi.js';
import { cartApi } from '../api/cartApi.js';
import { ordersApi } from '../api/ordersApi.js';
import { paymentsApi } from '../api/paymentsApi.js';
import { useThemeMode } from '../contexts/ThemeModeContext.jsx';
import { sanitizeSvg } from '../utils/sanitizeSvg.js';
import { formatPrice, formatDate, toPersianDigits } from '../utils/formatters.js';

export default function SubscriptionsPage() {
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  const [subscriptions, setSubscriptions] = useState([]);
  const [activeSubData, setActiveSubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [subsRes, mySubRes] = await Promise.allSettled([
          subscriptionsApi.getSubscriptions(),
          subscriptionsApi.getMySubscription()
        ]);

        if (subsRes.status === 'fulfilled' && subsRes.value?.ok) {
          setSubscriptions(subsRes.value.data || []);
        }

        if (mySubRes.status === 'fulfilled' && mySubRes.value?.ok && mySubRes.value.data) {
          setActiveSubData(mySubRes.value.data);
        }
      } catch (err) {
        console.error('Failed to load subscriptions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubscribe = async (sub) => {
    try {
      setAddingId(sub.id);
      const effectivePrice = sub.salePrice || sub.price;
      await cartApi.addToCart(sub.id, 'subscription', 1, effectivePrice);
      const orderRes = await ordersApi.createOrder();
      if (orderRes?.ok && orderRes.data?.id) {
        const initRes = await paymentsApi.initiatePayment(orderRes.data.id);
        if (initRes?.ok && initRes.data?.requiresGatewayRedirect && initRes.data?.redirectUrl) {
          window.location.href = initRes.data.redirectUrl;
          return;
        }
      }
      navigate('/payments');
    } catch (err) {
      console.error(err);
      navigate('/payments');
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const hasActiveSub = activeSubData?.hasActiveSubscription && activeSubData.subscription;

  return (
    <Box>
      {/* Active Subscription Banner if user has one */}
      {hasActiveSub && (
        <Card
          sx={{
            p: { xs: 2.5, sm: 3.5 },
            mb: 4,
            borderRadius: '24px',
            backgroundColor: isDark ? 'background.paper' : '#fffdfa',
            border: '2px solid #f47c20',
            boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 25px -4px rgba(244, 124, 32, 0.15)'
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 1 }}>
                <Chip
                  icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                  label="اشتراک فعال شما"
                  color="success"
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
                {activeSubData.userSubscription?.endDate && (
                  <Chip
                    icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
                    label={`معتبر تا: ${formatDate(activeSubData.userSubscription.endDate)}`}
                    size="small"
                    sx={{
                      backgroundColor: isDark ? 'rgba(244, 124, 32, 0.15)' : '#fff8ed',
                      color: isDark ? '#fed7aa' : '#b94410',
                      fontWeight: 600
                    }}
                  />
                )}
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
                {activeSubData.subscription.title}
              </Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 2 }}>
                {activeSubData.subscription.description || 'شما در حال حاضر از دسترسی ویژه به دوره‌های تحت پوشش و نشان کاربری اختصاصی برخوردار هستید.'}
              </Typography>

              {activeSubData.includedCourses && activeSubData.includedCourses.length > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', mb: 0.5 }}>
                    دوره‌های باز شده با این اشتراک ({toPersianDigits(activeSubData.includedCourses.length)} دوره):
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {activeSubData.includedCourses.map((c) => (
                      <Chip
                        key={c.id}
                        label={c.name}
                        size="small"
                        sx={{
                          backgroundColor: isDark ? '#1e293b' : '#ffffff',
                          border: '1px solid',
                          borderColor: 'divider',
                          color: 'text.primary'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              {/* Dynamic Badge Display */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '20px',
                  backgroundColor: isDark ? 'rgba(244, 124, 32, 0.15)' : '#fff8ed',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(244, 124, 32, 0.3)' : '#ffdda8',
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: 160
                }}
              >
                {activeSubData.subscription.badgeIconSvg ? (
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      mb: 1,
                      '& svg': { width: '100%', height: '100%' }
                    }}
                    dangerouslySetInnerHTML={{ __html: sanitizeSvg(activeSubData.subscription.badgeIconSvg) }}
                  />
                ) : (
                  <VerifiedUserOutlinedIcon sx={{ fontSize: 44, color: '#f47c20', mb: 1 }} />
                )}

                <Typography variant="caption" sx={{ color: isDark ? '#fed7aa' : '#b94410', fontWeight: 600 }}>
                  نشان فعال:
                </Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: 'text.primary' }}>
                  {activeSubData.subscription.badgeLabel || activeSubData.subscription.title}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>
      )}

      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center', maxWidth: 640, mx: 'auto' }}>
        <Chip
          icon={<CardMembershipOutlinedIcon sx={{ fontSize: 16 }} />}
          label="پلن‌های عضویت ویژه"
          size="small"
          sx={{
            backgroundColor: isDark ? 'rgba(37, 99, 235, 0.2)' : '#eff6ff',
            color: isDark ? '#60a5fa' : '#2563eb',
            fontWeight: 700,
            mb: 1.5
          }}
        />
        <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.4rem', md: '2rem' }, mb: 1.5, color: 'text.primary' }}>
          دسترسی نامحدود با اشتراک حرکت
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
          با تهیه اشتراک‌های دوره‌ای، به جلسات هفتگی اتاق فکر، وبینارهای تخصصی، نشان ویژه کاربری و شبکه نخبگان حرکت دسترسی خواهید داشت.
        </Typography>
      </Box>

      {/* Subscriptions Grid */}
      <Grid container spacing={3.5} justifyContent="center">
        {subscriptions.map((sub, index) => {
          const isFeatured = index === 0;
          const sanitizedBadgeSvg = sanitizeSvg(sub.badgeIconSvg);

          return (
            <Grid item xs={12} sm={6} md={4} key={sub.id}>
              <Card
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  border: isFeatured ? '2px solid #f47c20' : '1px solid',
                  borderColor: isFeatured ? '#f47c20' : 'divider',
                  boxShadow: isFeatured
                    ? '0 12px 30px -8px rgba(244, 124, 32, 0.25)'
                    : (isDark ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.04)'),
                  position: 'relative',
                  backgroundColor: 'background.paper'
                }}
              >
                {isFeatured && (
                  <Chip
                    label="پیشنهاد ویژه"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      backgroundColor: '#f47c20',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.75rem'
                    }}
                  />
                )}

                {/* Badge preview if configured */}
                {(sub.badgeLabel || sanitizedBadgeSvg) && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 2,
                      p: 1,
                      backgroundColor: isDark ? 'rgba(244, 124, 32, 0.15)' : '#fff8ed',
                      borderRadius: '12px',
                      width: 'fit-content'
                    }}
                  >
                    {sanitizedBadgeSvg ? (
                      <Box
                        sx={{ width: 22, height: 22, display: 'flex', alignItems: 'center', '& svg': { width: '100%', height: '100%' } }}
                        dangerouslySetInnerHTML={{ __html: sanitizedBadgeSvg }}
                      />
                    ) : (
                      <VerifiedUserOutlinedIcon sx={{ fontSize: 20, color: '#f47c20' }} />
                    )}
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: isDark ? '#fed7aa' : '#b94410' }}>
                      نشان: {sub.badgeLabel || sub.title}
                    </Typography>
                  </Box>
                )}

                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
                  {sub.title}
                </Typography>

                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, minHeight: 40, lineHeight: 1.6 }}>
                  {sub.description || 'دسترسی کامل به محتواهای ویژه و وبینارهای تخصصی مدرسه حرکت.'}
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#f47c20' }}>
                      {formatPrice(sub.salePrice || sub.price)}
                    </Typography>
                    {sub.salePrice && (
                      <Typography sx={{ textDecoration: 'line-through', color: 'text.disabled', fontSize: '0.95rem' }}>
                        {formatPrice(sub.price)}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    مدت اعتبار: {toPersianDigits(sub.durationMonths || 1)} ماهه
                  </Typography>
                </Box>

                <Divider sx={{ mb: 3, borderColor: 'divider' }} />

                <List disablePadding sx={{ mb: 3, flex: 1 }}>
                  <ListItem disableGutters sx={{ py: 0.8 }}>
                    <ListItemIcon sx={{ minWidth: 28, color: '#16a34a' }}>
                      <CheckCircleIcon sx={{ fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="دسترسی به تمامی دوره‌های تحت پوشش"
                      primaryTypographyProps={{ fontSize: '0.86rem', fontWeight: 500, color: 'text.primary' }}
                    />
                  </ListItem>

                  <ListItem disableGutters sx={{ py: 0.8 }}>
                    <ListItemIcon sx={{ minWidth: 28, color: '#16a34a' }}>
                      <CheckCircleIcon sx={{ fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="نشان اختصاصی کاربری در پروفایل و دیدگاه‌ها"
                      primaryTypographyProps={{ fontSize: '0.86rem', fontWeight: 500, color: 'text.primary' }}
                    />
                  </ListItem>

                  <ListItem disableGutters sx={{ py: 0.8 }}>
                    <ListItemIcon sx={{ minWidth: 28, color: '#16a34a' }}>
                      <CheckCircleIcon sx={{ fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="پشتیبانی اولویت‌دار و تیکت مستقیم با اساتید"
                      primaryTypographyProps={{ fontSize: '0.86rem', fontWeight: 500, color: 'text.primary' }}
                    />
                  </ListItem>
                </List>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={addingId === sub.id}
                  onClick={() => handleSubscribe(sub)}
                  startIcon={addingId === sub.id ? <CircularProgress size={20} color="inherit" /> : <CreditCardOutlinedIcon />}
                  sx={{
                    py: 1.3,
                    borderRadius: '16px',
                    fontWeight: 700,
                    backgroundColor: '#f47c20',
                    '&:hover': { backgroundColor: '#df5b13' }
                  }}
                >
                  {addingId === sub.id ? 'در حال ثبت...' : 'خرید و فعال‌سازی اشتراک'}
                </Button>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
