import { createContext, useContext } from 'react';

export const NotificationContext = createContext(null);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    // Fallback if rendered outside provider
    return {
      showNotification: (msg) => console.log(msg),
      showSuccess: (msg) => console.log('[SUCCESS]', msg),
      showError: (msg) => console.error('[ERROR]', msg),
      showWarning: (msg) => console.warn('[WARN]', msg),
      showInfo: (msg) => console.info('[INFO]', msg),
    };
  }
  return ctx;
}
