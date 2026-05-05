import React from "react";

export default function StatCard({ icon, label, value }) {
  return (
    <div className="pa-card flex items-start justify-between p-5">
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[rgb(var(--pa-primary))/10] text-[rgb(var(--pa-primary))]">
          {icon}
        </div>
        <div className="pt-1">
          <div className="text-xs font-bold text-black/45">{label}</div>
          <div className="mt-1 text-3xl font-extrabold tracking-tight">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

