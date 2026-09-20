import { Box, Typography, Popover, Button, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider } from '@mui/material';
import MilitaryTechOutlinedIcon from '@mui/icons-material/MilitaryTechOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { useNotifications } from '../../contexts/NotificationContext.jsx';
import { NavLink } from 'react-router-dom';

export default function NotificationPopover({ anchorEl, open, onClose }) {
  const { notifications, markAllAsRead, clearAllNotifications } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case 'points':
        return (
          <Avatar sx={{ bgcolor: '#d1fae5', color: '#059669', width: 38, height: 38, borderRadius: '12px' }}>
            <MilitaryTechOutlinedIcon sx={{ fontSize: 20 }} />
          </Avatar>
        );
      case 'course':
        return (
          <Avatar sx={{ bgcolor: '#e0f2fe', color: '#0284c7', width: 38, height: 38, borderRadius: '12px' }}>
            <SchoolOutlinedIcon sx={{ fontSize: 20 }} />
          </Avatar>
        );
      default:
        return (
          <Avatar sx={{ bgcolor: '#f1f5f9', color: '#64748b', width: 38, height: 38, borderRadius: '12px' }}>
            <InfoOutlinedIcon sx={{ fontSize: 20 }} />
          </Avatar>
        );
    }
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
          width: 320,
          p: 0,
          borderRadius: '24px',
          boxShadow: '0 20px 40px -8px rgba(15, 23, 42, 0.15)',
          border: '1px solid #eef2f6',
          mt: 1.5,
          overflow: 'hidden'
        }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
          پیام‌ها و اعلان‌ها
        </Typography>
        {notifications.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              onClick={markAllAsRead}
              sx={{ fontSize: '0.75rem', color: '#64748b', p: 0, minWidth: 'auto' }}
            >
              خوانده شد همه
            </Button>
            <Typography variant="caption" sx={{ color: '#cbd5e1' }}>•</Typography>
            <Button
              size="small"
              onClick={clearAllNotifications}
              sx={{ fontSize: '0.75rem', color: '#dc2626', p: 0, minWidth: 'auto' }}
            >
              پاک‌سازی
            </Button>
          </Box>
        )}
      </Box>

      {notifications.length === 0 ? (
        <Box sx={{ py: 6, px: 3, textAlign: 'center' }}>
          <NotificationsNoneOutlinedIcon sx={{ fontSize: 44, color: '#cbd5e1', mb: 1.5 }} />
          <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#64748b' }}>
            هیچ اعلان جدیدی وجود ندارد
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block', fontSize: '0.75rem' }}>
            اعلان‌های مربوط به دوره‌ها و فعالیت‌های شما در اینجا قرار می‌گیرند.
          </Typography>
        </Box>
      ) : (
        <List disablePadding sx={{ maxHeight: 340, overflowY: 'auto' }}>
          {notifications.slice(0, 4).map((n) => (
            <ListItem
              key={n.id}
              sx={{
                p: 2,
                backgroundColor: n.isRead ? '#ffffff' : '#f8fafc',
                borderBottom: '1px solid #f1f5f9',
                alignItems: 'flex-start',
                gap: 1.5
              }}
            >
              <ListItemAvatar sx={{ minWidth: 38 }}>
                {getIcon(n.type)}
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>
                    {n.title}
                  </Typography>
                }
                secondary={
                  <Box component="span">
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.3, fontSize: '0.78rem' }}>
                      {n.description}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem', mt: 0.5, display: 'block' }}>
                      {n.date}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* Blue link "All notifications" as in Dribbble reference */}
      <Box sx={{ p: 1.5, textAlign: 'center', backgroundColor: '#ffffff' }}>
        <Button
          component={NavLink}
          to="/profile"
          onClick={onClose}
          fullWidth
          sx={{
            color: '#2563eb',
            fontWeight: 700,
            fontSize: '0.82rem',
            py: 0.8,
            '&:hover': { backgroundColor: '#eff6ff' }
          }}
        >
          تمام اعلان‌ها
        </Button>
      </Box>
    </Popover>
  );
}
