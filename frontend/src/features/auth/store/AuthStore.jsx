import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import AuthService from '../services/AuthService';

const AuthContext = createContext(null);

// ── CONSTANTS ────────────────────────────────────────────────────────────────
const TOKEN_KEY    = 'primepower_admin_token';
const USER_KEY     = 'primepower_admin_user';
const EXPIRY_KEY   = 'primepower_admin_token_expiry';
const SETTINGS_KEY = 'ismers.settings';

/**
 * Reads the configured Session Idle Timeout from the Settings page.
 * Falls back to 30 minutes if not configured.
 * The Settings UI stores the value as a string (minutes).
 */
function getIdleTimeoutMs() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const minutes = parseInt(parsed.sessionTimeout, 10);
      if (!isNaN(minutes) && minutes > 0) {
        return minutes * 60 * 1000;
      }
    }
  } catch { /* ignore */ }
  return 30 * 60 * 1000; // Default: 30 minutes
}

// Warn the user 2 minutes before expiry
const EXPIRY_WARN_BEFORE_MS = 2 * 60 * 1000;

// ── HELPERS ──────────────────────────────────────────────────────────────────
function readStorage(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function writeStorage(key, value) {
  try { localStorage.setItem(key, value); } catch { /* ignore */ }
}

function removeStorage(key) {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

/**
 * Returns true if the stored expiry timestamp is missing or in the past.
 * A missing expiry is treated as expired to enforce re-authentication
 * for any session persisted before token expiry was introduced.
 */
function isTokenExpired() {
  const expiry = readStorage(EXPIRY_KEY);
  if (!expiry) return true; // No expiry recorded — treat as expired, force re-login
  return Date.now() > new Date(expiry).getTime();
}

// ── PROVIDER ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (isTokenExpired()) {
      // Token is already past its expiry — clear everything immediately
      removeStorage(TOKEN_KEY);
      removeStorage(USER_KEY);
      removeStorage(EXPIRY_KEY);
      return null;
    }
    try {
      const saved = readStorage(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    if (isTokenExpired()) return null;
    return readStorage(TOKEN_KEY) || null;
  });

  const [loading, setLoading]           = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Timers stored in refs so they survive re-renders without triggering them
  const idleTimerRef   = useRef(null);
  const expiryTimerRef = useRef(null);
  const warnTimerRef   = useRef(null);

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  const logout = useCallback(async (reason = 'manual') => {
    // Clear all pending timers
    clearTimeout(idleTimerRef.current);
    clearTimeout(expiryTimerRef.current);
    clearTimeout(warnTimerRef.current);

    try { await AuthService.logout(); } catch { /* ignore */ }

    setToken(null);
    setUser(null);
    removeStorage(TOKEN_KEY);
    removeStorage(USER_KEY);
    removeStorage(EXPIRY_KEY);

    if (reason === 'expired' || reason === 'idle') {
      setSessionExpired(true);
    } else {
      window.location.href = '/login';
    }
  }, []);

  // ── IDLE DETECTION ────────────────────────────────────────────────────────
  const resetIdleTimer = useCallback(() => {
    if (!token) return;
    clearTimeout(idleTimerRef.current);
    // Read current configured timeout dynamically so Settings changes take
    // effect immediately on the next user activity event.
    idleTimerRef.current = setTimeout(() => logout('idle'), getIdleTimeoutMs());
  }, [token, logout]);

  useEffect(() => {
    if (!token) return;

    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll', 'mousemove'];
    const handler = () => resetIdleTimer();

    activityEvents.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    resetIdleTimer(); // Start on mount

    return () => {
      activityEvents.forEach((e) => window.removeEventListener(e, handler));
      clearTimeout(idleTimerRef.current);
    };
  }, [token, resetIdleTimer]);

  // ── TOKEN EXPIRY TIMER ────────────────────────────────────────────────────
  const scheduleExpiryTimers = useCallback(() => {
    clearTimeout(expiryTimerRef.current);
    clearTimeout(warnTimerRef.current);

    const expiry = readStorage(EXPIRY_KEY);
    if (!expiry) return;

    const msUntilExpiry = new Date(expiry).getTime() - Date.now();
    if (msUntilExpiry <= 0) {
      logout('expired');
      return;
    }

    // Warn 2 minutes before expiry
    const msUntilWarn = msUntilExpiry - EXPIRY_WARN_BEFORE_MS;
    if (msUntilWarn > 0) {
      warnTimerRef.current = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('primepower:session-warning', {
          detail: { minutesLeft: Math.ceil(EXPIRY_WARN_BEFORE_MS / 60000) },
        }));
      }, msUntilWarn);
    }

    // Force logout at expiry
    expiryTimerRef.current = setTimeout(() => logout('expired'), msUntilExpiry);
  }, [logout]);

  useEffect(() => {
    if (token) {
      scheduleExpiryTimers();
    }
    return () => {
      clearTimeout(expiryTimerRef.current);
      clearTimeout(warnTimerRef.current);
    };
  }, [token, scheduleExpiryTimers]);

  // ── CROSS-TAB SESSION SYNC ────────────────────────────────────────────────
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === TOKEN_KEY && !e.newValue) {
        // Another tab logged out — sync this tab
        setToken(null);
        setUser(null);
        setSessionExpired(true);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // ── SESSION EXPIRED REDIRECT ──────────────────────────────────────────────
  useEffect(() => {
    if (sessionExpired) {
      window.location.href = '/login?reason=session_expired';
    }
  }, [sessionExpired]);

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await AuthService.login(email, password);
      if (res?.token && res?.user) {
        setToken(res.token);
        setUser(res.user);
        writeStorage(TOKEN_KEY, res.token);
        writeStorage(USER_KEY, JSON.stringify(res.user));
        // Reset sidebar submenu state so menus start collapsed on fresh login
        try { localStorage.removeItem('primepower_open_menus'); } catch { /* ignore */ }
        if (res.expires_at) {
          writeStorage(EXPIRY_KEY, res.expires_at);
        }
        return { success: true, user: res.user };
      }
      return { success: false, message: 'Invalid response from server.' };
    } catch (err) {
      // Support both Axios error format and plain Error (mock service)
      const message =
        err.response?.data?.message || err.message || 'Invalid email or password.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if the logged-in user has access to a given module key.
   */
  const canAccess = (moduleKey) => {
    if (!user) return false;
    return Array.isArray(user.allowedModules)
      ? user.allowedModules.includes(moduleKey)
      : false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token),
        loading,
        login,
        logout,
        canAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
