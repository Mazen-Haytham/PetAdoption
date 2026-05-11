import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import useAdminStore from "../../store/useAdminStore";

/** Bell opens a small panel; "Clear all" empties the list (SignalR pushes new items here). */
export default function AdminNotificationBell() {
  const items = useAdminStore((s) => s.postNotifications);
  const clearAll = useAdminStore((s) => s.clearPostNotifications);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function onDocDown(e) {
      if (!open) return;
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);

  const count = items.length;

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-xl p-2.5 text-black/55 ring-1 ring-black/5 transition hover:bg-black/5 hover:text-black/80"
        aria-expanded={open}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {count > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white ring-2 ring-white">
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-black/10 bg-white py-2 shadow-lg ring-1 ring-black/5">
          <div className="border-b border-black/5 px-4 py-2 text-xs font-extrabold tracking-wide text-black/45">
            Notifications
          </div>
          <div className="max-h-72 overflow-y-auto">
            {count === 0 ? (
              <p className="px-4 py-6 text-sm font-semibold text-black/40">No new posts.</p>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  className="border-b border-black/5 px-4 py-3 text-sm font-semibold text-black/70 last:border-0"
                >
                  {n.message}
                  <div className="mt-1 text-[11px] font-semibold text-black/35">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
          {count > 0 ? (
            <div className="border-t border-black/5 p-2">
              <button
                type="button"
                className="w-full rounded-xl py-2 text-sm font-bold text-[rgb(var(--pa-primary))] hover:bg-black/5"
                onClick={() => {
                  clearAll();
                  setOpen(false);
                }}
              >
                Clear all
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
