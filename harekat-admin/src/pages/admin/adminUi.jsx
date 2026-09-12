// MUI-based admin primitives — replaces previous Tailwind helpers
import { Box, Paper, Stack, Chip, Alert, Typography, Button } from '@mui/material';
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

// Re-export MUI inputs for old imports: inputCls no longer needed but keep for compat
export const inputCls = '';
export const btnPrimaryCls = '';
export const btnGhostCls = '';
export const btnDangerCls = '';
