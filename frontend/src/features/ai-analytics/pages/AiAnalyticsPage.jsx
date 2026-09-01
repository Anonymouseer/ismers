import { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/store/AuthStore';
import SmartScoringTab from '../components/SmartScoringTab';
import PipelineAnalyticsTab from '../components/PipelineAnalyticsTab';
import RetentionPredictorTab from '../components/RetentionPredictorTab';
import './AiAnalyticsPage.css';
import '../../deployment-assignment/pages/DeploymentAssignmentPage.css';

/**
 * Role-based AI Analytics tab access matrix.
 * Each role maps to the set of tabs they are permitted to view.
 * If a role is not listed, all tabs are shown (fallback for admin).
 */
const ROLE_TAB_ACCESS = {
  hr_administrator:      ['scoring', 'pipeline', 'retention'],
  registration_officer:  ['scoring'],
  recruitment_officer:   ['scoring'],
  job_order_coordinator: ['scoring', 'pipeline'],
  deployment_officer:    ['retention'],
};

/** Human-readable tab titles for the page header */
const TAB_TITLES = {
  scoring:   'AI Candidate Scoring',
  pipeline:  'Recruitment Intelligence',
  retention: 'Workforce Retention Analysis',
};

const TAB_SUBTITLES = {
  scoring:   '11 client accounts  ·  Multi-factor candidate match scoring & skills alignment',
  pipeline:  'PRF pipeline funnel analytics & sourcing channel performance',
  retention: 'Contract renewal tracking & workforce attrition analysis',
};

export default function AiAnalyticsPage() {
  const { collapsed } = useOutletContext() || { collapsed: false };
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Determine which tabs this user role is permitted to access
  const allowedTabs = useMemo(() => {
    const role = user?.role;
    return ROLE_TAB_ACCESS[role] || ['scoring', 'pipeline', 'retention'];
  }, [user?.role]);

  // Read requested tab from URL, enforce access
  const requestedTab = searchParams.get('tab') || 'scoring';
  const effectiveTab = allowedTabs.includes(requestedTab) ? requestedTab : allowedTabs[0];

  const [activeTab, setActiveTab] = useState(effectiveTab);

  // Sync when URL or access changes
  useEffect(() => {
    if (allowedTabs.includes(requestedTab)) {
      setActiveTab(requestedTab);
    } else {
      // Redirect to the first allowed tab if the user navigated to a restricted one
      setActiveTab(allowedTabs[0]);
      setSearchParams({ tab: allowedTabs[0] }, { replace: true });
    }
  }, [requestedTab, allowedTabs, setSearchParams]);

  return (
    <div className="page" style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <main className={`main ${collapsed ? 'collapsed' : ''}`} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {/* PAGE HEADER */}
        <div className="page-head">
          <div>
            <h1 className="page-title">{TAB_TITLES[activeTab] || 'AI Candidate Scoring'}</h1>
            <div className="page-sub">
              {TAB_SUBTITLES[activeTab] || ''}
            </div>
          </div>
        </div>

        {/* WORKSPACE CONTAINER FITTING FULL PAGE LIKE DEPLOYMENT & ASSIGNMENT */}
        <div className="workspace">
          {activeTab === 'scoring' && <SmartScoringTab />}
          {activeTab === 'pipeline' && <PipelineAnalyticsTab />}
          {activeTab === 'retention' && <RetentionPredictorTab />}
        </div>
      </main>
    </div>
  );
}
