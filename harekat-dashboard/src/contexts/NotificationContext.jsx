import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import notificationsApi from '../api/notificationsApi.js';
import { useAuth } from './AuthContext.jsx';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }
    try {
      setLoading(true);
      const res = await notificationsApi.getMyNotifications();
      if (res?.ok && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.warn('Failed to load notifications:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
    // Periodically poll notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await notificationsApi.markAllAsRead();
    } catch (err) {
      console.warn('Error marking all read:', err.message);
    }
  };

  const markAsRead = async (id) => {
    try {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      await notificationsApi.markAsRead(id);
    } catch (err) {
      console.warn('Error marking read:', err.message);
    }
  };

  const clearAllNotifications = () => {
    markAllAsRead();
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    refreshNotifications: fetchNotifications,
    markAllAsRead,
    markAsRead,
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
