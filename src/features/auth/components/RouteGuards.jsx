import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { hasRole } from "../../../shared/config/roles";

export function ProtectedRoute({ roles }) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles?.length && !roles.some((role) => hasRole(user.roles, role)))
    return <Navigate to="/app" replace />;
  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/app" replace /> : <Outlet />;
}

export function RoleRoute({ allowedRoles }) {
  const { user } = useAuth();
  const allowed = allowedRoles.some((role) => hasRole(user?.roles, role));
  return allowed ? <Outlet /> : <Navigate to="/app" replace />;
}
