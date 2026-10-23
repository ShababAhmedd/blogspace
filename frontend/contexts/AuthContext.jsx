"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import authService from "@/services/auth.service";
import userService from "@/services/user.service";
import { AUTH_EXPIRED_EVENT } from "@/utils/api";
import { TOKEN_KEY, getToken, getTokenExpiry, getTokenUserId, isTokenExpired, removeToken, setToken } from "@/utils/auth";

const AuthContext = createContext(null);

// setTimeout fires straight away for delays longer than this (about 24.8 days)
const MAX_TIMER_DELAY = 2 ** 31 - 1;
const RECHECK_DELAY = 60 * 1000;

// Next.js keeps visited pages mounted, so leaving a session does a full page
// load to make sure no page keeps the previous user's state
const leaveSession = (url) => window.location.assign(url);

const sessionEndUrl = (reason) => `/login?session=${reason}&redirect=${encodeURIComponent(window.location.pathname)}`;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // id of the user whose token this tab is using (null for a guest)
  const sessionUserId = useRef(null);

  // restore the session after a page refresh while the token is still valid
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      removeToken();
      setLoading(false);
      return;
    }
    sessionUserId.current = getTokenUserId(token);
    userService
      .getProfile()
      .then(setUser)
      // a token the backend rejects is cleared by the API layer; if the server
      // just couldn't be reached, the token is kept for the next visit
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // the API layer fires this when the backend rejects the token (401) or the account is deactivated
  useEffect(() => {
    const handleExpired = (event) => {
      const reason = event.detail?.message?.includes("deactivated") ? "deactivated" : "expired";
      leaveSession(sessionEndUrl(reason));
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
  }, []);

  // end the session when the token expires, even if no request is made in the meantime.
  // The backend decides: once it rejects the token the API layer ends the session, and
  // if this device's clock runs fast and the token is still accepted, check again later
  useEffect(() => {
    if (!user) return;
    const expiresAt = getTokenExpiry(getToken());
    if (!expiresAt) return;
    let timer;
    const check = () => {
      userService.getProfile().catch(() => {});
      timer = setTimeout(check, RECHECK_DELAY);
    };
    timer = setTimeout(check, Math.min(Math.max(expiresAt - Date.now(), 0), MAX_TIMER_DELAY));
    return () => clearTimeout(timer);
  }, [user]);

  // keep tabs in sync: logging out, or in as someone else, in another tab
  // reloads this one so it never shows a session that no longer exists
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== null && event.key !== TOKEN_KEY) return;
      const token = getToken();
      if ((token ? getTokenUserId(token) : null) !== sessionUserId.current) window.location.reload();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const login = useCallback(async (email, password) => {
    const { token } = await authService.login({ email, password });
    setToken(token);
    sessionUserId.current = getTokenUserId(token);
    try {
      const profile = await userService.getProfile();
      setUser(profile);
      return profile;
    } catch (error) {
      removeToken();
      sessionUserId.current = null;
      throw error;
    }
  }, []);

  // signs out and opens `url`, e.g. the login page with a message after a password reset
  const endSession = useCallback((url) => {
    removeToken();
    leaveSession(url);
  }, []);

  const logout = useCallback(() => endSession("/login"), [endSession]);

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
      endSession,
      refreshUser,
      updateUser,
    }),
    [user, loading, login, logout, endSession, refreshUser, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
