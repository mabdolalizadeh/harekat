// MUI-based admin primitives — replaces previous Tailwind helpers
import { Box, Paper, Stack, Chip, Alert, Typography, Button, Skeleton, Grid } from '@mui/material';
import { CheckCircle as ActiveIcon, Cancel as InactiveIcon } from '@mui/icons-material';

export function Card({ children, sx, ...props }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'background.paper',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Paper>
  );
}

export function Field({ label, children, hint }) {
  return (
    <Stack spacing={1}>
      <Typography variant="caption" color="text.secondary" fontWeight={700} fontSize={12}>
        {label}
      </Typography>
      {children}
      {hint && <Typography variant="caption" color="text.secondary" fontSize={11}>{hint}</Typography>}
    </Stack>
  );
}

export function RowActions({ onEdit, onDelete, extra }) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      {extra}
      {onEdit && <Button size="small" variant="text" onClick={onEdit} sx={{ minWidth: 52, fontSize: 12 }}>ویرایش</Button>}
      {onDelete && <Button size="small" color="error" variant="text" onClick={onDelete} sx={{ minWidth: 52, fontSize: 12 }}>حذف</Button>}
    </Stack>
  );
}

export function StatusDot({ active, label }) {
  return (
    <Chip
      size="small"
      icon={active ? <ActiveIcon sx={{ fontSize: 14 }} /> : <InactiveIcon sx={{ fontSize: 14 }} />}
      label={label ?? (active ? 'فعال' : 'غیرفعال')}
      color={active ? 'success' : 'default'}
      variant={active ? 'filled' : 'outlined'}
      sx={{ height: 24, fontSize: 11.5, fontWeight: 700, px: 0.5, '& .MuiChip-icon': { fontSize: 14, marginInlineEnd: '-4px', marginInlineStart: '4px' } }}
    />
  );
}

export function FormError({ error }) {
  if (!error) return null;
  return <Alert severity="error" variant="outlined" sx={{ py: 0.5, fontSize: 13 }}>{error}</Alert>;
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
      <Box>
        <Typography variant="h5" fontWeight={800} letterSpacing={-0.5}>{title}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary" mt={0.5} fontSize={13}>{subtitle}</Typography>}
      </Box>
      {action}
    </Box>
  );
}

export function ListRowSkeleton({ count = 4, circularAvatar = true, showAvatar = true, avatarWidth, avatarHeight }) {
  return (
    <Stack spacing={1.5}>
      {Array.from({ length: count }).map((_, i) => (
        <Paper
          key={i}
          elevation={0}
          sx={{
            px: { xs: 1.5, sm: 2 },
            py: 1.25,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: circularAvatar ? 999 : 2.5,
          }}
        >
          {showAvatar && (
            circularAvatar ? (
              <Skeleton variant="circular" width={avatarWidth || 44} height={avatarHeight || 44} sx={{ flexShrink: 0 }} />
            ) : (
              <Skeleton variant="rounded" width={avatarWidth || 56} height={avatarHeight || 40} sx={{ borderRadius: 1.5, flexShrink: 0 }} />
            )
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Skeleton variant="text" width={180} height={22} sx={{ borderRadius: 1 }} />
            <Skeleton variant="text" width={260} height={16} sx={{ borderRadius: 1, mt: 0.5 }} />
          </Box>
          <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
            <Skeleton variant="circular" width={12} height={12} />
            <Skeleton variant="circular" width={28} height={28} />
            <Skeleton variant="circular" width={28} height={28} />
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}

export function CategoryListSkeleton({ count = 4 }) {
  return (
    <Stack spacing={1.5}>
      {Array.from({ length: count }).map((_, i) => (
        <Paper
          key={i}
          elevation={0}
          sx={{
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2.5
          }}
        >
          <Box>
            <Skeleton variant="text" width={140} height={22} sx={{ borderRadius: 1 }} />
            <Skeleton variant="text" width={80} height={16} sx={{ borderRadius: 1, mt: 0.5 }} />
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Skeleton variant="circular" width={12} height={12} />
            <Skeleton variant="circular" width={28} height={28} />
            <Skeleton variant="circular" width={28} height={28} />
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}

export function TeacherCardSkeleton({ count = 4 }) {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid key={i} size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2.5,
            }}
          >
            <Skeleton variant="circular" width={48} height={48} sx={{ flexShrink: 0 }} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Skeleton variant="text" width={120} height={22} sx={{ borderRadius: 1 }} />
              <Skeleton variant="text" width={160} height={16} sx={{ borderRadius: 1, mt: 0.5 }} />
            </Box>
            <Stack sx={{ alignItems: 'flex-end' }} spacing={1} flexShrink={0}>
              <Skeleton variant="rounded" width={50} height={20} sx={{ borderRadius: 1 }} />
              <Stack direction="row" spacing={1}>
                <Skeleton variant="circular" width={28} height={28} />
                <Skeleton variant="circular" width={28} height={28} />
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

export function BannerListSkeleton({ count = 3 }) {
  return (
    <Stack spacing={1.5}>
      {Array.from({ length: count }).map((_, i) => (
        <Paper
          key={i}
          elevation={0}
          sx={{
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2.5,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
            <Skeleton variant="rounded" width={110} height={58} sx={{ borderRadius: 1.5, flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              <Skeleton variant="text" width={140} height={20} sx={{ borderRadius: 1 }} />
              <Skeleton variant="text" width={100} height={16} sx={{ borderRadius: 1, mt: 0.5 }} />
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Skeleton variant="circular" width={12} height={12} />
            <Skeleton variant="circular" width={28} height={28} />
            <Skeleton variant="circular" width={28} height={28} />
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}

// Re-export MUI inputs for old imports: inputCls no longer needed but keep for compat
export const inputCls = '';
export const btnPrimaryCls = '';
export const btnGhostCls = '';
export const btnDangerCls = '';
