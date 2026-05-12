import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import useAdminStore from "../../store/useAdminStore";
import {
  adminApprovalRequestId,
  adminPetPostId,
  isPendingStatus,
  PET_STATUS_FILTER_OPTIONS,
} from "../../admin/adminShared";

/** Pet posts: filter + table (one file). */
export default function AdminPetsModeration() {
  const pets = useAdminStore((s) => s.pets);
  const loading = useAdminStore((s) => s.petsLoading);
  const error = useAdminStore((s) => s.petsError);
  const fetchPets = useAdminStore((s) => s.fetchPets);
  const approvePet = useAdminStore((s) => s.approvePet);
  const rejectPet = useAdminStore((s) => s.rejectPet);

  const [statusFilter, setStatusFilter] = useState("");
  const [busyApprovalId, setBusyApprovalId] = useState(null);

  useEffect(() => {
    fetchPets({ status: statusFilter });
  }, [fetchPets, statusFilter]);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Pet Posts</h1>
          <p className="mt-1 text-sm font-semibold text-black/45">
            Review and moderate pet listing requests from owners.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-black/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--pa-primary))/20]"
        >
          {PET_STATUS_FILTER_OPTIONS.map((s) => (
            <option key={s || "all"} value={s}>
              {s || "All Statuses"}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <div className="pa-card mt-6 border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="pa-card mt-6 overflow-x-auto lg:overflow-hidden">
        <div className="min-w-[640px] lg:min-w-0">
          <div className="grid grid-cols-4 gap-2 bg-[rgb(var(--pa-primary))/4] px-6 py-4 text-[11px] font-extrabold tracking-wider text-black/40">
            <div>PET</div>
            <div>OWNER</div>
            <div>STATUS</div>
            <div className="text-right">ACTIONS</div>
          </div>

          <div className="divide-y divide-black/5">
            {pets.length === 0 ? (
              <div className="px-6 py-10 text-sm font-semibold text-black/45">
                {loading ? "Loading…" : "No pet posts."}
              </div>
            ) : (
              pets.map((row) => {
                const approvalId = adminApprovalRequestId(row);
                const key = approvalId ?? adminPetPostId(row);
                const pending = isPendingStatus(row.status);
                const busy = busyApprovalId === approvalId;

                return (
                  <div key={key} className="grid grid-cols-4 items-center gap-2 px-6 py-5">
                    <div className="text-sm font-extrabold">{row.name ?? "—"}</div>
                    <div className="text-sm font-semibold text-black/45">{row.owner ?? "—"}</div>
                    <div>
                      <StatusPill status={row.status} />
                    </div>
                    <div className="flex justify-end gap-2">
                      {pending && approvalId != null ? (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={async () => {
                              setBusyApprovalId(approvalId);
                              await approvePet(approvalId);
                              setBusyApprovalId(null);
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
                              setBusyApprovalId(approvalId);
                              await rejectPet(approvalId);
                              setBusyApprovalId(null);
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
