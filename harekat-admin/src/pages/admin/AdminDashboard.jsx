import { adminApi } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { Box, Card, CardContent, Typography, Grid, Stack, Skeleton, Alert, Button, Divider, List, ListItem, ListItemIcon, Chip } from '@mui/material';
import {
  ShoppingBag as BagIcon,
  Category as CategoryIcon,
  People as PeopleIcon,
  LocalOffer as OfferIcon,
  Discount as DiscountIcon,
  Menu as MenuIcon,
  Article as ArticleIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', inset: 0, background: `radial-gradient(300px 120px at 85% 0%, ${color}14, transparent 70%)`, pointerEvents: 'none' }} />
      <CardContent sx={{ position: 'relative' }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={1.5}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: `${color}14`, color: color }}>
            <Icon fontSize="small" />
          </Box>
          {sub && <Chip label={sub} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />}
        </Stack>
        <Typography variant="h4" fontWeight={800} lineHeight={1}>{value}</Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={600} fontSize={12.5}>{label}</Typography>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data, loading, error, reload } = useApi(() => adminApi.dashboard());

  if (loading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Grid key={i} size={{ xs: 6, lg: 4 }}>
            <Skeleton variant="rounded" height={120} sx={{ borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>
    );
  }
  if (error) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">خطا در بارگذاری: {error}</Alert>
        <Button onClick={reload} variant="outlined" sx={{ alignSelf: 'flex-start' }}>تلاش مجدد</Button>
      </Stack>
    );
  }

  const courses = data?.courses?.data ?? [];
  const categories = data?.categories?.data ?? [];
  const coupons = data?.coupons?.data ?? [];
  const menu = data?.menu?.data ?? [];
  const content = data?.content?.data ?? [];
  const teachers = data?.teachers?.data ?? [];
  const discounted = courses.filter((c) => c.salePrice && Number(c.salePrice) < Number(c.price)).length;

  const stats = [
    { label: 'محصولات (دوره‌ها)', value: courses.length, icon: BagIcon, color: '#315efb' },
    { label: 'دسته‌بندی‌ها', value: categories.length, icon: CategoryIcon, color: '#7c3aed' },
    { label: 'مدرسان', value: teachers.length, icon: PeopleIcon, color: '#0e9f6e' },
    { label: 'کدهای تخفیف', value: coupons.length, icon: OfferIcon, color: '#f59e0b' },
    { label: 'محصولات تخفیف‌دار', value: discounted, icon: DiscountIcon, color: '#e5484d', sub: `${courses.length ? Math.round((discounted / courses.length) * 100) : 0}%` },
    { label: 'آیتم‌های سربرگ', value: menu.length, icon: MenuIcon, color: '#06b6d4' },
    { label: 'بلوک‌های محتوا', value: content.length, icon: ArticleIcon, color: '#6b7280' },
  ];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={800}>نمای کلی</Typography>
        <Typography variant="body2" color="text.secondary" fontSize={13} mt={0.5}>خلاصه‌ای از وضعیت فعلی پنل و محتوا</Typography>
      </Box>

      <Grid container spacing={2}>
        {stats.map((s) => (
          <Grid key={s.label} size={{ xs: 6, md: 4, lg: 3 }}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography fontWeight={700} mb={1.5}>راهنمای سریع</Typography>
          <Divider sx={{ mb: 2 }} />
          <List dense disablePadding>
            {[
              'قیمت اصلی و قیمت فروش (تخفیف‌دار) هر محصول را از بخش محصولات مدیریت کنید.',
              'چهار بخش اصلی (آموزش کپسولی، مقدماتی، پکیج‌ها، اشتراک‌ها) دسته‌بندی هستند — از همان بخش محصولات.',
              'کدهای تخفیف در سبد خرید با اعتبارسنجی سمت سرور اعمال می‌شوند.',
              'منوی سربرگ، نوار متحرک، مدرسان و محتوای سایت (تماس، شبکه‌های اجتماعی، هیرو) بدون تغییر کد قابل ویرایش است.',
            ].map((t) => (
              <ListItem key={t} disablePadding sx={{ py: 0.6, alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 28, mt: 0.4 }}><CheckIcon fontSize="small" color="success" /></ListItemIcon>
                <Typography variant="body2" color="text.secondary" fontSize={13.5} lineHeight={1.7}>{t}</Typography>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Stack>
  );
}
