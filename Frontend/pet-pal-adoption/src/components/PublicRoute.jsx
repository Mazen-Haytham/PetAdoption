// components/PublicRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const ROLE_DESTINATIONS = {
  Adopter: "/adopter",
  Owner: "/owner",
  Admin: "/admin/dashboard",
};

export default function PublicRoute({ children }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);

  if (isAuthLoading) return null;

  if (accessToken) {
    const destination = ROLE_DESTINATIONS[role] ?? "/login";
    return <Navigate to={destination} replace />;
  }

  return children;
}