import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, userApi, getStoredToken } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(getStoredToken()));
  const [error, setError] = useState(null);
  const [pendingPhone, setPendingPhone] = useState(null);

  const isAuthenticated = Boolean(token);

  const persist = (tokenValue, userValue) => {
    try {
      localStorage.setItem('token', tokenValue);
      localStorage.setItem('user', JSON.stringify(userValue));
    } catch { /* ignore */ }
  };

  const clearPersisted = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch { /* ignore */ }
  };

  // Load the authenticated user's profile (enrolled courses + payments) on mount
  // if a token is already present.
  const refreshProfile = async (tokenValue = token, userValue = user) => {
    if (!tokenValue || !userValue?.id) {
      setProfile(null);
      return;
    }
    try {
      const me = await userApi.getProfile(userValue.id);
      setProfile(me);
      setUser((prev) => ({ ...prev, ...me }));
      // Keep localStorage user in sync (e.g. completed name fields).
      persist(tokenValue, { ...userValue, ...me });
    } catch (err) {
      // Token may be invalid/expired -> treat as logged out.
      if (err.status === 401 || err.status === 403) {
        logout();
      }
      setProfile(null);
    }
  };

  useEffect(() => {
    const userValue = user;
    if (token && !userValue) {
      try {
        setUser(JSON.parse(localStorage.getItem('user') || 'null'));
      } catch { /* ignore */ }
    }
    if (token && (userValue || getStoredToken())) {
      const u = userValue || (JSON.parse(localStorage.getItem('user') || 'null'));
      refreshProfile(token, u).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (phoneNumber) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.requestOtp(phoneNumber);
      setPendingPhone(phoneNumber);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (phoneNumber, otp) => {
    setLoading(true);
    setError(null);
    try {
      const { token: newToken, user: newUser } = await authApi.validateOtp(phoneNumber, otp);
      setToken(newToken);
      setUser(newUser);
      persist(newToken, newUser);
      await refreshProfile(newToken, newUser);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setProfile(null);
    setPendingPhone(null);
    clearPersisted();
  };

  const value = useMemo(
    () => ({
      token,
      user,
      profile,
      isAuthenticated,
      loading,
      error,
      pendingPhone,
      login,
      verifyOtp,
      logout,
      refreshProfile,
    }),
    [token, user, profile, isAuthenticated, loading, error, pendingPhone]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
