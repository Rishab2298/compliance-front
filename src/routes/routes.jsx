import { createBrowserRouter } from "react-router-dom";

// import PublicRoute from "./publicRoute";
import AppLayout from "@/layout/app-layout";
import SuperAdminLayout from "@/layout/super-admin-layout";
import ProtectedRoute from "./protectedRoute";
import Dashboard from "@/pages/dashboard-sample";
import OnboardingDark from "@/pages/onboardingPageDark";
import ClientDashboard from "@/client/clientDashboard";
import Drivers from "@/client/drivers";
import Compliance from "@/client/compliance";
import Calendar from "@/client/calendar";
import Billing from "@/client/billing";
import BillingCancel from "@/client/billingCancel";
import BillingSuccess from "@/client/billingSuccess";
import InvoiceView from "@/client/invoiceView";
import Reminders from "@/client/reminders";
import DocumentStatus from "@/client/documentStatus";
import DriverLicense from "@/client/driverLicense";
import Passport from "@/client/passport";
import LoginPage from "@/authentication/signin";
import SignUpPage from "@/authentication/signup";
import LandingPage from "@/pages/landingPage";
import DocumentTypes from "@/client/documentTypes";
import AddADriver from "@/client/addADriver";
import Settings from "@/client/settings";
import DriverUploadPortal from "@/pages/driverUploadPortal";
import DriverDetail from "@/client/driverDetail";
import SuperAdminDashboard from "@/super-admin/superAdminDashboard";
import PoliciesPage from "@/super-admin/PoliciesPage";
import PolicyEditPage from "@/super-admin/PolicyEditPage";
import AIUsagePage from "@/super-admin/AIUsagePage";
import SystemLogsPage from "@/super-admin/SystemLogsPage";
import ConsentLogsPage from "@/super-admin/ConsentLogsPage";
import SecurityLogsPage from "@/super-admin/SecurityLogsPage";
import BillingPage from "@/super-admin/BillingPage";
import CompaniesPage from "@/super-admin/CompaniesPage";
import CompanyDetailPage from "@/super-admin/CompanyDetailPage";
import UsersPage from "@/super-admin/UsersPage";
import TeamManagement from "@/client/teamManagement";
import AuditLogs from "@/client/auditLogs";
import Notifications from "@/client/notifications";
import PolicyAcceptance from "@/pages/PolicyAcceptance";
import PolicyViewer from "@/pages/PolicyViewer";
import NotFound from "@/pages/NotFound";
import { MyTicketsPage } from "@/client/ticketing/MyTicketsPage";
import TicketsPage from "@/super-admin/TicketsPage";
import HealthcareCompliancePage from "@/pages/HealthcareCompliancePage";
import ShippingManagementPage from "@/pages/ShippingManagementPage";
import RealEstateManagementPage from "@/pages/RealEstateManagementPage";
import ManufacturingManagementPage from "@/pages/ManufacturingManagementPage";
import EducationManagementPage from "@/pages/EducationManagementPage";
import InsuranceManagementPage from "@/pages/InsuranceManagementPage";
import SecurityGuardManagementPage from "@/pages/SecurityGuardManagementPage";
import ServiceProvidersManagementPage from "@/pages/ServiceProvidersManagementPage";
import GovernmentManagementPage from "@/pages/GovernmentManagementPage";
import ComplaintRegistration from "@/pages/complaintRegistration";
import ContactPage from "@/pages/ContactPage";

export const router = createBrowserRouter([
  {

    path: "/",
    children: [
      { path: "/", element: <LandingPage /> },

      // { path: "/onboarding-light", element: <OnboardingLight /> },
      { path: "/dashboard-sample", element: <Dashboard /> },
      {path: "/healthcare",element:<HealthcareCompliancePage />},
      {path: "/shipping-management",element:<ShippingManagementPage />},
      {path:"/real-estate-management",element:<RealEstateManagementPage/>},
      {path:"/manufacturing-management",element:<ManufacturingManagementPage/>},
      {path:"/education-management",element:<EducationManagementPage/>},
      {path:"/insurance-management",element:<InsuranceManagementPage/>},
      {path:"/security-guard-management",element:<SecurityGuardManagementPage/>},
      {path:"/service-provider-management",element:<ServiceProvidersManagementPage/>},
      {path:"/government-management",element:<GovernmentManagementPage/>},
      { path: "/complaints", element: <ComplaintRegistration /> },
      { path: "/contact", element: <ContactPage /> },
      { path: "/sign-up", element: <SignUpPage /> },
      { path: "/sign-in", element: <LoginPage /> },
      { path: "/onboarding-dark", element:<OnboardingDark /> },
      { path: "/driver/upload/:token", element: <DriverUploadPortal /> },
      { path: "/policies/:type", element: <PolicyViewer /> },
      {
        path: "/policy-acceptance",
        element: (
          <ProtectedRoute>
            <PolicyAcceptance />
          </ProtectedRoute>
        )
      },
      {
        path: "/client/add-a-driver",
        element: (
          <ProtectedRoute>
            <AddADriver />
          </ProtectedRoute>
        )
      },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/client/dashboard", element: <ClientDashboard /> },
      { path: "/client/drivers", element: <Drivers /> },
      { path: "/client/driver/:driverId", element: <DriverDetail /> },
      { path: "/client/compliance", element: <Compliance /> },
      { path: "/client/calendar", element: <Calendar /> },
      { path: "/client/billing", element: <Billing /> },
      { path: "/client/billing/cancel", element: <BillingCancel /> },
      { path: "/client/billing/success", element: <BillingSuccess /> },
      { path: "/client/billing/invoice/:invoiceId", element: <InvoiceView /> },
      { path: "/client/reminders", element: <Reminders /> },
      { path: "/client/document-status", element: <DocumentStatus /> },
      { path: "/client/document-types", element: <DocumentTypes /> },
      { path: "/client/smart-upload-driver-license", element: <DriverLicense /> },
      { path: "/client/smart-upload-passport", element: <Passport /> },
      { path: "/client/team", element: <TeamManagement /> },
      { path: "/client/audit-logs", element: <AuditLogs /> },
      { path: "/client/settings", element: <Settings /> },
      { path: "/client/notifications", element: <Notifications /> },
      { path: "/client/tickets", element: <MyTicketsPage /> }
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <SuperAdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/super-admin/dashboard", element: <SuperAdminDashboard /> },
      { path: "/super-admin/tickets", element: <TicketsPage /> },
      { path: "/super-admin/policies", element: <PoliciesPage /> },
      { path: "/super-admin/policies/:type", element: <PolicyEditPage /> },
      { path: "/super-admin/ai-usage", element: <AIUsagePage /> },
      { path: "/super-admin/logs", element: <SystemLogsPage /> },
      { path: "/super-admin/consent-logs", element: <ConsentLogsPage /> },
      { path: "/super-admin/security-logs", element: <SecurityLogsPage /> },
      // Placeholder routes - you can create these pages later
      { path: "/super-admin/companies", element: <CompaniesPage /> },
      { path: "/super-admin/companies/:id", element: <CompanyDetailPage /> },
      { path: "/super-admin/users", element: <UsersPage /> },
      { path: "/super-admin/analytics", element: <div className="p-8 text-center">Analytics Page Coming Soon</div> },
      { path: "/super-admin/billing", element: <BillingPage /> },
      { path: "/super-admin/settings", element: <div className="p-8 text-center">Settings Page Coming Soon</div> },
    ],
  },
  // Catch-all route for 404 Not Found
  // IMPORTANT: This must be the last route in the array
  {
    path: "*",
    element: <NotFound />,
  },
]);
