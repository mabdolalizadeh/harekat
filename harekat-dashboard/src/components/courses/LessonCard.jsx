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
        borderRadius: '18px',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: isInProgress ? 'primary.main' : 'divider',
        boxShadow: isInProgress
          ? '0 6px 18px -4px rgba(244, 124, 32, 0.2)'
          : '0 2px 6px rgba(0, 0, 0, 0.04)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.12)',
          borderColor: 'primary.main',
        },
      }}
      onClick={() => onPlay && onPlay(lesson)}
    >
      {/* Top lesson info: Lesson Number + Time / Date */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.78rem' }}>
          {lesson.lessonNumber ? `جلسه ${toPersianDigits(lesson.lessonNumber)}` : 'جلسه آموزشی'}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: isInProgress ? 'primary.main' : 'text.secondary' }}>
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
          lineHeight: 1.45,
          color: 'text.primary',
          mb: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
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
            bgcolor: 'action.hover',
          }}
        />
      )}

      {/* Bottom Action Bar: Play icon, Exercise icon, Resource icon + Score/Progress */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }} onClick={(e) => e.stopPropagation()}>
          {/* Play button */}
          <Tooltip title="مشاهده ویدیو">
            <IconButton
              size="small"
              onClick={() => onPlay && onPlay(lesson)}
              sx={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                bgcolor: 'success.main',
                color: '#ffffff',
                '&:hover': { bgcolor: 'success.dark' },
              }}
            >
              <PlayArrowIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          {/* Exercise / Reading icon */}
          <Tooltip title="متن و سرفصل">
            <IconButton
              size="small"
              onClick={() => onPlay && onPlay(lesson)}
              sx={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                bgcolor: 'warning.main',
                color: '#ffffff',
                '&:hover': { bgcolor: 'warning.dark' },
              }}
            >
              <MenuBookIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>

          {/* Resource icon */}
          <Tooltip title="پیوست‌ها و فایل‌ها">
            <IconButton
              size="small"
              onClick={() => onPlay && onPlay(lesson)}
              sx={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                bgcolor: 'info.main',
                color: '#ffffff',
                '&:hover': { bgcolor: 'info.dark' },
              }}
            >
              <FolderOutlinedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Score indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
          {isCompleted && <CheckCircleIcon sx={{ fontSize: 15, color: 'success.main' }} />}
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.8rem',
              color: isCompleted ? 'success.main' : 'text.disabled',
            }}
          >
            {isCompleted ? `${toPersianDigits(20)} / ${toPersianDigits(20)}` : `${toPersianDigits(0)} / ${toPersianDigits(20)}`}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}
