// MUI-based admin primitives & re-exports
import {
  Box,
  Paper,
  Stack,
  Alert,
  Typography,
  Skeleton,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

// Re-export modern components
export { default as PageHeader } from '../../components/admin/PageHeader.jsx';
export { default as StatCard } from '../../components/admin/StatCard.jsx';
export { default as DataTable } from '../../components/admin/DataTable.jsx';
export { default as ConfirmDialog } from '../../components/admin/ConfirmDialog.jsx';
export { default as StatusChip } from '../../components/admin/StatusChip.jsx';
export { default as EmptyState } from '../../components/admin/EmptyState.jsx';

export function Card({ children, sx = {}, ...props }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3 },
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

export function Field({ label, children, hint, required }) {
  return (
    <Stack spacing={1}>
      {label && (
        <Typography variant="caption" color="text.secondary" fontWeight={700} fontSize={12}>
          {label} {required && <Box component="span" sx={{ color: 'error.main' }}>*</Box>}
        </Typography>
      )}
      {children}
      {hint && <Typography variant="caption" color="text.secondary" fontSize={11}>{hint}</Typography>}
    </Stack>
  );
}

export function RowActions({ onEdit, onDelete, extra, editTooltip = 'ویرایش', deleteTooltip = 'حذف' }) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      {extra}
      {onEdit && (
        <Tooltip title={editTooltip}>
          <IconButton size="small" onClick={onEdit} color="primary">
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip title={deleteTooltip}>
          <IconButton size="small" onClick={onDelete} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}

// Backward compatible StatusDot that uses StatusChip
import StatusChip from '../../components/admin/StatusChip.jsx';
export function StatusDot({ active, label }) {
  return <StatusChip status={!!active} label={label} />;
}

export function FormError({ error }) {
  if (!error) return null;
  return (
    <Alert severity="error" variant="outlined" sx={{ py: 0.5, fontSize: 13, borderRadius: 2 }}>
      {error}
    </Alert>
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
            px: { xs: 2, sm: 2.5 },
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2.5,
          }}
        >
          {showAvatar && (
            circularAvatar ? (
              <Skeleton variant="circular" width={avatarWidth || 40} height={avatarHeight || 40} sx={{ flexShrink: 0 }} />
            ) : (
              <Skeleton variant="rounded" width={avatarWidth || 56} height={avatarHeight || 40} sx={{ borderRadius: 1.5, flexShrink: 0 }} />
            )
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Skeleton variant="text" width={180} height={22} sx={{ borderRadius: 1 }} />
            <Skeleton variant="text" width={260} height={16} sx={{ borderRadius: 1, mt: 0.5 }} />
          </Box>
          <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
            <Skeleton variant="circular" width={20} height={20} />
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
            p: 2,
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
            <Skeleton variant="circular" width={20} height={20} />
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
              p: 2.5,
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
            p: 2,
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
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="circular" width={28} height={28} />
            <Skeleton variant="circular" width={28} height={28} />
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}

export const inputCls = '';
export const btnPrimaryCls = '';
export const btnGhostCls = '';
export const btnDangerCls = '';
