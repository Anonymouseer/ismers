// RecruitmentSelectionService.js
// API calls for the recruitment-selection feature
import api from '../../../services/apiClient';

const BASE_URL = '/recruitment-selection';

export const recruitmentSelectionService = {
  getAll: () => api.get(BASE_URL),
  getById: (id) => api.get(`${BASE_URL}/${id}`),
  create: (data) => api.post(BASE_URL, data),
  update: (id, data) => api.put(`${BASE_URL}/${id}`, data),
  remove: (id) => api.delete(`${BASE_URL}/${id}`),
};
