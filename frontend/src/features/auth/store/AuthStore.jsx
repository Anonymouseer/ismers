import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import AuthService from '../services/AuthService';

const AuthContext = createContext(null);

// ── CONSTANTS ────────────────────────────────────────────────────────────────
const TOKEN_KEY       = 'primepower_admin_token';
const USER_KEY        = 'primepower_admin_user';
const EXPIRY_KEY      = 'primepower_admin_token_expiry';
const SETTINGS_KEY    = 'ismers.settings';
const LAST_ACTIVE_KEY = 'ismers_last_active';
const IDLE_WARN_BEFORE_MS = 60 * 1000; // 60 seconds warning before idle timeout

/**
 * Reads the configured Session Idle Timeout from the Settings page.
 * Default: 15 minutes idle timeout (bounded between 5 and 60 minutes).
 */
function getIdleTimeoutMs() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const minutes = parseInt(parsed.sessionTimeout, 10);
      if (!isNaN(minutes) && minutes > 0) {
        const boundedMinutes = Math.min(60, Math.max(5, minutes));
        return boundedMinutes * 60 * 1000;
      }
    }
  } catch { /* ignore */ }
  return 15 * 60 * 1000; // Standard default: 15 minutes idle timeout
}

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
 * Returns true only if a valid expiry string is stored AND it has passed.
 * Does not falsely expire sessions that have no local expiry recorded.
 */
function isTokenExpired() {
  const expiry = readStorage(EXPIRY_KEY);
  if (!expiry) return false;
  return Date.now() > new Date(expiry).getTime();
}

/**
 * Returns true if the user has been idle longer than the configured timeout.
 */
function isIdleExpired() {
  const lastActive = readStorage(LAST_ACTIVE_KEY);
  if (!lastActive) return false;
  const elapsed = Date.now() - parseInt(lastActive, 10);
  return elapsed > getIdleTimeoutMs();
}

