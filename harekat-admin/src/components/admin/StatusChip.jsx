import { Chip } from '@mui/material';
import {
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  HourglassEmpty as PendingIcon,
  Check as PaidIcon,
  Close as FailedIcon,
  Help as OpenIcon,
} from '@mui/icons-material';

const MAPS = {
  active: { label: 'فعال', color: 'success', icon: ActiveIcon },
  inactive: { label: 'غیرفعال', color: 'default', icon: InactiveIcon },

  // Orders & Payments
  pending: { label: 'در انتظار پرداخت', color: 'warning', icon: PendingIcon },
  paid: { label: 'پرداخت شده', color: 'success', icon: PaidIcon },
  failed: { label: 'ناموفق', color: 'error', icon: FailedIcon },
  cancelled: { label: 'لغو شده', color: 'default' },
  refunded: { label: 'مرجوع شده', color: 'info' },

  // Tickets
  open: { label: 'باز', color: 'info', icon: OpenIcon },
  in_progress: { label: 'در حال بررسی', color: 'warning' },
  answered: { label: 'پاسخ داده شده', color: 'success' },
  closed: { label: 'بسته شده', color: 'default' },

  // Priorities
  low: { label: 'کم', color: 'default' },
  medium: { label: 'متوسط', color: 'primary' },
  high: { label: 'بالا', color: 'error' },

  // Access Source
  direct: { label: 'خرید مستقیم', color: 'primary' },
  package: { label: 'پکیج مهارتی', color: 'secondary' },
  subscription: { label: 'اشتراک', color: 'info' },
  admin: { label: 'دستی مدیر', color: 'warning' },

  // License status
  available: { label: 'معتبر و صادرشده', color: 'success' },
  revoked: { label: 'باطل شده', color: 'error' },
};

export default function StatusChip({
  status,
  label,
  color,
  size = 'small',
  variant = 'filled',
  sx = {}
}) {
  if (typeof status === 'boolean') {
    const isAct = status;
    return (
      <Chip
        size={size}
        label={label || (isAct ? 'فعال' : 'غیرفعال')}
        color={color || (isAct ? 'success' : 'default')}
        variant={variant}
        sx={{
          fontWeight: 600,
          fontSize: '0.75rem',
          height: 24,
          ...sx
        }}
      />
    );
  }

  const item = MAPS[status] || {};
  const chipLabel = label || item.label || status || 'نامشخص';
  const chipColor = color || item.color || 'default';

  return (
    <Chip
      size={size}
      label={chipLabel}
      color={chipColor}
      variant={variant}
      sx={{
        fontWeight: 600,
        fontSize: '0.75rem',
        height: 24,
        ...sx
      }}
    />
  );
}
