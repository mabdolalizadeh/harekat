import { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useCart } from '../../contexts/CartContext.jsx';
import { cartApi } from '../../api/cartApi.js';
import { formatPrice, assetUrl, toPersianDigits } from '../../utils/formatters.js';

export default function CartDrawer() {
  const {
    items,
    itemCount,
    totalAmount,
    isDrawerOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    checkout,
    loading
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setCouponLoading(true);
      setCouponMessage(null);
      const res = await cartApi.validateCoupon(couponCode.trim(), totalAmount);
      if (res?.ok && res.data?.valid) {
        setCouponDiscount(res.data.discount || 0);
        setCouponMessage({ type: 'success', text: `تخفیف ${formatPrice(res.data.discount)} با موفقیت اعمال شد.` });
      } else {
        setCouponDiscount(0);
        setCouponMessage({ type: 'error', text: res?.message || 'کد تخفیف نامعتبر است.' });
      }
    } catch (err) {
      setCouponDiscount(0);
      setCouponMessage({ type: 'error', text: err.message || 'کد تخفیف نامعتبر یا منقضی است.' });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = async () => {
    try {
      setCheckoutError(null);
      setCheckoutSuccess(null);
      const order = await checkout(couponCode || undefined);
      setCheckoutSuccess(`سفارش شماره #${toPersianDigits(order.id.slice(0, 8))} با موفقیت ثبت شد!`);
      setCouponDiscount(0);
      setCouponCode('');
      setCouponMessage(null);
    } catch (err) {
      setCheckoutError(err.message || 'خطا در ثبت سفارش');
    }
  };

  const finalPayable = Math.max(0, totalAmount - couponDiscount);

  return (
    <Drawer
      anchor="left"
      open={isDrawerOpen}
      onClose={closeCart}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 420 },
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)'
        }
      }}
    >
      {/* Drawer Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f4f9' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShoppingBagOutlinedIcon sx={{ color: '#2563eb' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
            سبد خرید ({toPersianDigits(itemCount)})
          </Typography>
        </Box>
        <IconButton onClick={closeCart} size="small" sx={{ color: '#64748b' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content Area */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
        {checkoutSuccess ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 64, color: '#10b981', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              ثبت موفق سفارش
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
              {checkoutSuccess}
            </Typography>
            <Button variant="contained" onClick={closeCart} sx={{ borderRadius: '12px' }}>
              مشاهده در دوره‌های من
            </Button>
          </Box>
        ) : items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ShoppingBagOutlinedIcon sx={{ fontSize: 56, color: '#cbd5e1', mb: 1.5 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#475569', mb: 0.5 }}>
              سبد خرید شما خالی است
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
              دوره‌های آموزشی و بسته‌های مهارتی مورد نظر خود را اضافه کنید.
            </Typography>
            <Button
              variant="outlined"
              onClick={closeCart}
              sx={{ borderRadius: '12px', borderColor: '#cbd5e1', color: '#475569' }}
            >
              مشاهده دوره‌ها
            </Button>
          </Box>
        ) : (
          <>
            {checkoutError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: '14px' }}>
                {checkoutError}
              </Alert>
            )}

            <List disablePadding>
              {items.map((item) => (
                <ListItem
                  key={item.id}
                  sx={{
                    p: 2,
                    mb: 1.5,
                    border: '1px solid #eef2f6',
                    borderRadius: '16px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      variant="rounded"
                      src={assetUrl(item.productImage)}
                      sx={{ width: 52, height: 52, borderRadius: '12px', bgcolor: '#eff6ff' }}
                    >
                      🎓
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#171715' }}>
                        {item.productName || (item.productType === 'course' ? 'دوره آموزشی' : 'اشتراک')}
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#f47c20', mt: 0.5 }}>
                        {formatPrice(item.price)}
                      </Typography>
                    }
                  />

                  {/* Quantity & Delete */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                      sx={{ border: '1px solid #deddd7', borderRadius: '8px', p: 0.4 }}
                    >
                      <AddIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', px: 0.8 }}>
                      {toPersianDigits(item.quantity || 1)}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => {
                        if ((item.quantity || 1) > 1) {
                          updateQuantity(item.id, item.quantity - 1);
                        } else {
                          removeItem(item.id);
                        }
                      }}
                      sx={{ border: '1px solid #deddd7', borderRadius: '8px', p: 0.4 }}
                    >
                      <RemoveIcon sx={{ fontSize: 14 }} />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => removeItem(item.id)}
                      sx={{ color: '#e5484d', ml: 0.5 }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>

            {/* Coupon Code Input */}
            <Box sx={{ mt: 3, p: 2, backgroundColor: '#fff8ed', borderRadius: '16px', border: '1px solid #ffdda8' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, fontSize: '0.85rem', color: '#171715' }}>
                کد تخفیف دارید؟
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="مثلاً HAREKAT10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: '#ffffff'
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleValidateCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  sx={{ borderRadius: '12px', minWidth: 80, borderColor: '#f47c20', color: '#f47c20' }}
                >
                  {couponLoading ? <CircularProgress size={18} /> : 'اعمال'}
                </Button>
              </Box>
              {couponMessage && (
                <Typography
                  sx={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    mt: 1,
                    color: couponMessage.type === 'success' ? '#10b981' : '#ef4444'
                  }}
                >
                  {couponMessage.text}
                </Typography>
              )}
            </Box>
          </>
        )}
      </Box>

      {/* Drawer Footer / Checkout */}
      {items.length > 0 && !checkoutSuccess && (
        <Box sx={{ p: 2.5, borderTop: '1px solid #f1f4f9', backgroundColor: '#ffffff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ color: '#64748b' }}>جمع اقلام:</Typography>
            <Typography sx={{ fontWeight: 600 }}>{formatPrice(totalAmount)}</Typography>
          </Box>
          {couponDiscount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#10b981' }}>تخفیف کوپن:</Typography>
              <Typography sx={{ fontWeight: 700, color: '#10b981' }}>- {formatPrice(couponDiscount)}</Typography>
            </Box>
          )}
          <Divider sx={{ my: 1.5 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#171715' }}>مبلغ قابل پرداخت:</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#f47c20' }}>
              {formatPrice(finalPayable)}
            </Typography>
          </Box>

          <Button
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            onClick={handleCheckout}
            sx={{
              py: 1.4,
              borderRadius: '16px',
              fontSize: '1rem',
              fontWeight: 700
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'ثبت سفارش و پرداخت'}
          </Button>

          <Button
            onClick={clearCart}
            fullWidth
            size="small"
            sx={{ mt: 1, color: '#94a3b8', fontSize: '0.75rem' }}
          >
            پاک کردن تمام سبد خرید
          </Button>
        </Box>
      )}
    </Drawer>
  );
}
