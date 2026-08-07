import { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import SmartScoringTab from '../components/SmartScoringTab';
import PipelineAnalyticsTab from '../components/PipelineAnalyticsTab';
import RetentionPredictorTab from '../components/RetentionPredictorTab';
import './AiAnalyticsPage.css';

export default function AiAnalyticsPage() {
  const { collapsed } = useOutletContext() || { collapsed: false };
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = searchParams.get('tab') || 'scoring';
  const [activeTab, setActiveTab] = useState(activeTabParam);

  useEffect(() => {
    setActiveTab(activeTabParam);
  }, [activeTabParam]);

  const handleTabSwitch = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <main className={`ai-analytics-main ${collapsed ? 'collapsed' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* PAGE TITLE HEADER */}
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: '4px 0 2px' }}>
              Smart Recruitment & Workforce Intelligence
            </h1>
            <div style={{ fontSize: 12, color: 'var(--muted-fg)' }}>
              Multi-factor candidate match scoring, recruitment speed telemetry, and deployment retention predictions
            </div>
          </div>

          {/* KPI STATS STRIP */}
          <div className="ai-kpi-grid">
            <div className="executive-kpi-card blue">
              <div className="kpi-title-strip">
                <span className="kpi-label">Total Scored Candidates</span>
              </div>
              <div className="kpi-value-row">
                <span className="kpi-main-val">10 Applicants</span>
                <span className="kpi-sub-badge green">94% Top Fit</span>
              </div>
            </div>

            <div className="executive-kpi-card green">
              <div className="kpi-title-strip">
                <span className="kpi-label">Avg Time-to-Deploy</span>
              </div>
              <div className="kpi-value-row">
                <span className="kpi-main-val">4.2 Days</span>
                <span className="kpi-sub-badge green">-1.5d vs MoM</span>
              </div>
            </div>

            <div className="executive-kpi-card red">
              <div className="kpi-title-strip">
                <span className="kpi-label">Retention Risk Alerts</span>
              </div>
              <div className="kpi-value-row">
                <span className="kpi-main-val" style={{ color: 'var(--red)' }}>2 High Risk</span>
                <span className="kpi-sub-badge amber">Contract Renewal</span>
              </div>
            </div>

            <div className="executive-kpi-card purple">
              <div className="kpi-title-strip">
                <span className="kpi-label">Pipeline Conversion</span>
              </div>
              <div className="kpi-value-row">
                <span className="kpi-main-val" style={{ color: 'var(--purple)' }}>68.5%</span>
                <span className="kpi-sub-badge green">+4.2% MoM</span>
              </div>
            </div>
          </div>

          {/* ACTIVE TAB CONTENT */}
          {activeTab === 'scoring' && <SmartScoringTab />}
          {activeTab === 'pipeline' && <PipelineAnalyticsTab />}
          {activeTab === 'retention' && <RetentionPredictorTab />}
        </div>
      </main>
    </div>
  );
}
