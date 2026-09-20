import { createTheme } from '@mui/material/styles';

/**
 * Premium SaaS Theme System for Harekat Admin
 * Built strictly on Material UI (MUI) design principles.
 * Features:
 * - High-clarity typography with Vazirmatn & Rubik
 * - Crisp slate neutrals and vibrant royal cobalt accent
 * - Subtle 1px borders, elevation 0 flat surfaces
 * - Full RTL support with stylis-plugin-rtl
 * - Unified light & dark palette
 */

const typography = {
  fontFamily: '"Vazirmatn", "Rubik", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  h1: { fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.025em', lineHeight: 1.25 },
  h2: { fontWeight: 800, fontSize: '1.625rem', letterSpacing: '-0.02em', lineHeight: 1.3 },
  h3: { fontWeight: 700, fontSize: '1.375rem', letterSpacing: '-0.015em', lineHeight: 1.35 },
  h4: { fontWeight: 700, fontSize: '1.1875rem', letterSpacing: '-0.01em', lineHeight: 1.4 },
  h5: { fontWeight: 700, fontSize: '1.0625rem', lineHeight: 1.45 },
  h6: { fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1.5 },
  subtitle1: { fontSize: '0.9375rem', fontWeight: 500, lineHeight: 1.5 },
  subtitle2: { fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.5 },
  body1: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.6 },
  body2: { fontSize: '0.8125rem', fontWeight: 400, lineHeight: 1.55 },
  button: { textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' },
  caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.5 },
  overline: { fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' },
};

const shape = {
  borderRadius: 10,
};

const getCommonComponents = (mode) => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarColor: mode === 'dark' ? '#334155 #0f172a' : '#cbd5e1 #f8fafc',
        '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
          width: 8,
          height: 8,
        },
        '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
          borderRadius: 8,
          backgroundColor: mode === 'dark' ? '#334155' : '#cbd5e1',
          minHeight: 24,
        },
        '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
          backgroundColor: mode === 'dark' ? '#0f172a' : '#f8fafc',
        },
      },
    },
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
      size: 'medium',
    },
    styleOverrides: {
      root: {
        borderRadius: 8,
        paddingInline: 16,
        paddingBlock: 8,
        minHeight: 38,
        fontWeight: 600,
        transition: 'all 0.15s ease-in-out',
      },
      containedPrimary: {
        boxShadow: mode === 'dark'
          ? '0 2px 10px rgba(59, 130, 246, 0.25)'
          : '0 2px 8px rgba(37, 99, 235, 0.18)',
        '&:hover': {
          boxShadow: mode === 'dark'
            ? '0 4px 14px rgba(59, 130, 246, 0.35)'
            : '0 4px 12px rgba(37, 99, 235, 0.25)',
        },
      },
      outlined: {
        borderColor: mode === 'dark' ? '#334155' : '#e2e8f0',
        '&:hover': {
          borderColor: mode === 'dark' ? '#60a5fa' : '#2563eb',
          backgroundColor: mode === 'dark' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(37, 99, 235, 0.04)',
        },
      },
    },
  },
  MuiPaper: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        borderRadius: 12,
      },
      elevation0: {
        border: '1px solid',
        borderColor: mode === 'dark' ? '#1f2937' : '#e2e8f0',
      },
    },
  },
  MuiCard: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: {
        borderRadius: 12,
        backgroundImage: 'none',
        border: '1px solid',
        borderColor: mode === 'dark' ? '#1f2937' : '#e2e8f0',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        fontWeight: 600,
        fontSize: '0.75rem',
        borderRadius: 6,
        height: 26,
      },
      sizeSmall: {
        height: 22,
        fontSize: '0.7rem',
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      size: 'small',
      fullWidth: true,
      variant: 'outlined',
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontSize: '0.875rem',
        '& fieldset': {
          borderColor: mode === 'dark' ? '#334155' : '#cbd5e1',
          transition: 'border-color 0.15s ease-in-out',
        },
        '&:hover fieldset': {
          borderColor: mode === 'dark' ? '#64748b' : '#94a3b8',
        },
        '&.Mui-focused fieldset': {
          borderColor: mode === 'dark' ? '#60a5fa' : '#2563eb',
          borderWidth: '1.5px',
        },
      },
      input: {
        padding: '9.5px 14px',
      },
    },
  },
  MuiSelect: {
    defaultProps: {
      size: 'small',
    },
    styleOverrides: {
      select: {
        padding: '9.5px 14px',
      },
    },
  },
  MuiTableHead: {
    styleOverrides: {
      root: {
        backgroundColor: mode === 'dark' ? '#151e2e' : '#f8fafc',
        '& .MuiTableCell-head': {
          fontWeight: 700,
          fontSize: '0.775rem',
          color: mode === 'dark' ? '#94a3b8' : '#64748b',
          borderBottom: `1px solid ${mode === 'dark' ? '#1f2937' : '#e2e8f0'}`,
          padding: '12px 16px',
          whiteSpace: 'nowrap',
        },
      },
    },
  },
  MuiTableBody: {
    styleOverrides: {
      root: {
        '& .MuiTableRow-root': {
          transition: 'background-color 0.15s ease',
          '&:hover': {
            backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.015)',
          },
        },
        '& .MuiTableCell-body': {
          fontSize: '0.84rem',
          padding: '13px 16px',
          borderBottom: `1px solid ${mode === 'dark' ? '#1f2937' : '#f1f5f9'}`,
        },
      },
    },
  },
  MuiTablePagination: {
    styleOverrides: {
      root: {
        borderTop: `1px solid ${mode === 'dark' ? '#1f2937' : '#e2e8f0'}`,
        fontSize: '0.8125rem',
      },
      select: {
        fontSize: '0.8125rem',
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 16,
        border: '1px solid',
        borderColor: mode === 'dark' ? '#1f2937' : '#e2e8f0',
        boxShadow: mode === 'dark'
          ? '0 20px 40px rgba(0, 0, 0, 0.6)'
          : '0 20px 40px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: {
        fontWeight: 700,
        fontSize: '1.125rem',
        padding: '20px 24px 16px',
      },
    },
  },
  MuiDialogActions: {
    styleOverrides: {
      root: {
        padding: '16px 24px 20px',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        border: 0,
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.875rem',
        minHeight: 44,
        paddingInline: 18,
      },
    },
  },
  MuiTooltip: {
    defaultProps: {
      arrow: true,
    },
    styleOverrides: {
      tooltip: {
        backgroundColor: mode === 'dark' ? '#1e293b' : '#0f172a',
        color: '#ffffff',
        fontSize: '0.75rem',
        fontWeight: 500,
        borderRadius: 6,
        padding: '6px 10px',
        border: `1px solid ${mode === 'dark' ? '#334155' : 'transparent'}`,
      },
      arrow: {
        color: mode === 'dark' ? '#1e293b' : '#0f172a',
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        fontSize: '0.84rem',
        alignItems: 'center',
      },
    },
  },
});

