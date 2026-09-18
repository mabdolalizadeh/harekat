import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi.js';
import { userApi } from '../api/userApi.js';

const AuthContext = createContext(null);

const LANDING_URL = import.meta.env?.VITE_LANDING_URL || (import.meta.env?.DEV ? 'http://localhost:5173' : '');
export const LANDING_AUTH_URL = `${LANDING_URL}/auth`;

// Default Mockup User for Preview Mode (matches Dribbble reference & seeded database data)
export const MOCK_PREVIEW_USER = {
  id: '681252e1-34e1-485e-ad5d-cb4fc4b5b4b8',
  firstName: 'علی',
  lastName: 'محمدی',
  phoneNumber: '09123456789',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  courses: [
    {
      id: 'b72a92b8-73b9-4188-b946-a9d62d8a16d2',
      name: 'آموزش جامع React.js و اکوسیستم فرانت‌اند',
      price: '450000',
      salePrice: null,
      description: 'یادگیری عمیق کامپوننت‌ها، هوک‌ها، معماری مدرن و اتصال به بک‌اند.',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
      level: 'مبتدی',
      duration: '۲۰ ساعت',
      typeOfAttendence: 'آنلاین',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      longDescription: '# دوره جامع React.js\n\n- مفاهیم پایه‌ای و پیشرفته کامپوننت‌ها\n- مدیریت وضعیت با Context و هوک‌های سفارشی\n- اتصال به REST API و بهینه‌سازی رندر\n- تمرین‌ها و پروژه‌های عملی',
      teacher: { firstName: 'حمید', lastName: 'رضایی', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }
    },
    {
      id: '57a81119-4311-463f-a6e6-840417c2a584',
      name: 'دوره جامع Node.js و طراحی وب‌سرویس',
      price: '520000',
      salePrice: null,
      description: 'معماری بک‌اند، دیتابیس، احراز هویت JWT و پیاده‌سازی API.',
      image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400',
      level: 'پیشرفته',
      duration: '۲۵ ساعت',
      typeOfAttendence: 'آفلاین',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      longDescription: '# دوره Node.js و Express\n\n- مدل‌سازی داده با Sequelize و SQLite/Postgres\n- سیستم احراز هویت امن و Rate Limiting\n- استقرار و بیلد سرور',
      teacher: { firstName: 'محمد', lastName: 'احمدی', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100' }
    },
    {
      id: 'c-ui-ux-design',
      name: 'طراحی رابط کاربری و تجربه کاربری (UI/UX)',
      price: '380000',
      salePrice: null,
      description: 'طراحی سیستم دیزاین، کار با فیگما و پروتوتایپ استانداردهای بصری.',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
      level: 'مقدماتی',
      duration: '۱۸ ساعت',
      typeOfAttendence: 'آنلاین',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      longDescription: '# دوره طراحی محصول\n\n- اصول تایپوگرافی و تئوری رنگ‌ها\n- ساخت کامپوننت‌های ماژولار در Figma\n- تست کاربردپذیری و تحویل به توسعه‌دهنده',
      teacher: { firstName: 'سارا', lastName: 'محمدی', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' }
    }
  ]
};

// Helper to decode JWT token payload without external libraries
export function parseJwt(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Redirects to Landing Page auth flow
export function redirectToLandingLogin(returnUrl) {
  const target = returnUrl || window.location.href;
  const url = new URL(LANDING_AUTH_URL, window.location.origin);
  url.searchParams.set('redirect_to', target);
  window.location.href = url.toString();
}

export function AuthProvider({ children }) {
  // 1. Check for token passed from Landing Page via URL query param or hash
  const getInitialToken = () => {
    try {
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const queryToken = searchParams.get('token') || searchParams.get('auth_token') || searchParams.get('jwt') || hashParams.get('token');

        if (queryToken) {
          localStorage.setItem('token', queryToken);
          // Clean token from URL address bar for security
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete('token');
          cleanUrl.searchParams.delete('auth_token');
          cleanUrl.searchParams.delete('jwt');
          window.history.replaceState({}, document.title, cleanUrl.pathname + (cleanUrl.search ? cleanUrl.search : ''));
          return queryToken;
        }
      }
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  };

  const [token, setToken] = useState(getInitialToken);

  // If no saved user or token, default to MOCK_PREVIEW_USER so user can preview the UI immediately
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : MOCK_PREVIEW_USER;
    } catch {
      return MOCK_PREVIEW_USER;
    }
  });

  const [loading, setLoading] = useState(false);

  // Flag indicating whether we are in preview mode (no real JWT token stored)
  const isPreviewMode = !token;

  // Load fresh user data including enrolled courses from the backend if token exists
  const refreshUser = useCallback(async (userId, currentToken) => {
    const effectiveToken = currentToken || token;
    let effectiveId = userId || user?.id;

    if (!effectiveId && effectiveToken) {
      const payload = parseJwt(effectiveToken);
      effectiveId = payload?.id;
    }

    if (!effectiveToken || !effectiveId) {
      return;
    }

    // Check token expiration
    const payload = parseJwt(effectiveToken);
    if (payload?.exp && payload.exp * 1000 < Date.now()) {
      console.warn('Auth token has expired. Resetting to preview mode.');
      logout(false);
      return;
    }

    try {
      const res = await userApi.getUserById(effectiveId);
      if (res?.ok && res.data) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      }
    } catch (err) {
      console.warn('Failed to refresh user profile:', err);
      if (err.status === 401 || err.status === 403) {
        logout(false);
      }
    }
  }, [token, user?.id]);

  useEffect(() => {
    const effectiveToken = token || getInitialToken();
    if (effectiveToken) {
      const payload = parseJwt(effectiveToken);
      const userId = user?.id || payload?.id;
      if (userId) {
        refreshUser(userId, effectiveToken);
      }
    }
  }, []);

  const requestOtp = async (phoneNumber) => {
    return await authApi.requestOtp(phoneNumber);
  };

  const validateOtp = async (phoneNumber, otp) => {
    const res = await authApi.validateOtp(phoneNumber, otp);
    if (res?.ok && res.data?.token) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      localStorage.setItem('token', receivedToken);

      try {
        const fullUserRes = await userApi.getUserById(receivedUser.id);
        const fullUser = fullUserRes?.ok ? fullUserRes.data : receivedUser;
        setUser(fullUser);
        localStorage.setItem('user', JSON.stringify(fullUser));
      } catch {
        setUser(receivedUser);
        localStorage.setItem('user', JSON.stringify(receivedUser));
      }
      return res.data;
    }
    throw new Error(res?.message || 'کد ورود نامعتبر است');
  };

  const updateProfile = async (userData) => {
    // If in preview mode, update local state directly so the preview is interactive
    if (isPreviewMode) {
      const updated = { ...user, ...userData };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    }

    if (!user?.id) throw new Error('کاربر وارد نشده است');
    const res = await userApi.updateUser(user.id, userData);
    if (res?.ok && res.data) {
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      return res.data;
    }
    throw new Error(res?.message || 'خطا در ویرایش اطلاعات');
  };

  const logout = (redirect = true) => {
    setToken(null);
    setUser(MOCK_PREVIEW_USER);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {
      // ignore
    }
    if (redirect) {
      window.location.href = `${LANDING_URL}/`;
    }
  };

  // Learning points / rubies calculation for Dribbble reference display
  const enrolledCount = user?.courses?.length || 3;
  const rubies = 28;
  const studyPoints = 112;

  const value = {
    token,
    user,
    isAuthenticated: true, // Always allow previewing the mockup without blocking
    isPreviewMode,
    loading,
    requestOtp,
    validateOtp,
    refreshUser,
    updateProfile,
    logout,
    redirectToLandingLogin,
    landingAuthUrl: LANDING_AUTH_URL,
    rubies,
    studyPoints
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export default AuthContext;
