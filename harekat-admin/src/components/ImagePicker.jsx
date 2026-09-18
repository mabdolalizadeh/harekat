import { useEffect, useState } from 'react';
import { Box, Button, Stack, Typography, LinearProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { adminApi } from '../services/api.js';

export default function ImagePicker({ value, onChange, alt = 'preview' }) {
  const [file, setFile] = useState(null);
  const [blobUrl, setBlobUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const preview = blobUrl || value || '';

  useEffect(() => () => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
  }, [blobUrl]);

  const chooseFile = (nextFile) => {
    if (!nextFile) return;
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    const url = URL.createObjectURL(nextFile);
    setFile(nextFile);
    setBlobUrl(url);
    setError(null);
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const imageUrl = await adminApi.uploadImage(file);
      onChange(imageUrl);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      setFile(null);
      setBlobUrl('');
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const remove = () => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setFile(null);
    setBlobUrl('');
    setError(null);
    onChange('');
  };

  return (
    <Stack spacing={1.2}>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <Button component="label" variant="outlined" size="small" startIcon={<CloudUploadIcon />}>
          انتخاب تصویر
          <input type="file" hidden accept="image/*" onChange={(e) => chooseFile(e.target.files[0])} disabled={uploading} />
        </Button>
        {preview && <Box component="img" src={preview} alt={alt} sx={{ width: 44, height: 44, borderRadius: 2, objectFit: 'cover', border: '1px solid', borderColor: 'divider' }} />}
        {preview && <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all', flex: 1, fontSize: 11 }} dir="ltr">{preview.slice(0, 60)}</Typography>}
      </Box>
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="contained" onClick={upload} disabled={!file || uploading}>{uploading ? 'در حال بارگذاری...' : 'بارگذاری'}</Button>
        <Button size="small" variant="text" color="error" startIcon={<DeleteIcon />} onClick={remove} disabled={(!file && !value) || uploading}>حذف</Button>
      </Stack>
      {uploading && <LinearProgress />}
      {error && <Typography variant="caption" color="error">{error}</Typography>}
    </Stack>
  );
}
