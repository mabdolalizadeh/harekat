import { useState } from 'react';
import { adminApi } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { Card, PageHeader, ListRowSkeleton } from './adminUi.jsx';
import {
  Box, Stack, Typography, Grid, Alert, Paper, Chip,
  Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Divider, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Chat as ChatIcon, Send as SendIcon } from '@mui/icons-material';

const STATUS_MAP = {
  open: { label: 'باز', color: 'info' },
  in_progress: { label: 'در حال بررسی', color: 'warning' },
  answered: { label: 'پاسخ داده شده', color: 'success' },
  closed: { label: 'بسته شده', color: 'default' }
};

const PRIORITY_MAP = {
  low: { label: 'کم', color: 'default' },
  medium: { label: 'متوسط', color: 'primary' },
  high: { label: 'بالا', color: 'error' }
};

export default function AdminTickets() {
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState(null);

  const tickets = useApi(() => adminApi.listTickets());

  const openConversation = async (t) => {
    try {
      const res = await adminApi.getTicket(t.id);
      setActiveTicket(res.data);
    } catch (err) {
      alert(`خطا: ${err.message}`);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeTicket) return;
    setSending(true);
    try {
      await adminApi.replyTicket(activeTicket.id, { message: replyText });
      setReplyText('');
      const updated = await adminApi.getTicket(activeTicket.id);
      setActiveTicket(updated.data);
      tickets.reload();
      setNotice('پاسخ با موفقیت ارسال شد');
    } catch (err) {
      alert(`خطا: ${err.message}`);
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
    } catch (err) {
      alert(`خطا: ${err.message}`);
    }
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="تیکت‌های پشتیبانی"
        subtitle="پاسخگویی و پیگیری تیکت‌های دانشجویان و دوره‌های آموزشی"
      />

      {notice && <Alert severity="success" onClose={() => setNotice(null)}>{notice}</Alert>}

      <Card>
        {tickets.loading && <ListRowSkeleton count={4} />}
        {tickets.error && (
          <Alert severity="error">
            خطا: {tickets.error} <Button size="small" onClick={tickets.reload}>تلاش مجدد</Button>
          </Alert>
        )}

        {!tickets.loading && tickets.isEmpty && (
          <Alert severity="info">هیچ تیکت پشتیبانی ثبت نشده است.</Alert>
        )}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>موضوع</TableCell>
              <TableCell>کاربر / دانشجو</TableCell>
              <TableCell>دوره مربوطه</TableCell>
              <TableCell>اولویت</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell>آخرین بروزرسانی</TableCell>
              <TableCell align="left">گفتگو</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(tickets.data || []).map((t) => {
              const st = STATUS_MAP[t.status] || { label: t.status, color: 'default' };
              const pr = PRIORITY_MAP[t.priority] || { label: t.priority, color: 'default' };
              const user = t.user;
              const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.phoneNumber : 'کاربر';

              return (
                <TableRow key={t.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{t.subject}</TableCell>
                  <TableCell>{userName}</TableCell>
                  <TableCell>
                    {t.course?.name ? (
                      <Chip label={t.course.name} size="small" variant="outlined" />
                    ) : 'عمومی'}
                  </TableCell>
                  <TableCell>
                    <Chip label={pr.label} color={pr.color} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip label={st.label} color={st.color} size="small" sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>
                    {t.updatedAt ? new Date(t.updatedAt).toLocaleDateString('fa-IR') : '—'}
                  </TableCell>
                  <TableCell align="left">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ChatIcon />}
                      onClick={() => openConversation(t)}
                    >
                      مشاهده تیکت
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Ticket Conversation Modal */}
      {activeTicket && (
        <Dialog open onClose={() => setActiveTicket(null)} maxWidth="md" fullWidth dir="rtl">
          <DialogTitle fontWeight={700}>
            {activeTicket.subject} {activeTicket.course?.name ? `(${activeTicket.course.name})` : ''}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <Box>
                  <Chip
                    label={STATUS_MAP[activeTicket.status]?.label || activeTicket.status}
                    color={STATUS_MAP[activeTicket.status]?.color || 'default'}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    دانشجو: {activeTicket.user?.firstName} {activeTicket.user?.lastName} ({activeTicket.user?.phoneNumber})
                  </Typography>
                </Box>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>تغییر وضعیت</InputLabel>
                  <Select
                    value={activeTicket.status}
                    label="تغییر وضعیت"
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    <MenuItem value="open">باز</MenuItem>
                    <MenuItem value="in_progress">در حال بررسی</MenuItem>
                    <MenuItem value="answered">پاسخ داده شده</MenuItem>
                    <MenuItem value="closed">بسته شده</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              {/* Messages Container */}
              <Box sx={{ maxHeight: 360, overflowY: 'auto', p: 1 }}>
                <Stack spacing={1.5}>
                  {(activeTicket.messages || []).map((msg) => {
                    const isStaff = msg.senderType === 'admin' || msg.senderType === 'ta';
                    return (
                      <Box
                        key={msg.id}
                        sx={{
                          alignSelf: isStaff ? 'flex-end' : 'flex-start',
                          maxWidth: '80%',
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: isStaff ? 'primary.light' : 'action.hover',
                          color: isStaff ? 'primary.contrastText' : 'text.primary'
                        }}
                      >
                        <Typography variant="caption" fontWeight={700} sx={{ display: 'block', mb: 0.5, opacity: 0.9 }}>
                          {msg.senderName} ({isStaff ? 'پشتیبان' : 'دانشجو'})
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                          {msg.message}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, textAlign: 'left', opacity: 0.7 }}>
                          {new Date(msg.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              <Divider />

              {/* Reply box */}
              <Box>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="پاسخ خود را بنویسید..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <Button
                  variant="contained"
                  endIcon={<SendIcon />}
                  disabled={sending || !replyText.trim()}
                  onClick={handleSendReply}
                  sx={{ mt: 1.5 }}
                >
                  {sending ? 'در حال ارسال...' : 'ارسال پاسخ'}
                </Button>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setActiveTicket(null)}>بستن</Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  );
}
