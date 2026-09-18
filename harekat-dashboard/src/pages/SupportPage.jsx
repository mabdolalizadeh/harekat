import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Alert,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Divider,
  Paper,
  Avatar
} from '@mui/material';
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';

import { ticketsApi } from '../api/ticketsApi.js';
import { accessApi } from '../api/accessApi.js';
import { formatDate, toPersianDigits } from '../utils/formatters.js';

export default function SupportPage() {
  const [tickets, setTickets] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // New ticket modal
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCourseId, setNewCourseId] = useState('');
  const [newPriority, setNewPriority] = useState('normal');
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState(null);

  // View ticket thread modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [loadingTicket, setLoadingTicket] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, coursesRes] = await Promise.allSettled([
        ticketsApi.getMyTickets(),
        accessApi.getMyAccessibleCourses()
      ]);

      if (ticketsRes.status === 'fulfilled' && ticketsRes.value?.ok) {
        setTickets(ticketsRes.value.data || []);
      }
      if (coursesRes.status === 'fulfilled' && coursesRes.value?.ok) {
        setCourses(coursesRes.value.data || []);
      }
    } catch (err) {
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    try {
      setSubmitting(true);
      setCreateError(null);
      const payload = {
        title: newTitle.trim(),
        description: newDesc.trim(),
        courseId: newCourseId || null,
        priority: newPriority
      };
      const res = await ticketsApi.createTicket(payload);
      if (res?.ok) {
        setCreateOpen(false);
        setNewTitle('');
        setNewDesc('');
        setNewCourseId('');
        await loadData();
      }
    } catch (err) {
      setCreateError(err.message || 'خطا در ثبت تیکت');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenTicket = async (ticket) => {
    try {
      setSelectedTicket(ticket);
      setLoadingTicket(true);
      const res = await ticketsApi.getTicketById(ticket.id);
      if (res?.ok && res.data) {
        setSelectedTicket(res.data);
      }
    } catch (err) {
      console.error('Error loading ticket details:', err);
    } finally {
      setLoadingTicket(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    try {
      setReplying(true);
      const res = await ticketsApi.replyTicket(selectedTicket.id, replyText.trim());
      if (res?.ok) {
        setReplyText('');
        // Reload ticket details
        const updated = await ticketsApi.getTicketById(selectedTicket.id);
        if (updated?.ok && updated.data) {
          setSelectedTicket(updated.data);
        }
        await loadData();
      }
    } catch (err) {
      alert(err.message || 'خطا در ارسال پاسخ');
    } finally {
      setReplying(false);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'open':
        return <Chip label="در انتظار پاسخ" size="small" sx={{ backgroundColor: '#fef3c7', color: '#b45309', fontWeight: 700 }} />;
      case 'answered':
        return <Chip label="پاسخ داده شده" size="small" sx={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 700 }} />;
      case 'closed':
        return <Chip label="بسته شده" size="small" sx={{ backgroundColor: '#f1f5f9', color: '#64748b' }} />;
      default:
        return <Chip label={status || 'نامشخص'} size="small" />;
    }
  };

  const getPriorityChip = (priority) => {
    switch (priority) {
      case 'urgent':
        return <Chip label="فوری" size="small" sx={{ backgroundColor: '#fee2e2', color: '#b91c1c', fontWeight: 700 }} />;
      case 'high':
        return <Chip label="زیاد" size="small" sx={{ backgroundColor: '#ffedd5', color: '#c2410c' }} />;
      default:
        return <Chip label="معمولی" size="small" sx={{ backgroundColor: '#f8fafc', color: '#64748b' }} />;
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
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.75rem' }, mb: 0.5, color: '#171715' }}>
            تیکت‌های پشتیبانی و ارتباط با اساتید
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b6b63' }}>
            ارسال و پیگیری سوالات درسی، فنی و مشاوره‌ای پیرامون دوره‌ها
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{
            borderRadius: '14px',
            px: 2.5,
            py: 1.1,
            backgroundColor: '#f47c20',
            fontWeight: 700,
            '&:hover': { backgroundColor: '#df5b13' }
          }}
        >
          ثبت تیکت جدید
        </Button>
      </Box>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center', borderRadius: '24px', border: '1px dashed #deddd7', backgroundColor: '#ffffff' }}>
          <HeadsetMicOutlinedIcon sx={{ fontSize: 60, color: '#f47c20', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#171715' }}>
            هیچ تیکت پشتیبانی ثبت نشده است
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b6b63', mb: 3, maxWidth: 440, mx: 'auto' }}>
            در صورت بروز هرگونه مشکل یا سوال در جلسات دوره‌ها، تیکت پشتیبانی ارسال فرمایید.
          </Typography>
          <Button
            variant="contained"
            onClick={() => setCreateOpen(true)}
            sx={{ borderRadius: '14px', px: 3, py: 1.1, backgroundColor: '#f47c20', fontWeight: 700 }}
          >
            ارسال اولین تیکت
          </Button>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {tickets.map((ticket) => (
            <Grid item xs={12} key={ticket.id}>
              <Card
                onClick={() => handleOpenTicket(ticket)}
                sx={{
                  p: 2.5,
                  borderRadius: '20px',
                  border: '1px solid #deddd7',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                    borderColor: '#ffdda8'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusChip(ticket.status)}
                    {getPriorityChip(ticket.priority)}
                    {ticket.course ? (
                      <Chip
                        icon={<SchoolOutlinedIcon sx={{ fontSize: 14 }} />}
                        label={ticket.course.name}
                        size="small"
                        sx={{ backgroundColor: '#fff8ed', color: '#b94410', fontWeight: 600 }}
                      />
                    ) : (
                      <Chip label="پشتیبانی عمومی" size="small" sx={{ backgroundColor: '#f1f5f9', color: '#475569' }} />
                    )}
                  </Box>

                  <Typography variant="caption" sx={{ color: '#9b9b92' }}>
                    {formatDate(ticket.createdAt)}
                  </Typography>
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 800, color: '#171715', fontSize: '1.05rem', mb: 0.5 }}>
                  {ticket.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: '#6b6b63',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {ticket.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Ticket Modal */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>ثبت تیکت پشتیبانی جدید</span>
          <IconButton onClick={() => setCreateOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Box component="form" onSubmit={handleCreateTicket}>
          <DialogContent dividers>
            {createError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
                {createError}
              </Alert>
            )}

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.8 }}>
                مربوط به دوره:
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={newCourseId}
                  onChange={(e) => setNewCourseId(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>پشتیبانی عمومی / سایر</em>
                  </MenuItem>
                  {courses.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.8 }}>
                اولویت:
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                >
                  <MenuItem value="low">کم</MenuItem>
                  <MenuItem value="normal">متوسط (عادی)</MenuItem>
                  <MenuItem value="high">زیاد</MenuItem>
                  <MenuItem value="urgent">فوری</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.8 }}>
                عنوان تیکت:
              </Typography>
              <TextField
                fullWidth
                size="small"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="مثال: سوال درباره تمرین جلسه سوم"
              />
            </Box>

            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.8 }}>
                متن پیام و توضیحات:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                required
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="توضیحات کامل درخواست یا سوال خود را بنویسید..."
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setCreateOpen(false)} sx={{ borderRadius: '12px', color: '#6b6b63' }}>
              انصراف
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ borderRadius: '12px', backgroundColor: '#f47c20', fontWeight: 700, px: 3 }}
            >
              {submitting ? <CircularProgress size={20} color="inherit" /> : 'ثبت تیکت'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Ticket Chat & Message Thread Dialog */}
      <Dialog
        open={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1, minHeight: 480 } }}
      >
        {selectedTicket && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  {getStatusChip(selectedTicket.status)}
                  {selectedTicket.course && (
                    <Chip label={selectedTicket.course.name} size="small" sx={{ backgroundColor: '#fff8ed', color: '#b94410' }} />
                  )}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#171715' }}>
                  {selectedTicket.title}
                </Typography>
              </Box>

              <IconButton onClick={() => setSelectedTicket(null)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, backgroundColor: '#f8fafc' }}>
              {/* Original student question */}
              <Paper sx={{ p: 2, borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', alignSelf: 'flex-start', maxWidth: '85%' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#f47c20', display: 'block', mb: 0.5 }}>
                  پیام شما ({formatDate(selectedTicket.createdAt)}):
                </Typography>
                <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                  {selectedTicket.description}
                </Typography>
              </Paper>

              {/* Message thread */}
              {selectedTicket.messages?.map((msg) => {
                const isStudent = msg.senderType === 'user';
                return (
                  <Paper
                    key={msg.id}
                    sx={{
                      p: 2,
                      borderRadius: '16px',
                      backgroundColor: isStudent ? '#ffffff' : '#fff8ed',
                      border: isStudent ? '1px solid #e2e8f0' : '1px solid #ffdda8',
                      alignSelf: isStudent ? 'flex-start' : 'flex-end',
                      maxWidth: '85%'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: isStudent ? '#f47c20' : '#15803d' }}>
                        {isStudent ? 'شما' : 'پشتیبان / استاد دوره'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        • {formatDate(msg.createdAt)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#1e293b', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                      {msg.message}
                    </Typography>
                  </Paper>
                );
              })}
            </DialogContent>

            {/* Reply Input Bar */}
            <Box sx={{ p: 2, backgroundColor: '#ffffff', display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <TextField
                fullWidth
                size="small"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="پاسخ خود را بنویسید..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
              />
              <Button
                variant="contained"
                disabled={replying || !replyText.trim()}
                onClick={handleSendReply}
                startIcon={replying ? <CircularProgress size={18} color="inherit" /> : <SendIcon sx={{ transform: 'rotate(180deg)' }} />}
                sx={{ borderRadius: '14px', px: 2.5, py: 1, backgroundColor: '#f47c20', fontWeight: 700, flexShrink: 0 }}
              >
                ارسال
              </Button>
            </Box>
          </>
        )}
      </Dialog>
    </Box>
  );
}
