// DeploymentAssignmentService.js
// API calls for the deployment-assignment feature
import api from '../../../services/apiClient';

const BASE_URL = '/deployment-assignment';

export const deploymentAssignmentService = {
  getAll: () => api.get(BASE_URL),
  getById: (id) => api.get(`${BASE_URL}/${id}`),
  create: (data) => api.post(BASE_URL, data),
  update: (id, data) => api.put(`${BASE_URL}/${id}`, data),
  remove: (id) => api.delete(`${BASE_URL}/${id}`),
};
