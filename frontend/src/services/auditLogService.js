import api from './apiClient';

export const auditLogService = {
  /**
   * Fetch activity/audit logs with optional filters.
   * @param {Object} params - { search, module, status, limit, page }
   * @returns {Promise<{ success: boolean, data: Array, metrics: Object, pagination: Object }>}
   */
  async getLogs(params = {}) {
    const res = await api.get('/audit-logs', { params });
    return res.data;
  },

  /**
   * Record a client-side or administrative event.
   * @param {string} action - Description of action taken
   * @param {string} module - Module/feature name
   * @param {Object} [details] - Optional payload details
   * @param {string} [status='Success'] - 'Success' | 'Warning' | 'Danger' | 'Info'
   */
  async recordLog(action, module, details = null, status = 'Success') {
    try {
      const res = await api.post('/audit-logs', {
        action,
        module,
        details,
        status,
      });
      return res.data;
    } catch {
      // Non-blocking logging failure
      return null;
    }
  },

  /**
   * Download CSV export of audit logs.
   * @param {Object} params - { search, module }
   */
  async exportCsv(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${api.defaults.baseURL}/audit-logs/export${query ? `?${query}` : ''}`;
    
    // Trigger browser download via anchor
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ismers_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

export default auditLogService;
