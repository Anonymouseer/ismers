// ClientManagementService.js
// API calls for Client Management & CRM
import api from '../../../services/apiClient';

const BASE_URL = '/clients';

export const clientManagementService = {
  getAll: (params) => api.get(BASE_URL, { params }),
  getById: (id) => api.get(`${BASE_URL}/${id}`),
  create: (data) => api.post(BASE_URL, data),
  update: (id, data) => api.put(`${BASE_URL}/${id}`, data),
  remove: (id) => api.delete(`${BASE_URL}/${id}`),
};

export default clientManagementService;
