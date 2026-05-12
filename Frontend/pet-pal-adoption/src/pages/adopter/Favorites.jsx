import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getFavorites, removeFavorite, resolveAssetUrl } from "../../api/api";

function formatSavedAt(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export default function Favorites() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFavorites();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = typeof e === "string" ? e : e?.message ?? "Could not load favorites.";
      toast.error(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRemove(petPostId) {
    if (petPostId == null || removingId != null) return;
    setRemovingId(petPostId);
    try {
      const res = await removeFavorite(petPostId);
      if (res?.success === false) {
        toast.error(res.message || "Could not remove.");
        return;
      }
      setItems((prev) => prev.filter((p) => (p.id ?? p.Id) !== petPostId));
      toast.success("Removed from favorites.");
    } catch (e) {
      const msg = typeof e === "string" ? e : e?.message ?? "Could not remove.";
      toast.error(msg);
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <main className="pa-container pb-16 pt-8">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--pa-primary))]">
          Saved pets
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-black/90">
          My favorites
        </h1>
        <p className="mt-2 text-sm font-semibold text-black/45">
          {loading
            ? "Loading your list…"
            : items.length === 0
              ? "You have not saved any pets yet."
              : `${items.length} saved pet${items.length === 1 ? "" : "s"}.`}
        </p>
      </div>

      {loading ? (
        <div className="pa-card p-10 text-center text-sm font-semibold text-black/45">
          Loading favorites…
        </div>
      ) : null}

      {!loading && items.length === 0 ? (
        <div className="pa-card border border-dashed border-black/15 p-12 text-center">
          <p className="text-base font-extrabold text-black/80">No favorites yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-black/45">
            Browse available pets and use the heart on a card to save pets you
            are interested in.
          </p>
          <Link
            to="/adopter"
            className="mt-8 inline-flex rounded-2xl bg-[rgb(var(--pa-primary))] px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:brightness-95"
          >
            Browse pets
          </Link>
        </div>
      ) : null}

      {!loading && items.length > 0 ? (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((pet) => {
            const id = pet.id ?? pet.Id;
            const name = pet.name ?? pet.Name ?? "Pet";
            const breed = pet.breed ?? pet.Breed ?? "—";
            const type = pet.type ?? pet.Type ?? "—";
            const age = pet.age ?? pet.Age;
            const location = pet.location ?? pet.Location ?? "—";
            const rawImg = pet.image ?? pet.Image;
            const img = rawImg ? resolveAssetUrl(rawImg) : null;
            const savedAt = pet.savedAt ?? pet.SavedAt;
            const busy = removingId === id;

            return (
              <li key={id} className="pa-card flex flex-col overflow-hidden">
                <div className="aspect-[4/3] w-full bg-black/5">
                  {img ? (
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-semibold text-black/35">
                      No photo
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-lg font-extrabold tracking-tight text-black/90">{name}</h2>
                  <p className="mt-1 text-sm font-semibold text-black/45">
                    {type} · {breed}
                    {typeof age === "number" ? ` · ${age} yrs` : ""}
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-black/40">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-black/35" />
                    {location}
                  </p>
                  {savedAt ? (
                    <p className="mt-2 text-xs font-bold uppercase tracking-wide text-black/35">
                      Saved {formatSavedAt(savedAt)}
                    </p>
                  ) : null}

                  <div className="mt-4 flex flex-1 flex-col justify-end">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleRemove(id)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-3 text-sm font-extrabold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
                      {busy ? "Removing…" : "Remove from favorites"}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </main>
  );
}
