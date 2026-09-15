import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  Grid
} from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { ordersApi } from '../api/ordersApi.js';
import { formatPrice, formatDate, assetUrl, toPersianDigits } from '../utils/formatters.js';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const res = await ordersApi.getOrders();
        if (res?.ok && res.data) {
          setOrders(res.data);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const getStatusChip = (status) => {
    switch (status) {
      case 'paid':
        return (
          <Chip
            icon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
            label="پرداخت شده"
            size="small"
            sx={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 700 }}
          />
        );
      case 'pending':
        return (
          <Chip
            icon={<HourglassEmptyIcon sx={{ fontSize: 16 }} />}
            label="در انتظار پرداخت"
            size="small"
            sx={{ backgroundColor: '#fef3c7', color: '#b45309', fontWeight: 700 }}
          />
        );
      default:
        return (
          <Chip
            icon={<HighlightOffIcon sx={{ fontSize: 16 }} />}
            label="ناموفق یا لغو شده"
            size="small"
            sx={{ backgroundColor: '#fee2e2', color: '#b91c1c', fontWeight: 700 }}
          />
        );
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
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.4rem', md: '1.75rem' }, mb: 0.5 }}>
          تاریخچه سفارشات و خریدها
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          سفارشات ثبت شده، وضعیت پرداخت و دوره‌های خریداری شده ({toPersianDigits(orders.length)} سفارش)
        </Typography>
      </Box>

      {orders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10, px: 2, backgroundColor: '#f8fafc', borderRadius: '24px', border: '1px dashed #cbd5e1' }}>
          <ReceiptLongOutlinedIcon sx={{ fontSize: 60, color: '#94a3b8', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#334155' }}>
            هنوز سفارشی ثبت نکرده‌اید
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            پس از خرید دوره‌ها یا اشتراک‌ها، فاکتور و جزئیات آن‌ها در این بخش نمایش داده می‌شود.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order.id}>
              <Card
                sx={{
                  borderRadius: '24px',
                  border: '1px solid #eef2f7',
                  boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
                  overflow: 'hidden'
                }}
              >
                {/* Order Header bar */}
                <Box
                  sx={{
                    p: 2.5,
                    backgroundColor: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    borderBottom: '1px solid #eef2f7'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>
                      سفارش #{order.id.slice(0, 8)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                      {formatDate(order.createdAt)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {getStatusChip(order.status)}
                    <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#2563eb' }}>
                      {formatPrice(order.finalAmount || order.totalAmount)}
                    </Typography>
                  </Box>
                </Box>

                {/* Items List */}
                <CardContent sx={{ p: 2.5 }}>
                  <List disablePadding>
                    {order.items?.map((item, idx) => (
                      <ListItem
                        key={item.id || idx}
                        disableGutters
                        sx={{
                          py: 1.5,
                          borderBottom: idx === (order.items.length - 1) ? 'none' : '1px solid #f1f4f9',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            variant="rounded"
                            src={assetUrl(item.productImage)}
                            sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: '#eff6ff' }}
                          >
                            🎓
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>
                              {item.productName || (item.productType === 'course' ? 'دوره آموزشی' : 'اشتراک')}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              تعداد: {toPersianDigits(item.quantity || 1)} • قیمت: {formatPrice(item.price)}
                            </Typography>
                          }
                        />
                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>
                          {formatPrice((Number(item.price) || 0) * (item.quantity || 1))}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
