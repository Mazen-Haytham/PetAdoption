import PetAvatar from "./PetAvatar";

function StoryCard({ item }) {
  const bg = (() => {
    if(item.note?.includes("Rejected")) return "bg-red-200";
    if(item.note?.includes("Adopted") || 
       item.note?.includes("Completed") || 
       item.note?.includes("Accepted")) return "bg-green-200";

    return "bg-gray-200";
  })();
  return (
    <article className="pa-card p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-[rgb(var(--pa-primary))/10] p-1">
          <PetAvatar
            seed={item.petName}
            size={44}
            src={item.imageUrl}
            alt={item.petName ? `Photo of ${item.petName}` : "Pet"}
            roundedClass="rounded-full"
          />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-extrabold">{item.petName}</div>
          <div className="mt-0.5 text-xs font-semibold text-[rgb(var(--pa-primary))]">
            {item.secondary}
          </div>
        </div>
      </div>

      {item.note ? (
        <p className={`rounded-full ${bg} text-center mt-4 text-sm leading-6 text-black/70`}>{item.note}</p>
      ) : null}
    </article>
  );
}

export default function AdoptionHistoryCard({ items, canToggle = false, toggleLabel = "Show All", onToggle }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="pa-section-title">My Adoption History</h2>
        {canToggle ? (
          <button type="button" className="pa-link font-bold" onClick={onToggle}>
            {toggleLabel}
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {items.length ? (
          items.map((item) => <StoryCard key={item.id} item={item} />)
        ) : (
          <div className="pa-card p-6 text-sm text-black/45 sm:col-span-2">
            No adoption history yet.
          </div>
        )}
      </div>
    </section>
  );
}

