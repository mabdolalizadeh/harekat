import { createTheme } from '@mui/material/styles';

// Premium ink + cobalt admin theme — light & dark
// Keeps vibe of harekat-admin but fully MUI-driven.

const common = {
  typography: {
    fontFamily: '"Rubik",ui-sans-serif,system-ui,sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 300,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: { fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700 },
    body1: { fontWeight: 300 },
    body2: { fontWeight: 300 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 18, minHeight: 38, fontSize: 13.5 },
        containedPrimary: { boxShadow: '0 2px 10px rgba(49,94,251,0.22)' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        rounded: { borderRadius: 14 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 14, backgroundImage: 'none' },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, fontSize: 12 } },
    },
    MuiTextField: {
      defaultProps: { size: 'small', fullWidth: true },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 10, background: 'transparent', fontSize: 13.5 },
        input: { padding: '10px 12px' },
      },
    },
    MuiSelect: { styleOverrides: { select: { padding: '10px 12px' } } },
    MuiDrawer: {
      styleOverrides: { paper: { border: 0 } },
    },
    MuiTab: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600, minHeight: 36 } },
    },
  },
};

export const lightTheme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'light',
    primary: { main: '#315efb', light: '#6d8cff', dark: '#2449d6', contrastText: '#fff' },
    secondary: { main: '#263d9b', contrastText: '#fff' },
    background: { default: '#f4f6fa', paper: '#ffffff' },
    text: { primary: '#182235', secondary: '#65738a' },
    divider: '#dce3ee',
    success: { main: '#16a34a' },
    warning: { main: '#d99400' },
    error: { main: '#e5484d' },
    grey: { 50: '#f4f6fa', 100: '#eef2f8', 200: '#dce3ee' },
  },
  ...common,
  components: {
    ...common.components,
    MuiAppBar: {
      styleOverrides: {
        root: { background: '#ffffff', color: '#182235', borderBottom: '1px solid #e1e7f0', boxShadow: 'none' },
      },
    },
  },
});

export const darkTheme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'dark',
    primary: { main: '#6d8cff', light: '#9db1ff', dark: '#4a6af0', contrastText: '#10182a' },
    secondary: { main: '#8da7ff', contrastText: '#10182a' },
    background: { default: '#111827', paper: '#182235' },
    text: { primary: '#e8edf7', secondary: '#9aa8bf' },
    divider: '#2e3c56',
    success: { main: '#22c55e' },
    warning: { main: '#f59e0b' },
    error: { main: '#f87171' },
  },
  ...common,
  components: {
    ...common.components,
    MuiAppBar: {
      styleOverrides: {
        root: { background: '#182235', color: '#e8edf7', borderBottom: '1px solid #2e3c56', boxShadow: 'none' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none', backgroundColor: '#182235' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { backgroundColor: '#182235', backgroundImage: 'none' },
      },
    },
  },
});
