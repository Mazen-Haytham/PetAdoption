import React, { useEffect, useState } from "react";

export default function AdoptionToast({ petName, notificationId, onDismiss }) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    const t = setTimeout(() => {
      if (notificationId !== undefined && onDismiss) {
        onDismiss(notificationId);
      }
    }, 9000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [notificationId, onDismiss]);

  return (
    <div
      className={[
        "pointer-events-auto rounded-2xl border border-black/10 bg-white/95 px-4 py-3 shadow-lg backdrop-blur",
        "transition-all duration-300 ease-out",
        entered ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0",
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[rgb(var(--pa-primary))]" />
        <div className="min-w-0">
          <div className="text-sm font-extrabold text-black/80">
            A new Adoption Request has been made on{" "}
            <span className="text-[rgb(var(--pa-primary))]">{petName}</span>.
          </div>
        </div>
        <button
          type="button"
          className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full text-black/35 hover:bg-black/5"
          onClick={() => notificationId !== undefined && onDismiss?.(notificationId)}
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}
