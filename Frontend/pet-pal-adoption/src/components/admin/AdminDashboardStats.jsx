/** Four stat cards on the dashboard. */
import { CheckCircle, Clock, PawPrint, Users } from "lucide-react";
import StatCard from "../owner/shelterHome/StatCard";

export default function AdminDashboardStats({
  loading,
  totalUsers,
  totalPets,
  pendingPets,
  approvedPets,
}) {
  return (
    <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<Users className="h-5 w-5" />}
        label="Total Users"
        value={loading ? "…" : String(totalUsers)}
      />
      <StatCard
        icon={<PawPrint className="h-5 w-5" />}
        label="Total Pet Posts"
        value={loading ? "…" : String(totalPets)}
      />
      <StatCard
        icon={<Clock className="h-5 w-5" />}
        label="Pending Posts"
        value={loading ? "…" : String(pendingPets)}
      />
      <StatCard
        icon={<CheckCircle className="h-5 w-5" />}
        label="Approved Posts"
        value={loading ? "…" : String(approvedPets)}
      />
    </section>
  );
}
