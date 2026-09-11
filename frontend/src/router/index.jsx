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

const router = createBrowserRouter([
  // PUBLIC: Corporate Landing Page
  { path: '/', element: <LandingPage /> },

  // PUBLIC: Our Offices (National Headquarters & Regional Branches)
  { path: '/offices', element: <OfficesPage /> },

  // PUBLIC: Login
  { path: '/login', element: <LoginPage /> },

  // PROTECTED: Internal HR System (mounted at /app so the '/' root is free for the landing page)
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      // /app root → redirect to role's own default module
      { index: true, element: <RoleDefaultRedirect /> },

      // Dashboard — Executive Overview for all authenticated roles
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },

      // Client Management — hr_administrator, job_order_coordinator
      {
        path: 'client-management',
        element: (
          <ModuleRoute moduleKey="client-management">
            <ClientManagementPage />
          </ModuleRoute>
        ),
      },

      // Applicant Registration — hr_administrator, registration_officer
      {
        path: 'applicant-registration',
        element: (
          <ModuleRoute moduleKey="applicant-registration">
            <ApplicantRegistrationProvider>
              <ApplicantProfilingBoard />
            </ApplicantRegistrationProvider>
          </ModuleRoute>
        ),
      },
      {
        path: 'applicant-registration/register',
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
        path: 'recruitment-selection',
        element: (
          <ModuleRoute moduleKey="recruitment-selection">
            <RecruitmentSelectionPage />
          </ModuleRoute>
        ),
      },

      // Job Order Management — hr_administrator, job_order_coordinator
      {
        path: 'job-order-management',
        element: (
          <ModuleRoute moduleKey="job-order-management">
            <JobOrderManagementPage />
          </ModuleRoute>
        ),
      },

      // Deployment & Assignment — hr_administrator, deployment_officer
      {
        path: 'deployment-assignment',
        element: (
          <ModuleRoute moduleKey="deployment-assignment">
            <DeploymentAssignmentPage />
          </ModuleRoute>
        ),
      },

      // AI Analytics — hr_administrator only
      {
        path: 'ai-analytics',
        element: (
          <ModuleRoute moduleKey="ai-analytics">
            <AiAnalyticsPage />
          </ModuleRoute>
        ),
      },

      // Settings — hr_administrator only
      {
        path: 'settings',
        element: (
          <ModuleRoute moduleKey="settings">
            <SettingsPage />
          </ModuleRoute>
        ),
      },

      // My Profile & Account Preferences — All authenticated staff roles
      {
        path: 'profile',
        element: <UserProfilePage />,
      },
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
  },
  // PUBLIC: Client Portal authentication pages
  { path: '/client-portal/login', element: <ClientPortalLoginPage /> },
  { path: '/client-portal/register', element: <ClientPortalRegisterPage /> },
  { path: '/client-portal/reset-password', element: <ClientPortalResetPasswordPage /> },

  // PUBLIC: Applicant self-registration
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