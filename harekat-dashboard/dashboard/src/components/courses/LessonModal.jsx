import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Button, IconButton, Chip, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { toPersianDigits, formatDuration } from '../../utils/formatters.js';

export default function LessonModal({ lesson, open, onClose, onToggleComplete, isCompleted }) {
  if (!lesson) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          p: 1,
          border: '1px solid #deddd7',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            label={lesson.statusTitle || 'جلسه آموزشی'}
            size="small"
            sx={{
              backgroundColor: '#fff8ed',
              color: '#b94410',
              border: '1px solid #ffdda8',
              fontWeight: 700,
              fontSize: '0.78rem'
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#171715' }}>
            {lesson.title}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: '#f1f4f9' }}>
        {/* Video Player or Embed if videoUrl exists */}
        {lesson.videoUrl ? (
          <Box
            sx={{
              width: '100%',
              height: { xs: 220, sm: 380 },
              borderRadius: '20px',
              overflow: 'hidden',
              backgroundColor: '#0f172a',
              mb: 3,
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
            }}
          >
            {lesson.videoUrl.includes('youtube.com') || lesson.videoUrl.includes('aparat.com') ? (
              <iframe
                src={lesson.videoUrl}
                title={lesson.title}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={lesson.videoUrl}
                controls
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            )}
          </Box>
        ) : (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              borderRadius: '20px',
              mb: 3,
              border: '1px dashed #cbd5e1'
            }}
          >
            <PlayCircleOutlineIcon sx={{ fontSize: 54, color: '#94a3b8', mb: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#475569' }}>
              محتوای متنی و کارگاهی این جلسه
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              ویدیو برای این بخش ثبت نشده است؛ نکات و سرفصل زیر را مطالعه فرمایید.
            </Typography>
          </Box>
        )}

        {/* Metadata info: Duration, Teacher, Level */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#64748b' }}>
            <AccessTimeIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              مدت زمان: {toPersianDigits(formatDuration(lesson.duration))}
            </Typography>
          </Box>

          {lesson.teacher && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#64748b' }}>
              <PersonOutlineIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                مدرس: {lesson.teacher.firstName} {lesson.teacher.lastName}
              </Typography>
            </Box>
          )}

          {lesson.level && (
            <Chip
              label={`سطح: ${lesson.level}`}
              size="small"
              sx={{ backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 600 }}
            />
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Syllabus / Notes Markdown content */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1e293b' }}>
          توضیحات و سرفصل جلسه:
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#475569',
            lineHeight: 1.8,
            whiteSpace: 'pre-line',
            backgroundColor: '#f8fafc',
            p: 2.5,
            borderRadius: '16px',
            border: '1px solid #eef2f6'
          }}
        >
          {lesson.longDescription || lesson.description || 'توضیحات تکمیلی برای این جلسه ثبت نشده است.'}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button onClick={onClose} sx={{ color: '#64748b' }}>
          بستن
        </Button>

        <Button
          variant={isCompleted ? 'outlined' : 'contained'}
          color={isCompleted ? 'success' : 'primary'}
          endIcon={<CheckCircleOutlineIcon />}
          onClick={() => {
            if (onToggleComplete) onToggleComplete(lesson.id);
          }}
          sx={{ borderRadius: '14px', px: 3, fontWeight: 700 }}
        >
          {isCompleted ? 'تکمیل شده (علامت زدن به عنوان ناتمام)' : 'علامت زدن به عنوان تکمیل شده (+۲۰ امتیاز)'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
