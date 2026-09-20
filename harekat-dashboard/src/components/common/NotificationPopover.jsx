import { Box, Typography, Popover, Button, List, ListItem, ListItemAvatar, Avatar, ListItemText, Chip } from '@mui/material';
import MilitaryTechOutlinedIcon from '@mui/icons-material/MilitaryTechOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { useNotifications } from '../../contexts/NotificationContext.jsx';
import { formatDate } from '../../utils/formatters.js';

export default function NotificationPopover({ anchorEl, open, onClose }) {
  const { notifications, markAllAsRead, markAsRead } = useNotifications();

  const getIcon = (type, senderRole) => {
    if (senderRole === 'ta' || type === 'course') {
      return (
        <Avatar sx={{ bgcolor: '#eff6ff', color: '#2563eb', width: 36, height: 36, borderRadius: '12px' }}>
          <SchoolOutlinedIcon sx={{ fontSize: 18 }} />
        </Avatar>
      );
    }
    if (type === 'system') {
      return (
        <Avatar sx={{ bgcolor: '#fff1f2', color: '#e11d48', width: 36, height: 36, borderRadius: '12px' }}>
          <CampaignOutlinedIcon sx={{ fontSize: 18 }} />
        </Avatar>
      );
    }
    return (
      <Avatar sx={{ bgcolor: '#fff8ed', color: '#f47c20', width: 36, height: 36, borderRadius: '12px' }}>
        <InfoOutlinedIcon sx={{ fontSize: 18 }} />
      </Avatar>
    );
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left'
      }}
      PaperProps={{
        sx: {
          width: 360,
          p: 0,
          borderRadius: '24px',
          boxShadow: '0 20px 40px -8px rgba(15, 23, 42, 0.15)',
          border: '1px solid #eef2f6',
          mt: 1.5,
          overflow: 'hidden'
        }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f4f9' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.92rem' }}>
          پیام‌ها و اعلان‌ها
        </Typography>
        {notifications.length > 0 && (
          <Button
            size="small"
            onClick={markAllAsRead}
            sx={{ fontSize: '0.75rem', color: '#64748b', p: 0, minWidth: 'auto', fontWeight: 600 }}
          >
            خوانده شدن همه
          </Button>
        )}
      </Box>

      {notifications.length === 0 ? (
        <Box sx={{ py: 6, px: 3, textAlign: 'center' }}>
          <NotificationsNoneOutlinedIcon sx={{ fontSize: 44, color: '#cbd5e1', mb: 1.5 }} />
          <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#64748b' }}>
            هیچ اعلان جدیدی وجود ندارد
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block', fontSize: '0.75rem' }}>
            پیام‌های ارسالی از سوی مدیریت و استادیاران دوره‌ها در اینجا نمایش داده می‌شوند.
          </Typography>
        </Box>
      ) : (
        <List disablePadding sx={{ maxHeight: 380, overflowY: 'auto' }}>
          {notifications.map((n) => (
            <ListItem
              key={n.id}
              onClick={() => {
                if (!n.isRead) markAsRead(n.id);
              }}
              sx={{
                p: 2,
                cursor: 'pointer',
                backgroundColor: n.isRead ? '#ffffff' : '#f8fafc',
                borderBottom: '1px solid #f1f4f9',
                alignItems: 'flex-start',
                gap: 1.5,
                transition: 'background-color 0.15s',
                '&:hover': {
                  backgroundColor: '#f1f5f9'
                }
              }}
            >
              <ListItemAvatar sx={{ minWidth: 36 }}>
                {getIcon(n.type, n.senderRole)}
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.86rem', color: '#1e293b' }}>
                      {n.title}
                    </Typography>
                    {!n.isRead && (
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f47c20', flexShrink: 0 }} />
                    )}
                  </Box>
                }
                secondary={
                  <Box component="span">
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.3, fontSize: '0.8rem', lineHeight: 1.5 }}>
                      {n.description || n.body}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                      <Chip
                        label={n.senderLabel || (n.senderRole === 'ta' ? 'استادیار دوره' : 'مدیریت حرکت')}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          bgcolor: n.senderRole === 'ta' ? '#eff6ff' : '#fff8ed',
                          color: n.senderRole === 'ta' ? '#1d4ed8' : '#c2410c'
                        }}
                      />
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                        {formatDate(n.createdAt || n.date)}
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Popover>
  );
}
