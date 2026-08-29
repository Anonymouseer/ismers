import api from '../../../services/apiClient';

const BASE_URL = '/client-portal';
const JOB_ORDERS_URL = '/job-orders';

export const clientPortalService = {
  login:          (credentials) => api.post(`${BASE_URL}/login`, credentials),
  register:       (data)        => api.post(`${BASE_URL}/register`, data),
  forgotPassword: (email)       => api.post(`${BASE_URL}/forgot-password`, { email }),
  resetPassword:  (data)        => api.post(`${BASE_URL}/reset-password`, data),
  changePassword: (data)        => api.post(`${BASE_URL}/change-password`, data),

  /**
   * Submit a new job order from the Client Portal.
   * POST /api/v1/job-orders
   */
  createJobOrder: (payload) => api.post(JOB_ORDERS_URL, payload),

  /**
   * Retrieve all job orders belonging to a specific client account.
   * GET /api/v1/job-orders?client_account_id=<id>
   */
  getJobOrders: (clientAccountId) =>
    api.get(JOB_ORDERS_URL, { params: { client_account_id: clientAccountId } }),
};
