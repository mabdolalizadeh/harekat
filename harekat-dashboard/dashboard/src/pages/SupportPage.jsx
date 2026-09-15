import { Box, Typography, Card, TextField, Button, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useState } from 'react';

export default function SupportPage() {
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !text.trim()) return;
    setSent(true);
    setSubject('');
    setText('');
  };

  return (
    <Box sx={{ maxWidth: 720 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        پشتیبانی و ارتباط با کارشناسان
      </Typography>
      <Typography variant="body2" sx={{ color: '#64748b', mb: 3.5 }}>
        در صورت بروز هرگونه مشکل یا سوال پیرامون دوره‌ها، پیام خود را ارسال فرمایید.
      </Typography>

      {sent && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '16px' }}>
          پیام شما با موفقیت دریافت شد و کارشناسان پشتیبانی به زودی با شما تماس خواهند گرفت.
        </Alert>
      )}

      <Card
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 3.5,
          borderRadius: '24px',
          border: '1px solid #eef2f7',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)'
        }}
      >
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            موضوع پیام:
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="مثلاً مشکل در مشاهده ویدیو جلسه دوم"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            متن پیام:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="توضیحات کامل درخواست خود را بنویسید..."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          size="large"
          startIcon={<SendIcon />}
          sx={{ borderRadius: '14px', px: 3.5, py: 1.2, fontWeight: 700 }}
        >
          ارسال تیکت پشتیبانی
        </Button>
      </Card>
    </Box>
  );
}
