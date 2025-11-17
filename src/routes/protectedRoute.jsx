import { Navigate, useLocation } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { PropagateLoader } from "react-spinners";
import { useTheme } from "@/contexts/ThemeContext";
import MFAEnforcementModal from "@/components/MFAEnforcementModal";

export default function ProtectedRoute({ children }) {
  const { isSignedIn } = useAuth();
  const { isLoaded, user } = useUser();
  const { isDarkMode } = useTheme();
  const location = useLocation();

  // Show loader until user data is loaded
  if (!isLoaded) {
    return (
      <div className={`relative flex items-center justify-center w-full h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gray-50'}`}>
        <PropagateLoader color={isDarkMode ? "#a78bfa" : "#1f2937"} />
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  const role = user?.publicMetadata?.role;
  const companyId = user?.publicMetadata?.companyId;

  // Redirect if no role assigned
  if (!role) {
    return <Navigate to="/sign-in" replace />;
  }

  // ✅ Handle SUPER_ADMIN role
  if (role === "SUPER_ADMIN") {
    // Super admins should access super-admin routes
    if (location.pathname.startsWith("/super-admin")) {
      return <MFAEnforcementModal>{children}</MFAEnforcementModal>;
    } else {
      // Redirect to super admin dashboard if on other routes
      return <Navigate to="/super-admin/dashboard" replace />;
    }
  }

  // ✅ Allow admins without company only on onboarding route
  if (role === "ADMIN" && !companyId) {
    if (location.pathname !== "/onboarding-dark") {
      return <Navigate to="/onboarding-dark" replace />;
    } else {
      return children; // let onboarding page load freely
    }
  }

  // ✅ Allow admin/staff with company access to client pages
  if ((role === "ADMIN" || role === "STAFF") && companyId) {
    return <MFAEnforcementModal>{children}</MFAEnforcementModal>;
  }

  // Fallback
  return <Navigate to="/sign-in" replace />;
}
