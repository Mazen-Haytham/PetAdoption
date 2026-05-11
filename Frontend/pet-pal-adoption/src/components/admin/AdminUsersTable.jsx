import { Check, X } from "lucide-react";
import { AdminRoleBadge, AdminStatusBadge } from "./AdminBadges";
import { isPendingStatus } from "../../admin/adminHelpers";

export default function AdminUsersTable({
  rows,
  loading,
  busyUserId,
  onApprove,
  onReject,
}) {
  return (
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
                    <AdminRoleBadge role={user.role} />
                  </div>
                  <div>
                    <AdminStatusBadge status={user.status} />
                  </div>
                  <div className="flex justify-end gap-2">
                    {pending ? (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onApprove(user.id)}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onReject(user.id)}
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
  );
}
