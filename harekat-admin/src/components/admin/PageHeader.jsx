import { Box, Typography, Stack, Breadcrumbs } from '@mui/material';
import { NavigateBefore as ChevronIcon } from '@mui/icons-material';

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  action,
  children,
  sx = {}
}) {
  return (
    <Box sx={{ mb: { xs: 2.5, sm: 3.5 }, ...sx }}>
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<ChevronIcon sx={{ fontSize: 14, color: 'text.disabled', transform: 'rotate(180deg)' }} />}
          sx={{ mb: 1 }}
        >
          {breadcrumbs.map((b, idx) => (
            <Typography
              key={idx}
              variant="caption"
              color={idx === breadcrumbs.length - 1 ? 'text.primary' : 'text.secondary'}
              fontWeight={idx === breadcrumbs.length - 1 ? 600 : 400}
            >
              {b.label}
            </Typography>
          ))}
        </Breadcrumbs>
      )}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              letterSpacing: '-0.02em',
              lineHeight: 1.3,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, fontSize: '0.84rem' }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {action && (
          <Box sx={{ flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'center' } }}>
            {action}
          </Box>
        )}
      </Stack>

      {children && <Box sx={{ mt: 2 }}>{children}</Box>}
    </Box>
  );
}
