import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('primepower_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore
  }
  return config;
});

export default api;
