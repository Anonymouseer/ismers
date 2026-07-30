// RecruitmentSelectionService.js
// Talks to /api/v1/applications once the Laravel backend is wired up.
// For now these wrap the local mock data so the page can run standalone.
//
// NOTE on cross-feature sync: the original prototype used a page-level
// "ISMERSBridge" (localStorage + events) to let Applicant Registration push
// candidates into this board, and to let Deployment & Assignment report
// deployment status back onto a hired candidate's card. In the SPA, that
// becomes: call ApplicantRegistrationService/DeploymentAssignmentService
// directly for reads, and let each subsystem own writes to its own table
// (see the ISMERS "shared entity ownership" rule). Below is a minimal
// in-memory placeholder so the UI has something to render — swap the
// body of each function for a real service/store call when that
// subsystem's service file exists.

const hireDeploymentMock = new Map();

export function keyFor(name, depRef) {
  return `${name}::${depRef}`;
}

export function getHire(key) {
  return hireDeploymentMock.get(key) || null;
}

export function upsertHire(key, data) {
  hireDeploymentMock.set(key, { ...hireDeploymentMock.get(key), ...data });
}

// Example real-API shape for later:
// export async function getApplications() {
//   const res = await apiClient.get('/applications');
//   return res.data.data;
// }
// export async function updateApplicationStatus(id, status) {
//   const res = await apiClient.patch(`/applications/${id}`, { status });
//   return res.data.data;
// }