import { StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import rtlPlugin from 'stylis-plugin-rtl'
import { prefixer } from 'stylis'
import { ThemeProvider, CssBaseline } from '@mui/material'
import './index.css'
import App from './App.jsx'
import { lightTheme, darkTheme } from './theme.js'

const cacheRtl = createCache({
  key: 'mui-rtl',
  stylisPlugins: [prefixer, rtlPlugin],
})

export function ThemedApp() {
  const [mode, setMode] = useState(() => localStorage.getItem('adminTheme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
  const theme = useMemo(() => (mode === 'dark' ? darkTheme : lightTheme), [mode])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark')
    document.documentElement.classList.toggle('light', mode !== 'dark')
    document.documentElement.dir = 'rtl'
    document.documentElement.style.colorScheme = mode
    localStorage.setItem('adminTheme', mode)
  }, [mode])

  // expose toggler for AdminLayout without prop-drilling via global
  useEffect(() => {
    window.__toggleAdminTheme = () => setMode((m) => (m === 'dark' ? 'light' : 'dark'))
    window.__adminTheme = mode
    return () => { delete window.__toggleAdminTheme }
  }, [mode])

  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App mode={mode} onToggleTheme={() => setMode((m) => (m === 'dark' ? 'light' : 'dark'))} />
      </ThemeProvider>
    </CacheProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <HashRouter>
    <StrictMode>
      <ThemedApp />
    </StrictMode>
  </HashRouter>
)
