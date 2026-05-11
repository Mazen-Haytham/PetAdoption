import { useNavigate } from "react-router-dom";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";
import AdminDashboardStats from "../../components/admin/AdminDashboardStats";
import AdminDashboardRecentActivity from "../../components/admin/AdminDashboardRecentActivity";
import AdminPageShell from "../../components/admin/AdminPageShell";
import AdminAlertError from "../../components/admin/AdminAlertError";

/** Thin page: data from hook, layout from small components (same idea as ShelterDashboardPage). */
export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { loading, error, stats, recentApproved } = useAdminDashboard();

  return (
    <AdminPageShell>
      <h1 className="text-3xl font-extrabold tracking-tight">System Overview</h1>
      <p className="mt-1 text-sm font-semibold text-black/45">
        Snapshot of users and pet moderation queue.
      </p>

      <AdminAlertError message={error} />

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
    </AdminPageShell>
  );
}
