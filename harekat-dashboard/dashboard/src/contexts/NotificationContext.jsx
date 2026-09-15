import { createContext, useContext, useState } from 'react';

const NotificationContext = createContext(null);

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    title: '+۸ امتیاز برای تمرین کلاسی',
    description: 'تمرین شما توسط استاد دوره بررسی و تایید شد.',
    date: 'امروز، ۲۳ اردیبهشت',
    type: 'points',
    isRead: false
  },
  {
    id: 'n2',
    title: 'جلسه جدید دوره اضافه شد',
    description: 'فصل سوم دوره React.js هم‌اکنون در دسترس است.',
    date: 'دیروز',
    type: 'course',
    isRead: false
  },
  {
    id: 'n3',
    title: 'خوش آمدید به حرکت مدیا',
    description: 'یادگیری مهارت‌های تخصصی خود را آغاز کنید.',
    date: '۳ روز پیش',
    type: 'system',
    isRead: true
  }
];

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const addNotification = (notif) => {
    setNotifications((prev) => [
      { id: `n_${Date.now()}`, isRead: false, date: 'همین الان', ...notif },
      ...prev
    ]);
  };

  const value = {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
    addNotification
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
