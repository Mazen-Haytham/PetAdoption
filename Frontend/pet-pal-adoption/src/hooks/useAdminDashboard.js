import { useEffect, useMemo } from "react";
import useAdminStore from "../store/useAdminStore";

/**
 * Like owner’s outlet hook pattern: one place for dashboard data loading + derived numbers.
 * Page only renders; it does not talk to the API directly.
 */
export function useAdminDashboard() {
  const pets = useAdminStore((s) => s.pets);
  const users = useAdminStore((s) => s.users);
  const loading = useAdminStore((s) => s.dashboardLoading);
  const error = useAdminStore((s) => s.dashboardError);
  const load = useAdminStore((s) => s.loadDashboardData);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const pending = pets.filter((p) => isPending(p.status)).length;
    const approved = pets.filter((p) => isApproved(p.status)).length;
    return {
      totalUsers: users.length,
      totalPets: pets.length,
      pendingPets: pending,
      approvedPets: approved,
    };
  }, [pets, users]);

  const recentApproved = useMemo(() => {
    return pets.filter((p) => isApproved(p.status)).slice(0, 8);
  }, [pets]);

  return { loading, error, stats, recentApproved };
}

function isPending(status) {
  return String(status ?? "").toLowerCase() === "pending";
}

function isApproved(status) {
  return String(status ?? "").toLowerCase() === "approved";
}
