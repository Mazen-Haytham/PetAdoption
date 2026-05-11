import { useEffect, useState } from "react";
import useAdminStore from "../../store/useAdminStore";
import {
  USER_ROLE_FILTER_OPTIONS,
  USER_STATUS_FILTER_OPTIONS,
} from "../../admin/adminConstants";
import AdminAlertError from "./AdminAlertError";
import AdminUsersTable from "./AdminUsersTable";

/** Users page body: filters + table. */
export default function AdminUsersManage() {
  const users = useAdminStore((s) => s.users);
  const loading = useAdminStore((s) => s.usersLoading);
  const error = useAdminStore((s) => s.usersError);
  const fetchUsers = useAdminStore((s) => s.fetchUsers);
  const approveUser = useAdminStore((s) => s.approveUser);
  const rejectUser = useAdminStore((s) => s.rejectUser);

  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [busyUserId, setBusyUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const rows = users.filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (statusFilter && u.status !== statusFilter) return false;
    return true;
  });

  async function handleApprove(id) {
    setBusyUserId(id);
    await approveUser(id);
    setBusyUserId(null);
  }

  async function handleReject(id) {
    setBusyUserId(id);
    await rejectUser(id);
    setBusyUserId(null);
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Manage Users</h1>
          <p className="mt-1 text-sm font-semibold text-black/45">
            Approve or reject pending accounts; filter by role or status.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-black/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--pa-primary))/20]"
          >
            {USER_ROLE_FILTER_OPTIONS.map((r) => (
              <option key={r || "roles"} value={r}>
                {r || "All Roles"}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-black/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--pa-primary))/20]"
          >
            {USER_STATUS_FILTER_OPTIONS.map((s) => (
              <option key={s || "status"} value={s}>
                {s || "All Statuses"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <AdminAlertError message={error} />

      <AdminUsersTable
        rows={rows}
        loading={loading}
        busyUserId={busyUserId}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </>
  );
}
