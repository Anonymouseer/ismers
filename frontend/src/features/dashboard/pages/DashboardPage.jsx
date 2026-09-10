import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/store/AuthStore';
import dashboardService from '../services/dashboardService';
import StatCard from '../components/StatCard';
import PipelineBar from '../components/PipelineBar';
import DonutChart from '../components/DonutChart';
import ActivityFeed from '../components/ActivityFeed';
import SkeletonLoader from '../../../components/common/SkeletonLoader';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setRefreshing(true);

    const safetyTimer = setTimeout(() => {
      setLoading(false);
      setRefreshing(false);
    }, 5000);

    try {
      const data = await dashboardService.getStats();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(true);

    // Auto-refresh cadence every 30 seconds
    const interval = setInterval(() => {
      fetchStats(false);
    }, 30000);

    const handleSync = () => {
      fetchStats(false);
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('ismers_sync_event', handleSync);
    window.addEventListener('ismers:client-status-updated', handleSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('ismers_sync_event', handleSync);
      window.removeEventListener('ismers:client-status-updated', handleSync);
    };
  }, [fetchStats]);

  const currentDate = new Date().toLocaleDateString('en-PH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Segments for Job Orders breakdown
  const jobOrderSegments = stats?.jobOrders?.byStatus
    ? [
        { label: 'Open', value: stats.jobOrders.byStatus.open || 0, color: '#007DCC' },
        { label: 'Filling', value: stats.jobOrders.byStatus.filling || 0, color: '#D98A2B' },
        { label: 'Urgent', value: stats.jobOrders.byStatus.urgent || 0, color: '#EF4444' },
        { label: 'Filled', value: stats.jobOrders.byStatus.filled || 0, color: '#10B981' },
      ]
    : [];

  // Segments for Deployment stages
  const deploymentSegments = stats?.deployments?.byStage
    ? [
        { label: 'Assigned', value: stats.deployments.byStage.assigned || 0, color: '#6366F1' },
        { label: 'Pre-Deployment', value: stats.deployments.byStage.pre_deployment || 0, color: '#D98A2B' },
        { label: 'Dispatched', value: stats.deployments.byStage.dispatched || 0, color: '#3B82F6' },
        { label: 'On-Site', value: stats.deployments.byStage.on_site || 0, color: '#10B981' },
        { label: 'Completed', value: stats.deployments.byStage.completed || 0, color: '#059669' },
      ]
    : [];

  // Segments for Client portfolio — matches Active, Prospect, Inactive
  const clientSegments = [
    { label: 'Active', value: stats?.clients?.byStatus?.active || 0, color: '#10B981' },
    { label: 'Prospect', value: stats?.clients?.byStatus?.prospect || 0, color: '#007DCC' },
    { label: 'Inactive', value: stats?.clients?.byStatus?.inactive || 0, color: '#94A3B8' },
  ];

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dash-greeting">
          <div className="dash-greeting-left">
            <h1>Operational Overview</h1>
            <div className="dash-subtitle">Loading system intelligence and live metrics...</div>
          </div>
        </div>
        <SkeletonLoader variant="dashboard" showHeader={false} />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* ── Executive Greeting Header ── */}
      <div className="dash-greeting">
        <div className="dash-greeting-left">
          <h1>Welcome back, {user?.name || 'Operations Executive'}</h1>
          <div className="dash-subtitle">
            {currentDate} &bull; PRIMEPOWER HR Smart Recruitment Operations Control Center
          </div>
        </div>
        <div className="dash-greeting-right">
          <span className="dash-role-badge">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            {user?.roleName || user?.role || 'Administrator'}
          </span>
          <div className="dash-refresh-indicator" title="Live sync every 30 seconds">
            <span className="dash-refresh-dot" />
            <span>{refreshing ? 'Updating...' : 'Live Synced'}</span>
            {lastUpdated && (
              <span className="dash-last-updated">
                ({lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
              </span>
            )}
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => fetchStats(false)}
            disabled={refreshing}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <svg
              viewBox="0 0 24 24"
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }}
            >
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* ── KPI Summary Cards ── */}
      <div className="dash-stat-row">
        <StatCard
          label="Total Registered Applicants"
          value={stats?.applicants?.total || 0}
          previous={stats?.applicants?.lastMonth || 0}
          color="#007DCC"
          icon={
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatCard
          label="In Recruitment Funnel"
          value={stats?.recruitment?.total || 0}
          previous={0}
          color="#6366F1"
          icon={
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          }
        />
        <StatCard
          label="Active Job Orders"
          value={stats?.jobOrders?.total || 0}
          previous={stats?.jobOrders?.lastMonth || 0}
          color="#D98A2B"
          icon={
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          }
        />
        <StatCard
          label="Active Deployments"
          value={stats?.deployments?.total || 0}
          previous={stats?.deployments?.lastMonth || 0}
          color="#10B981"
          icon={
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          }
        />
        <StatCard
          label="Client Accounts"
          value={stats?.clients?.total || 0}
          previous={0}
          color="#8B5CF6"
          icon={
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21h18" />
              <path d="M9 8h1" />
              <path d="M9 12h1" />
              <path d="M9 16h1" />
              <path d="M14 8h1" />
              <path d="M14 12h1" />
              <path d="M14 16h1" />
              <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
            </svg>
          }
        />
      </div>

      {/* ── Recruitment Pipeline Visualization ── */}
      <PipelineBar data={stats?.recruitment?.byStage || {}} />

      {/* ── Breakdown Analytics Grid ── */}
      <div className="dash-charts-row">
        <DonutChart
          title="Job Order Status Breakdown"
          segments={jobOrderSegments}
          size={180}
        />
        <DonutChart
          title="Deployment Stage Distribution"
          segments={deploymentSegments}
          size={180}
        />
        <DonutChart
          title="Client Portfolio Distribution"
          segments={clientSegments}
          size={180}
        />
      </div>

      {/* ── Recent Activity Audit Trail ── */}
      <ActivityFeed activities={stats?.recentActivity || []} />
    </div>
  );
}
