import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../components/layout/RootLayout';
import ClientManagementPage from '../features/client-management/pages/ClientManagementPage';
import ApplicantProfilingBoard from '../features/applicant-registration/pages/ApplicantProfilingBoard';
import { ApplicantRegistrationProvider } from '../features/applicant-registration/store/ApplicantRegistrationStore';
import RecruitmentSelectionPage from '../features/recruitment-selection/pages/RecruitmentSelectionPage';
import JobOrderManagementPage from '../features/job-order-management/pages/JobOrderManagementPage';
import DeploymentAssignmentPage from '../features/deployment-assignment/pages/DeploymentAssignmentPage';
import SettingsPage from '../features/settings/pages/SettingsPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <ClientManagementPage /> },
      { path: 'client-management', element: <ClientManagementPage /> },
      {
        path: 'applicant-registration',
        element: (
          <ApplicantRegistrationProvider>
            <ApplicantProfilingBoard />
          </ApplicantRegistrationProvider>
        ),
      },
      { path: 'recruitment-selection', element: <RecruitmentSelectionPage /> },
      { path: 'job-order-management', element: <JobOrderManagementPage /> },
      { path: 'deployment-assignment', element: <DeploymentAssignmentPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);

export default router;