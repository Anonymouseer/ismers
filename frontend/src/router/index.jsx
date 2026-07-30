// Route definitions
// TODO: import and register routes per feature (client-management, applicant-registration, etc.)

import { createBrowserRouter } from 'react-router-dom';
import ClientManagementPage from '../features/client-management/pages/ClientManagementPage';
import ApplicantProfilingBoard from '../features/applicant-registration/pages/ApplicantProfilingBoard';
import { ApplicantRegistrationProvider } from '../features/applicant-registration/store/ApplicantRegistrationStore';
import RecruitmentSelectionPage from '../features/recruitment-selection/pages/RecruitmentSelectionPage';
import JobOrderManagementPage from '../features/job-order-management/pages/JobOrderManagementPage';
import DeploymentAssignmentPage from '../features/deployment-assignment/pages/DeploymentAssignmentPage';


const router = createBrowserRouter([
  { path: '/', element: <ClientManagementPage /> },
  { path: '/client-management', element: <ClientManagementPage /> },
  {
    path: '/applicant-registration',
    element: (
      <ApplicantRegistrationProvider>
        <ApplicantProfilingBoard />
      </ApplicantRegistrationProvider>
    ),
  },
  { path: '/recruitment-selection', element: <RecruitmentSelectionPage /> },
  { path: '/job-order-management', element: <JobOrderManagementPage /> },
  { path: '/deployment-assignment', element: <DeploymentAssignmentPage /> },
]);

export default router;