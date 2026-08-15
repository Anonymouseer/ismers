import { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import SmartScoringTab from '../components/SmartScoringTab';
import PipelineAnalyticsTab from '../components/PipelineAnalyticsTab';
import RetentionPredictorTab from '../components/RetentionPredictorTab';
import './AiAnalyticsPage.css';
import '../../deployment-assignment/pages/DeploymentAssignmentPage.css';

export default function AiAnalyticsPage() {
  const { collapsed } = useOutletContext() || { collapsed: false };
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = searchParams.get('tab') || 'scoring';
  const [activeTab, setActiveTab] = useState(activeTabParam);

  useEffect(() => {
    setActiveTab(activeTabParam);
  }, [activeTabParam]);

  return (
    <div className="page" style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <main className={`main ${collapsed ? 'collapsed' : ''}`} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {/* PAGE HEADER */}
        <div className="page-head">
          <div>
            <h1 className="page-title">AI Candidate Scoring</h1>
            <div className="page-sub">
              11 client accounts &nbsp;·&nbsp; Multi-factor candidate match scoring &amp; skills alignment
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
