import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Stack,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Skeleton,
  Alert,
  Divider,
  Paper,
} from '@mui/material';
import {
  School as CourseIcon,
  People as StudentIcon,
  ShoppingCart as OrderIcon,
  Paid as RevenueIcon,
  CreditCard as SubscriptionIcon,
  LiveHelp as TicketIcon,
  ArrowForward as ArrowIcon,
  Add as AddIcon,
  Bolt as QuickIcon,
} from '@mui/icons-material';
import { adminApi, isTA } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { formatToman } from '../../utils/format.js';
import PageHeader from '../../components/admin/PageHeader.jsx';
import StatCard from '../../components/admin/StatCard.jsx';
import StatusChip from '../../components/admin/StatusChip.jsx';
import EmptyState from '../../components/admin/EmptyState.jsx';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const ta = isTA();
  const { data, loading, error, reload } = useApi(() => adminApi.dashboard());

  const courses = useMemo(() => data?.courses?.data || [], [data]);
  const categories = useMemo(() => data?.categories?.data || [], [data]);
  const teachers = useMemo(() => data?.teachers?.data || [], [data]);
  const orders = useMemo(() => data?.orders?.data || [], [data]);
  const payments = useMemo(() => data?.payments?.data || [], [data]);
  const students = useMemo(() => data?.students?.data || [], [data]);
  const subscriptions = useMemo(() => data?.subscriptions?.data || [], [data]);
  const tickets = useMemo(() => data?.tickets?.data || [], [data]);

  // Calculate real metrics from backend
  const totalRevenue = useMemo(() => {
    let sum = 0;
    for (const p of payments) {
      if (p.status === 'paid' || p.type === 'paid') {
        const val = Number(String(p.amount || 0).replace(/[,٬\s]/g, ''));
        if (Number.isFinite(val)) sum += val;
      }
    }
    return sum;
  }, [payments]);

  const activeSubCount = useMemo(() => {
    return subscriptions.filter((s) => s.isActive).length;
  }, [subscriptions]);

  const pendingTicketsCount = useMemo(() => {
    return tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;
  }, [tickets]);

  const recentOrders = useMemo(() => {
    return orders.slice(0, 5);
  }, [orders]);

  const recentTickets = useMemo(() => {
    return tickets.slice(0, 5);
  }, [tickets]);

  if (loading) {
    return (
      <Stack spacing={3}>
        <Box>
          <Skeleton variant="text" width={200} height={36} />
          <Skeleton variant="text" width={320} height={20} sx={{ mt: 0.5 }} />
        </Box>

        <Grid container spacing={2.5}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" justifyContent="space-between" mb={2}>
                  <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: 2 }} />
                  <Skeleton variant="rounded" width={50} height={22} sx={{ borderRadius: 1 }} />
                </Stack>
                <Skeleton variant="text" width={80} height={36} />
                <Skeleton variant="text" width={140} height={18} sx={{ mt: 0.5 }} />
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Card elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
              <Skeleton variant="text" width={160} height={26} sx={{ mb: 2 }} />
              <Stack spacing={1.5}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={44} sx={{ borderRadius: 2 }} />
                ))}
              </Stack>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, lg: 5 }}>
            <Card elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
              <Skeleton variant="text" width={160} height={26} sx={{ mb: 2 }} />
              <Stack spacing={1.5}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={44} sx={{ borderRadius: 2 }} />
                ))}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack spacing={2}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={reload}>
              تلاش مجدد
            </Button>
          }
        >
          خطا در بارگذاری اطلاعات داشبورد: {error}
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={3.5}>
      <PageHeader
        title={ta ? 'میز کار دستیار آموزشی' : 'داشبورد مدیریت سامانه'}
        subtitle="خلاصه آمار جامع دوره‌ها، دانشجویان، تراکنش‌های مالی و تیکت‌های پشتیبانی"
        action={
          !ta && (
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                startIcon={<QuickIcon />}
                onClick={() => navigate('/students')}
              >
                بررسی دسترسی‌ها
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/courses')}
              >
                دوره جدید
              </Button>
            </Stack>
          )
        }
      />

      {/* Primary Stat Cards */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="کل دانشجویان و کاربران"
            value={students.length.toLocaleString('fa-IR')}
            icon={StudentIcon}
            color="primary"
            caption={`${students.filter((s) => s.phoneNumber).length} کاربر با شماره موبایل ثبت‌شده`}
            onClick={() => !ta && navigate('/students')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="دوره‌های آموزشی فعال"
            value={courses.length.toLocaleString('fa-IR')}
            icon={CourseIcon}
            color="info"
            caption={`${categories.length} دسته‌بندی موضوعی و ${teachers.length} مدرس`}
            onClick={() => navigate('/courses')}
          />
        </Grid>

        {!ta && (
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              title="مجموع درآمد تاییدشده"
              value={formatToman(totalRevenue)}
              icon={RevenueIcon}
              color="success"
              badge={`${payments.filter((p) => p.status === 'paid' || p.type === 'paid').length} تراکنش موفق`}
              badgeColor="success"
              caption="محاسبه‌شده از تراکنش‌های موفق درگاه"
              onClick={() => navigate('/payments')}
            />
          </Grid>
        )}

        {!ta && (
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              title="سفارش‌های ثبت‌شده"
              value={orders.length.toLocaleString('fa-IR')}
              icon={OrderIcon}
              color="warning"
              badge={`${orders.filter((o) => o.status === 'pending').length} در انتظار پرداخت`}
              badgeColor="warning"
              caption="سفارش‌های سبد خرید دانشجویان"
              onClick={() => navigate('/orders')}
            />
          </Grid>
        )}

        {!ta && (
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              title="پلن‌های اشتراک فعال"
              value={activeSubCount.toLocaleString('fa-IR')}
              icon={SubscriptionIcon}
              color="secondary"
              caption={`از مجموع ${subscriptions.length} نوع پلن اشتراک ماهانه`}
              onClick={() => navigate('/subscriptions')}
            />
          </Grid>
        )}

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="تیکت‌های در انتظار پاسخ"
            value={pendingTicketsCount.toLocaleString('fa-IR')}
            icon={TicketIcon}
            color={pendingTicketsCount > 0 ? 'error' : 'success'}
            badge={pendingTicketsCount > 0 ? 'نیاز به بررسی' : 'پاسخ داده شده'}
            badgeColor={pendingTicketsCount > 0 ? 'error' : 'success'}
            caption={`از مجموع ${tickets.length} تیکت پشتیبانی سامانه`}
            onClick={() => navigate('/tickets')}
          />
        </Grid>
      </Grid>

      {/* Main Split: Recent Orders & Support Tickets */}
      <Grid container spacing={3}>
        {/* Left Column: Recent Orders (or Course Quickview for TA) */}
        {!ta ? (
          <Grid size={{ xs: 12, lg: 7 }}>
            <Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
              <CardHeader
                title={
                  <Typography variant="h6" fontWeight={700}>
                    آخرین سفارش‌ها
                  </Typography>
                }
                action={
                  <Button
                    size="small"
                    endIcon={<ArrowIcon sx={{ transform: 'rotate(180deg)' }} />}
                    onClick={() => navigate('/orders')}
                  >
                    مشاهده همه ({orders.length})
                  </Button>
                }
                sx={{ px: 3, pt: 2.5, pb: 1.5 }}
              />
              <Divider />
              <CardContent sx={{ p: 0 }}>
                {recentOrders.length > 0 ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>شناسه</TableCell>
                        <TableCell>کاربر</TableCell>
                        <TableCell>مبلغ نهایی</TableCell>
                        <TableCell>وضعیت</TableCell>
                        <TableCell align="left">تاریخ ثبت</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentOrders.map((o) => {
                        const user = o.user;
                        const userName = user
                          ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.phoneNumber
                          : 'نامشخص';
                        return (
                          <TableRow key={o.id} hover>
                            <TableCell dir="ltr" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                              #{o.id.slice(0, 8)}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{userName}</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>{formatToman(o.finalAmount)}</TableCell>
                            <TableCell>
                              <StatusChip status={o.status} />
                            </TableCell>
                            <TableCell align="left" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                              {o.createdAt ? new Date(o.createdAt).toLocaleDateString('fa-IR') : '—'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <Box sx={{ p: 4 }}>
                    <EmptyState title="سفارشی ثبت نشده است" description="تاکنون سفارشی در سامانه ایجاد نشده است." />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ) : (
          <Grid size={{ xs: 12, lg: 7 }}>
            <Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
              <CardHeader
                title={
                  <Typography variant="h6" fontWeight={700}>
                    دوره‌های من
                  </Typography>
                }
                action={
                  <Button
                    size="small"
                    endIcon={<ArrowIcon sx={{ transform: 'rotate(180deg)' }} />}
                    onClick={() => navigate('/courses')}
                  >
                    مشاهده دوره‌ها
                  </Button>
                }
                sx={{ px: 3, pt: 2.5, pb: 1.5 }}
              />
              <Divider />
              <CardContent sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  به عنوان دستیار آموزشی، شما به جلسات آموزشی، آزمون‌ها و تیکت‌های دوره‌های اختصاص‌یافته خود دسترسی دارید.
                </Typography>
                <Grid container spacing={2}>
                  {courses.slice(0, 4).map((c) => (
                    <Grid key={c.id} size={{ xs: 12, sm: 6 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                        }}
                      >
                        <Typography fontWeight={700} fontSize="0.9rem" noWrap>
                          {c.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                          سطح: {c.level || 'عمومی'} · {c.duration || 'بدون مشخصات'}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Right Column: Recent Tickets */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
            <CardHeader
              title={
                <Typography variant="h6" fontWeight={700}>
                  تیکت‌های اخیر
                </Typography>
              }
              action={
                <Button
                  size="small"
                  endIcon={<ArrowIcon sx={{ transform: 'rotate(180deg)' }} />}
                  onClick={() => navigate('/tickets')}
                >
                  همه ({tickets.length})
                </Button>
              }
              sx={{ px: 3, pt: 2.5, pb: 1.5 }}
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              {recentTickets.length > 0 ? (
                <Stack divider={<Divider />} sx={{ px: 0 }}>
                  {recentTickets.map((t) => {
                    const user = t.user;
                    const userName = user
                      ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.phoneNumber
                      : 'کاربر';
                    return (
                      <Box
                        key={t.id}
                        sx={{
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1.5,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                        onClick={() => navigate('/tickets')}
                      >
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography fontWeight={600} fontSize="0.84rem" noWrap>
                            {t.subject}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap display="block" mt={0.25}>
                            {userName} {t.course?.name ? `· ${t.course.name}` : ''}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
                          <StatusChip status={t.status} size="small" />
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              ) : (
                <Box sx={{ p: 4 }}>
                  <EmptyState title="تیکتی ثبت نشده است" description="هیچ تیکت پشتیبانی جدیدی وجود ندارد." />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
