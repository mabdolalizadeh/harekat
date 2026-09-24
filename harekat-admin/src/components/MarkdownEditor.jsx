import { useState, useRef } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Button,
  IconButton,
  Tooltip,
  Divider,
  Paper,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatStrikethrough as StrikethroughIcon,
  Title as HeadingIcon,
  FormatListBulleted as BulletListIcon,
  FormatListNumbered as NumberedListIcon,
  FormatQuote as QuoteIcon,
  Code as CodeIcon,
  Link as LinkIcon,
  AddPhotoAlternate as ImageIcon,
  TableChart as TableIcon,
  HorizontalRule as RuleIcon,
  Checklist as ChecklistIcon,
  Visibility as PreviewIcon,
  EditNote as EditIcon,
  ViewColumn as SplitViewIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { adminApi } from '../services/api.js';

export default function MarkdownEditor({
  value = '',
  onChange,
  label = 'توضیحات جامع دوره',
  placeholder = 'توضیحات کامل، سرفصل‌ها و اهداف آموزشی را به زبان Markdown یا متن ساده بنویسید...',
  minHeight = 280,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // 0: Editor, 1: Live Preview, 2: Split View
  const [activeTab, setActiveTab] = useState(0);

  // Image Upload Dialog State
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageTab, setImageTab] = useState(0); // 0: Upload File, 1: Image URL
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Helper to insert markdown text at cursor position
  const insertText = (before, after = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = value || '';
    const selectedText = currentVal.substring(start, end) || defaultText;

    const replacement = `${before}${selectedText}${after}`;
    const newValue = currentVal.substring(0, start) + replacement + currentVal.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  // Upload image handler
  const handleUploadImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('فقط فایل‌های تصویری مجاز هستند.');
      return;
    }

    try {
      setUploadingImage(true);
      setUploadError(null);
      const url = await adminApi.uploadImage(file);
      if (url) {
        const alt = imageAlt.trim() || file.name.replace(/\.[^/.]+$/, '');
        insertText(`\n![${alt}](${url})\n`, '');
        setImageDialogOpen(false);
        setImageAlt('');
        setImageUrl('');
      }
    } catch (err) {
      setUploadError(err.message || 'خطا در بارگذاری تصویر');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleInsertUrlImage = () => {
    if (!imageUrl.trim()) return;
    const alt = imageAlt.trim() || 'تصویر';
    insertText(`\n![${alt}](${imageUrl.trim()})\n`, '');
    setImageDialogOpen(false);
    setImageAlt('');
    setImageUrl('');
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2.5,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      {/* Top Bar: Tabs (Edit, Preview, Split) + Header Label */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 0.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} color="text.primary">
          {label}
        </Typography>

        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            minHeight: 36,
            '& .MuiTab-root': {
              minHeight: 36,
              py: 0.5,
              px: 1.5,
              fontSize: '0.78rem',
              fontWeight: 700,
            },
          }}
        >
          <Tab icon={<EditIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="ویرایشگر متن" />
          <Tab icon={<PreviewIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="پیش‌نمایش زنده" />
          <Tab
            icon={<SplitViewIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="دو ستونه (همزمان)"
            sx={{ display: { xs: 'none', md: 'inline-flex' } }}
          />
        </Tabs>
      </Box>

      {/* Formatting Toolbar (Visible in Editor and Split modes) */}
      {(activeTab === 0 || activeTab === 2) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
            py: 0.8,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: isDark ? 'background.default' : '#ffffff',
            flexWrap: 'wrap',
          }}
        >
          <Tooltip title="تیتر بزرگ (Heading 2)">
            <IconButton size="small" onClick={() => insertText('\n## ', '\n', 'عنوان تیتر')}>
              <HeadingIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="پررنگ (Bold)">
            <IconButton size="small" onClick={() => insertText('**', '**', 'متن پررنگ')}>
              <BoldIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="ایتالیک (Italic)">
            <IconButton size="small" onClick={() => insertText('*', '*', 'متن مورب')}>
              <ItalicIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="خط‌خورده (Strikethrough)">
            <IconButton size="small" onClick={() => insertText('~~', '~~', 'متن خط‌خورده')}>
              <StrikethroughIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, alignSelf: 'center' }} />

          <Tooltip title="لیست نشانه‌دار (Bullets)">
            <IconButton size="small" onClick={() => insertText('\n- ', '\n', 'مورد لیست')}>
              <BulletListIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="لیست شماره‌دار (Numbered)">
            <IconButton size="small" onClick={() => insertText('\n1. ', '\n', 'مورد اول')}>
              <NumberedListIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="چک‌لیست کارها (Checklist)">
            <IconButton size="small" onClick={() => insertText('\n- [ ] ', '\n', 'وظیفه')}>
              <ChecklistIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="نقل قول (Quote)">
            <IconButton size="small" onClick={() => insertText('\n> ', '\n', 'متن نقل قول')}>
              <QuoteIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, alignSelf: 'center' }} />

          <Tooltip title="تکه کد (Inline Code)">
            <IconButton size="small" onClick={() => insertText('`', '`', 'کد نمونه')}>
              <CodeIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="لینک (Link)">
            <IconButton size="small" onClick={() => insertText('[عنوان پیوند](', ')', 'https://')}>
              <LinkIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="درج جدول (Table)">
            <IconButton
              size="small"
              onClick={() =>
                insertText(
                  '\n| ستون ۱ | ستون ۲ | ستون ۳ |\n| --- | --- | --- |\n| داده ۱ | داده ۲ | داده ۳ |\n'
                )
              }
            >
              <TableIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="خط افقی (Divider)">
            <IconButton size="small" onClick={() => insertText('\n---\n')}>
              <RuleIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, alignSelf: 'center' }} />

          {/* Primary Action: Add / Upload Image */}
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<ImageIcon sx={{ fontSize: 16 }} />}
            onClick={() => setImageDialogOpen(true)}
            sx={{
              borderRadius: 1.5,
              fontSize: '0.74rem',
              fontWeight: 700,
              py: 0.4,
              px: 1.2,
              ml: 'auto',
            }}
          >
            آپلود و درج تصویر
          </Button>
        </Box>
      )}

      {/* Editor Content Area */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: activeTab === 2 ? { xs: '1fr', md: '1fr 1fr' } : '1fr',
          minHeight,
        }}
      >
        {/* Tab 0 / Split: Textarea Editor */}
        {(activeTab === 0 || activeTab === 2) && (
          <Box
            sx={{
              p: 2,
              borderLeft: activeTab === 2 ? '1px solid' : 'none',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <textarea
              ref={textareaRef}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              dir="auto"
              style={{
                width: '100%',
                flex: 1,
                minHeight: minHeight - 40,
                border: 'none',
                outline: 'none',
                resize: 'vertical',
                backgroundColor: 'transparent',
                color: isDark ? '#f8fafc' : '#0f172a',
                fontFamily: '"Vazirmatn", "Rubik", sans-serif',
                fontSize: '0.9rem',
                lineHeight: 1.7,
              }}
            />
          </Box>
        )}

        {/* Tab 1 / Split: Live Markdown Preview */}
        {(activeTab === 1 || activeTab === 2) && (
          <Box
            sx={{
              p: 2.5,
              maxHeight: 520,
              overflowY: 'auto',
              bgcolor: isDark ? '#0b0f19' : '#fcfcfc',
              direction: 'rtl',
              '& h1, & h2, & h3, & h4': {
                fontWeight: 800,
                color: 'text.primary',
                mt: 1.5,
                mb: 1,
              },
              '& h1': { fontSize: '1.4rem' },
              '& h2': { fontSize: '1.2rem', borderBottom: '1px solid', borderColor: 'divider', pb: 0.5 },
              '& h3': { fontSize: '1.05rem' },
              '& p': {
                lineHeight: 1.8,
                color: 'text.secondary',
                mb: 1.5,
                fontSize: '0.88rem',
              },
              '& ul, & ol': {
                pr: 3,
                mb: 1.5,
                color: 'text.secondary',
                fontSize: '0.88rem',
                lineHeight: 1.8,
              },
              '& blockquote': {
                borderRight: '4px solid',
                borderColor: 'primary.main',
                bgcolor: isDark ? 'rgba(37, 99, 235, 0.08)' : 'rgba(37, 99, 235, 0.04)',
                p: 1.5,
                borderRadius: '0 8px 8px 0',
                my: 1.5,
                color: 'text.primary',
                fontStyle: 'italic',
              },
              '& code': {
                bgcolor: isDark ? '#1e293b' : '#f1f5f9',
                color: 'primary.main',
                px: 0.8,
                py: 0.2,
                borderRadius: 1,
                fontSize: '0.82rem',
                fontFamily: 'monospace',
                dir: 'ltr',
              },
              '& pre': {
                bgcolor: isDark ? '#1e293b' : '#0f172a',
                color: '#f8fafc',
                p: 2,
                borderRadius: 2,
                overflowX: 'auto',
                dir: 'ltr',
                my: 2,
                '& code': {
                  bgcolor: 'transparent',
                  color: 'inherit',
                  p: 0,
                },
              },
              '& table': {
                width: '100%',
                borderCollapse: 'collapse',
                my: 2,
                '& th, & td': {
                  border: '1px solid',
                  borderColor: 'divider',
                  p: 1,
                  fontSize: '0.84rem',
                  textAlign: 'right',
                },
                '& th': {
                  bgcolor: isDark ? '#1e293b' : '#f1f5f9',
                  fontWeight: 700,
                },
              },
              '& img': {
                maxWidth: '100%',
                height: 'auto',
                borderRadius: 2,
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                my: 1.5,
                display: 'block',
              },
              '& hr': {
                border: 'none',
                borderTop: '1px solid',
                borderColor: 'divider',
                my: 2.5,
              },
            }}
          >
            {value && value.trim() ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            ) : (
              <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic', py: 4, textAlign: 'center' }}>
                پیش‌نمایش محتوای مارک‌داون شما در این بخش نمایش داده می‌شود.
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Image Upload & Insertion Modal */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>درج تصویر در متن</span>
          <IconButton size="small" onClick={() => setImageDialogOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 1.5 }}>
          <Tabs
            value={imageTab}
            onChange={(_, v) => setImageTab(v)}
            sx={{ mb: 2, minHeight: 34, '& .MuiTab-root': { minHeight: 34, fontSize: '0.78rem', fontWeight: 700 } }}
          >
            <Tab label="آپلود فایل تصویر" />
            <Tab label="درج لینک اینترنتی" />
          </Tabs>

          <TextField
            fullWidth
            size="small"
            label="توضیح یا عنوان تصویر (Alt Text)"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            placeholder="مثال: دیاگرام معماری سیستم"
            sx={{ mb: 2 }}
          />

          {imageTab === 0 ? (
            <Box
              sx={{
                p: 3,
                border: '2px dashed',
                borderColor: uploadError ? 'error.main' : 'primary.main',
                borderRadius: 2.5,
                textAlign: 'center',
                bgcolor: isDark ? 'rgba(37, 99, 235, 0.05)' : 'rgba(37, 99, 235, 0.02)',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleUploadImageFile}
              />
              <CloudUploadIcon sx={{ fontSize: 44, color: 'primary.main', mb: 1 }} />
              <Typography variant="body2" fontWeight={700} mb={0.5}>
                انتخاب فایل تصویر برای آپلود
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                فرمت‌های JPG، PNG، WebP، SVG پشتیبانی می‌شوند
              </Typography>

              <Button
                variant="contained"
                size="small"
                disabled={uploadingImage}
                onClick={() => fileInputRef.current?.click()}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                {uploadingImage ? 'در حال آپلود و بهینه‌سازی...' : 'انتخاب از حافظه دستگاه'}
              </Button>

              {uploadingImage && <LinearProgress sx={{ mt: 2, borderRadius: 1 }} />}

              {uploadError && (
                <Typography variant="caption" color="error.main" display="block" mt={1} fontWeight={600}>
                  {uploadError}
                </Typography>
              )}
            </Box>
          ) : (
            <Box>
              <TextField
                fullWidth
                size="small"
                label="آدرس کامل اینترنتی تصویر (URL)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.png"
                dir="ltr"
              />
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                آدرس مستقیم تصویر مورد نظر را وارد نمایید.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setImageDialogOpen(false)} color="inherit" sx={{ borderRadius: 2 }}>
            انصراف
          </Button>
          {imageTab === 1 && (
            <Button
              variant="contained"
              disabled={!imageUrl.trim()}
              onClick={handleInsertUrlImage}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              افزودن تصویر به متن
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
