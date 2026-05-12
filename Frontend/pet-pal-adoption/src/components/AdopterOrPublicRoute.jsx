import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const ROLE_HOME = {
  Admin: "/admin/dashboard",
  Owner: "/owner",
};

export default function AdopterOrPublicRoute({ children }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);

  if (isAuthLoading) return null;

  if (accessToken && role !== "Adopter") {
    return <Navigate to={ROLE_HOME[role] ?? "/unauthorized"} replace />;
  }

  return children;
}