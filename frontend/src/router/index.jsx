import { createBrowserRouter, Navigate } from 'react-router-dom';
import LandingPage from '../features/landing/pages/LandingPage';
import OfficesPage from '../features/landing/pages/OfficesPage';
import RootLayout from '../components/layout/RootLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import ModuleRoute from '../components/auth/ModuleRoute';
import ClientPortalProtectedRoute from '../components/auth/ClientPortalProtectedRoute';
import ClientManagementPage from '../features/client-management/pages/ClientManagementPage';
import ApplicantProfilingBoard from '../features/applicant-registration/pages/ApplicantProfilingBoard';
import RegisterApplicantPage from '../features/applicant-registration/pages/RegisterApplicantPage';
import { ApplicantRegistrationProvider } from '../features/applicant-registration/store/ApplicantRegistrationStore';
import RecruitmentSelectionPage from '../features/recruitment-selection/pages/RecruitmentSelectionPage';
import JobOrderManagementPage from '../features/job-order-management/pages/JobOrderManagementPage';
import DeploymentAssignmentPage from '../features/deployment-assignment/pages/DeploymentAssignmentPage';
import AiAnalyticsPage from '../features/ai-analytics/pages/AiAnalyticsPage';
import SettingsPage from '../features/settings/pages/SettingsPage';
import UserProfilePage from '../features/profile/pages/UserProfilePage';
import ClientPortalPage from '../features/client-portal/pages/ClientPortalPage';
import ClientPortalLoginPage from '../features/client-portal/pages/ClientPortalLoginPage';
import ClientPortalRegisterPage from '../features/client-portal/pages/ClientPortalRegisterPage';
import ClientPortalResetPasswordPage from '../features/client-portal/pages/ClientPortalResetPasswordPage';
import PublicApplyPage from '../features/applicant-registration/pages/PublicApplyPage';
import LoginPage from '../features/auth/pages/LoginPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import RoleDefaultRedirect from '../components/auth/RoleDefaultRedirect';
import RouteErrorBoundary from '../components/common/RouteErrorBoundary';

const router = createBrowserRouter([
  // PUBLIC: Corporate Landing Page
  {
    path: '/',
    element: <LandingPage />,
    errorElement: <RouteErrorBoundary />,
  },

  // PUBLIC: Our Offices (National Headquarters & Regional Branches)
  {
    path: '/offices',
    element: <OfficesPage />,
    errorElement: <RouteErrorBoundary />,
  },

  // PUBLIC: Staff Authentication
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },

  // PROTECTED: Internal HR System (Mounted at root paths so all system features and links work seamlessly)
  {
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      // Dashboard — Executive Overview for all authenticated roles
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },

      // Client Management — hr_administrator, job_order_coordinator
      {
        path: '/client-management',
        element: (
          <ModuleRoute moduleKey="client-management">
            <ClientManagementPage />
          </ModuleRoute>
        ),
      },

      // Applicant Registration — hr_administrator, registration_officer
      {
        path: '/applicant-registration',
        element: (
          <ModuleRoute moduleKey="applicant-registration">
            <ApplicantRegistrationProvider>
              <ApplicantProfilingBoard />
            </ApplicantRegistrationProvider>
          </ModuleRoute>
        ),
      },
      {
        path: '/applicant-registration/register',
        element: (
          <ModuleRoute moduleKey="applicant-registration">
            <ApplicantRegistrationProvider>
              <RegisterApplicantPage />
            </ApplicantRegistrationProvider>
          </ModuleRoute>
        ),
      },

      // Recruitment & Selection — hr_administrator, recruitment_officer
      {
        path: '/recruitment-selection',
        element: (
          <ModuleRoute moduleKey="recruitment-selection">
            <RecruitmentSelectionPage />
          </ModuleRoute>
        ),
      },

      // Job Order Management — hr_administrator, job_order_coordinator
      {
        path: '/job-order-management',
        element: (
          <ModuleRoute moduleKey="job-order-management">
            <JobOrderManagementPage />
          </ModuleRoute>
        ),
      },

      // Deployment & Assignment — hr_administrator, deployment_officer
      {
        path: '/deployment-assignment',
        element: (
          <ModuleRoute moduleKey="deployment-assignment">
            <DeploymentAssignmentPage />
          </ModuleRoute>
        ),
      },

      // AI Analytics — hr_administrator only
      {
        path: '/ai-analytics',
        element: (
          <ModuleRoute moduleKey="ai-analytics">
            <AiAnalyticsPage />
          </ModuleRoute>
        ),
      },

      // Settings — hr_administrator only
      {
        path: '/settings',
        element: (
          <ModuleRoute moduleKey="settings">
            <SettingsPage />
          </ModuleRoute>
        ),
      },

      // My Profile & Account Preferences — All authenticated staff roles
      {
        path: '/profile',
        element: <UserProfilePage />,
      },

      // App Root redirect
      {
        path: '/app',
        element: <RoleDefaultRedirect />,
      },
      // App prefixed path aliases for backwards-compatibility
      { path: '/app/dashboard', element: <Navigate to="/dashboard" replace /> },
      { path: '/app/client-management', element: <Navigate to="/client-management" replace /> },
      { path: '/app/applicant-registration', element: <Navigate to="/applicant-registration" replace /> },
      { path: '/app/applicant-registration/register', element: <Navigate to="/applicant-registration/register" replace /> },
      { path: '/app/recruitment-selection', element: <Navigate to="/recruitment-selection" replace /> },
      { path: '/app/job-order-management', element: <Navigate to="/job-order-management" replace /> },
      { path: '/app/deployment-assignment', element: <Navigate to="/deployment-assignment" replace /> },
      { path: '/app/ai-analytics', element: <Navigate to="/ai-analytics" replace /> },
      { path: '/app/settings', element: <Navigate to="/settings" replace /> },
      { path: '/app/profile', element: <Navigate to="/profile" replace /> },
    ],
  },

  // PROTECTED: Client Portal (separate auth scope)
  {
    path: '/client-portal',
    element: (
      <ClientPortalProtectedRoute>
        <ClientPortalPage />
      </ClientPortalProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  // PUBLIC: Client Portal authentication pages
  { path: '/client-portal/login', element: <ClientPortalLoginPage />, errorElement: <RouteErrorBoundary /> },
  { path: '/client-portal/register', element: <ClientPortalRegisterPage />, errorElement: <RouteErrorBoundary /> },
  { path: '/client-portal/reset-password', element: <ClientPortalResetPasswordPage />, errorElement: <RouteErrorBoundary /> },

  // PUBLIC: Applicant self-registration
  {
    path: '/apply',
    element: (
      <ApplicantRegistrationProvider>
        <PublicApplyPage />
      </ApplicantRegistrationProvider>
    ),
    errorElement: <RouteErrorBoundary />,
  },

  // CATCH-ALL: Render professional error boundary on invalid routes
  {
    path: '*',
    element: <RouteErrorBoundary />,
  },
]);

export default router;