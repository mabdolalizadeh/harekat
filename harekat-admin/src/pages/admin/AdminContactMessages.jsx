import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  MarkEmailRead as ReadIcon,
  MarkEmailUnread as UnreadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Language as IpIcon,
  Forum as ContactIcon,
} from '@mui/icons-material';
import { adminApi } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';

function formatPersianDate(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export default function AdminContactMessages() {
  const { showSuccess, showError } = useNotification();
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { data: responseData, loading, error, reload } = useApi(
    () => adminApi.listContactMessages()
  );

  const messages = responseData?.data || [];
  const unreadCount = responseData?.meta?.unreadCount ?? messages.filter((m) => !m.isRead).length;

  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      if (filterStatus === 'unread') return !msg.isRead;
      if (filterStatus === 'read') return msg.isRead;
      return true;
    });
  }, [messages, filterStatus]);

  const handleOpenMessage = async (msg) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      try {
        await adminApi.markContactMessageRead(msg.id, true);
        reload();
      } catch (err) {
        console.error('Failed to mark message as read:', err);
      }
    }
  };

  const handleToggleRead = async (msg, e) => {
    e?.stopPropagation();
    try {
      const nextState = !msg.isRead;
      await adminApi.markContactMessageRead(msg.id, nextState);
      showSuccess(nextState ? 'پیام به عنوان خوانده‌شده علامت‌گذاری شد' : 'پیام به عنوان خوانده‌نشده تنظیم شد');
      reload();
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage((prev) => (prev ? { ...prev, isRead: nextState } : null));
      }
    } catch (err) {
      showError(err.message || 'خطا در تغییر وضعیت پیام');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteContactMessage(deleteTarget.id);
      showSuccess('پیام با موفقیت حذف گردید');
      setDeleteTarget(null);
      if (selectedMessage?.id === deleteTarget.id) {
        setSelectedMessage(null);
      }
      reload();
    } catch (err) {
      showError(err.message || 'خطا در حذف پیام');
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo(() => [
    {
      id: 'sender',
      label: 'فرستنده',
      render: (row) => (
        <Stack spacing={0.5}>
          <Typography variant="body2" sx={{ fontWeight: row.isRead ? 500 : 700, color: 'text.primary' }}>
            {row.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', direction: 'ltr', textAlign: 'right' }}>
            {row.email}
          </Typography>
          {row.phoneNumber && (
            <Typography variant="caption" sx={{ color: 'text.secondary', direction: 'ltr', textAlign: 'right' }}>
              {row.phoneNumber}
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      id: 'subject',
      label: 'موضوع',
      render: (row) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: row.isRead ? 400 : 700,
            maxWidth: 240,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {row.subject || 'بدون موضوع'}
        </Typography>
      ),
    },
    {
      id: 'message',
      label: 'متن پیام',
      render: (row) => (
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            maxWidth: 320,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {row.message}
        </Typography>
      ),
    },
    {
      id: 'isRead',
      label: 'وضعیت',
      render: (row) => (
        <Chip
          size="small"
          label={row.isRead ? 'خوانده شده' : 'جدید / خوانده نشده'}
          color={row.isRead ? 'default' : 'primary'}
          sx={{ fontWeight: 600, fontSize: '0.75rem' }}
        />
      ),
    },
    {
      id: 'createdAt',
      label: 'تاریخ دریافت',
      render: (row) => (
        <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
          {formatPersianDate(row.createdAt)}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'عملیات',
      align: 'left',
      render: (row) => (
        <Stack direction="row" spacing={1} onClick={(e) => e.stopPropagation()}>
          <Tooltip title="مشاهده جزئیات">
            <IconButton size="small" color="primary" onClick={() => handleOpenMessage(row)}>
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={row.isRead ? 'علامت به عنوان خوانده نشده' : 'علامت به عنوان خوانده شده'}>
            <IconButton size="small" onClick={(e) => handleToggleRead(row, e)}>
              {row.isRead ? <UnreadIcon fontSize="small" /> : <ReadIcon fontSize="small" color="action" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="حذف پیام">
            <IconButton size="small" color="error" onClick={() => setDeleteTarget(row)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [reload]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader
        title="پیام‌های تماس با ما"
        subtitle={`مدیریت پیام‌ها و فرم‌های ارسال‌شده توسط کاربران و بازدیدکنندگان وب‌سایت (${unreadCount} پیام خوانده‌نشده)`}
        icon={ContactIcon}
      />

      <DataTable
        columns={columns}
        rows={filteredMessages}
        loading={loading}
        error={error}
        onReload={reload}
        onRowClick={handleOpenMessage}
        searchPlaceholder="جستجو در نام، ایمیل، موضوع یا متن پیام..."
        searchFilter={(row, term) => {
          const t = term.toLowerCase();
          return (
            row.name?.toLowerCase().includes(t) ||
            row.email?.toLowerCase().includes(t) ||
            row.subject?.toLowerCase().includes(t) ||
            row.message?.toLowerCase().includes(t) ||
            row.phoneNumber?.toLowerCase().includes(t)
          );
        }}
        filterSlot={
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="filter-status-label">وضعیت پیام</InputLabel>
            <Select
              labelId="filter-status-label"
              value={filterStatus}
              label="وضعیت پیام"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">همه پیام‌ها ({messages.length})</MenuItem>
              <MenuItem value="unread">خوانده نشده ({unreadCount})</MenuItem>
              <MenuItem value="read">خوانده شده ({messages.length - unreadCount})</MenuItem>
            </Select>
          </FormControl>
        }
        emptyTitle="پیامی یافت نشد"
        emptyDescription="هنوز پیامی از طریق فرم تماس با ما ارسال نشده است یا با فیلتر انتخابی همخوانی ندارد."
      />

      {/* Message Details Modal */}
      <Dialog
        open={Boolean(selectedMessage)}
        onClose={() => setSelectedMessage(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>
          {selectedMessage?.subject || 'جزئیات پیام تماس با ما'}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {selectedMessage && (
            <Stack spacing={2.5}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: '14px', bgcolor: 'background.default' }}>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      نام فرستنده:
                    </Typography>
                    <Typography variant="body2">{selectedMessage.name}</Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={1}>
                    <EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ایمیل:
                    </Typography>
                    <Typography variant="body2" sx={{ direction: 'ltr' }}>
                      {selectedMessage.email}
                    </Typography>
                  </Stack>

                  {selectedMessage.phoneNumber && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PhoneIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        شماره تماس:
                      </Typography>
                      <Typography variant="body2" sx={{ direction: 'ltr' }}>
                        {selectedMessage.phoneNumber}
                      </Typography>
                    </Stack>
                  )}

                  <Stack direction="row" alignItems="center" spacing={1}>
                    <TimeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      زمان ارسال:
                    </Typography>
                    <Typography variant="body2">{formatPersianDate(selectedMessage.createdAt)}</Typography>
                  </Stack>

                  {selectedMessage.ip && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <IpIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        IP ارسال‌کننده: {selectedMessage.ip}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Paper>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  متن پیام:
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: '14px',
                    lineHeight: 1.8,
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'inherit',
                  }}
                >
                  {selectedMessage.message}
                </Paper>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            color="error"
            variant="outlined"
            onClick={() => {
              setDeleteTarget(selectedMessage);
              setSelectedMessage(null);
            }}
          >
            حذف این پیام
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button
            variant="contained"
            onClick={() => setSelectedMessage(null)}
            sx={{ borderRadius: '10px' }}
          >
            بستن
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف پیام تماس با ما"
        content={`آیا از حذف پیام دریافتی از «${deleteTarget?.name}» اطمینان دارید؟ این عملیات غیرقابل بازگشت است.`}
        confirmLabel="حذف پیام"
        cancelLabel="انصراف"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
