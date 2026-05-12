import React from "react";
import StatusPill from "./StatusPill";

export default function PetPostsTable({
  title,
  rows,
  loading,
  emptyMessage = "No pet posts yet.",
  showRowActions = false,
  onEdit,
  onDelete,
  deletingKey = null,
}) {
  const gridClass = showRowActions
    ? "grid-cols-[minmax(0,2fr)_minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(128px,auto)]"
    : "grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]";

  return (
    <div>
      <h2 className="pa-section-title">{title}</h2>

      <div className="pa-card mt-4 max-h-80 w-full flex flex-col overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
          <div className={showRowActions ? "min-w-[760px]" : "min-w-[640px]"}>
            <div
              className={`sticky top-0 z-10 grid ${gridClass} gap-2 bg-white px-6 py-4 text-[11px] font-extrabold tracking-wider text-black/40`}
            >
              <div className="min-w-0">PET</div>
              <div>SPECIES</div>
              <div>STATUS</div>
              <div className="text-right">DATE POSTED</div>
              {showRowActions ? <div className="text-right">ACTIONS</div> : null}
            </div>
            <div className="divide-y divide-black/5">
            {rows.length ? (
              rows.map((row) => {
                const adopted =
                  String(row.status ?? "").toLowerCase() === "adopted";
                const busy = deletingKey != null && row.key === deletingKey;
                return (
                  <div
                    key={row.key}
                    className={`grid ${gridClass} items-center gap-2 px-6 py-5`}
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-black/10">
                        {row.avatar ? (
                          <img
                            alt={`${row.name} avatar`}
                            className="h-full w-full object-cover"
                            src={row.avatar}
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 truncate text-sm font-extrabold">
                        {row.name}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-black/45">
                      {row.species}
                    </div>
                    <div>
                      <StatusPill status={row.status} />
                    </div>
                    <div className="text-right text-sm font-semibold text-black/45">
                      {row.date}
                    </div>
                    {showRowActions && !adopted ? (
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          className="rounded-lg px-2 py-1 text-xs font-extrabold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
                          onClick={() => onEdit?.(row)}
                          disabled={busy}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded-lg px-2 py-1 text-xs font-extrabold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                          onClick={() => onDelete?.(row)}
                          disabled={busy}
                          title="Delete listing"
                        >
                          Delete
                        </button>
                      </div>
                    ) : <div className="flex justify-end"><p className="text-black/50 text-sm">Unavailable</p></div>}
                  </div>
                );
              })
            ) : (
              <div className="px-6 py-10 text-sm font-semibold text-black/45">
                {loading ? "Loading…" : emptyMessage}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
