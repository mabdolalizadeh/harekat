import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi.js';
import { userApi } from '../api/userApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Load fresh user data including enrolled courses on mount
  const refreshUser = useCallback(async (userId, currentToken) => {
    const effectiveToken = currentToken || token;
    const effectiveId = userId || user?.id;
    if (!effectiveToken || !effectiveId) {
      setLoading(false);
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
      // If 401/403, token is expired
      if (err.status === 401 || err.status === 403) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [token, user?.id]);

  useEffect(() => {
    if (token && user?.id) {
      refreshUser(user.id, token);
    } else {
      setLoading(false);
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

      // Fetch full user with courses and payments
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
    if (!user?.id) throw new Error('کاربر وارد نشده است');
    const res = await userApi.updateUser(user.id, userData);
    if (res?.ok && res.data) {
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      return res.data;
    }
    throw new Error(res?.message || 'خطا در ویرایش اطلاعات');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {
      // ignore
    }
  };

  // Learning points / rubies calculation for Dribbble reference display
  const enrolledCount = user?.courses?.length || 0;
  const rubies = 20 + enrolledCount * 4;
  const studyPoints = 80 + enrolledCount * 16;

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token && user),
    loading,
    requestOtp,
    validateOtp,
    refreshUser,
    updateProfile,
    logout,
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
