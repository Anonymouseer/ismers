import axios from 'axios';

function getApiBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1' && !host.startsWith('192.168.')) {
      return 'https://api.primepowersystem.com/api/v1';
    }
    return `http://${host}:8000/api/v1`;
  }
  return 'http://localhost:8000/api/v1';
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── REQUEST INTERCEPTOR: Attach bearer token ────────────────────────────────
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  try {
    const isClientPortal = typeof window !== 'undefined' && window.location.pathname.startsWith('/client-portal');

    // 1. Resolve client portal token (from cp_token or inside cp_session)
    let cpToken = localStorage.getItem('cp_token');
    if (!cpToken) {
      try {
        const rawSess = localStorage.getItem('cp_session');
        if (rawSess) {
          const sess = JSON.parse(rawSess);
          if (sess?.token) {
            cpToken = sess.token;
            localStorage.setItem('cp_token', cpToken);
          }
        }
      } catch { /* ignore */ }
    }

    // 2. Resolve HR/Admin token (from primepower_admin_token or inside primepower_admin_user)
    let adminToken = localStorage.getItem('primepower_admin_token');
    if (!adminToken) {
      try {
        const rawUser = localStorage.getItem('primepower_admin_user');
        if (rawUser) {
          const u = JSON.parse(rawUser);
          if (u?.token) {
            adminToken = u.token;
            localStorage.setItem('primepower_admin_token', adminToken);
          }
        }
      } catch { /* ignore */ }
    }

    // Prioritize context token with dev fallback
    const token = isClientPortal
      ? (cpToken || adminToken)
      : (adminToken || cpToken);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore storage errors
  }
  return config;
});

// ── RESPONSE INTERCEPTOR: Handle 401 session expiry ─────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Server rejected the token — determine which session to clear and where to redirect
      try {
        const isClientPortal = window.location.pathname.startsWith('/client-portal');
        if (isClientPortal) {
          localStorage.removeItem('cp_token');
          localStorage.removeItem('cp_session');
          if (!window.location.pathname.startsWith('/client-portal/login')) {
            window.location.href = '/client-portal/login?reason=session_expired';
          }
        } else {
          localStorage.removeItem('primepower_admin_token');
          localStorage.removeItem('primepower_admin_user');
          localStorage.removeItem('primepower_admin_token_expiry');
          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login?reason=session_expired';
          }
        }
      } catch {
        // ignore storage errors
      }
    }
    return Promise.reject(error);
  }
);

export default api;
