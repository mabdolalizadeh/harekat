import { useState, useEffect } from 'react';
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
  ListItemText
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CardMembershipOutlinedIcon from '@mui/icons-material/CardMembershipOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { subscriptionsApi } from '../api/subscriptionsApi.js';
import { useCart } from '../contexts/CartContext.jsx';
import { formatPrice, toPersianDigits } from '../utils/formatters.js';

export default function SubscriptionsPage() {
  const { addToCart } = useCart();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    async function loadSubs() {
      try {
        setLoading(true);
        const res = await subscriptionsApi.getSubscriptions();
        if (res?.ok && res.data) {
          setSubscriptions(res.data);
        }
      } catch (err) {
        console.error('Failed to load subscriptions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSubs();
  }, []);

  const handleSubscribe = async (sub) => {
    try {
      setAddingId(sub.id);
      const effectivePrice = sub.salePrice || sub.price;
      await addToCart(sub.id, 'subscription', 1, effectivePrice);
    } catch (err) {
      console.error(err);
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

  return (
    <Box>
      <Box sx={{ mb: 4, textAlign: 'center', maxWidth: 640, mx: 'auto' }}>
        <Chip
          icon={<CardMembershipOutlinedIcon sx={{ fontSize: 16 }} />}
          label="پلن‌های عضویت ویژه"
          size="small"
          sx={{ backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: 700, mb: 1.5 }}
        />
        <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '2rem' }, mb: 1.5 }}>
          دسترسی نامحدود با اشتراک حرکت
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.7 }}>
          با تهیه اشتراک‌های دوره‌ای، به جلسات هفتگی اتاق فکر، وبینارهای تخصصی، پکیج‌های ضبط شده و شبکه نخبگان حرکت دسترسی خواهید داشت.
        </Typography>
      </Box>

      <Grid container spacing={3.5} justifyContent="center">
        {subscriptions.map((sub, index) => {
          const isFeatured = index === 0;
          return (
            <Grid item xs={12} sm={6} md={4} key={sub.id}>
              <Card
                sx={{
                  p: 3.5,
                  borderRadius: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  border: isFeatured ? '2px solid #2563eb' : '1px solid #eef2f7',
                  boxShadow: isFeatured
                    ? '0 20px 40px -10px rgba(37, 99, 235, 0.15)'
                    : '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
                  position: 'relative',
                  backgroundColor: '#ffffff'
                }}
              >
                {isFeatured && (
                  <Chip
                    label="پیشنهاد ویژه"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -12,
                      right: 24,
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      fontWeight: 800,
                      px: 1
                    }}
                  />
                )}

                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  {sub.name}
                </Typography>

                <Typography variant="body2" sx={{ color: '#64748b', mb: 3, minHeight: 44 }}>
                  {sub.description || 'دسترسی کامل به تمام امکانات اختصاصی و محتوای VIP.'}
                </Typography>

                {/* Price block */}
                <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: '18px' }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 0.5 }}>
                    هزینه اشتراک:
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#2563eb' }}>
                    {formatPrice(sub.salePrice || sub.price)}
                  </Typography>
                </Box>

                {/* Benefits checklist */}
                <List disablePadding sx={{ mb: 3, flex: 1 }}>
                  <ListItem disableGutters sx={{ py: 0.6 }}>
                    <ListItemIcon sx={{ minWidth: 28, color: '#10b981' }}>
                      <CheckCircleIcon sx={{ fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="دسترسی به تمام جلسات اتاق فکر"
                      primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}
                    />
                  </ListItem>
                  <ListItem disableGutters sx={{ py: 0.6 }}>
                    <ListItemIcon sx={{ minWidth: 28, color: '#10b981' }}>
                      <CheckCircleIcon sx={{ fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="دانلود فایل‌ها و جزوات جلسات"
                      primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}
                    />
                  </ListItem>
                  <ListItem disableGutters sx={{ py: 0.6 }}>
                    <ListItemIcon sx={{ minWidth: 28, color: '#10b981' }}>
                      <CheckCircleIcon sx={{ fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="پرسش و پاسخ مستقیم با اساتید"
                      primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}
                    />
                  </ListItem>
                </List>

                <Button
                  variant={isFeatured ? 'contained' : 'outlined'}
                  fullWidth
                  size="large"
                  disabled={addingId === sub.id}
                  onClick={() => handleSubscribe(sub)}
                  startIcon={<ShoppingBagOutlinedIcon />}
                  sx={{ py: 1.3, borderRadius: '16px', fontWeight: 700 }}
                >
                  {addingId === sub.id ? <CircularProgress size={22} color="inherit" /> : 'فعال‌سازی اشتراک'}
                </Button>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
