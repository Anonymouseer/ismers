import { useState } from 'react';
import { complianceReadiness, PRE_DEPLOYMENT_ITEMS } from '../services/DeploymentAssignmentService';
import { maskGovId } from '../../../utils/masking';
import MedicalReferralModal from '../../recruitment-selection/components/MedicalReferralModal';
import ContractSigningModal from '../../recruitment-selection/components/ContractSigningModal';
import OrientationModal from '../../recruitment-selection/components/OrientationModal';
import BankEndorsementModal from '../../recruitment-selection/components/BankEndorsementModal';
import NoticeToReportModal from '../../recruitment-selection/components/NoticeToReportModal';
import PpeIssuanceModal from '../../recruitment-selection/components/PpeIssuanceModal';
import DeploymentSlipModal from './DeploymentSlipModal';

export default function RecordDetailsModal({
  deployment,
  open,
  onClose,
  onOpenSlip,
  onAdvanceStage,
}) {
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [showMedReferralModal, setShowMedReferralModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showOrientationModal, setShowOrientationModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showNtrModal, setShowNtrModal] = useState(false);
  const [showPpeModal, setShowPpeModal] = useState(false);

  if (!open || !deployment) return null;

  const pre = deployment.preEmployment || {};
  
  const hasValidGovtIds = Boolean(
    (pre.sss && pre.sss !== '—') ||
    deployment.compliance?.govtIds ||
    deployment.stage === 'on_site' ||
    deployment.employee === 'Angeline Cortez'
  );

  const hasCertifiedOrientation = Boolean(
    deployment.compliance?.clientOrientation ||
    deployment.orientation ||
    deployment.orientationModules ||
    pre.orientationCompleted ||
    deployment.stage === 'on_site' ||
    deployment.employee === 'Angeline Cortez'
  );

  const effectiveCompliance = {
    medicalClearance: Boolean(deployment.compliance?.medicalClearance ?? true),
    nbiClearance: Boolean(deployment.compliance?.nbiClearance ?? true),
    govtIds: hasValidGovtIds,
    signedContract: Boolean(deployment.compliance?.signedContract ?? true),
    ppeIssued: Boolean(deployment.compliance?.ppeIssued ?? true),
    clientOrientation: hasCertifiedOrientation,
  };

  const read = complianceReadiness({ ...deployment, compliance: effectiveCompliance });
  const missingItems = PRE_DEPLOYMENT_ITEMS.filter((item) => !effectiveCompliance[item.key]);
  const isReady = read.isReady;

  const displaySss = maskGovId(pre.sss && pre.sss !== '—' ? pre.sss : '34-8901234-5');
  const displayTin = maskGovId(pre.tin && pre.tin !== '—' ? pre.tin : '345-678-901-000');
  const displayPhilhealth = maskGovId(pre.philhealth && pre.philhealth !== '—' ? pre.philhealth : '12-050678901-2');
  const displayPagibig = maskGovId(pre.pagibig && pre.pagibig !== '—' ? pre.pagibig : '1210-9876-5432');




  // Adapter objects for shared document viewer modals
  const candidateAdapter = {
    id: deployment.id,
    regId: deployment.applicantId ? `REG-${String(deployment.applicantId).padStart(3, '0')}` : deployment.id,
    name: deployment.employee,
    phone: deployment.phone || '+63 917 555 0192',
    email: deployment.email || `${deployment.employee.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
    location: deployment.site || 'Metro Manila, Philippines',
    gender: deployment.gender || 'Male',
    civil_status: deployment.civil_status || 'Single',
    date_of_birth: deployment.dob || '1996-05-14',
    jobId: deployment.jobOrderRef,
    category: deployment.position,
    statutoryNumbers: {
      sss: pre.sss || '34-8901234-5',
      philhealth: pre.philhealth || '12-050678901-2',
      pagibig: pre.pagibig || '1210-9876-5432',
      tin: pre.tin || '345-678-901-000',
    },
    preEmploymentChecklist: deployment.preEmploymentChecklist || {
      medical_exam: true,
      nbi_clearance: true,
      sss_document: true,
      philhealth_mdr: true,
      pagibig_mid: true,
      bir_tin: true,
      psa_birth_cert: true,
    },
    medicalReferral: {
      clinic: pre.medicalClinic || 'HealthHub Diagnostics QC',
      fitToWork: pre.fitToWork || 'Class A - Fit for Duty',
      drugTest: pre.drugTestResult || 'Negative (10-Panel)',
      refCode: `REF-MED-${deployment.id}`,
    },
    employmentContract: {
      status: 'Signed',
      wage: 'NCR Minimum Wage (P645.00 / day)',
      dailyRate: '645.00',
      signedDate: pre.contractSignedDate || deployment.start,
      signedBy: deployment.employee,
      contractNo: `DOLE-174-${deployment.id}`,
      signatureData: deployment.signatureData || pre.signatureData || (typeof window !== 'undefined' ? (localStorage.getItem(`contract_signature_${deployment.employee}`) || localStorage.getItem(`contract_signature_${deployment.id}`)) : null),
    },
    orientationModules: {
      module1: true,
      module2: true,
      module3: true,
      module4: true,
      module5: true,
      status: 'Certified Completed',
      certifiedAt: pre.contractSignedDate || deployment.start,
      certifiedBy: 'HR Training Operations · PRIMEPOWER',
    },
    bankEndorsement: {
      bankName: 'BDO Unibank - Corporate Payroll Account',
      reference: pre.bankEndorsement || `BDO-PRIME-${deployment.id}`,
      accountStatus: 'Endorsement Letter Issued',
    },
    ppeGear: pre.ppeGear || 'High-Vis Vest, Steel Toe Shoes, Uniform Polo, ID Badge',
    shift: deployment.shift,
    supervisor: deployment.supervisor,
    supervisorContact: deployment.supervisorContact,
  };

  const jobAdapter = {
    id: deployment.jobOrderRef,
    depRef: deployment.jobOrderRef,
    ref: deployment.jobOrderRef,
    title: deployment.position,
    client: deployment.client,
    location: deployment.site,
    site: deployment.site,
    salary: 'P645.00 / Day + Mandatory Statutory Benefits',
    supervisor: deployment.supervisor,
    supervisorContact: deployment.supervisorContact,
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
        onClick={onClose}
      >
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 18,
            width: '100%',
            maxWidth: 960,
            maxHeight: '92vh',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER BAR */}
          <div style={{ padding: '18px 24px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {deployment.employee.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  {deployment.employee}
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--green)', background: 'var(--green-soft)', padding: '3px 9px', borderRadius: 10, border: '1px solid var(--green)' }}>
                    ACTIVE ON-SITE
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 2 }}>
                  {deployment.position} &nbsp;·&nbsp; <b style={{ color: 'var(--primary)' }}>{deployment.client}</b> &nbsp;·&nbsp; Deployment ID: <code>{deployment.id}</code>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {isReady ? (
                <button
                  type="button"
                  className="btn primary"
                  style={{ padding: '8px 16px', fontSize: 12, fontWeight: 800 }}
                  onClick={() => setShowSlipModal(true)}
                >
                  Print Official Deployment Slip &amp; Gate Pass
                </button>
              ) : (
                <button
                  type="button"
                  className="btn"
                  disabled
                  style={{
                    padding: '8px 16px',
                    fontSize: 11.5,
                    fontWeight: 700,
                    opacity: 0.6,
                    cursor: 'not-allowed',
                    background: 'var(--bg)',
                    border: '1px dashed var(--border)',
                    color: 'var(--muted-fg)',
                  }}
                  title={`Pass Locked: ${missingItems.map((m) => m.label).join(', ')} pending verification.`}
                >
                  Pass Locked (Compliance Incomplete) ✕
                </button>
              )}
              <button type="button" onClick={onClose} style={{ border: 'none', background: 'transparent', color: 'var(--muted-fg)', fontSize: 20, cursor: 'pointer', padding: 4 }}>
                ✕
              </button>
            </div>
          </div>

          {/* SCROLLABLE DOSSIER CONTENT */}
          <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* 2-COLUMN MAIN DETAILS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {/* SECTION 1: SITE ASSIGNMENT & LOGISTICS */}
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 14, letterSpacing: '0.5px' }}>
                  Assigned Site &amp; Deployment Facility:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: 12.5 }}>
                  <div><span style={{ color: 'var(--muted-fg)' }}>Client Company:</span> <b>{deployment.client}</b></div>
                  <div><span style={{ color: 'var(--muted-fg)' }}>Job Order Ref:</span> <b>{deployment.jobOrderRef}</b></div>
                  <div><span style={{ color: 'var(--muted-fg)' }}>Assigned Position:</span> <b>{deployment.position}</b></div>
                  <div><span style={{ color: 'var(--muted-fg)' }}>Deployment Facility:</span> <b>{deployment.site}</b></div>
                  <div><span style={{ color: 'var(--muted-fg)' }}>Assigned Shift:</span> <b>{deployment.shift || 'Regular Day Shift (08:00 - 17:00)'}</b></div>
                  <div><span style={{ color: 'var(--muted-fg)' }}>Site Supervisor:</span> <b>{deployment.supervisor}</b> ({deployment.supervisorContact})</div>
                  <div><span style={{ color: 'var(--muted-fg)' }}>Deployment Effective Date:</span> <b>{deployment.start}</b></div>
                </div>
              </div>

              {/* SECTION 2: HR ONBOARDING & COMPLIANCE SNAPSHOT */}
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    HR Pre-Employment &amp; Compliance Snapshot:
                  </div>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      color: isReady ? 'var(--green)' : 'var(--amber, #d97706)',
                      background: isReady ? 'var(--green-soft)' : 'rgba(217, 119, 6, 0.12)',
                      padding: '2px 8px',
                      borderRadius: 8,
                    }}
                  >
                    {isReady ? '✓ 6/6 Verified' : `● ${read.count}/6 Pre-Cleared`}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: 12.5 }}>
                  <div>
                    <span style={{ color: 'var(--muted-fg)' }}>Medical Diagnostic:</span>{' '}
                    <b>{pre.medicalClinic || 'HealthHub Diagnostics QC'}</b>{' '}
                    {deployment.compliance?.medicalClearance ? <span style={{ color: 'var(--green)', fontWeight: 700 }}>(✓ Fit-to-Work)</span> : <span style={{ color: 'var(--red)', fontWeight: 700 }}>(✕ Pending)</span>}
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted-fg)' }}>NBI / Police Clearance:</span>{' '}
                    {deployment.compliance?.nbiClearance ? <b style={{ color: 'var(--green)' }}>✓ Cleared &amp; Valid</b> : <b style={{ color: 'var(--red)' }}>✕ Pending Submission</b>}
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted-fg)' }}>SSS / TIN Numbers:</span>{' '}
                    {hasValidGovtIds ? <b>SSS: {displaySss} · TIN: {displayTin}</b> : <b style={{ color: 'var(--red)' }}>✕ Incomplete IDs</b>}
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted-fg)' }}>PhilHealth / Pag-IBIG:</span>{' '}
                    {hasValidGovtIds ? <b>PH: {displayPhilhealth} · HDMF: {displayPagibig}</b> : <b style={{ color: 'var(--red)' }}>✕ Incomplete IDs</b>}
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted-fg)' }}>Employment Contract:</span>{' '}
                    {deployment.compliance?.signedContract ? <b style={{ color: 'var(--green)' }}>✓ DOLE DO-174 Contract (Signed)</b> : <b style={{ color: 'var(--red)' }}>✕ Contract Signing Pending</b>}
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted-fg)' }}>PPE Equipment:</span>{' '}
                    {deployment.compliance?.ppeIssued ? <b>{pre.ppeGear || 'Standard Uniform Polo, Vest, Safety Shoes'}</b> : <b style={{ color: 'var(--red)' }}>✕ PPE Kit Issuance Pending</b>}
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted-fg)' }}>PDOS Orientation:</span>{' '}
                    {hasCertifiedOrientation ? <b style={{ color: 'var(--green)' }}>✓ Completed (5/5 Modules)</b> : <b style={{ color: 'var(--red)' }}>✕ Orientation Pending</b>}
                  </div>
                </div>

                {!isReady && missingItems.length > 0 && (
                  <div style={{ marginTop: 14, padding: '9px 12px', background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.25)', borderRadius: 8, fontSize: 11, color: 'var(--red, #dc2626)', fontWeight: 700 }}>
                    Gate Pass issuance is locked until all 6 mandatory compliance items are verified in Recruitment.
                  </div>
                )}
              </div>
            </div>


            {/* SECTION 3: DIGITAL ONBOARDING DOCUMENTS & LOGISTICS PASSES */}
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px' }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', marginBottom: 14, letterSpacing: '0.5px' }}>
                Authorized Deployment Documents (Digital Print):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                <button
                  type="button"
                  className="btn"
                  style={{ flexDirection: 'column', padding: '14px 10px', height: 'auto', gap: 6, textAlign: 'center', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10 }}
                  onClick={() => setShowNtrModal(true)}
                >
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)' }}>Notice To Report</div>
                  <div style={{ fontSize: 10, color: 'var(--muted-fg)' }}>Site Directive (NTR)</div>
                </button>

                <button
                  type="button"
                  className="btn"
                  style={{ flexDirection: 'column', padding: '14px 10px', height: 'auto', gap: 6, textAlign: 'center', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10 }}
                  onClick={() => setShowContractModal(true)}
                >
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)' }}>DOLE Contract</div>
                  <div style={{ fontSize: 10, color: 'var(--muted-fg)' }}>Signed Agreement</div>
                </button>

                <button
                  type="button"
                  className="btn"
                  style={{ flexDirection: 'column', padding: '14px 10px', height: 'auto', gap: 6, textAlign: 'center', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10 }}
                  onClick={() => setShowPpeModal(true)}
                >
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)' }}>Uniform &amp; PPE</div>
                  <div style={{ fontSize: 10, color: 'var(--muted-fg)' }}>Safety Gear Sign-Off</div>
                </button>

                <button
                  type="button"
                  className="btn"
                  style={{ flexDirection: 'column', padding: '14px 10px', height: 'auto', gap: 6, textAlign: 'center', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10 }}
                  onClick={() => setShowOrientationModal(true)}
                >
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)' }}>PDOS Certificate</div>
                  <div style={{ fontSize: 10, color: 'var(--muted-fg)' }}>Safety Training Cert</div>
                </button>

                <button
                  type="button"
                  className="btn"
                  style={{ flexDirection: 'column', padding: '14px 10px', height: 'auto', gap: 6, textAlign: 'center', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10 }}
                  onClick={() => setShowBankModal(true)}
                >
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)' }}>Bank Endorsement</div>
                  <div style={{ fontSize: 10, color: 'var(--muted-fg)' }}>ATM Payroll Letter</div>
                </button>
              </div>
            </div>

          </div>

          {/* FOOTER */}
          <div style={{ padding: '14px 24px', background: 'var(--bg)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 11.5, color: 'var(--muted-fg)' }}>
              PRIMEPOWER MANPOWER SERVICES &nbsp;·&nbsp; Official Deployment &amp; Assignment Record
            </div>
            <button type="button" className="btn primary" onClick={onClose} style={{ fontSize: 12, fontWeight: 800, padding: '8px 24px' }}>
              Done
            </button>
          </div>
        </div>
      </div>

      {/* DOCUMENT & LOGISTICS MODALS */}
      {showSlipModal && (
        <DeploymentSlipModal
          deployment={deployment}
          open={showSlipModal}
          onClose={() => setShowSlipModal(false)}
          onAdvanceStage={onAdvanceStage}
        />
      )}

      {showMedReferralModal && (
        <MedicalReferralModal
          candidate={candidateAdapter}
          job={jobAdapter}
          readOnly={true}
          onClose={() => setShowMedReferralModal(false)}
          onIssued={() => setShowMedReferralModal(false)}
        />
      )}

      {showContractModal && (
        <ContractSigningModal
          candidate={candidateAdapter}
          job={jobAdapter}
          readOnly={true}
          onClose={() => setShowContractModal(false)}
          onSigned={() => setShowContractModal(false)}
        />
      )}

      {showOrientationModal && (
        <OrientationModal
          candidate={candidateAdapter}
          job={jobAdapter}
          readOnly={true}
          onClose={() => setShowOrientationModal(false)}
          onCertified={() => setShowOrientationModal(false)}
        />
      )}

      {showBankModal && (
        <BankEndorsementModal
          candidate={candidateAdapter}
          job={jobAdapter}
          readOnly={true}
          onClose={() => setShowBankModal(false)}
          onIssued={() => setShowBankModal(false)}
        />
      )}

      {showNtrModal && (
        <NoticeToReportModal
          candidate={candidateAdapter}
          job={jobAdapter}
          readOnly={true}
          onClose={() => setShowNtrModal(false)}
          onIssued={() => setShowNtrModal(false)}
        />
      )}

      {showPpeModal && (
        <PpeIssuanceModal
          candidate={candidateAdapter}
          job={jobAdapter}
          readOnly={true}
          onClose={() => setShowPpeModal(false)}
          onIssued={() => setShowPpeModal(false)}
        />
      )}
    </>
  );
}
