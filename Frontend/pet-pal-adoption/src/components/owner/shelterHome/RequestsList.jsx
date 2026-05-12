import React from "react";

export default function RequestsList({
  title,
  items,
  loading,
  onOpenDetails,
  emptyMessage = "No adoption requests yet.",
}) {
  return (
    <div className="w-full">
      <h2 className="pa-section-title">{title}</h2>

      <div className="mt-4 flex max-h-80 w-full flex-col gap-5 overflow-y-auto">
        {items.length ? (
          items.map((r) => (
            <div key={r.key} className="pa-card p-5">
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 overflow-hidden rounded-full bg-black/10">
                  {r.avatar ? (
                    <img
                      alt={`${r.name} avatar`}
                      className="h-full w-full object-cover"
                      src={r.avatar}
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-extrabold">
                    {r.name}
                  </div>
                  <div className="mt-0.5 text-xs font-semibold text-black/45">
                    wants to adopt{" "}
                    <span className="font-bold text-[rgb(var(--pa-primary))]">
                      {r.petName}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] font-semibold text-black/35">
                    {r.time}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  className="pa-btn-primary flex-1"
                  onClick={() => onOpenDetails(r.raw)}
                >
                  Review
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="pa-card p-5 text-sm font-semibold text-black/45">
            {loading ? "Loading requests…" : emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
}
