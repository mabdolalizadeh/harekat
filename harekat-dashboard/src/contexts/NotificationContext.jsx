import { createContext, useContext, useState } from 'react';

const NotificationContext = createContext(null);

const INITIAL_NOTIFICATIONS = [];

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      try { localStorage.setItem('notifications', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const markAsRead = (id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      try { localStorage.setItem('notifications', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const addNotification = (notif) => {
    setNotifications((prev) => {
      const updated = [
        { id: `n_${Date.now()}`, isRead: false, date: 'همین الان', ...notif },
        ...prev
      ];
      try { localStorage.setItem('notifications', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    try {
      localStorage.removeItem('notifications');
    } catch {}
  };

  const value = {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
    addNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
}

export default NotificationContext;
