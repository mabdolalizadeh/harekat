import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Typography
} from '@mui/material';
import {
  WarningAmber as WarningIcon,
  Error as DangerIcon,
  Info as InfoIcon
} from '@mui/icons-material';

export default function ConfirmDialog({
  open,
  title = 'تایید عملیات',
  message = 'آیا از انجام این عملیات اطمینان دارید؟ این عمل ممکن است غیرقابل بازگشت باشد.',
  confirmText = 'تایید',
  cancelText = 'انصراف',
  severity = 'error', // 'error' | 'warning' | 'info'
  loading = false,
  onConfirm,
  onClose,
}) {
  const isDanger = severity === 'error';

  const getIcon = () => {
    switch (severity) {
      case 'error':
        return <DangerIcon color="error" sx={{ fontSize: 26 }} />;
      case 'warning':
        return <WarningIcon color="warning" sx={{ fontSize: 26 }} />;
      default:
        return <InfoIcon color="info" sx={{ fontSize: 26 }} />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      dir="rtl"
      PaperProps={{
        sx: { p: 1 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        {getIcon()}
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.6 }}>
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
        <Button
          variant="text"
          color="inherit"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          variant="contained"
          color={isDanger ? 'error' : 'primary'}
          onClick={onConfirm}
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} color="inherit" />}
          autoFocus
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
