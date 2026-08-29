import { scoreClass } from '../utils/recruitmentUtils';
import { getHire, keyFor } from '../services/RecruitmentSelectionService';
import { targetById, computeMatchScore } from '../../applicant-registration/services/ApplicantRegistrationService';
import PersonAvatar from '../../../components/common/PersonAvatar';

const STAGE_LABELS = {
  assigned: 'Assigned', scheduled: 'Scheduled', reporting: 'Reporting',
  in_progress: 'In Progress', monitoring: 'Monitoring', completed: 'Completed', closed: 'Closed',
};

function DeploymentBadge({ app, job }) {
  const hire = job ? getHire(keyFor(app.name, job.depRef)) : null;
  if (!hire || !hire.deploymentId) {
    return <span className="dep-sync-badge pending">Awaiting deployment</span>;
  }
  const label = STAGE_LABELS[hire.stage] || hire.stage || 'Deployed';
  const extra = typeof hire.attendanceRate === 'number' ? ` · ${hire.attendanceRate}% attendance` : '';
  return <span className="dep-sync-badge active">{hire.deploymentId} · {label}{extra}</span>;
}

export default function CandidateCard({ app, job, onSelect }) {
  const targetJob = job || targetById(app.jobId) || targetById(app.targetJobId);
  const currentScore = targetJob ? computeMatchScore(app, targetJob) : (app.score ?? 0);

  const preChecklist = app.preEmploymentChecklist || {};
  const preCount = Object.values(preChecklist).filter(Boolean).length;
  const isPreCleared = preCount === 7;

  const isContractSigned = Boolean(app?.employmentContract?.status === 'Signed');
  const isOrientationDone = Boolean(
    app?.orientationModules?.status === 'Certified Completed' ||
    (app?.orientationModules && Object.values(app.orientationModules).filter((v) => typeof v === 'boolean' && v).length >= 5)
  );

  return (
    <div className="cand-card" onClick={() => onSelect(app)}>
      <div className="cand-top">
        <PersonAvatar
          name={app.name}
          gender={app.gender}
          photo={app.photo || app.avatar}
          size="sm"
          variant="blue"
        />
        <div className="cand-name">{app.name}</div>
        <div className={`score-badge ${scoreClass(currentScore)}`}>{currentScore}%</div>
      </div>
      <div className="cand-jo">
        <svg className="icon" viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M8.5 11h7M8.5 14.5h7" /></svg>
        {targetJob?.title || job?.title || app.jobTitle || app.jobId || 'Unassigned Job'}
      </div>
      <div className="cand-foot">
        <span className="cand-client">{targetJob?.client || job?.client || app.client || '\u2014'}</span>
        <span className="cand-days">Applied {app.applied}</span>
      </div>

      {app.fromRegistration && (
        <div className="cand-dep-row">
          <span className="dep-sync-badge active" style={{ background: 'var(--purple-soft)', color: 'var(--purple)' }}>
            From Registration · {app.regId}
          </span>
        </div>
      )}

      {/* STAGE-ADAPTIVE CARD STATUS BADGES */}
      {app.status === 'client_interview' && (() => {
        const cpStatus =
          app.clientEndorsementStatus ||
          localStorage.getItem(`cp_endorsement_cand-${app.id}`) ||
          (app.regId && localStorage.getItem(`cp_endorsement_cand-${app.regId}`)) ||
          (app.name && localStorage.getItem(`cp_endorsement_${app.name}`)) ||
          'Pending Review';

        if (cpStatus === 'Passed Interview' || cpStatus === 'Passed Client Interview') {
          return (
            <div className="cand-dep-row">
              <span className="dep-sync-badge active" style={{ background: 'var(--green, #149e6e)', color: '#fff', fontWeight: 800 }}>
                ✓ Passed Client Final Interview
              </span>
            </div>
          );
        }
        if (cpStatus === 'Accepted for Interview') {
          return (
            <div className="cand-dep-row">
              <span className="dep-sync-badge active" style={{ background: 'var(--green-soft, #e8f5e9)', color: 'var(--green, #149e6e)' }}>
                Accepted for Interview
              </span>
            </div>
          );
        }
        if (cpStatus === 'Declined') {
          return (
            <div className="cand-dep-row">
              <span className="dep-sync-badge active" style={{ background: 'rgba(229, 57, 53, 0.12)', color: 'var(--red, #e53935)' }}>
                Declined by Client
              </span>
            </div>
          );
        }
        return (
          <div className="cand-dep-row">
            <span className="dep-sync-badge active" style={{ background: 'var(--purple-soft)', color: 'var(--purple)' }}>
              Sent Endorsement to Client
            </span>
          </div>
        );
      })()}

      {app.status === 'hr_requirements' && (
        <div className="cand-dep-row">
          <span
            className="dep-sync-badge active"
            style={
              isPreCleared
                ? { background: 'var(--green, #149e6e)', color: '#fff', fontWeight: 800 }
                : app.medicalReferral
                  ? { background: 'var(--blue-soft, #e0f2fe)', color: 'var(--primary, #007dcc)', fontWeight: 700 }
                  : { background: 'var(--amber-soft, #fef3c7)', color: 'var(--amber, #d97706)', fontWeight: 700 }
            }
          >
            {isPreCleared
              ? '✓ 7/7 Clearances Verified'
              : app.medicalReferral
                ? `${preCount}/7 · Med Referral Issued`
                : `${preCount}/7 Clearances Pending`}
          </span>
        </div>
      )}

      {app.status === 'contract_signing' && (
        <div className="cand-dep-row">
          <span
            className="dep-sync-badge active"
            style={
              isContractSigned && isOrientationDone
                ? { background: 'var(--green, #149e6e)', color: '#fff', fontWeight: 800 }
                : isContractSigned
                  ? { background: 'var(--blue-soft, #e0f2fe)', color: 'var(--primary, #007dcc)', fontWeight: 700 }
                  : { background: 'var(--amber-soft, #fef3c7)', color: 'var(--amber, #d97706)', fontWeight: 700 }
            }
          >
            {isContractSigned && isOrientationDone
              ? '✓ E-Signed & PDOS Certified'
              : isContractSigned
                ? '✓ E-Signed · Awaiting PDOS'
                : isOrientationDone
                  ? '✓ PDOS Certified · Awaiting Sign'
                  : 'Pending Contract E-Signature'}
          </span>
        </div>
      )}

      {app.status === 'for_deployment' && (
        <div className="cand-dep-row">
          <span className="dep-sync-badge active" style={{ background: 'var(--green, #149e6e)', color: '#fff', fontWeight: 800 }}>
            ✓ Ready for Deployment Handover
          </span>
        </div>
      )}

      {app.status === 're_pooling' && (
        <div className="cand-dep-row">
          <span className="dep-sync-badge active" style={{ background: 'rgba(217, 119, 6, 0.14)', color: 'var(--amber, #d97706)', fontWeight: 700 }}>
            Returned for Re-Line Up (3-Day Limit)
          </span>
        </div>
      )}

      {app.status === 'hired' && (
        <div className="cand-dep-row">
          <DeploymentBadge app={app} job={job} />
        </div>
      )}
    </div>
  );
}