import { TRACK_NODES, STAGE_INDEX } from '../services/JobOrderManagementService';

export default function StageTrack({ job, actions }) {
  const curIdx = STAGE_INDEX[job.stage];

  return (
    <>
      <div className="stage-track">
        {TRACK_NODES.map((node, idx) => {
          const isRejectedHere = job.stage === 'rejected' && idx === 2;
          let cls = 'future';
          if (isRejectedHere) cls = 'rejected';
          else if (idx < curIdx) cls = 'done';
          else if (idx === curIdx) cls = 'current';

          let label = node.label;
          if (isRejectedHere) label = node.rejectLabel;
          if (node.dynamic && idx <= curIdx) {
            if (job.stage === 'deploying' || (idx < curIdx && curIdx >= 6)) label = 'Deploy Staff';
            if (job.stage === 'recruiting') label = 'Send Request to Recruitment';
          }

          const dotContent = cls === 'done' ? '✓' : (isRejectedHere ? '✕' : '');

          return (
            <div className={`stage-step ${cls}`} key={node.id}>
              <div className="stage-dot">{dotContent}</div>
              <div><div className="stage-label">{label}</div></div>
            </div>
          );
        })}
      </div>
      <div className="stage-actions">
        <StageActions job={job} actions={actions} />
      </div>
    </>
  );
}

function StageActions({ job, actions }) {
  const ref = job.ref;
  switch (job.stage) {
    case 'review':
      return (
        <>
          <div className="stage-note">This job order was submitted from the Client Portal and is awaiting HR Manager review and approval.</div>
          <div className="stage-btn-row">
            <button className="stage-btn go" onClick={() => actions.approveAndOpen(ref)}>Approve &amp; Open Requisition</button>
            <button className="stage-btn stop" onClick={() => actions.stageReject(ref)}>Reject Request</button>
          </div>
        </>
      );
    case 'created':
      return (
        <>
          <div className="stage-note">This job order is awaiting manager review before it can be activated.</div>
          <div className="stage-btn-row">
            <button className="stage-btn go" onClick={() => actions.stageApprove(ref)}>Approve</button>
            <button className="stage-btn stop" onClick={() => actions.stageReject(ref)}>Reject</button>
          </div>
        </>
      );
    case 'rejected':
      return (
        <>
          <div className="stage-note">This job order request was rejected by the manager.</div>
          <div className="stage-btn-row"><button className="stage-btn" onClick={() => actions.stageRevise(ref)}>Revise &amp; Resubmit</button></div>
        </>
      );
    case 'approved':
      return (
        <>
          <div className="stage-note">Approved. Activate the job order to begin sourcing staff.</div>
          <div className="stage-btn-row"><button className="stage-btn go" onClick={() => actions.stageActivate(ref)}>Activate Job Order</button></div>
        </>
      );
    case 'activated':
      return (
        <>
          <div className="stage-note">Job order is live. Check bench/available employees against the requested headcount ({job.total}).</div>
          <div className="stage-btn-row"><button className="stage-btn go" onClick={() => actions.stageCheckStaff(ref)}>Check Available Employees</button></div>
        </>
      );
    case 'deploying':
      return (
        <>
          <div className="stage-note">Enough available employees found on the bench — deploying directly, no recruitment needed.</div>
          <div className="stage-btn-row"><button className="stage-btn go" onClick={() => actions.stageAssign(ref)}>Continue → Assign Staff</button></div>
        </>
      );
    case 'recruiting':
      return (
        <>
          <div className="stage-note">Not enough available employees. A staffing request was sent to Recruitment &amp; Selection.</div>
          <div className="stage-btn-row"><button className="stage-btn go" onClick={() => actions.stageAssign(ref)}>Recruitment Complete → Assign Staff</button></div>
        </>
      );
    case 'assigned':
      return (
        <>
          <div className="stage-note">{job.total} employee(s) assigned to this job order. Create the deployment schedule.</div>
          <div className="stage-btn-row"><button className="stage-btn go" onClick={() => actions.stageSchedule(ref)}>Create Deployment Schedule</button></div>
        </>
      );
    case 'scheduled':
      return (
        <>
          <div className="stage-note">Deployment schedule created. Confirm once employees report on-site.</div>
          <div className="stage-btn-row"><button className="stage-btn go" onClick={() => actions.stageReport(ref)}>Confirm Employees Reported</button></div>
        </>
      );
    case 'reporting':
      return (
        <>
          <div className="stage-note">Employees have reported to {job.client}. Start the job order.</div>
          <div className="stage-btn-row"><button className="stage-btn go" onClick={() => actions.stageStart(ref)}>Start Job Order</button></div>
        </>
      );
    case 'in_progress':
      return (
        <>
          <div className="stage-note">Job order is running. Begin tracking performance and attendance.</div>
          <div className="stage-btn-row"><button className="stage-btn go" onClick={() => actions.stageMonitor(ref)}>Begin Monitoring</button></div>
        </>
      );
    case 'monitoring':
      return (
        <>
          <div className="stage-note">Performance &amp; attendance are being monitored. Mark as completed once the engagement ends.</div>
          <div className="stage-btn-row"><button className="stage-btn go" onClick={() => actions.stageComplete(ref)}>Mark Job Order Completed</button></div>
        </>
      );
    case 'completed':
      return (
        <>
          <div className="stage-note">Job order completed. Close it out to archive the record.</div>
          <div className="stage-btn-row"><button className="stage-btn go" onClick={() => actions.stageClose(ref)}>Close Job Order</button></div>
        </>
      );
    case 'closed':
      return <div className="stage-note">This job order is closed and archived.</div>;
    default:
      return null;
  }
}