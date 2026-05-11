import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdopterProfile from "./pages/adopter/AdopterProfile";
import { useAuthStore } from "./store/authStore";
import PublicRoute from "./components/PublicRoute";
import ShelterOwnerLayout from "./pages/owner/ShelterOwnerLayout";
import ShelterDashboardPage from "./pages/owner/ShelterDashboardPage";
import ShelterRequestsPage from "./pages/owner/ShelterRequestsPage";
import ListPetPage from "./pages/owner/ListPetPage";

// Placeholder pages
const AdminDashboard = () => <h1>Admin Dashboard</h1>;
const Unauthorized = () => <h1>Unauthorized</h1>;

export default function App() {
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Adopter */}
        <Route
          path="/adopter/profile"
          element={
            <ProtectedRoute allowedRoles={["Adopter"]}>
              <AdopterProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/adopter"
          element={<Navigate to="/adopter/profile" replace />}
        />

        {/* Owner */}
        {/* Extracted so "Shelter" role can also access this route */}
        <Route
          path="/owner/pets/new"
          element={
            <ProtectedRoute allowedRoles={["Owner", "Shelter"]}>
              <ListPetPage />
            </ProtectedRoute>
          }
        />

        {/* All other owner routes, Owner-only */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute allowedRoles={["Owner"]}>
              <ShelterOwnerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ShelterDashboardPage />} />
          <Route path="dashboard" element={<Navigate to="/owner" replace />} />
          <Route path="requests" element={<ShelterRequestsPage />} />
        </Route>

        {/* Admin */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}