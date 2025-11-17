import { RouterProvider } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

import { SidebarProvider } from "./components/ui/sidebar";
import LoadingScreen from "./components/LoadingScreen";
import { ThemeProvider } from "./contexts/ThemeContext";

import { router } from "./routes/routes";

// const router = createBrowserRouter([
//   // Public Routes
//   {

//     children: [
//       {
//         path: "/",
//         element: <LandingPage />,
//       },
//       {
//         path: "/onboarding-dark",
//         element: <OnboardingDark />,
//       },
//       {
//         path: "/onboarding-light",
//         element: <OnboardingLight />,
//       },{
//         path:"/dashboard-sample",
//         element:<Dashboard />
//       }
//     ],
//   },
//   {
//     children: [
//       {
//         path: "/sign-up",
//         element: <SignUpPage />,
//       },
//       {
//         path: "/sign-in",
//         element: <SignInPage />,
//       },
//       // you can add more public pages here
//     ],
//   },

//   {
//     element: <AppLayout />,
//     children: [
//       {
//         path: "/client/dashboard",
//         element: <ClientDashboard />,
//       },
//       {
//         path: "/client/drivers",
//         element: <Drivers />,
//       },
//       {
//         path: "/client/compliance",
//         element: <Compliance />,
//       },
//       {
//         path: "/client/calendar",
//         element: <Calendar />,
//       },
//       {
//         path: "/client/storage",
//         element: <Storage />,
//       },
//       {
//         path: "/client/billing",
//         element: <Billing />,
//       },
//       {
//         path: "/client/reminders",
//         element: <Reminders />,
//       },
//       {
//         path: "/client/smart-upload-driver-license",
//         element: <DriverLicense />,
//       },
//       {
//         path: "/client/smart-upload-passport",
//         element: <Passport />,
//       },
//     ],
//   },
// ]);

function App() {
  return (
    <>
      <ThemeProvider>
        <SidebarProvider>
          <RouterProvider router={router} />
        </SidebarProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
