import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext"; 
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';

// Placeholder pages
const AdopterDashboard = () => <h1>Adopter Dashboard</h1>;
const OwnerDashboard = () => <h1>Owner Dashboard</h1>;
const AdminDashboard = () => <h1>Admin Dashboard</h1>;
const Unauthorized = () => <h1>Unauthorized</h1>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Adopter */}
          <Route path="/adopter/*" element={
            <ProtectedRoute allowedRoles={['Adopter']}>
              <AdopterDashboard />
            </ProtectedRoute>
          } />

          {/* Owner */}
          <Route path="/owner/*" element={
            <ProtectedRoute allowedRoles={['Owner']}>
              <OwnerDashboard />
            </ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Default */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}