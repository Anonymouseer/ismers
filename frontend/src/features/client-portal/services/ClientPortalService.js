import api from '../../../services/apiClient';

const BASE_URL = '/client-portal';

export const clientPortalService = {
  login: (credentials) => api.post(`${BASE_URL}/login`, credentials),
  register: (data) => api.post(`${BASE_URL}/register`, data),
};
