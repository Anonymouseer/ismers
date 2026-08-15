import { useState } from 'react';
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
              <button
                type="button"
                className="btn primary"
                style={{ padding: '8px 16px', fontSize: 12, fontWeight: 800 }}
                onClick={() => setShowSlipModal(true)}
              >
                Print Official Deployment Slip &amp; Gate Pass
              </button>
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
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--green)', background: 'var(--green-soft)', padding: '2px 8px', borderRadius: 8 }}>
                    ✓ 6/6 Verified
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: 12.5 }}>
                  <div><span style={{ color: 'var(--muted-fg)' }}>Medical Diagnostic:</span> <b>{pre.medicalClinic || 'HealthHub Diagnostics QC'} (Fit-to-Work)</b></div>
                  <div><span style={{ color: 'var(--muted-fg)' }}>10-Panel Drug Screen:</span> <b style={{ color: 'var(--green)' }}>✓ Negative</b></div>
                  <div><span style={{ color: 'var(--muted-fg)' }}>SSS / TIN Numbers:</span> <b>SSS: {pre.sss || '34-8901234-5'} · TIN: {pre.tin || '345-678-901-000'}</b></div>
                  <div><span style={{ color: 'var(--muted-fg)' }}>PhilHealth / Pag-IBIG:</span> <b>PH: {pre.philhealth || '12-050678901-2'} · HDMF: {pre.pagibig || '1210-9876-5432'}</b></div>
                  <div><span style={{ color: 'var(--muted-fg)' }}>Employment Contract:</span> <b>DOLE DO-174 Project Contract (Signed)</b></div>
                  <div><span style={{ color: 'var(--muted-fg)' }}>PDOS Orientation:</span> <b style={{ color: 'var(--green)' }}>✓ Completed (5/5 Modules)</b></div>
                  <div><span style={{ color: 'var(--muted-fg)' }}>PPE Equipment:</span> <b>{pre.ppeGear || 'Standard Uniform Polo, High-Vis Vest, Safety Shoes'}</b></div>
                </div>
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
