import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import useAdminStore from "../../store/useAdminStore";
import {
  isPendingStatus,
  USER_ROLE_FILTER_OPTIONS,
  USER_STATUS_FILTER_OPTIONS,
} from "../../admin/adminShared";

/** Manage users: filters + user table (one file). */
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

      {error ? (
        <div className="pa-card mt-6 border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="pa-card mt-6 overflow-x-auto lg:overflow-hidden">
        <div className="min-w-[640px] lg:min-w-0">
          <div className="grid grid-cols-5 gap-2 bg-[rgb(var(--pa-primary))/4] px-6 py-4 text-[11px] font-extrabold tracking-wider text-black/40">
            <div className="col-span-2">USER</div>
            <div>ROLE</div>
            <div>STATUS</div>
            <div className="text-right">ACTIONS</div>
          </div>

          <div className="divide-y divide-black/5">
            {rows.length === 0 ? (
              <div className="px-6 py-10 text-sm font-semibold text-black/45">
                {loading ? "Loading…" : "No users match the filters."}
              </div>
            ) : (
              rows.map((user) => {
                const pending = isPendingStatus(user.status);
                const busy = busyUserId === user.id;
                return (
                  <div key={user.id} className="grid grid-cols-5 items-center gap-2 px-6 py-5">
                    <div className="col-span-2 min-w-0">
                      <div className="truncate text-sm font-extrabold">{user.name ?? "—"}</div>
                      <div className="truncate text-xs font-semibold text-black/40">
                        {user.email ?? "—"}
                      </div>
                    </div>
                    <div>
                      <RolePill role={user.role} />
                    </div>
                    <div>
                      <StatusPill status={user.status} />
                    </div>
                    <div className="flex justify-end gap-2">
                      {pending ? (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={async () => {
                              setBusyUserId(user.id);
                              await approveUser(user.id);
                              setBusyUserId(null);
                            }}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={async () => {
                              setBusyUserId(user.id);
                              await rejectUser(user.id);
                              setBusyUserId(null);
                            }}
                            className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-black/30">—</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function StatusPill({ status }) {
  const key = String(status ?? "").toLowerCase();
  const map = {
    pending: "bg-amber-50 text-amber-700",
    approved: "bg-emerald-50 text-emerald-700",
    rejected: "bg-rose-50 text-rose-700",
  };
  const cls = map[key] ?? "bg-black/5 text-black/45";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${cls}`}>
      {status ?? "—"}
    </span>
  );
}

function RolePill({ role }) {
  const key = String(role ?? "").toLowerCase();
  const map = {
    admin: "bg-violet-50 text-violet-700",
    owner: "bg-blue-50 text-blue-700",
    adopter: "bg-sky-50 text-sky-700",
  };
  const cls = map[key] ?? "bg-black/5 text-black/45";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${cls}`}>
      {role ?? "—"}
    </span>
  );
}