export const lightTheme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      light: '#3b82f6',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#475569',
      light: '#64748b',
      dark: '#334155',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
      disabled: '#94a3b8',
    },
    divider: '#e2e8f0',
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
      contrastText: '#ffffff',
    },
    info: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    action: {
      hover: 'rgba(15, 23, 42, 0.04)',
      selected: 'rgba(37, 99, 235, 0.08)',
    },
  },
  typography,
  shape,
  components: {
    ...getCommonComponents('light'),
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#0f172a',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: 'none',
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#94a3b8',
      light: '#cbd5e1',
      dark: '#64748b',
      contrastText: '#0f172a',
    },
    background: {
      default: '#090d16',
      paper: '#111827',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
      disabled: '#64748b',
    },
    divider: '#1f2937',
    success: {
      main: '#34d399',
      light: '#6ee7b7',
      dark: '#059669',
      contrastText: '#0f172a',
    },
    warning: {
      main: '#fbbf24',
      light: '#fcd34d',
      dark: '#d97706',
      contrastText: '#0f172a',
    },
    error: {
      main: '#f87171',
      light: '#fca5a5',
      dark: '#dc2626',
      contrastText: '#0f172a',
    },
    info: {
      main: '#818cf8',
      light: '#a5b4fc',
      dark: '#4f46e5',
      contrastText: '#0f172a',
    },
    action: {
      hover: 'rgba(248, 250, 252, 0.04)',
      selected: 'rgba(59, 130, 246, 0.12)',
    },
  },
  typography,
  shape,
  components: {
    ...getCommonComponents('dark'),
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#111827',
          color: '#f8fafc',
          borderBottom: '1px solid #1f2937',
          boxShadow: 'none',
        },
      },
    },
  },
});
