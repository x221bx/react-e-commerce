import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import {
  selectCurrentUser,
  selectIsAuthInitialized,
} from "../features/auth/authSlice";

export default function ProtectedRoute({
  requireAdmin = false,
  allowedRoles = null,
  allowAdminOverride = true,
}) {
  const user = useSelector(selectCurrentUser);
  const isInitialized = useSelector(selectIsAuthInitialized);

  // Wait for auth state to resolve before deciding on access
  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (requireAdmin && user?.isAdmin !== true) return <Navigate to="/403" replace />;

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const userRole = user?.role || (user?.isAdmin ? "admin" : null);
    const hasRole = allowedRoles.includes(userRole);
    if (!hasRole && !(allowAdminOverride && user?.isAdmin)) {
      return <Navigate to="/403" replace />;
    }
  }

  return <Outlet />;
}
