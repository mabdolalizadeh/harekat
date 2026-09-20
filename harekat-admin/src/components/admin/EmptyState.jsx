import { Box, Typography, Button, Paper } from '@mui/material';
import { Inbox as DefaultEmptyIcon } from '@mui/icons-material';

export default function EmptyState({
  icon: Icon = DefaultEmptyIcon,
  title = 'داده‌ای یافت نشد',
  description = 'هیچ موردی برای نمایش وجود ندارد یا جستجوی شما نتیجه‌ای نداشت.',
  actionText,
  onAction,
  actionIcon,
  sx = {}
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        py: 6,
        px: 3,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 3,
        border: '1px dashed',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        ...sx,
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
          mb: 2,
        }}
      >
        <Icon sx={{ fontSize: 28 }} />
      </Box>

      <Typography variant="h6" fontWeight={700} color="text.primary" mb={0.5}>
        {title}
      </Typography>

      <Typography variant="body2" color="text.secondary" maxWidth={400} sx={{ mb: onAction ? 3 : 0 }}>
        {description}
      </Typography>

      {onAction && actionText && (
        <Button
          variant="contained"
          size="small"
          onClick={onAction}
          startIcon={actionIcon}
          sx={{ mt: 2 }}
        >
          {actionText}
        </Button>
      )}
    </Paper>
  );
}
