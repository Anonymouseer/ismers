// ApplicantRegistrationService.js
// API calls for the applicant-registration feature
import api from '../../../services/apiClient';

const BASE_URL = '/applicant-registration';

export const applicantRegistrationService = {
  getAll: () => api.get(BASE_URL),
  getById: (id) => api.get(`${BASE_URL}/${id}`),
  create: (data) => api.post(BASE_URL, data),
  update: (id, data) => api.put(`${BASE_URL}/${id}`, data),
  remove: (id) => api.delete(`${BASE_URL}/${id}`),
};
