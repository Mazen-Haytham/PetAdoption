import { Mail, Phone, Plus } from "lucide-react";

function VetRow({ item, showDivider }) {
  return (
    <div className={`py-5 ${showDivider ? "border-b border-black/5" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="truncate text-sm font-extrabold">{item.name}</div>
            {item.label ? (
              <span className="pa-pill-neutral bg-[rgb(var(--pa-primary))] text-white">
                {item.label}
              </span>
            ) : null}
          </div>
          <div className="mt-1 text-xs text-black/45">{item.clinic}</div>
        </div>
      </div>

      <div className="mt-3 space-y-2 text-xs text-black/55">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-[rgb(var(--pa-primary))]" />
          <span>{item.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-[rgb(var(--pa-primary))]" />
          <span className="truncate">{item.email}</span>
        </div>
      </div>
    </div>
  );
}

export default function VetReferencesCard({ items }) {
  return (
    <section className="pa-card p-6">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-[rgb(var(--pa-primary))/10]">
          <Plus className="h-5 w-5 text-[rgb(var(--pa-primary))]" />
        </div>
        <h2 className="text-base font-extrabold tracking-tight">Veterinary Refs</h2>
      </div>

      <div className="mt-2">
        {items.map((item, idx) => (
          <VetRow
            key={item.id}
            item={item}
            showDivider={idx !== items.length - 1}
          />
        ))}
      </div>

      <button type="button" className="pa-btn-soft mt-4 w-full">
        Add Reference
      </button>
    </section>
  );
}

