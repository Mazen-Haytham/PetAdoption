import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";



const ROLE_DESTINATIONS = {
  Adopter: "/adopter/profile",
  Owner: "/owner",
  Admin: "/admin/dashboard",
};

export default function ProtectedRoute({ allowedRoles, children }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);

  if (isAuthLoading) return null;

  if (!accessToken) return <Navigate to="/adopter" replace />;

if (allowedRoles && !allowedRoles.includes(role)) {
    const destination = ROLE_DESTINATIONS[role] ?? "/login";
    return <Navigate to={destination} replace />;
  }

  return children;
}