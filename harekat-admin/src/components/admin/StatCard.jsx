import { CardContent, Typography, Box, Stack, Chip } from '@mui/material';
import { motion } from 'motion/react';
import SpotlightCard from '../ui/SpotlightCard.jsx';

const COLOR_CONFIG = {
  primary: {
    bg: 'rgba(37, 99, 235, 0.08)',
    text: '#2563eb',
    border: 'rgba(37, 99, 235, 0.16)',
    spotlight: 'rgba(37, 99, 235, 0.10)',
  },
  success: {
    bg: 'rgba(16, 185, 129, 0.08)',
    text: '#10b981',
    border: 'rgba(16, 185, 129, 0.16)',
    spotlight: 'rgba(16, 185, 129, 0.10)',
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.08)',
    text: '#f59e0b',
    border: 'rgba(245, 158, 11, 0.16)',
    spotlight: 'rgba(245, 158, 11, 0.10)',
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.08)',
    text: '#ef4444',
    border: 'rgba(239, 68, 68, 0.16)',
    spotlight: 'rgba(239, 68, 68, 0.10)',
  },
  info: {
    bg: 'rgba(99, 102, 241, 0.08)',
    text: '#6366f1',
    border: 'rgba(99, 102, 241, 0.16)',
    spotlight: 'rgba(99, 102, 241, 0.10)',
  },
  secondary: {
    bg: 'rgba(148, 163, 184, 0.08)',
    text: '#64748b',
    border: 'rgba(148, 163, 184, 0.16)',
    spotlight: 'rgba(148, 163, 184, 0.10)',
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
    <motion.div
      whileHover={onClick ? { y: -3, transition: { duration: 0.2, ease: 'easeOut' } } : undefined}
      whileTap={onClick ? { scale: 0.985 } : undefined}
      style={{ height: '100%' }}
    >
      <SpotlightCard
        spotlightColor={conf.spotlight}
        onClick={onClick}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          cursor: onClick ? 'pointer' : 'default',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': onClick
            ? {
                borderColor: conf.text,
                boxShadow: `0 8px 24px -4px ${conf.bg}`,
              }
            : {},
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
      </SpotlightCard>
    </motion.div>
  );
}
