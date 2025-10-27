// import { Navigate, Outlet } from "react-router-dom";
// import { useAuth, useUser } from "@clerk/clerk-react";

// export default function PublicRoute({ children }) {
//   const { isLoaded: authLoaded, isSignedIn } = useAuth();
//   const { isLoaded: userLoaded, user } = useUser();

//   if (!authLoaded || !userLoaded) {
//     // Optional: show a loader
//     return <div>Loading...</div>;
//   }

//   if (isSignedIn) {
//     const role = user?.publicMetadata?.role;
//     const companyId = user?.publicMetadata?.companyId;
//     console.log(role);
//     if (!role) return <Navigate to="/sign-in" replace />;
//     if ((role === "admin" || role === "staff") && companyId)
//       return <Navigate to="/client/dashboard" replace />;
//     if (role === "admin" && !companyId)
//       return <Navigate to="/onboarding-dark" replace />;
//   }

//   // Render children if passed, else Outlet for nested routes
//   return children ? children : <Outlet />;
// }
