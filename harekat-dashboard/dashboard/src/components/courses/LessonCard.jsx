import { Box, Typography, Card, IconButton, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { assetUrl, toPersianDigits } from '../../utils/formatters.js';

export default function LessonCard({ lesson, onPlay, status }) {
  const isCompleted = status === 'completed';
  const isInProgress = status === 'in_progress';

  return (
    <Card
      sx={{
        p: 2,
        mb: 2,
        borderRadius: '22px',
        backgroundColor: '#ffffff',
        border: isInProgress ? '1.5px solid #bfdbfe' : '1px solid #eef2f7',
        boxShadow: isInProgress
          ? '0 12px 28px -6px rgba(37, 99, 235, 0.12)'
          : '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 30px -4px rgba(15, 23, 42, 0.09)'
        }
      }}
      onClick={() => onPlay && onPlay(lesson)}
    >
      {/* Top lesson info: Lesson Number + Time / Date */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.78rem' }}>
          {lesson.lessonNumber ? `جلسه ${toPersianDigits(lesson.lessonNumber)}` : 'جلسه آموزشی'}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: isInProgress ? '#ef4444' : '#94a3b8' }}>
          <AccessTimeIcon sx={{ fontSize: 14 }} />
          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.74rem' }}>
            {toPersianDigits(lesson.timeInfo || lesson.duration || '۳۰ دقیقه')}
          </Typography>
        </Box>
      </Box>

      {/* Lesson / Course Title */}
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 700,
          fontSize: '0.9rem',
          lineHeight: 1.4,
          color: '#1e293b',
          mb: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}
      >
        {lesson.title}
      </Typography>

      {/* Course thumbnail image if available */}
      {lesson.image && (
        <Box
          component="img"
          src={assetUrl(lesson.image)}
          alt={lesson.title}
          sx={{
            width: '100%',
            height: 100,
            objectFit: 'cover',
            borderRadius: '14px',
            mb: 1.5,
            backgroundColor: '#f1f5f9'
          }}
        />
      )}

      {/* Bottom Action Bar: Play icon, Exercise icon, Resource icon + Score/Progress */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }} onClick={(e) => e.stopPropagation()}>
          {/* Play button (Green square in reference) */}
          <Tooltip title="مشاهده ویدیو">
            <IconButton
              size="small"
              onClick={() => onPlay && onPlay(lesson)}
              sx={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                '&:hover': { backgroundColor: '#059669' }
              }}
            >
              <PlayArrowIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          {/* Exercise / Reading icon (Yellow/Orange square in reference) */}
          <Tooltip title="متن و سرفصل">
            <IconButton
              size="small"
              onClick={() => onPlay && onPlay(lesson)}
              sx={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                backgroundColor: '#f59e0b',
                color: '#ffffff',
                '&:hover': { backgroundColor: '#d97706' }
              }}
            >
              <MenuBookIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>

          {/* Resource icon (Blue square in reference) */}
          <Tooltip title="پیوست‌ها و فایل‌ها">
            <IconButton
              size="small"
              onClick={() => onPlay && onPlay(lesson)}
              sx={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                '&:hover': { backgroundColor: '#2563eb' }
              }}
            >
              <FolderOutlinedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Score indicator (e.g. 0/20 or 20/20 in reference) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
          {isCompleted && <CheckCircleIcon sx={{ fontSize: 15, color: '#10b981' }} />}
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.8rem',
              color: isCompleted ? '#10b981' : '#94a3b8'
            }}
          >
            {isCompleted ? `${toPersianDigits(20)} / ${toPersianDigits(20)}` : `${toPersianDigits(0)} / ${toPersianDigits(20)}`}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}
