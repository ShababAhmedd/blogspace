"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import authService from "@/services/auth.service";
import userService from "@/services/user.service";
import { AUTH_EXPIRED_EVENT } from "@/utils/api";
import { getToken, isTokenExpired, removeToken, setToken } from "@/utils/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // restore the session after a page refresh while the token is still valid
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      removeToken();
      setLoading(false);
      return;
    }
    userService
      .getProfile()
      .then(setUser)
      .catch(() => {
        removeToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Next.js keeps visited pages mounted, so leaving a session does a full page
  // load to make sure no page keeps the previous user's state
  const leaveSession = (url) => window.location.assign(url);

  // the API layer fires this when the backend rejects the token (401) or the account is deactivated
  useEffect(() => {
    const handleExpired = (event) => {
      const reason = event.detail?.message?.includes("deactivated") ? "deactivated" : "expired";
      const redirect = encodeURIComponent(window.location.pathname);
      leaveSession(`/login?session=${reason}&redirect=${redirect}`);
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
  }, []);

  const login = useCallback(async (email, password) => {
    const { token } = await authService.login({ email, password });
    setToken(token);
    try {
      const profile = await userService.getProfile();
      setUser(profile);
      return profile;
    } catch (error) {
      removeToken();
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    removeToken();
    leaveSession("/login");
  }, []);

  const refreshUser = useCallback(async () => {
    const profile = await userService.getProfile();
    setUser(profile);
    return profile;
  }, []);

  // merge fresh profile data (e.g. after an avatar upload) so the Navbar updates instantly
  const updateUser = useCallback((data) => {
    setUser((current) => (current ? { ...current, ...data } : current));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      login,
      logout,
      refreshUser,
      updateUser,
    }),
    [user, loading, login, logout, refreshUser, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
