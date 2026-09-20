import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Stack,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Send as SendIcon,
  LiveHelp as HelpIcon,
  Person as PersonIcon,
  SupportAgent as StaffIcon,
} from '@mui/icons-material';
import { adminApi } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import StatusChip from '../../components/admin/StatusChip.jsx';

export default function AdminTickets() {
  const { showSuccess, showError } = useNotification();
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const tickets = useApi(() => adminApi.listTickets());

  const openConversation = useCallback(async (t) => {
    try {
      const res = await adminApi.getTicket(t.id);
      setActiveTicket(res.data);
    } catch (err) {
      showError(err.message || 'خطا در بارگذاری پیام‌های تیکت');
    }
  }, [showError]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeTicket) return;
    setSending(true);
    try {
      await adminApi.replyTicket(activeTicket.id, { message: replyText.trim() });
      setReplyText('');
      const updated = await adminApi.getTicket(activeTicket.id);
      setActiveTicket(updated.data);
      tickets.reload();
      showSuccess('پاسخ شما با موفقیت ثبت و ارسال شد');
    } catch (err) {
      showError(err.message || 'خطا در ارسال پاسخ');
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status) => {
    if (!activeTicket) return;
    try {
      await adminApi.updateTicket(activeTicket.id, { status });
      const updated = await adminApi.getTicket(activeTicket.id);
      setActiveTicket(updated.data);
      tickets.reload();
      showSuccess('وضعیت تیکت تغییر کرد');
    } catch (err) {
      showError(err.message || 'خطا در تغییر وضعیت تیکت');
    }
  };

  const filteredTickets = useMemo(() => {
    const list = tickets.data || [];
    if (statusFilter === 'all') return list;
    return list.filter((t) => t.status === statusFilter);
  }, [tickets.data, statusFilter]);

  const columns = useMemo(() => [
    {
      id: 'subject',
      label: 'موضوع تیکت',
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'info.light', borderRadius: 2 }}>
            <HelpIcon sx={{ fontSize: 18 }} />
          </Avatar>
          <Box>
            <Typography fontWeight={700} fontSize="0.84rem">
              {row.subject}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {row.course?.name ? `دوره: ${row.course.name}` : 'پشتیبانی عمومی'}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      id: 'user',
      label: 'کاربر / دانشجو',
      render: (row) => {
        const user = row.user;
        const name = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.phoneNumber : 'کاربر';
        return (
          <Box>
            <Typography fontWeight={600} fontSize="0.84rem">
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
      id: 'priority',
      label: 'اولویت',
      render: (row) => <StatusChip status={row.priority || 'medium'} />,
    },
    {
      id: 'status',
      label: 'وضعیت',
      render: (row) => <StatusChip status={row.status || 'open'} />,
    },
    {
      id: 'updatedAt',
      label: 'آخرین بروزرسانی',
      render: (row) => (
        <Typography variant="caption" color="text.secondary">
          {row.updatedAt ? new Date(row.updatedAt).toLocaleDateString('fa-IR') : '—'}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'گفتگو',
      sortable: false,
      align: 'left',
      render: (row) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<ChatIcon fontSize="small" />}
          onClick={() => openConversation(row)}
          sx={{ borderRadius: 2 }}
        >
          مشاهده پیام‌ها
        </Button>
      ),
    },
  ], [openConversation]);

  return (
    <Stack spacing={3.5}>
      <PageHeader
        title="تیکت‌های پشتیبانی"
        subtitle="پاسخگویی، بررسی سوالات آموزشی و پیگیری تیکت‌های مطرح‌شده توسط دانشجویان"
      />

      {/* Tickets DataTable */}
      <DataTable
        columns={columns}
        rows={filteredTickets}
        loading={tickets.loading}
        error={tickets.error}
        onReload={tickets.reload}
        searchPlaceholder="جستجوی موضوع، نام دانشجو..."
        searchFilter={(row, term) => {
          const user = row.user;
          const name = `${user?.firstName || ''} ${user?.lastName || ''}`.toLowerCase();
          const sub = (row.subject || '').toLowerCase();
          const phone = (user?.phoneNumber || '').toLowerCase();
          return name.includes(term) || sub.includes(term) || phone.includes(term);
        }}
        filterSlot={
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>فیلتر وضعیت</InputLabel>
            <Select
              value={statusFilter}
              label="فیلتر وضعیت"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">همه تیکت‌ها</MenuItem>
              <MenuItem value="open">باز</MenuItem>
              <MenuItem value="in_progress">در حال بررسی</MenuItem>
              <MenuItem value="answered">پاسخ داده شده</MenuItem>
              <MenuItem value="closed">بسته شده</MenuItem>
            </Select>
          </FormControl>
        }
        emptyTitle="تیکت پشتیبانی یافت نشد"
        emptyDescription="هیچ تیکت پشتیبانی مطابق با فیلترهای انتخابی یافت نشد."
      />

      {/* Ticket Conversation Modal */}
      {activeTicket && (
        <Dialog open onClose={() => setActiveTicket(null)} maxWidth="md" fullWidth dir="rtl">
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5 }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {activeTicket.subject}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {activeTicket.course?.name ? `دوره: ${activeTicket.course.name} · ` : ''}
                دانشجو: {activeTicket.user?.firstName || ''} {activeTicket.user?.lastName || ''} ({activeTicket.user?.phoneNumber || ''})
              </Typography>
            </Box>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>وضعیت تیکت</InputLabel>
              <Select
                value={activeTicket.status || 'open'}
                label="وضعیت تیکت"
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <MenuItem value="open">باز</MenuItem>
                <MenuItem value="in_progress">در حال بررسی</MenuItem>
                <MenuItem value="answered">پاسخ داده شده</MenuItem>
                <MenuItem value="closed">بسته شده</MenuItem>
              </Select>
            </FormControl>
          </DialogTitle>

          <DialogContent dividers sx={{ p: 2.5 }}>
            <Stack spacing={2.5}>
              {/* Message Thread Container */}
              <Box sx={{ maxHeight: 380, overflowY: 'auto', p: 1 }}>
                <Stack spacing={2}>
                  {(activeTicket.messages || []).map((msg) => {
                    const isStaff = msg.senderType === 'admin' || msg.senderType === 'ta';
                    return (
                      <Box
                        key={msg.id}
                        sx={{
                          display: 'flex',
                          flexDirection: isStaff ? 'row-reverse' : 'row',
                          alignItems: 'flex-start',
                          gap: 1.5,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: isStaff ? 'primary.main' : 'secondary.light',
                            fontSize: '0.75rem',
                          }}
                        >
                          {isStaff ? <StaffIcon sx={{ fontSize: 18 }} /> : <PersonIcon sx={{ fontSize: 18 }} />}
                        </Avatar>

                        <Paper
                          elevation={0}
                          sx={{
                            maxWidth: '75%',
                            p: 2,
                            borderRadius: 2.5,
                            bgcolor: isStaff ? 'primary.main' : 'action.hover',
                            color: isStaff ? 'primary.contrastText' : 'text.primary',
                            border: '1px solid',
                            borderColor: isStaff ? 'primary.dark' : 'divider',
                          }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" mb={0.5}>
                            <Typography variant="caption" fontWeight={700} sx={{ opacity: 0.9 }}>
                              {msg.senderName || (isStaff ? 'پشتیبان حرکت' : 'دانشجو')}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.675rem' }}>
                              {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) : ''}
                            </Typography>
                          </Stack>

                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '0.84rem' }}>
                            {msg.message}
                          </Typography>
                        </Paper>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              <Divider />

              {/* Reply Box */}
              <Box>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="پاسخ خود را بنویسید..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <Stack direction="row" justifyContent="flex-end" mt={1.5}>
                  <Button
                    variant="contained"
                    endIcon={sending ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                    disabled={sending || !replyText.trim()}
                    onClick={handleSendReply}
                  >
                    {sending ? 'در حال ارسال...' : 'ارسال پاسخ'}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setActiveTicket(null)} variant="outlined">
              بستن
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  );
}
