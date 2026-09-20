import { useState, useMemo } from 'react';
import {
  Box,
  Stack,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  Paper,
  CircularProgress,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  ShoppingCart as CartIcon,
  School as CourseIcon,
  CreditCard as SubIcon,
  Sync as UpdateIcon,
} from '@mui/icons-material';
import { adminApi, isSuperAdmin } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { formatToman } from '../../utils/format.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import StatusChip from '../../components/admin/StatusChip.jsx';

export default function AdminOrders() {
  const { showSuccess, showError } = useNotification();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const orders = useApi(() => adminApi.listOrders());

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status || 'pending');
  };

  const handleUpdateStatus = async () => {
    if (!newStatus || !selectedOrder) return;
    setUpdating(true);
    try {
      await adminApi.updateOrderStatus(selectedOrder.id, { status: newStatus });
      showSuccess('وضعیت سفارش با موفقیت تغییر کرد');
      setSelectedOrder(null);
      orders.reload();
    } catch (err) {
      showError(err.message || 'خطا در بروزرسانی وضعیت سفارش');
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = useMemo(() => {
    const list = orders.data || [];
    if (statusFilter === 'all') return list;
    return list.filter((o) => o.status === statusFilter);
  }, [orders.data, statusFilter]);

  const columns = useMemo(() => [
    {
      id: 'id',
      label: 'شماره سفارش',
      render: (row) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', borderRadius: 1.5 }}>
            <CartIcon sx={{ fontSize: 16 }} />
          </Avatar>
          <Typography dir="ltr" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem' }}>
            #{row.id.slice(0, 8)}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'user',
      label: 'کاربر / دانشجو',
      render: (row) => {
        const user = row.user;
        const name = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.phoneNumber : '—';
        return (
          <Box>
            <Typography fontWeight={700} fontSize="0.84rem">
              {name}
            </Typography>
            {user?.phoneNumber && (
              <Typography variant="caption" color="text.secondary" dir="ltr" display="block">
                {user.phoneNumber}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      id: 'finalAmount',
      label: 'مبلغ نهایی',
      render: (row) => (
        <Typography fontWeight={700} fontSize="0.84rem">
          {formatToman(row.finalAmount)}
        </Typography>
      ),
    },
    {
      id: 'couponCode',
      label: 'کد تخفیف',
      render: (row) => (
        row.couponCode ? (
          <Chip label={row.couponCode} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }} />
        ) : (
          '—'
        )
      ),
    },
    {
      id: 'status',
      label: 'وضعیت',
      render: (row) => <StatusChip status={row.status} />,
    },
    {
      id: 'createdAt',
      label: 'تاریخ ثبت',
      render: (row) => (
        <Typography variant="caption" color="text.secondary">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString('fa-IR') : '—'}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'جزئیات',
      sortable: false,
      align: 'left',
      render: (row) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<ViewIcon fontSize="small" />}
          onClick={() => handleOpenDetail(row)}
          sx={{ borderRadius: 2 }}
        >
          مشاهده
        </Button>
      ),
    },
  ], []);

  if (!isSuperAdmin()) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="warning.main">دسترسی به بخش سفارشات فقط برای مدیر ارشد مجاز است.</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3.5}>
      <PageHeader
        title="سفارش‌ها"
        subtitle="مشاهده، بررسی آیتم‌ها و تغییر وضعیت سفارش‌های ثبت‌شده توسط دانشجویان"
      />

      {/* Orders DataTable */}
      <DataTable
        columns={columns}
        rows={filteredOrders}
        loading={orders.loading}
        error={orders.error}
        onReload={orders.reload}
        searchPlaceholder="جستجوی شماره سفارش، نام یا شماره تماس..."
        searchFilter={(row, term) => {
          const user = row.user;
          const name = `${user?.firstName || ''} ${user?.lastName || ''}`.toLowerCase();
          const phone = (user?.phoneNumber || '').toLowerCase();
          const id = (row.id || '').toLowerCase();
          return name.includes(term) || phone.includes(term) || id.includes(term);
        }}
        filterSlot={
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>فیلتر وضعیت</InputLabel>
            <Select
              value={statusFilter}
              label="فیلتر وضعیت"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">همه وضعیت‌ها</MenuItem>
              <MenuItem value="pending">در انتظار پرداخت</MenuItem>
              <MenuItem value="paid">پرداخت شده</MenuItem>
              <MenuItem value="failed">ناموفق</MenuItem>
              <MenuItem value="cancelled">لغو شده</MenuItem>
              <MenuItem value="refunded">مرجوع شده</MenuItem>
            </Select>
          </FormControl>
        }
        emptyTitle="سفارشی یافت نشد"
        emptyDescription="هیچ سفارشی مطابق فیلترهای انتخابی پیدا نشد."
      />

      {/* Order Detail Dialog */}
      {selectedOrder && (
        <Dialog open onClose={() => setSelectedOrder(null)} maxWidth="sm" fullWidth dir="rtl">
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                سفارش شماره #{selectedOrder.id.slice(0, 8)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('fa-IR') : '—'}
              </Typography>
            </Box>
            <StatusChip status={selectedOrder.status} />
          </DialogTitle>

          <DialogContent dividers sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              {/* Customer Info Card */}
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.5}>
                  مشخصات خریدار
                </Typography>
                <Typography fontWeight={700} fontSize="0.9rem">
                  {selectedOrder.user ? `${selectedOrder.user.firstName || ''} ${selectedOrder.user.lastName || ''}`.trim() || 'بدون نام' : 'کاربر نامشخص'}
                </Typography>
                {selectedOrder.user?.phoneNumber && (
                  <Typography variant="body2" color="text.secondary" dir="ltr" textAlign="right">
                    {selectedOrder.user.phoneNumber}
                  </Typography>
                )}
              </Paper>

              {/* Order Items Table */}
              <Box>
                <Typography fontWeight={700} fontSize="0.875rem" mb={1}>
                  اقلام سفارش
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>محصول</TableCell>
                      <TableCell align="center">تعداد</TableCell>
                      <TableCell align="left">قیمت</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedOrder.items || []).map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {item.productType === 'subscription' ? (
                              <SubIcon fontSize="small" color="secondary" />
                            ) : (
                              <CourseIcon fontSize="small" color="primary" />
                            )}
                            <Typography fontSize="0.84rem">
                              {item.productName || item.productId}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="left" sx={{ fontWeight: 600 }}>
                          {formatToman(item.price)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>

              <Divider />

              {/* Financial Totals */}
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">مبلغ کل:</Typography>
                  <Typography variant="body2">{formatToman(selectedOrder.totalAmount)}</Typography>
                </Stack>
                {selectedOrder.discountAmount && Number(selectedOrder.discountAmount) > 0 && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      تخفیف {selectedOrder.couponCode ? `(${selectedOrder.couponCode})` : ''}:
                    </Typography>
                    <Typography variant="body2" color="error.main">
                      - {formatToman(selectedOrder.discountAmount)}
                    </Typography>
                  </Stack>
                )}
                <Stack direction="row" justifyContent="space-between" pt={0.5}>
                  <Typography variant="body1" fontWeight={700}>مبلغ پرداختی نهایی:</Typography>
                  <Typography variant="body1" fontWeight={800} color="primary.main">
                    {formatToman(selectedOrder.finalAmount)}
                  </Typography>
                </Stack>
              </Stack>

              <Divider />

              {/* Status Update Control */}
              <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography fontWeight={700} fontSize="0.84rem" mb={1.5}>
                  تغییر وضعیت این سفارش
                </Typography>
                <Stack direction="row" spacing={1.5}>
                  <FormControl fullWidth size="small">
                    <InputLabel>وضعیت جدید</InputLabel>
                    <Select
                      value={newStatus}
                      label="وضعیت جدید"
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <MenuItem value="pending">در انتظار پرداخت</MenuItem>
                      <MenuItem value="paid">پرداخت شده</MenuItem>
                      <MenuItem value="failed">ناموفق</MenuItem>
                      <MenuItem value="cancelled">لغو شده</MenuItem>
                      <MenuItem value="refunded">مرجوع شده</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    disabled={updating || newStatus === selectedOrder.status}
                    onClick={handleUpdateStatus}
                    startIcon={updating ? <CircularProgress size={16} color="inherit" /> : <UpdateIcon />}
                    sx={{ flexShrink: 0 }}
                  >
                    {updating ? 'در حال ثبت...' : 'ثبت وضعیت'}
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setSelectedOrder(null)} variant="outlined">
              بستن
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  );
}
