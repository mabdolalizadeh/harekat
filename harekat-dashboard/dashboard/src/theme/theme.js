import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'light',
    primary: {
      main: '#f47c20', // Harekat brand orange
      light: '#ffa33f',
      dark: '#df5b13',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#18adf0', // Electric blue accent
      light: '#4cc9ff',
      dark: '#078dca',
      contrastText: '#ffffff'
    },
    success: {
      main: '#16a36a',
      light: '#34d399',
      dark: '#118453',
      contrastText: '#ffffff'
    },
    warning: {
      main: '#d99400',
      light: '#fbbf24',
      dark: '#b67600',
      contrastText: '#ffffff'
    },
    error: {
      main: '#e5484d',
      light: '#f87171',
      dark: '#c9363d',
      contrastText: '#ffffff'
    },
    info: {
      main: '#18adf0',
      light: '#4cc9ff',
      dark: '#0871a4',
      contrastText: '#ffffff'
    },
    background: {
      default: '#f7f5f0', // Warm canvas from landing page
      paper: '#ffffff'
    },
    text: {
      primary: '#171715', // Deep charcoal ink
      secondary: '#6b6b63', // Neutral stone gray
      disabled: '#9b9b92'
    },
    divider: '#deddd7'
  },
  typography: {
    fontFamily: [
      'Vazirmatn',
      '"Plus Jakarta Sans"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif'
    ].join(','),
    h1: { fontWeight: 800, letterSpacing: '-0.02em', color: '#171715' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em', color: '#171715' },
    h3: { fontWeight: 700, color: '#171715' },
    h4: { fontWeight: 700, color: '#171715' },
    h5: { fontWeight: 600, color: '#171715' },
    h6: { fontWeight: 600, color: '#171715' },
    subtitle1: { fontWeight: 600, color: '#171715' },
    subtitle2: { fontWeight: 600, color: '#171715' },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6, color: '#171715' },
    body2: { fontSize: '0.84rem', lineHeight: 1.5, color: '#6b6b63' },
    button: {
      textTransform: 'none',
      fontWeight: 700
    }
  },
  shape: {
    borderRadius: 16
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f7f5f0',
          color: '#171715',
          margin: 0,
          padding: 0,
          boxSizing: 'border-box'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          padding: '8px 20px',
          boxShadow: 'none',
          fontWeight: 700,
          '&:hover': {
            boxShadow: 'none'
          }
        },
        startIcon: {
          marginRight: 0,
          marginLeft: 8
        },
        endIcon: {
          marginRight: 8,
          marginLeft: 0
        },
        containedPrimary: {
          background: '#f47c20',
          color: '#ffffff',
          '&:hover': {
            background: '#df5b13',
            boxShadow: '0 4px 14px rgba(244, 124, 32, 0.3)'
          }
        },
        outlinedPrimary: {
          borderColor: '#f47c20',
          color: '#f47c20',
          '&:hover': {
            borderColor: '#df5b13',
            backgroundColor: '#fff8ed'
          }
        },
        containedSecondary: {
          background: '#ffffff',
          color: '#171715',
          border: '1px solid #deddd7',
          '&:hover': {
            background: '#efede7',
            borderColor: '#deddd7'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          backgroundColor: '#ffffff',
          border: '1px solid #deddd7',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        },
        rounded: {
          borderRadius: 20
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          fontWeight: 700,
          fontSize: '0.75rem',
          flexDirection: 'row-reverse', // RTL: puts text on RIGHT, icon on LEFT!
          padding: '0 6px'
        },
        icon: {
          margin: '0 6px 0 0 !important', // Strictly no negative margins; perfectly contained on the left
          fontSize: '1rem',
          color: 'inherit'
        },
        label: {
          padding: '0 4px'
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundColor: '#ffffff',
          '& fieldset': {
            borderColor: '#deddd7'
          },
          '&:hover fieldset': {
            borderColor: '#f47c20'
          },
          '&.Mui-focused fieldset': {
            borderColor: '#f47c20',
            borderWidth: '2px'
          }
        }
      }
    }
  }
});

export default theme;
