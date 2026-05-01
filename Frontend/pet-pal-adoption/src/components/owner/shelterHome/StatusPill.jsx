import React, { useMemo } from "react";

export default function StatusPill({ status }) {
  const cls = useMemo(() => {
    const s = String(status || "").toLowerCase();
    if (s === "available") {
      return "bg-[rgb(var(--pa-primary))]/20 text-[rgb(var(--pa-primary))]";
    }
    if (s === "pending") return "bg-indigo-100 text-indigo-700";
    if (s === "adopted") return "bg-emerald-100 text-emerald-700";
    return "bg-black/5 text-black/55";
  }, [status]);

  return <span className={["pa-pill", cls].join(" ")}>{String(status)}</span>;
}

