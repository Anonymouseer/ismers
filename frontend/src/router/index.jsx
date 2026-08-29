import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from '../components/layout/RootLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import ClientManagementPage from '../features/client-management/pages/ClientManagementPage';
import ApplicantProfilingBoard from '../features/applicant-registration/pages/ApplicantProfilingBoard';
import RegisterApplicantPage from '../features/applicant-registration/pages/RegisterApplicantPage';
import { ApplicantRegistrationProvider } from '../features/applicant-registration/store/ApplicantRegistrationStore';
import RecruitmentSelectionPage from '../features/recruitment-selection/pages/RecruitmentSelectionPage';
import JobOrderManagementPage from '../features/job-order-management/pages/JobOrderManagementPage';
import DeploymentAssignmentPage from '../features/deployment-assignment/pages/DeploymentAssignmentPage';
import AiAnalyticsPage from '../features/ai-analytics/pages/AiAnalyticsPage';
import SettingsPage from '../features/settings/pages/SettingsPage';
import ClientPortalPage from '../features/client-portal/pages/ClientPortalPage';
import ClientPortalLoginPage from '../features/client-portal/pages/ClientPortalLoginPage';
import ClientPortalRegisterPage from '../features/client-portal/pages/ClientPortalRegisterPage';
import ClientPortalResetPasswordPage from '../features/client-portal/pages/ClientPortalResetPasswordPage';
import PublicApplyPage from '../features/applicant-registration/pages/PublicApplyPage';
import LoginPage from '../features/auth/pages/LoginPage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/client-management" replace /> },
      { path: 'client-management', element: <ClientManagementPage /> },
      {
        path: 'applicant-registration',
        element: (
          <ApplicantRegistrationProvider>
            <ApplicantProfilingBoard />
          </ApplicantRegistrationProvider>
        ),
      },
      {
        path: 'applicant-registration/register',
        element: (
          <ApplicantRegistrationProvider>
            <RegisterApplicantPage />
          </ApplicantRegistrationProvider>
        ),
      },
      { path: 'recruitment-selection', element: <RecruitmentSelectionPage /> },
      { path: 'job-order-management', element: <JobOrderManagementPage /> },
      { path: 'deployment-assignment', element: <DeploymentAssignmentPage /> },
      { path: 'ai-analytics', element: <AiAnalyticsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  {
    path: '/client-portal',
    element: <ClientPortalPage />,
  },
  {
    path: '/client-portal/login',
    element: <ClientPortalLoginPage />,
  },
  {
    path: '/client-portal/register',
    element: <ClientPortalRegisterPage />,
  },
  {
    path: '/client-portal/reset-password',
    element: <ClientPortalResetPasswordPage />,
  },
  {
    path: '/apply',
    element: (
      <ApplicantRegistrationProvider>
        <PublicApplyPage />
      </ApplicantRegistrationProvider>
    ),
  },
]);

export default router;