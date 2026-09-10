import api from '../../../services/apiClient';

/**
 * Dashboard API service.
 * Fetches aggregated statistics from all system modules.
 */
const dashboardService = {
  /**
   * GET /api/v1/dashboard/stats
   * Returns live counts and breakdowns for the dashboard.
   */
  async getStats() {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};

export default dashboardService;
