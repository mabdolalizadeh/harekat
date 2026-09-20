import { createTheme } from '@mui/material/styles';

export const getDashboardTheme = (mode = 'light') => {
  const isDark = mode === 'dark';

  return createTheme({
    direction: 'rtl',
    palette: {
      mode,
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
        default: isDark ? '#0b0f19' : '#f7f5f0',
        paper: isDark ? '#111827' : '#ffffff'
      },
      text: {
        primary: isDark ? '#f8fafc' : '#171715',
        secondary: isDark ? '#94a3b8' : '#6b6b63',
        disabled: isDark ? '#64748b' : '#9b9b92'
      },
      divider: isDark ? '#1e293b' : '#deddd7'
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
      h1: { fontWeight: 800, letterSpacing: '-0.02em', color: isDark ? '#f8fafc' : '#171715' },
      h2: { fontWeight: 700, letterSpacing: '-0.01em', color: isDark ? '#f8fafc' : '#171715' },
      h3: { fontWeight: 700, color: isDark ? '#f8fafc' : '#171715' },
      h4: { fontWeight: 700, color: isDark ? '#f8fafc' : '#171715' },
      h5: { fontWeight: 600, color: isDark ? '#f8fafc' : '#171715' },
      h6: { fontWeight: 600, color: isDark ? '#f8fafc' : '#171715' },
      subtitle1: { fontWeight: 600, color: isDark ? '#f8fafc' : '#171715' },
      subtitle2: { fontWeight: 600, color: isDark ? '#f8fafc' : '#171715' },
      body1: { fontSize: '0.9375rem', lineHeight: 1.6, color: isDark ? '#f8fafc' : '#171715' },
      body2: { fontSize: '0.84rem', lineHeight: 1.5, color: isDark ? '#94a3b8' : '#6b6b63' },
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
            backgroundColor: isDark ? '#0b0f19' : '#f7f5f0',
            color: isDark ? '#f8fafc' : '#171715',
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
              backgroundColor: isDark ? 'rgba(244, 124, 32, 0.1)' : '#fff8ed'
            }
          },
          containedSecondary: {
            background: isDark ? '#1e293b' : '#ffffff',
            color: isDark ? '#f8fafc' : '#171715',
            border: `1px solid ${isDark ? '#334155' : '#deddd7'}`,
            '&:hover': {
              background: isDark ? '#334155' : '#efede7',
              borderColor: isDark ? '#475569' : '#deddd7'
            }
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            backgroundColor: isDark ? '#111827' : '#ffffff',
            border: `1px solid ${isDark ? '#1f2937' : '#deddd7'}`,
            boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              boxShadow: isDark ? '0 6px 20px rgba(0, 0, 0, 0.5)' : '0 6px 20px rgba(0, 0, 0, 0.06)'
            }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? '#111827' : '#ffffff'
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
            padding: '0 4px'
          },
          icon: {
            fontSize: '1rem',
            color: 'inherit',
            margin: '0 4px !important'
          },
          label: {
            padding: '0 6px'
          }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            '& fieldset': {
              borderColor: isDark ? '#334155' : '#deddd7'
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
};

const defaultTheme = getDashboardTheme('light');
export default defaultTheme;
