import api from '../../../services/apiClient';
import { CLIENT_REQUISITIONS, PIPELINE_ANALYTICS, RETENTION_RISK_STAFF } from '../data/mockAiAnalyticsData';

export const AnalyticsService = {
  /**
   * Fetch candidate match scoring against client requisitions.
   */
  async getScoringData() {
    try {
      const res = await api.get('/analytics/scoring');
      if (res.data?.requisitions && res.data.requisitions.length > 0) {
        return res.data;
      }
      return { requisitions: CLIENT_REQUISITIONS, totalRequisitions: CLIENT_REQUISITIONS.length, totalCandidatesScored: 24 };
    } catch (err) {
      console.warn('Analytics scoring endpoint offline; using fallback data.', err);
      return { requisitions: CLIENT_REQUISITIONS, totalRequisitions: CLIENT_REQUISITIONS.length, totalCandidatesScored: 24 };
    }
  },

  /**
   * Fetch funnel conversion metrics and pipeline velocity.
   */
  async getPipelineMetrics() {
    try {
      const res = await api.get('/analytics/pipeline');
      if (res.data && typeof res.data === 'object' && res.data.totalApplicants !== undefined) {
        return res.data;
      }
      return PIPELINE_ANALYTICS;
    } catch (err) {
      console.warn('Analytics pipeline endpoint offline; using fallback data.', err);
      return PIPELINE_ANALYTICS;
    }
  },

  /**
   * Fetch workforce retention risk and contract renewal alerts.
   */
  async getRetentionData() {
    try {
      const res = await api.get('/analytics/retention');
      if (res.data && res.data.summary) {
        return res.data;
      }
      return {
        summary: {
          totalStaffDeployed: RETENTION_RISK_STAFF.length,
          highRiskCount: RETENTION_RISK_STAFF.filter((s) => s.riskLevel === 'High').length,
          mediumRiskCount: RETENTION_RISK_STAFF.filter((s) => s.riskLevel === 'Medium').length,
          lowRiskCount: RETENTION_RISK_STAFF.filter((s) => s.riskLevel === 'Low').length,
          retentionRate: 94.2,
          renewalWindowCount: RETENTION_RISK_STAFF.filter((s) => s.riskLevel === 'High').length,
        },
        highRiskStaff: RETENTION_RISK_STAFF.filter((s) => s.riskLevel === 'High'),
        mediumRiskStaff: RETENTION_RISK_STAFF.filter((s) => s.riskLevel === 'Medium'),
        lowRiskStaff: RETENTION_RISK_STAFF.filter((s) => s.riskLevel === 'Low'),
        allStaff: RETENTION_RISK_STAFF,
      };
    } catch (err) {
      console.warn('Analytics retention endpoint offline; using fallback data.', err);
      return {
        summary: {
          totalStaffDeployed: RETENTION_RISK_STAFF.length,
          highRiskCount: RETENTION_RISK_STAFF.filter((s) => s.riskLevel === 'High').length,
          mediumRiskCount: RETENTION_RISK_STAFF.filter((s) => s.riskLevel === 'Medium').length,
          lowRiskCount: RETENTION_RISK_STAFF.filter((s) => s.riskLevel === 'Low').length,
          retentionRate: 94.2,
          renewalWindowCount: RETENTION_RISK_STAFF.filter((s) => s.riskLevel === 'High').length,
        },
        highRiskStaff: RETENTION_RISK_STAFF.filter((s) => s.riskLevel === 'High'),
        mediumRiskStaff: RETENTION_RISK_STAFF.filter((s) => s.riskLevel === 'Medium'),
        lowRiskStaff: RETENTION_RISK_STAFF.filter((s) => s.riskLevel === 'Low'),
        allStaff: RETENTION_RISK_STAFF,
      };
    }
  },

  /**
   * Record and persist an HR retention intervention action / memorandum to the database.
   */
  async recordRetentionIntervention(staffId, payload) {
    try {
      const res = await api.post(`/deployments/${staffId}/intervention`, payload);
      return res.data;
    } catch (err) {
      console.warn(`Could not persist retention intervention for ${staffId}:`, err);
      return { success: false };
    }
  },
};

export default AnalyticsService;
