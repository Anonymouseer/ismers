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
          {/* HEADER BAR */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Core Engine › AI & Predictive Analytics
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: '4px 0 2px' }}>
              Smart Recruitment & Workforce Intelligence
            </h1>
            <div style={{ fontSize: 12, color: 'var(--muted-fg)' }}>
              Multi-factor candidate match scoring, recruitment speed telemetry, and deployment retention predictions
            </div>
          </div>

          {/* KPI STATS STRIP */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Total Scored Candidates</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)', marginTop: 2 }}>10 Applicants</div>
              <div style={{ fontSize: 10.5, color: 'var(--green)', fontWeight: 700, marginTop: 2 }}>94% Top Match Fit</div>
            </div>

            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Avg Time-to-Deploy</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginTop: 2 }}>4.2 Days</div>
              <div style={{ fontSize: 10.5, color: 'var(--green)', fontWeight: 700, marginTop: 2 }}>-1.5 days vs last month</div>
            </div>

            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Retention Risk Alerts</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--red)', marginTop: 2 }}>2 High Risk</div>
              <div style={{ fontSize: 10.5, color: 'var(--amber)', fontWeight: 700, marginTop: 2 }}>Pending contract renewal</div>
            </div>

            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Pipeline Conversion</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--purple)', marginTop: 2 }}>68.5%</div>
              <div style={{ fontSize: 10.5, color: 'var(--green)', fontWeight: 700, marginTop: 2 }}>+4.2% MoM growth</div>
            </div>
          </div>

          {/* SUB-TAB FILTER BAR */}
          <div style={{ display: 'flex', gap: 8, background: 'var(--panel)', border: '1px solid var(--border)', padding: 6, borderRadius: 12 }}>
            <button
              onClick={() => handleTabSwitch('scoring')}
              style={{
                flex: 1, padding: '8px 14px', borderRadius: 8, border: 'none',
                background: activeTab === 'scoring' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'scoring' ? '#fff' : 'var(--muted-fg)',
                fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s ease',
              }}
            >
              AI Candidate Scoring
            </button>
            <button
              onClick={() => handleTabSwitch('pipeline')}
              style={{
                flex: 1, padding: '8px 14px', borderRadius: 8, border: 'none',
                background: activeTab === 'pipeline' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'pipeline' ? '#fff' : 'var(--muted-fg)',
                fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s ease',
              }}
            >
              Recruitment Intelligence
            </button>
            <button
              onClick={() => handleTabSwitch('retention')}
              style={{
                flex: 1, padding: '8px 14px', borderRadius: 8, border: 'none',
                background: activeTab === 'retention' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'retention' ? '#fff' : 'var(--muted-fg)',
                fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s ease',
              }}
            >
              Workforce Retention Analysis
            </button>
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
