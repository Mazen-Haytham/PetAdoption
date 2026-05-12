import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdopterProfile from "./pages/adopter/AdopterProfile";
import Favorites from "./pages/adopter/Favorites";
import Reviews from "./pages/adopter/Reviews";
import AdopterBrowseLayout from "./pages/adopter/AdopterBrowseLayout";
import AdopterHomePage from "./pages/adopter/AdopterHomePage";
import { useAuthStore } from "./store/authStore";
import PublicRoute from "./components/PublicRoute";
import ShelterOwnerLayout from "./pages/owner/ShelterOwnerLayout";
import ShelterDashboardPage from "./pages/owner/ShelterDashboardPage";
import ShelterRequestsPage from "./pages/owner/ShelterRequestsPage";
import ListPetPage from "./pages/owner/ListPetPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminPetsPage from "./pages/admin/AdminPetsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";

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

        {/* Adopter — browse is public; profile/favorites/reviews are protected */}
        <Route path="/adopter" element={<AdopterBrowseLayout />}>
          <Route index element={<AdopterHomePage />} />

          <Route
            path="profile"
            element={
              <ProtectedRoute allowedRoles={["Adopter"]}>
                <AdopterProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="favorites"
            element={
              <ProtectedRoute allowedRoles={["Adopter"]}>
                <Favorites />
              </ProtectedRoute>
            }
          />

          <Route
            path="reviews"
            element={
              <ProtectedRoute allowedRoles={["Adopter"]}>
                <Reviews />
              </ProtectedRoute>
            }
          />
        </Route>

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
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="pets" element={<AdminPetsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>

        {/* Default — app home is public adopter browse */}
        <Route path="/" element={<Navigate to="/adopter" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}