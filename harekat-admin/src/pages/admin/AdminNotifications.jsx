import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Stack
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Send as SendIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { adminApi, isTA, getAdminUser } from '../../services/api.js';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';
import StatCard from '../../components/admin/StatCard.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import { formatDate } from '../../utils/format.js';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [form, setForm] = useState({
    title: '',
    body: '',
    recipientType: 'all',
    targetId: '',
    type: 'general'
  });

  const ta = isTA();
  const adminUser = getAdminUser();

  const loadData = async () => {
    try {
      setLoading(true);
      const [notifsRes, coursesRes, studentsRes] = await Promise.all([
        adminApi.listNotifications().catch(() => ({ data: [] })),
        adminApi.listCourses().catch(() => ({ data: [] })),
        adminApi.listStudents().catch(() => ({ data: [] }))
      ]);

      setNotifications(notifsRes?.data || []);
      setCourses(coursesRes?.data || []);
      setStudents(studentsRes?.data || []);

      if (ta && form.recipientType === 'all') {
        setForm((prev) => ({ ...prev, recipientType: 'course' }));
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'خطا در بارگذاری داده‌ها' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDialog = () => {
    setForm({
      title: '',
      body: '',
      recipientType: ta ? 'course' : 'all',
      targetId: '',
      type: 'general'
    });
    setDialogOpen(true);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      setFeedback({ type: 'error', text: 'لطفاً عنوان و متن پیام را وارد کنید' });
      return;
    }

    if (form.recipientType !== 'all' && !form.targetId) {
      setFeedback({
        type: 'error',
        text: form.recipientType === 'course' ? 'لطفاً دوره مورد نظر را انتخاب کنید' : 'لطفاً دانشجو را انتخاب کنید'
      });
      return;
    }

    try {
      setSending(true);
      setFeedback(null);
      const payload = {
        title: form.title.trim(),
        body: form.body.trim(),
        recipientType: form.recipientType,
        targetId: form.recipientType === 'all' ? null : form.targetId,
        courseId: form.recipientType === 'course' ? form.targetId : null,
        type: form.type
      };

      const res = await adminApi.sendNotification(payload);
      if (res?.ok) {
        setFeedback({ type: 'success', text: 'پیام با موفقیت ارسال شد و برای مخاطبین قابل مشاهده است.' });
        setDialogOpen(false);
        await loadData();
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'خطا در ارسال پیام' });
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      setDeleteLoading(true);
      await adminApi.deleteNotification(deleteTargetId);
      setFeedback({ type: 'success', text: 'اعلان با موفقیت حذف شد' });
      setDeleteTargetId(null);
      await loadData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'خطا در حذف اعلان' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalCount = notifications.length;
  const allCount = notifications.filter((n) => n.recipientType === 'all').length;
  const courseCount = notifications.filter((n) => n.recipientType === 'course').length;
  const userCount = notifications.filter((n) => n.recipientType === 'user').length;

  const columns = [
    {
      field: 'title',
      headerName: 'عنوان پیام',
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ py: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {params.row.title}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {params.row.body}
          </Typography>
        </Box>
      )
    },
    {
      field: 'recipientType',
      headerName: 'جامعه هدف',
      width: 200,
      renderCell: (params) => {
        const type = params.value;
        if (type === 'all') {
          return (
            <Chip
              icon={<PeopleIcon sx={{ fontSize: 16 }} />}
              label="همه کاربران"
              size="small"
              sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 600 }}
            />
          );
        }
        if (type === 'course') {
          return (
            <Chip
              icon={<SchoolIcon sx={{ fontSize: 16 }} />}
              label={`دوره: ${params.row.course?.name || 'انتخابی'}`}
              size="small"
              sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 600 }}
            />
          );
        }
        return (
          <Chip
            icon={<PersonIcon sx={{ fontSize: 16 }} />}
            label="دانشجوی خاص"
            size="small"
            sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600 }}
          />
        );
      }
    },
    {
      field: 'sender',
      headerName: 'فرستنده',
      width: 170,
      renderCell: (params) => (
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
            {params.row.senderName || params.row.sender?.name || params.row.sender?.username || 'مدیر'}
          </Typography>
          <Chip
            label={params.row.senderRole === 'ta' ? 'دستیار آموزشی' : 'مدیر ارشد'}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.65rem',
              bgcolor: params.row.senderRole === 'ta' ? 'secondary.light' : 'primary.light',
              color: '#ffffff'
            }}
          />
        </Box>
      )
    },
    {
      field: 'createdAt',
      headerName: 'تاریخ ارسال',
      width: 140,
      renderCell: (params) => (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {formatDate(params.value)}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'عملیات',
      width: 90,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="حذف پیام">
          <IconButton
            size="small"
            color="error"
            onClick={() => setDeleteTargetId(params.row.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )
    }
  ];

  return (
    <Box>
      <PageHeader
        title="مدیریت اعلان‌ها و پیام‌ها"
        subtitle="ارسال پیام‌های عمومی، اطلاعیه‌های کلاسی اساتید/TAs و پیام‌های فردی به دانشجویان"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{ borderRadius: 2 }}
          >
            ارسال پیام جدید
          </Button>
        }
      />

      {feedback && (
        <Alert
          severity={feedback.type}
          onClose={() => setFeedback(null)}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {feedback.text}
        </Alert>
      )}

      {/* Stats row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="کل پیام‌های ارسالی"
            value={totalCount}
            icon={CampaignIcon}
            color="#f47c20"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="پیام‌های همگانی"
            value={allCount}
            icon={PeopleIcon}
            color="#2563eb"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="اطلاعیه‌های دوره‌ها"
            value={courseCount}
            icon={SchoolIcon}
            color="#d97706"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="پیام‌های اختصاصی"
            value={userCount}
            icon={PersonIcon}
            color="#16a34a"
          />
        </Grid>
      </Grid>

      {/* Notifications Table */}
      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 0 }}>
          <DataTable
            rows={notifications}
            columns={columns}
            loading={loading}
            getRowId={(r) => r.id}
          />
        </CardContent>
      </Card>

      {/* Compose Notification Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={sending ? undefined : () => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <form onSubmit={handleSend}>
          <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
            ارسال اعلان یا پیام جدید
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                label="عنوان پیام"
                fullWidth
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="مثال: شروع جلسه اول دوره طراحی UI"
              />

              <FormControl fullWidth>
                <InputLabel>جامعه هدف (مخاطب)</InputLabel>
                <Select
                  value={form.recipientType}
                  label="جامعه هدف (مخاطب)"
                  onChange={(e) => setForm({ ...form, recipientType: e.target.value, targetId: '' })}
                >
                  {!ta && <MenuItem value="all">📢 همه کاربران سامانه (اطلاعیه عمومی)</MenuItem>}
                  <MenuItem value="course">🎓 دانشجویان یک دوره خاص</MenuItem>
                  <MenuItem value="user">👤 یک دانشجوی مشخص</MenuItem>
                </Select>
              </FormControl>

              {form.recipientType === 'course' && (
                <FormControl fullWidth required>
                  <InputLabel>انتخاب دوره</InputLabel>
                  <Select
                    value={form.targetId}
                    label="انتخاب دوره"
                    onChange={(e) => setForm({ ...form, targetId: e.target.value })}
                  >
                    {courses.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {form.recipientType === 'user' && (
                <FormControl fullWidth required>
                  <InputLabel>انتخاب دانشجو</InputLabel>
                  <Select
                    value={form.targetId}
                    label="انتخاب دانشجو"
                    onChange={(e) => setForm({ ...form, targetId: e.target.value })}
                  >
                    {students.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.firstName || s.lastName
                          ? `${s.firstName || ''} ${s.lastName || ''} (${s.phoneNumber})`
                          : s.phoneNumber}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControl fullWidth>
                <InputLabel>دسته‌بندی پیام</InputLabel>
                <Select
                  value={form.type}
                  label="دسته‌بندی پیام"
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <MenuItem value="general">عمومی / اطلاع‌رسانی</MenuItem>
                  <MenuItem value="course">آموزشی / کلاسی</MenuItem>
                  <MenuItem value="system">سیستمی / مهم</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="متن پیام"
                fullWidth
                required
                multiline
                rows={4}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="متن اعلان خود را در اینجا بنویسید..."
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDialogOpen(false)} disabled={sending} sx={{ color: 'text.secondary' }}>
              انصراف
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={sending}
              startIcon={sending ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
            >
              {sending ? 'در حال ارسال...' : 'ارسال پیام'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        title="حذف اعلان"
        message="آیا از حذف این پیام اطمینان دارید؟ این پیام برای مخاطبان نیز حذف خواهد شد."
        confirmText="حذف"
        cancelText="انصراف"
        severity="error"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onClose={() => setDeleteTargetId(null)}
      />
    </Box>
  );
}
