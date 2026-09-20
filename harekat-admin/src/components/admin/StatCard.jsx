import { Card, CardContent, Typography, Box, Stack, Chip } from '@mui/material';

const COLOR_CONFIG = {
  primary: {
    bg: 'rgba(37, 99, 235, 0.08)',
    text: '#2563eb',
    border: 'rgba(37, 99, 235, 0.16)',
  },
  success: {
    bg: 'rgba(16, 185, 129, 0.08)',
    text: '#10b981',
    border: 'rgba(16, 185, 129, 0.16)',
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.08)',
    text: '#f59e0b',
    border: 'rgba(245, 158, 11, 0.16)',
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.08)',
    text: '#ef4444',
    border: 'rgba(239, 68, 68, 0.16)',
  },
  info: {
    bg: 'rgba(99, 102, 241, 0.08)',
    text: '#6366f1',
    border: 'rgba(99, 102, 241, 0.16)',
  },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = 'primary',
  caption,
  badge,
  badgeColor,
  onClick,
  sx = {},
}) {
  const conf = COLOR_CONFIG[color] || COLOR_CONFIG.primary;

  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
          borderColor: conf.text,
        } : {},
        ...sx,
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: conf.bg,
              color: conf.text,
              border: `1px solid ${conf.border}`,
            }}
          >
            {Icon && <Icon sx={{ fontSize: 22 }} />}
          </Box>

          {badge && (
            <Chip
              label={badge}
              size="small"
              color={badgeColor || color}
              variant="outlined"
              sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700 }}
            />
          )}
        </Stack>

        <Typography
          variant="h4"
          component="div"
          sx={{
            fontWeight: 800,
            color: 'text.primary',
            mb: 0.5,
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </Typography>

        <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.8125rem' }}>
          {title}
        </Typography>

        {caption && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontSize: '0.725rem', opacity: 0.8 }}>
            {caption}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
