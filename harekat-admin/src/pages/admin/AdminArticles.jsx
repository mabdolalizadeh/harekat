import { useState, useMemo } from 'react';
import {
  Box,
  Stack,
  Button,
  TextField,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  CircularProgress,
  Avatar,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Article as ArticleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  CheckCircle as PublishedIcon,
  Drafts as DraftIcon,
} from '@mui/icons-material';
import { adminApi } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import StatusChip from '../../components/admin/StatusChip.jsx';
import ImagePicker from '../../components/ImagePicker.jsx';

const EMPTY_ARTICLE = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featuredImage: '',
  category: 'مهارت‌آموزی',
  authorName: 'آکادمی حرکت',
  tags: '',
  seoTitle: '',
  seoDescription: '',
  status: 'published',
  publishedAt: new Date().toISOString().slice(0, 10),
};

function ArticleModal({ open, initial, onClose, onSaved }) {
  const { showSuccess, showError } = useNotification();
  const isEditing = Boolean(initial?.id);
  const [form, setForm] = useState(() => {
    if (!initial) return EMPTY_ARTICLE;
    const tagsArr = Array.isArray(initial.tags) ? initial.tags : [];
    return {
      ...initial,
      tags: tagsArr.join('، '),
      publishedAt: initial.publishedAt ? new Date(initial.publishedAt).toISOString().slice(0, 10) : '',
    };
  });
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return showError('عنوان مقاله الزامی است');
    if (!form.content.trim()) return showError('متن محتوای مقاله الزامی است');

    setSaving(true);
    try {
      const parsedTags = form.tags
        ? form.tags.split(/[،,]/).map((t) => t.trim()).filter(Boolean)
        : [];

      const payload = {
        title: form.title.trim(),
        slug: form.slug?.trim() || undefined,
        excerpt: form.excerpt?.trim() || undefined,
        content: form.content,
        featuredImage: form.featuredImage || null,
        category: form.category?.trim() || 'عمومی',
        authorName: form.authorName?.trim() || 'آکادمی حرکت',
        tags: parsedTags,
        seoTitle: form.seoTitle?.trim() || form.title.trim(),
        seoDescription: form.seoDescription?.trim() || form.excerpt?.trim() || null,
        status: form.status || 'published',
        publishedAt: form.publishedAt ? new Date(form.publishedAt) : new Date(),
      };

      if (isEditing) {
        await adminApi.updateArticle(initial.id, payload);
        showSuccess('مقاله با موفقیت ویرایش شد');
      } else {
        await adminApi.createArticle(payload);
        showSuccess('مقاله جدید با موفقیت ایجاد شد');
      }

      onSaved();
      onClose();
    } catch (err) {
      showError(err.message || 'خطا در ثبت مقاله');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth dir="rtl">
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          {isEditing ? `ویرایش مقاله: ${initial.title}` : 'افزودن مقاله جدید'}
        </Typography>
      </DialogTitle>

      <Box component="form" id="article-form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                fullWidth
                label="عنوان مقاله *"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="مثال: روش‌های نوین تقویت تمرکز در نوجوانان"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth>
                <InputLabel>وضعیت انتشار</InputLabel>
                <Select
                  value={form.status}
                  label="وضعیت انتشار"
                  onChange={(e) => set('status', e.target.value)}
                >
                  <MenuItem value="published">منتشر شده</MenuItem>
                  <MenuItem value="draft">پیش‌نویس</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="نامک / Slug انگلیسی یا فارسی"
                value={form.slug}
                onChange={(e) => set('slug', e.target.value)}
                dir="ltr"
                placeholder="focus-techniques"
                helperText="در صورت خالی بودن، به طور خودکار از روی عنوان تولید می‌شود"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="دسته‌بندی"
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                placeholder="مهارت‌های فردی"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="نام نویسنده"
                value={form.authorName}
                onChange={(e) => set('authorName', e.target.value)}
                placeholder="آکادمی حرکت"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <ImagePicker
                label="تصویر شاخص مقاله"
                value={form.featuredImage}
                onChange={(url) => set('featuredImage', url)}
                aspectRatio="16/9"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="خلاصه / چکیده مقاله"
                value={form.excerpt}
                onChange={(e) => set('excerpt', e.target.value)}
                placeholder="یک یا دو جمله برای معرفی مختصر در کارت‌های مقاله و موتورهای جستجو"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={10}
                label="متن کامل محتوا (پشتیبانی از Markdown) *"
                value={form.content}
                onChange={(e) => set('content', e.target.value)}
                placeholder="متن مقاله را اینجا وارد نمایید. می‌توانید از تیترها با ## و لیست‌ها استفاده کنید."
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="برچسب‌ها (با کاما یا ویرگول جدا کنید)"
                value={form.tags}
                onChange={(e) => set('tags', e.target.value)}
                placeholder="نوجوانان، تمرکز، رشد فردی، برنامه‌ریزی"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="عنوان سئو (SEO Title)"
                value={form.seoTitle}
                onChange={(e) => set('seoTitle', e.target.value)}
                placeholder="عنوان بهینه‌شده برای گوگل"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="تاریخ انتشار"
                type="date"
                value={form.publishedAt}
                onChange={(e) => set('publishedAt', e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="توضیحات سئو (Meta Description)"
                value={form.seoDescription}
                onChange={(e) => set('seoDescription', e.target.value)}
                placeholder="توضیح مختصر ۱۲۰ تا ۱۶۰ کاراکتری برای موتورهای جستجو"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={saving}>
            انصراف
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={18} /> : null}
          >
            {saving ? 'در حال ذخیره...' : isEditing ? 'ذخیره تغییرات' : 'انتشار مقاله'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default function AdminArticles() {
  const { showSuccess, showError } = useNotification();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: articlesRes, loading, execute: refresh } = useApi(
    () => adminApi.listArticles({ limit: 100, status: statusFilter === 'all' ? undefined : statusFilter, search }),
    [statusFilter, search]
  );

  const articles = articlesRes?.data?.articles || [];

  const handleEdit = (article) => {
    setEditingArticle(article);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingArticle(null);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminApi.deleteArticle(deleteId);
      showSuccess('مقاله با موفقیت حذف گردید');
      refresh();
    } catch (err) {
      showError(err.message || 'خطا در حذف مقاله');
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleStatus = async (article) => {
    const newStatus = article.status === 'published' ? 'draft' : 'published';
    try {
      await adminApi.updateArticle(article.id, { status: newStatus });
      showSuccess(`وضعیت مقاله به ${newStatus === 'published' ? 'منتشر شده' : 'پیش‌نویس'} تغییر یافت`);
      refresh();
    } catch (err) {
      showError(err.message || 'خطا در تغییر وضعیت');
    }
  };

  const columns = useMemo(
    () => [
      {
        id: 'image',
        label: 'تصویر',
        render: (row) => (
          <Avatar
            variant="rounded"
            src={row.featuredImage}
            sx={{ width: 48, height: 36, bgcolor: 'background.default' }}
          >
            <ArticleIcon fontSize="small" />
          </Avatar>
        ),
      },
      {
        id: 'title',
        label: 'عنوان و نامک',
        render: (row) => (
          <Box>
            <Typography variant="body2" fontWeight={600} color="text.primary">
              {row.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" dir="ltr" sx={{ display: 'block' }}>
              /blog/{row.slug}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'category',
        label: 'دسته‌بندی',
        render: (row) => (
          <Chip label={row.category || 'عمومی'} size="small" variant="outlined" />
        ),
      },
      {
        id: 'status',
        label: 'وضعیت',
        render: (row) => (
          <StatusChip
            status={row.status === 'published' ? 'active' : 'inactive'}
            label={row.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'}
          />
        ),
      },
      {
        id: 'views',
        label: 'بازدید',
        render: (row) => (
          <Typography variant="caption" color="text.secondary">
            {row.views || 0} بازدید
          </Typography>
        ),
      },
      {
        id: 'publishedAt',
        label: 'تاریخ انتشار',
        render: (row) => (
          <Typography variant="caption" color="text.secondary">
            {row.publishedAt ? new Date(row.publishedAt).toLocaleDateString('fa-IR') : '—'}
          </Typography>
        ),
      },
      {
        id: 'actions',
        label: 'عملیات',
        align: 'left',
        render: (row) => (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Tooltip title={row.status === 'published' ? 'تغییر به پیش‌نویس' : 'انتشار مقاله'}>
              <IconButton size="small" onClick={() => handleToggleStatus(row)}>
                {row.status === 'published' ? (
                  <PublishedIcon fontSize="small" color="success" />
                ) : (
                  <DraftIcon fontSize="small" color="action" />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="ویرایش">
              <IconButton size="small" onClick={() => handleEdit(row)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="حذف">
              <IconButton size="small" color="error" onClick={() => setDeleteId(row.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    []
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="مدیریت وبلاگ و مقالات"
        subtitle="ایجاد، ویرایش، بهینه‌سازی سئو و مدیریت مقالات آموزشی آکادمی"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            مقاله جدید
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="جستجو در عنوان و محتوا..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 260 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>فیلتر وضعیت</InputLabel>
          <Select
            value={statusFilter}
            label="فیلتر وضعیت"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">همه مقالات</MenuItem>
            <MenuItem value="published">منتشر شده</MenuItem>
            <MenuItem value="draft">پیش‌نویس</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <DataTable
        columns={columns}
        rows={articles}
        loading={loading}
        emptyMessage="مقاله‌ای یافت نشد"
      />

      {modalOpen && (
        <ArticleModal
          open={modalOpen}
          initial={editingArticle}
          onClose={() => setModalOpen(false)}
          onSaved={refresh}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="حذف مقاله"
        message="آیا از حذف این مقاله اطمینان دارید؟ این عملیات قابل بازگشت نیست."
        confirmLabel="حذف مقاله"
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </Box>
  );
}
