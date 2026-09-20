import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { ThemeModeProvider } from './contexts/ThemeModeContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import { NotificationProvider } from './contexts/NotificationContext.jsx';
import App from './App.jsx';

// Configure Emotion RTL cache with stylis-plugin-rtl
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CacheProvider value={cacheRtl}>
      <BrowserRouter>
        <ThemeModeProvider>
          <AuthProvider>
            <CartProvider>
              <NotificationProvider>
                <App />
              </NotificationProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeModeProvider>
      </BrowserRouter>
    </CacheProvider>
  </React.StrictMode>
);
