import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import AuthService from '../services/AuthService';

const AuthContext = createContext(null);

// ── CONSTANTS ────────────────────────────────────────────────────────────────
const TOKEN_KEY    = 'primepower_admin_token';
const USER_KEY     = 'primepower_admin_user';
const EXPIRY_KEY   = 'primepower_admin_token_expiry';

// Idle timeout: 30 minutes of no user activity forces logout
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

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
 * Returns true if the stored expiry timestamp is in the past.
 */
function isTokenExpired() {
  const expiry = readStorage(EXPIRY_KEY);
  if (!expiry) return false; // No expiry stored — treat as valid
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
    idleTimerRef.current = setTimeout(() => logout('idle'), IDLE_TIMEOUT_MS);
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
        // Persist the absolute expiry provided by the server
        if (res.expires_at) {
          writeStorage(EXPIRY_KEY, res.expires_at);
        }
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server.' };
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
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
