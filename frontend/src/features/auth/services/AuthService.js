import api from '../../../services/apiClient';

export const AuthService = {
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export default AuthService;
