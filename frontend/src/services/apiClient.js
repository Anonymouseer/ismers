import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── REQUEST INTERCEPTOR: Attach bearer token ────────────────────────────────
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('primepower_admin_token');
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
      // Server rejected the token — clear session and redirect to login
      try {
        localStorage.removeItem('primepower_admin_token');
        localStorage.removeItem('primepower_admin_user');
        localStorage.removeItem('primepower_admin_token_expiry');
      } catch {
        // ignore storage errors
      }

      // Avoid redirect loops on the login page itself
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?reason=session_expired';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
