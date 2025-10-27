import { createBrowserRouter } from "react-router-dom";

// import PublicRoute from "./publicRoute";
import AppLayout from "@/layout/app-layout";
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

export const router = createBrowserRouter([
  {

    path: "/",
    children: [
      { path: "/", element: <LandingPage /> },

      // { path: "/onboarding-light", element: <OnboardingLight /> },
      { path: "/dashboard-sample", element: <Dashboard /> },
      { path: "/sign-up", element: <SignUpPage /> },
      { path: "/sign-in", element: <LoginPage /> },
      { path: "/onboarding-dark", element:<OnboardingDark /> },
      { path: "/driver/upload/:token", element: <DriverUploadPortal /> },
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
      { path: "/client/settings", element: <Settings /> }
    ],
  },
]);