// ── PROVIDER ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (isTokenExpired() || isIdleExpired()) {
      removeStorage(TOKEN_KEY);
      removeStorage(USER_KEY);
      removeStorage(EXPIRY_KEY);
      removeStorage(LAST_ACTIVE_KEY);
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
    if (isTokenExpired() || isIdleExpired()) return null;
    return readStorage(TOKEN_KEY) || null;
  });

  const [loading, setLoading]               = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Timers stored in refs so they survive re-renders without triggering them
  const idleTimerRef          = useRef(null);
  const idleWarnTimerRef      = useRef(null);
  const expiryTimerRef        = useRef(null);
  const expiryWarnTimerRef    = useRef(null);
  const lastStorageWriteRef   = useRef(Date.now());
  const isWarningShowingRef   = useRef(false);

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  const logout = useCallback(async (reason = 'manual') => {
    clearTimeout(idleTimerRef.current);
    clearTimeout(idleWarnTimerRef.current);
    clearTimeout(expiryTimerRef.current);
    clearTimeout(expiryWarnTimerRef.current);

    try { await AuthService.logout(); } catch { /* ignore */ }

    setToken(null);
    setUser(null);
    removeStorage(TOKEN_KEY);
    removeStorage(USER_KEY);
    removeStorage(EXPIRY_KEY);
    removeStorage(LAST_ACTIVE_KEY);

    if (reason === 'expired' || reason === 'idle') {
      setSessionExpired(true);
    } else {
      window.location.href = '/login';
    }
  }, []);

  // ── IDLE TIMERS SETUP & RESET ─────────────────────────────────────────────
  const resetIdleTimer = useCallback((forceSync = false) => {
    if (!token) return;

    const now = Date.now();

    // If warning was active, dismiss it immediately because user is actively interacting
    if (isWarningShowingRef.current) {
      isWarningShowingRef.current = false;
      window.dispatchEvent(new CustomEvent('primepower:session-resumed'));
    }

    // Throttle writing to localStorage to at most once every 3 seconds during rapid mouse movement
    if (forceSync || now - lastStorageWriteRef.current > 3000) {
      writeStorage(LAST_ACTIVE_KEY, String(now));
      lastStorageWriteRef.current = now;
    }

    clearTimeout(idleTimerRef.current);
    clearTimeout(idleWarnTimerRef.current);

    const timeoutMs = getIdleTimeoutMs();
    const warnMs = Math.max(10000, timeoutMs - IDLE_WARN_BEFORE_MS);

    // 1. Schedule warning modal 60 seconds before idle expiry
    idleWarnTimerRef.current = setTimeout(() => {
      const sharedLastActive = readStorage(LAST_ACTIVE_KEY);
      if (sharedLastActive) {
        const elapsed = Date.now() - parseInt(sharedLastActive, 10);
        if (elapsed < warnMs) {
          // Another tab was active — reschedule
          resetIdleTimer(false);
          return;
        }
      }

      isWarningShowingRef.current = true;
      window.dispatchEvent(new CustomEvent('primepower:session-warning', {
        detail: {
          secondsLeft: Math.round(IDLE_WARN_BEFORE_MS / 1000),
          minutesLeft: 1,
          reason: 'idle',
        },
      }));
    }, warnMs);

    // 2. Schedule logout when full idle period elapses with zero activity
    idleTimerRef.current = setTimeout(() => {
      const sharedLastActive = readStorage(LAST_ACTIVE_KEY);
      if (sharedLastActive) {
        const elapsed = Date.now() - parseInt(sharedLastActive, 10);
        if (elapsed < timeoutMs) {
          resetIdleTimer(false);
          return;
        }
      }
      logout('idle');
    }, timeoutMs);
  }, [token, logout]);

  // ── TOKEN HARD EXPIRY TIMER (8-Hour Workday Window) ───────────────────────
  const scheduleExpiryTimers = useCallback((explicitExpiry = null) => {
    clearTimeout(expiryTimerRef.current);
    clearTimeout(expiryWarnTimerRef.current);

    const expiry = explicitExpiry || readStorage(EXPIRY_KEY);
    if (!expiry) return;

    const msUntilExpiry = new Date(expiry).getTime() - Date.now();
    if (msUntilExpiry <= 0) {
      logout('expired');
      return;
    }

    // Warn 1 minute before absolute 8-hour token expiry
    const msUntilWarn = msUntilExpiry - IDLE_WARN_BEFORE_MS;
    if (msUntilWarn > 0) {
      expiryWarnTimerRef.current = setTimeout(() => {
        isWarningShowingRef.current = true;
        window.dispatchEvent(new CustomEvent('primepower:session-warning', {
          detail: {
            secondsLeft: 60,
            minutesLeft: 1,
            reason: 'token',
          },
        }));
      }, msUntilWarn);
    }

    expiryTimerRef.current = setTimeout(() => logout('expired'), msUntilExpiry);
  }, [logout]);

  // ── EXTEND SESSION (Explicit User Action or Modal Continue) ────────────────
  const extendSession = useCallback(async () => {
    // Reset idle timer immediately
    resetIdleTimer(true);

    if (isWarningShowingRef.current) {
      isWarningShowingRef.current = false;
      window.dispatchEvent(new CustomEvent('primepower:session-resumed'));
    }

    // Call backend to refresh 8-hour token
    try {
      const res = await AuthService.refresh();
      if (res?.token && res?.expires_at) {
        setToken(res.token);
        writeStorage(TOKEN_KEY, res.token);
        writeStorage(EXPIRY_KEY, res.expires_at);
        scheduleExpiryTimers(res.expires_at);
      }
    } catch {
      // Backend refresh fallback: still keep client idle timer alive
    }
  }, [resetIdleTimer, scheduleExpiryTimers]);

  // ── USER ACTIVITY LISTENERS ───────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll', 'mousemove'];
    const handler = () => resetIdleTimer(false);

    activityEvents.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    resetIdleTimer(true); // Initialize on mount / login

    return () => {
      activityEvents.forEach((e) => window.removeEventListener(e, handler));
      clearTimeout(idleTimerRef.current);
      clearTimeout(idleWarnTimerRef.current);
    };
  }, [token, resetIdleTimer]);

  // ── TOKEN EXPIRY TIMER ON TOKEN CHANGE ────────────────────────────────────
  useEffect(() => {
    if (token) {
      scheduleExpiryTimers();
    }
    return () => {
      clearTimeout(expiryTimerRef.current);
      clearTimeout(expiryWarnTimerRef.current);
    };
  }, [token, scheduleExpiryTimers]);

  // ── CROSS-TAB ACTIVITY & STORAGE SYNC ─────────────────────────────────────
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === TOKEN_KEY && !e.newValue) {
        // Another tab logged out — sync this tab
        setToken(null);
        setUser(null);
        setSessionExpired(true);
      } else if (e.key === USER_KEY && e.newValue) {
        try {
          setUser(JSON.parse(e.newValue));
        } catch { /* ignore */ }
      } else if (e.key === LAST_ACTIVE_KEY && e.newValue) {
        // Activity detected in another tab
        if (isWarningShowingRef.current) {
          isWarningShowingRef.current = false;
          window.dispatchEvent(new CustomEvent('primepower:session-resumed'));
        }
        clearTimeout(idleTimerRef.current);
        clearTimeout(idleWarnTimerRef.current);

        const timeoutMs = getIdleTimeoutMs();
        const elapsed = Date.now() - parseInt(e.newValue, 10);
        const remainingMs = Math.max(0, timeoutMs - elapsed);
        const warnMs = Math.max(0, remainingMs - IDLE_WARN_BEFORE_MS);

        if (warnMs > 0) {
          idleWarnTimerRef.current = setTimeout(() => {
            isWarningShowingRef.current = true;
            window.dispatchEvent(new CustomEvent('primepower:session-warning', {
              detail: { secondsLeft: 60, minutesLeft: 1, reason: 'idle' },
            }));
          }, warnMs);
        }

        idleTimerRef.current = setTimeout(() => logout('idle'), remainingMs);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [logout]);

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
        writeStorage(LAST_ACTIVE_KEY, String(Date.now()));
        try { localStorage.removeItem('primepower_open_menus'); } catch { /* ignore */ }
        if (res.expires_at) {
          writeStorage(EXPIRY_KEY, res.expires_at);
        }
        return { success: true, user: res.user };
      }
      return { success: false, message: 'Invalid response from server.' };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Invalid email or password.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update logged-in user fields in real-time across components and storage.
   */
  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedFields };
      writeStorage(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

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
        extendSession,
        resetIdleTimer,
        updateUser,
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
