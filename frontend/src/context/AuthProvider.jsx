import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './AuthContext';
import * as authService from '../services/authService';

// WHY THIS EXISTS: the auth token lives in an httpOnly cookie that JavaScript
// cannot read. So the only way to know "am I logged in?" is to ask the server
// (GET /auth/me) when the app loads. The answer is stored here and shared
// with every component through context.
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // true until the first /me finishes

  useEffect(() => {
    authService
      .getMe()
      .then(setUser)
      .catch(() => setUser(null)) // 401 simply means "not logged in"
      .finally(() => setAuthLoading(false));
  }, []);

  // api.js fires this event when any request comes back 401 (session expired)
  useEffect(() => {
    const handleExpired = () => setUser(null);
    window.addEventListener('nova:unauthorized', handleExpired);
    return () => window.removeEventListener('nova:unauthorized', handleExpired);
  }, []);

  const login = useCallback(async (email, password) => {
    const loggedIn = await authService.login(email, password);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const register = useCallback(async (details) => {
    const created = await authService.register(details);
    setUser(created);
    return created;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout(); // the server clears the cookie
    } finally {
      setUser(null); // even if the call fails, treat the user as logged out locally
    }
  }, []);

  const updateProfile = useCallback(async (profile) => {
    const updated = await authService.updateProfile(profile);
    setUser(updated);
    return updated;
  }, []);

  // useMemo keeps the object identical between renders unless something changed,
  // so components using the context don't re-render for no reason.
  const value = useMemo(
    () => ({
      user,
      authLoading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, authLoading, login, register, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
