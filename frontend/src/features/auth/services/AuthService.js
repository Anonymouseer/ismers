import api from '../../../services/apiClient';

/**
 * AuthService — Communicates directly with PostgreSQL via Laravel API (/api/v1/auth).
 * All authentication, password hashing, and token issuance are handled securely by the backend.
 */
export const AuthService = {
  /**
   * Authenticate user credentials against PostgreSQL database.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ token: string, user: object, message?: string }>}
   */
  async login(email, password) {
    const res = await api.post('/auth/login', {
      email: email.trim(),
      password,
    });
    return res.data;
  },

  /**
   * Revoke current Sanctum token on PostgreSQL backend.
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore network/cleanup errors on logout
    }
  },

  /**
   * Fetch current authenticated user profile from backend.
   */
  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export default AuthService;
