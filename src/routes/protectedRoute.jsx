import { Navigate, useLocation } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { PropagateLoader } from "react-spinners";

export default function ProtectedRoute({ children }) {
  const { isSignedIn } = useAuth();
  const { isLoaded, user } = useUser();
  const location = useLocation();

  // Show loader until user data is loaded
  if (!isLoaded) {
    return (
      <div className="relative flex items-center justify-center w-full h-screen">
        <PropagateLoader />
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

  // ✅ Allow admins without company only on onboarding route
  if (role === "admin" && !companyId) {
    if (location.pathname !== "/onboarding-dark") {
      return <Navigate to="/onboarding-dark" replace />;
    } else {
      return children; // let onboarding page load freely
    }
  }

  // ✅ Allow admin/staff with company access to client pages
  if ((role === "admin" || role === "staff") && companyId) {
    return children;
  }

  // Fallback
  return <Navigate to="/sign-in" replace />;
}
