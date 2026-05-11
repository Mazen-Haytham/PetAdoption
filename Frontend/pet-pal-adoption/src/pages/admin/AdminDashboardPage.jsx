import { useNavigate } from "react-router-dom";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";
import AdminDashboardStats from "../../components/admin/AdminDashboardStats";
import AdminDashboardRecentActivity from "../../components/admin/AdminDashboardRecentActivity";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { loading, error, stats, recentApproved } = useAdminDashboard();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">System Overview</h1>
      <p className="mt-1 text-sm font-semibold text-black/45">
        Snapshot of users and pet moderation queue.
      </p>

      {error ? (
        <div className="pa-card mt-6 border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <AdminDashboardStats
        loading={loading}
        totalUsers={stats.totalUsers}
        totalPets={stats.totalPets}
        pendingPets={stats.pendingPets}
        approvedPets={stats.approvedPets}
      />

      <AdminDashboardRecentActivity
        loading={loading}
        rows={recentApproved}
        onViewAll={() => navigate("/admin/pets")}
      />
    </div>
  );
}
