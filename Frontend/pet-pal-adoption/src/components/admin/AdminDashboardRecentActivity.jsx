/** Approved posts list on dashboard (reads pre-filtered `rows` from parent). */
import { adminApprovalRequestId, adminPetPostId } from "../../admin/adminShared";

export default function AdminDashboardRecentActivity({
  loading,
  rows,
  onViewAll,
}) {
  return (
    <section className="mt-10">
      <div className="flex items-center justify-between">
        <h2 className="pa-section-title">Recent Activity</h2>
        <button type="button" className="pa-link" onClick={onViewAll}>
          View All
        </button>
      </div>

      <div className="pa-card mt-4 overflow-x-auto lg:overflow-hidden">
        <div className="min-w-[520px] lg:min-w-0">
          <div className="grid grid-cols-4 gap-2 bg-[rgb(var(--pa-primary))/4] px-6 py-4 text-[11px] font-extrabold tracking-wider text-black/40">
            <div className="col-span-2">PET</div>
            <div>OWNER</div>
            <div className="text-right">STATUS</div>
          </div>

          <div className="divide-y divide-black/5">
            {rows.length === 0 ? (
              <div className="px-6 py-10 text-sm font-semibold text-black/45">
                {loading ? "Loading activity…" : "No approved posts yet."}
              </div>
            ) : (
              rows.map((row) => {
                const key =
                  adminApprovalRequestId(row) ?? adminPetPostId(row) ?? row.name;
                return (
                  <div
                    key={key}
                    className="grid grid-cols-4 items-center gap-2 px-6 py-5"
                  >
                    <div className="col-span-2 text-sm font-extrabold">
                      {row.name ?? "—"}
                    </div>
                    <div className="text-sm font-semibold text-black/45">
                      {row.owner ?? "—"}
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                        Approved
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
