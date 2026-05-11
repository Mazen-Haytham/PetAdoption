import PetAvatar from "./PetAvatar";
import StatusPill from "./StatusPill";

function Row({ item, showDivider }) {
  return (
    <div className={`flex items-center gap-4 py-5 ${showDivider ? "border-b border-black/5" : ""}`}>
      <PetAvatar
        seed={item.petName}
        size={54}
        src={item.imageUrl}
        alt={item.petName ? `Photo of ${item.petName}` : "Pet"}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="truncate text-sm font-extrabold">{item.petName}</div>
            {item.subtitle ? (
              <div className="mt-0.5 truncate text-xs text-black/45">{item.subtitle}</div>
            ) : null}
          </div>

          <div className="shrink-0">
            <StatusPill status={item.status} />
          </div>
        </div>
      </div>

      <div className="hidden w-36 shrink-0 text-right text-[11px] font-semibold tracking-wide text-black/35 sm:block">
        {item.trailingText}
      </div>
    </div>
  );
}

export default function ActiveApplicationsCard({ items }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="pa-section-title">Active Applications</h2>
        <button type="button" className="pa-link font-bold">
          View All
        </button>
      </div>

      <div className="pa-card overflow-hidden px-6">
        {items.length ? (
          items.map((item, idx) => (
            <Row
              key={item.id}
              item={item}
              showDivider={idx !== items.length - 1}
            />
          ))
        ) : (
          <div className="py-10 text-center text-sm text-black/45">
            No active applications yet.
          </div>
        )}
      </div>
    </section>
  );
}

