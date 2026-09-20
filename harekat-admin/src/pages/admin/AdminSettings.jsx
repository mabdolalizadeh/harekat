import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Stack,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Divider,
  Avatar,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Alert,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  LockReset as LockResetIcon,
  CheckCircle as CheckIcon,
  Cancel as CrossIcon,
  VpnKey as KeyIcon,
  PersonAdd as PersonAddIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  AccountCircle as ProfileIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { adminApi, getAdminUser, isTA, isSuperAdmin } from '../../services/api.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import StatusChip from '../../components/admin/StatusChip.jsx';

function validatePassword(password) {
  if (!password || password.length < 8) return 'رمز عبور باید حداقل ۸ کاراکتر باشد';
  if (!/[A-Z]/.test(password)) return 'رمز عبور باید حداقل یک حرف بزرگ انگلیسی داشته باشد';
  if (!/[a-z]/.test(password)) return 'رمز عبور باید حداقل یک حرف کوچک انگلیسی داشته باشد';
  if (!/[0-9]/.test(password)) return 'رمز عبور باید حداقل یک عدد داشته باشد';
  if (!/[^A-Za-z0-9]/.test(password)) return 'رمز عبور باید حداقل یک کاراکتر ویژه داشته باشد';
  return null;
}

function downloadFile(content, fileName, mimeType = 'application/x-pem-file') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AdminSettings() {
  const { showSuccess, showError } = useNotification();
  const [activeTab, setActiveTab] = useState(0);

  // Profile / Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Admins List State
  const [adminsList, setAdminsList] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  // Create Super Admin Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: '',
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    generateRsaKey: true,
  });
  const [creating, setCreating] = useState(false);

  // Key Result Display Dialog State
  const [keyResultModal, setKeyResultModal] = useState({
    open: false,
    adminUsername: '',
    privateKey: '',
    fingerprint: '',
  });

  // Delete Confirm State
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    adminId: null,
    username: '',
  });

  const admin = getAdminUser();
  const ta = isTA();
  const superAdmin = isSuperAdmin();

  // Password rules validation checklist
  const rules = [
    { label: 'حداقل ۸ کاراکتر', passed: password.length >= 8 },
    { label: 'حداقل یک حرف بزرگ انگلیسی (A-Z)', passed: /[A-Z]/.test(password) },
    { label: 'حداقل یک حرف کوچک انگلیسی (a-z)', passed: /[a-z]/.test(password) },
    { label: 'حداقل یک عدد (0-9)', passed: /[0-9]/.test(password) },
    { label: 'حداقل یک کاراکتر ویژه (!@#$%...)', passed: /[^A-Za-z0-9]/.test(password) },
  ];

  const fetchAdmins = useCallback(async () => {
    if (!superAdmin) return;
    setLoadingAdmins(true);
    try {
      const res = await adminApi.listAdmins();
      setAdminsList(res?.data || []);
    } catch (err) {
      showError(err.message || 'خطا در دریافت لیست مدیران');
    } finally {
      setLoadingAdmins(false);
    }
  }, [superAdmin, showError]);

  useEffect(() => {
    if (activeTab === 1 && superAdmin) {
      fetchAdmins();
    }
  }, [activeTab, superAdmin, fetchAdmins]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!admin?.id) {
      showError('اطلاعات کاربری یافت نشد. لطفاً دوباره وارد سیستم شوید.');
      return;
    }
    if (!currentPassword) {
      showError('لطفاً رمز عبور فعلی خود را وارد کنید.');
      return;
    }

    const err = validatePassword(password);
    if (err) {
      showError(err);
      return;
    }
    if (password !== confirmPassword) {
      showError('تکرار رمز عبور با رمز جدید یکسان نیست.');
      return;
    }

    setLoading(true);
    try {
      await adminApi.updateAdmin(admin.id, { currentPassword, password });
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
      showSuccess('رمز عبور شما با موفقیت تغییر کرد.');
    } catch (error) {
      showError(
        error.status === 401
          ? 'رمز عبور فعلی اشتباه است.'
          : error.message || 'خطا در تغییر رمز عبور.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuperAdmin = async (e) => {
    e.preventDefault();
    if (!createForm.username.trim()) {
      showError('نام کاربری الزامی است');
      return;
    }

    if (createForm.password && validatePassword(createForm.password)) {
      showError(validatePassword(createForm.password));
      return;
    }

    setCreating(true);
    try {
      const res = await adminApi.createSuperAdmin({
        username: createForm.username.trim(),
        name: createForm.name.trim() || undefined,
        email: createForm.email.trim() || undefined,
        phoneNumber: createForm.phoneNumber.trim() || undefined,
        password: createForm.password || undefined,
        generateRsaKey: createForm.generateRsaKey,
      });

      showSuccess('مدیر ارشد با موفقیت ایجاد شد');
      setCreateModalOpen(false);

      if (res.data?.privateKey) {
        setKeyResultModal({
          open: true,
          adminUsername: res.data.username,
          privateKey: res.data.privateKey,
          fingerprint: res.data.keyFingerprint || '',
        });
      }

      setCreateForm({
        username: '',
        name: '',
        email: '',
        phoneNumber: '',
        password: '',
        generateRsaKey: true,
      });

      fetchAdmins();
    } catch (err) {
      showError(err.message || 'خطا در ایجاد مدیر ارشد');
    } finally {
      setCreating(false);
    }
  };

  const handleRegenerateKey = async (adminItem) => {
    try {
      const res = await adminApi.generateAdminRsaKey(adminItem.id);
      showSuccess('کلید RSA جدید با موفقیت تولید شد');
      setKeyResultModal({
        open: true,
        adminUsername: res.data.username,
        privateKey: res.data.privateKey,
        fingerprint: res.data.keyFingerprint || '',
      });
      fetchAdmins();
    } catch (err) {
      showError(err.message || 'خطا در تولید کلید RSA');
    }
  };

  const handleDeleteAdmin = async () => {
    if (!deleteDialog.adminId) return;
    try {
      await adminApi.deleteAdmin(deleteDialog.adminId);
      showSuccess('مدیر با موفقیت حذف شد');
      setDeleteDialog({ open: false, adminId: null, username: '' });
      fetchAdmins();
    } catch (err) {
      showError(err.message || 'خطا در حذف مدیر');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showSuccess('کلید خصوصی در حافظه کپی شد');
  };

  return (
    <Stack spacing={3.5}>
      <PageHeader
        title="تنظیمات سیستم و مدیریت حساب‌ها"
        subtitle="مدیریت اطلاعات هویتی، تغییر رمز عبور و تنظیمات کلیدهای RSA مدیران ارشد"
      />

      {superAdmin && (
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTab-root': { fontWeight: 700, fontSize: '0.9rem' },
          }}
        >
          <Tab icon={<ProfileIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="حساب کاربری و امنیت" />
          <Tab icon={<SecurityIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="مدیران ارشد و کلیدهای RSA" />
        </Tabs>
      )}

      {/* TAB 0: PROFILE & PASSWORD */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Left Card: Profile Details */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <Stack spacing={2.5} alignItems="center" textAlign="center">
                <Avatar
                  sx={{
                    width: 72,
                    height: 72,
                    bgcolor: ta ? 'secondary.main' : 'primary.main',
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  {admin?.username?.[0]?.toUpperCase() || (ta ? 'T' : 'A')}
                </Avatar>

                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {admin?.name || admin?.username || 'مدیر سامانه'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" dir="ltr" display="block">
                    @{admin?.username}
                  </Typography>
                  <Chip
                    size="small"
                    label={ta ? 'دستیار آموزشی (TA)' : 'مدیر ارشد سامانه'}
                    color={ta ? 'secondary' : 'primary'}
                    variant="filled"
                    sx={{ mt: 1, fontWeight: 700 }}
                  />
                </Box>

                <Divider sx={{ width: '100%' }} />

                <Stack spacing={1.5} width="100%" textAlign="right">
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      شناسه یکتا در سیستم:
                    </Typography>
                    <Typography variant="body2" dir="ltr" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {admin?.id}
                    </Typography>
                  </Box>
                  {admin?.keyFingerprint && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        اثرانگشت کلید RSA:
                      </Typography>
                      <Typography variant="caption" dir="ltr" sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}>
                        {admin.keyFingerprint}
                      </Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      سطح دسترسی:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {ta ? 'محدود به دوره‌ها و تیکت‌های محول‌شده' : 'دسترسی نامحدود به تمامی بخش‌ها'}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Paper>
          </Grid>

          {/* Right Card: Change Password Form */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper
              component="form"
              onSubmit={handlePasswordSubmit}
              elevation={0}
              sx={{ p: { xs: 2.5, sm: 3.5 }, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}
            >
              <Stack spacing={2.5}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <LockResetIcon color="primary" />
                  <Typography variant="h6" fontWeight={700}>
                    تغییر رمز عبور ورود
                  </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  برای افزایش امنیت حساب، از رمز عبور قدرتمند شامل حروف، ارقام و علائم نگارشی استفاده کنید.
                </Typography>

                <TextField
                  label="رمز عبور فعلی *"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  dir="ltr"
                />

                <TextField
                  label="رمز عبور جدید *"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  dir="ltr"
                />

                <TextField
                  label="تکرار رمز عبور جدید *"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  dir="ltr"
                />

                {/* Password Policy Checklist */}
                {password && (
                  <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
                      الزامات رمز عبور:
                    </Typography>
                    <List dense disablePadding>
                      {rules.map((r, idx) => (
                        <ListItem key={idx} disablePadding sx={{ py: 0.25 }}>
                          <ListItemIcon sx={{ minWidth: 26 }}>
                            {r.passed ? (
                              <CheckIcon color="success" sx={{ fontSize: 16 }} />
                            ) : (
                              <CrossIcon color="disabled" sx={{ fontSize: 16 }} />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={r.label}
                            slotProps={{
                              primary: {
                                sx: {
                                  fontSize: '0.75rem',
                                  color: r.passed ? 'success.main' : 'text.secondary',
                                  fontWeight: r.passed ? 600 : 400,
                                },
                              },
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !currentPassword || !password || !confirmPassword}
                  startIcon={loading && <CircularProgress size={16} color="inherit" />}
                  sx={{ alignSelf: 'flex-start', px: 3 }}
                >
                  {loading ? 'در حال ثبت...' : 'تغییر رمز عبور'}
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* TAB 1: SUPER ADMINS & RSA KEY MANAGEMENT */}
      {activeTab === 1 && superAdmin && (
        <Stack spacing={3}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={2} mb={3}>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  مدیران ارشد و کلیدهای امنیتی RSA
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  مدیریت حساب‌های مدیران ارشد و ایجاد کلیدهای اختصاصی RSA برای احراز هویت رمزنگاری‌شده بدون رمز عبور
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => setCreateModalOpen(true)}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                ایجاد مدیر ارشد با کلید RSA
              </Button>
            </Stack>

            <DataTable
              rows={adminsList}
              loading={loadingAdmins}
              columns={[
                {
                  id: 'username',
                  label: 'نام کاربری / نام',
                  render: (row) => (
                    <Box>
                      <Typography variant="body2" fontWeight={700} dir="ltr" textAlign="right">
                        @{row.username}
                      </Typography>
                      {row.name && (
                        <Typography variant="caption" color="text.secondary">
                          {row.name}
                        </Typography>
                      )}
                    </Box>
                  ),
                },
                {
                  id: 'role',
                  label: 'نقش',
                  render: (row) => (
                    <Chip
                      size="small"
                      label={row.role === 'superadmin' ? 'مدیر ارشد' : 'دستیار آموزشی (TA)'}
                      color={row.role === 'superadmin' ? 'primary' : 'secondary'}
                      sx={{ fontWeight: 700 }}
                    />
                  ),
                },
                {
                  id: 'rsa',
                  label: 'کلید اختصاصی RSA',
                  render: (row) => (
                    row.keyFingerprint ? (
                      <Tooltip title={`اثرانگشت کلید: ${row.keyFingerprint}`}>
                        <Chip
                          size="small"
                          icon={<KeyIcon sx={{ fontSize: '14px !important' }} />}
                          label={row.keyFingerprint.slice(0, 14) + '...'}
                          color="success"
                          variant="outlined"
                          dir="ltr"
                          sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                        />
                      </Tooltip>
                    ) : (
                      <Typography variant="caption" color="text.disabled">
                        ثبت نشده
                      </Typography>
                    )
                  ),
                },
                {
                  id: 'status',
                  label: 'وضعیت',
                  render: (row) => <StatusChip status={row.status || 'active'} />,
                },
                {
                  id: 'createdAt',
                  label: 'تاریخ ایجاد',
                  render: (row) => (
                    <Typography variant="caption" color="text.secondary">
                      {row.createdAt ? new Date(row.createdAt).toLocaleDateString('fa-IR') : '—'}
                    </Typography>
                  ),
                },
                {
                  id: 'actions',
                  label: 'عملیات',
                  align: 'left',
                  render: (row) => (
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="تولید مجدد کلید RSA">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleRegenerateKey(row)}
                        >
                          <KeyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {row.id !== admin?.id && (
                        <Tooltip title="حذف مدیر">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                adminId: row.id,
                                username: row.username,
                              })
                            }
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  ),
                },
              ]}
            />
          </Paper>
        </Stack>
      )}

      {/* CREATE SUPER ADMIN MODAL */}
      <Dialog
        open={createModalOpen}
        onClose={() => !creating && setCreateModalOpen(false)}
        maxWidth="sm"
        fullWidth
        dir="rtl"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          ایجاد حساب مدیر ارشد جدید
        </DialogTitle>
        <Box component="form" onSubmit={handleCreateSuperAdmin}>
          <DialogContent dividers sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <Alert severity="info" sx={{ borderRadius: 2, fontSize: '0.825rem' }}>
                با فعال بودن گزینه جفت‌کلید RSA، یک کلید اختصاصی ۲۰۴۸ بیتی برای مدیر جدید تولید شده و کلید خصوصی جهت دانلود در اختیارتان قرار می‌گیرد.
              </Alert>

              <TextField
                label="نام کاربری *"
                value={createForm.username}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, username: e.target.value }))}
                dir="ltr"
                required
                fullWidth
              />

              <TextField
                label="نام و نام خانوادگی"
                value={createForm.name}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                fullWidth
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="ایمیل"
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                    dir="ltr"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="شماره موبایل"
                    value={createForm.phoneNumber}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                    dir="ltr"
                    fullWidth
                  />
                </Grid>
              </Grid>

              <TextField
                label="رمز عبور (اختیاری در صورت استفاده از کلید RSA)"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
                dir="ltr"
                fullWidth
                helperText="اگر خالی بگذارید، رمز عبور تصادفی و ایمن ایجاد خواهد شد"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={createForm.generateRsaKey}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, generateRsaKey: e.target.checked }))}
                    color="primary"
                  />
                }
                label="تولید خودکار جفت‌کلید RSA-2048 (توصیه‌شده برای امنیت حداکثری)"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setCreateModalOpen(false)} disabled={creating}>
              انصراف
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={creating || !createForm.username.trim()}
              startIcon={creating ? <CircularProgress size={16} color="inherit" /> : <PersonAddIcon />}
            >
              {creating ? 'در حال ایجاد...' : 'ایجاد مدیر ارشد'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* KEY RESULT MODAL (PRIVATE KEY PEM DOWNLOAD & COPY) */}
      <Dialog
        open={keyResultModal.open}
        onClose={() => setKeyResultModal((prev) => ({ ...prev, open: false }))}
        maxWidth="md"
        fullWidth
        dir="rtl"
      >
        <DialogTitle sx={{ fontWeight: 800, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <KeyIcon /> کلید اختصاصی RSA تولید شد (@{keyResultModal.adminUsername})
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Alert severity="warning" variant="filled" sx={{ borderRadius: 2, fontWeight: 600 }}>
              هشدار امنیتی: کلید خصوصی زیر تنها یک‌بار به شما نمایش داده می‌شود. لطفاً آن را دانلود کرده و در جای امن ذخیره کنید. در صورت گم‌شدن باید کلید جدید صادر شود.
            </Alert>

            {keyResultModal.fingerprint && (
              <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  اثرانگشت کلید عمومی (SHA-256 Fingerprint):
                </Typography>
                <Typography variant="body2" dir="ltr" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>
                  {keyResultModal.fingerprint}
                </Typography>
              </Box>
            )}

            <Box>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                متن کلید خصوصی (Private Key PEM):
              </Typography>
              <TextField
                multiline
                rows={8}
                value={keyResultModal.privateKey}
                dir="ltr"
                fullWidth
                slotProps={{
                  input: {
                    readOnly: true,
                    sx: { fontFamily: 'monospace', fontSize: '0.75rem', bgcolor: 'background.default' },
                  },
                }}
              />
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() =>
                  downloadFile(
                    keyResultModal.privateKey,
                    `${keyResultModal.adminUsername}_rsa_private_key.pem`
                  )
                }
                sx={{ fontWeight: 700 }}
              >
                دانلود فایل کلید (.pem)
              </Button>

              <Button
                variant="outlined"
                startIcon={<CopyIcon />}
                onClick={() => copyToClipboard(keyResultModal.privateKey)}
              >
                کپی در کلیپ‌بورد
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="contained"
            onClick={() => setKeyResultModal((prev) => ({ ...prev, open: false }))}
          >
            متوجه شدم و کلید را ذخیره کردم
          </Button>
        </DialogActions>
      </Dialog>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="حذف حساب مدیر"
        message={`آیا از حذف حساب کاربری مدیر @${deleteDialog.username} اطمینان دارید؟ این عملیات غیرقابل بازگشت است.`}
        confirmText="حذف مدیر"
        confirmColor="error"
        onConfirm={handleDeleteAdmin}
        onClose={() => setDeleteDialog({ open: false, adminId: null, username: '' })}
      />
    </Stack>
  );
}
