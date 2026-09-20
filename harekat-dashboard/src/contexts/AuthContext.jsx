import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi.js';
import { userApi } from '../api/userApi.js';

const AuthContext = createContext(null);

const LANDING_URL = import.meta.env?.VITE_LANDING_URL || (import.meta.env?.DEV ? 'http://localhost:5173' : '');
export const LANDING_AUTH_URL = `${LANDING_URL}/auth`;

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
  // 1. Check for token passed via URL query param or stored in localStorage
  const getInitialToken = () => {
    try {
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const queryToken = searchParams.get('token') || searchParams.get('auth_token') || searchParams.get('jwt') || hashParams.get('token');

        if (queryToken) {
          localStorage.setItem('token', queryToken);
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

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(token && user);

  // Load fresh user data including enrolled courses from the backend
  const refreshUser = useCallback(async (userId, currentToken) => {
    const effectiveToken = currentToken || token;
    let effectiveId = userId || user?.id;

    if (!effectiveId && effectiveToken) {
      const payload = parseJwt(effectiveToken);
      effectiveId = payload?.id;
    }

    if (!effectiveToken || !effectiveId) {
      setLoading(false);
      return;
    }

    // Check token expiration
    const payload = parseJwt(effectiveToken);
    if (payload?.exp && payload.exp * 1000 < Date.now()) {
      console.warn('Auth token has expired.');
      logout(false);
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
      if (err.status === 401 || err.status === 403) {
        logout(false);
      }
    } finally {
      setLoading(false);
    }
  }, [token, user?.id]);

  useEffect(() => {
    const effectiveToken = token || getInitialToken();
    if (effectiveToken) {
      const payload = parseJwt(effectiveToken);
      const userId = user?.id || payload?.id;
      if (userId) {
        refreshUser(userId, effectiveToken);
      } else {
        setLoading(false);
      }
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

  const logout = (redirect = true) => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {
      // ignore
    }
    if (redirect) {
      window.location.href = '/login';
    }
  };

  // Real Rubies & Study Points from user model
  const rubies = user?.rubies || 0;
  const studyPoints = rubies * 5;

  const value = {
    token,
    user,
    isAuthenticated,
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

