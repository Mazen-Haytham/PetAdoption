import { Check, X } from "lucide-react";
import { AdminStatusBadge } from "./AdminBadges";
import { adminApprovalRequestId, adminPetPostId, isPendingStatus } from "../../admin/adminHelpers";

/**
 * Table only — parent loads data and passes approve/reject handlers.
 */
export default function AdminPetsTable({
  rows,
  loading,
  busyApprovalId,
  onApprove,
  onReject,
}) {
  return (
    <div className="pa-card mt-6 overflow-x-auto lg:overflow-hidden">
      <div className="min-w-[640px] lg:min-w-0">
        <div className="grid grid-cols-4 gap-2 bg-[rgb(var(--pa-primary))/4] px-6 py-4 text-[11px] font-extrabold tracking-wider text-black/40">
          <div>PET</div>
          <div>OWNER</div>
          <div>STATUS</div>
          <div className="text-right">ACTIONS</div>
        </div>

        <div className="divide-y divide-black/5">
          {rows.length === 0 ? (
            <div className="px-6 py-10 text-sm font-semibold text-black/45">
              {loading ? "Loading…" : "No pet posts."}
            </div>
          ) : (
            rows.map((row) => {
              const approvalId = adminApprovalRequestId(row);
              const key = approvalId ?? adminPetPostId(row);
              const pending = isPendingStatus(row.status);
              const busy = busyApprovalId === approvalId;

              return (
                <div key={key} className="grid grid-cols-4 items-center gap-2 px-6 py-5">
                  <div className="text-sm font-extrabold">{row.name ?? "—"}</div>
                  <div className="text-sm font-semibold text-black/45">{row.owner ?? "—"}</div>
                  <div>
                    <AdminStatusBadge status={row.status} />
                  </div>
                  <div className="flex justify-end gap-2">
                    {pending && approvalId != null ? (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onApprove(approvalId)}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onReject(approvalId)}
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
