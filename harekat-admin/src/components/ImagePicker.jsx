import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  LinearProgress,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { adminApi } from '../services/api.js';

export default function ImagePicker({ value, onChange, alt = 'پیش‌نمایش تصویر' }) {
  const [blobUrl, setBlobUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const preview = blobUrl || value || '';

  useEffect(() => () => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
  }, [blobUrl]);

  const chooseFile = async (nextFile) => {
    if (!nextFile) return;
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    const url = URL.createObjectURL(nextFile);
    setBlobUrl(url);
    setError(null);

    // Auto-upload immediately upon file selection for smooth UX
    setUploading(true);
    try {
      const imageUrl = await adminApi.uploadImage(nextFile);
      onChange(imageUrl);
      setBlobUrl('');
    } catch (e) {
      setError(e.message || 'خطا در بارگذاری تصویر');
    } finally {
      setUploading(false);
    }
  };

  const remove = (e) => {
    e.stopPropagation();
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl('');
    setError(null);
    onChange('');
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: '1px dashed',
        borderColor: error ? 'error.main' : 'divider',
        borderRadius: 2.5,
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={1.5}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {preview ? (
            <Box
              component="img"
              src={preview}
              alt={alt}
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                objectFit: 'cover',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'action.hover',
                flexShrink: 0,
              }}
            />
          ) : (
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: 'action.hover',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
                flexShrink: 0,
              }}
            >
              <ImageIcon />
            </Box>
          )}

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                component="label"
                variant="outlined"
                size="small"
                startIcon={<CloudUploadIcon />}
                disabled={uploading}
                sx={{ borderRadius: 2 }}
              >
                {uploading ? 'در حال بارگذاری...' : preview ? 'تغییر تصویر' : 'انتخاب تصویر'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => chooseFile(e.target.files[0])}
                  disabled={uploading}
                />
              </Button>

              {preview && (
                <Tooltip title="حذف تصویر">
                  <IconButton size="small" color="error" onClick={remove} disabled={uploading}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>

            {preview && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ wordBreak: 'break-all', display: 'block', mt: 0.75, fontSize: '0.725rem' }}
                dir="ltr"
              >
                {preview.slice(0, 60)}...
              </Typography>
            )}
          </Box>
        </Box>

        {uploading && <LinearProgress sx={{ borderRadius: 1 }} />}

        {error && (
          <Typography variant="caption" color="error.main" fontWeight={600}>
            {error}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
