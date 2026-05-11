import { MapPin } from "lucide-react";
import { resolveAssetUrl } from "../../api/api";

function petImage(pet) {
  const primary = pet?.primaryImage ?? pet?.PrimaryImage;
  if (primary) return resolveAssetUrl(primary);
  const imgs = pet?.images ?? pet?.Images;
  if (Array.isArray(imgs) && imgs.length > 0) return resolveAssetUrl(imgs[0]);
  return null;
}

function petPostId(pet) {
  return pet?.petPostId ?? pet?.PetPostId ?? pet?.id;
}

export default function AdopterPetCard({ pet, canRequestAdoption, onRequestAdopt, onRequestBlocked }) {
  const id = petPostId(pet);
  const img = petImage(pet);
  const name = pet?.name ?? pet?.Name ?? "Pet";
  const breed = pet?.breed ?? pet?.Breed ?? "—";
  const type = pet?.type ?? pet?.Type ?? "—";
  const age = pet?.age ?? pet?.Age;
  const location = pet?.location ?? pet?.Location ?? "—";
  const status = pet?.status ?? pet?.Status ?? "Available";

  return (
    <article className="pa-card flex flex-col overflow-hidden transition hover:ring-2 hover:ring-[rgb(var(--pa-primary))]/15">
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
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-extrabold tracking-tight">{name}</h2>
          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold capitalize text-emerald-700">
            {String(status).toLowerCase()}
          </span>
        </div>
        <p className="mt-1 text-sm font-semibold text-black/45">
          {type} · {breed}
          {typeof age === "number" ? ` · ${age} yrs` : ""}
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-black/40">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {location}
        </p>
        <div className="mt-4 flex flex-1 flex-col justify-end">
          <button
            type="button"
            onClick={() => {
              if (canRequestAdoption) onRequestAdopt(id, name);
              else onRequestBlocked?.();
            }}
            className="pa-btn-primary w-full py-3 text-sm font-extrabold"
          >
            Request to adopt
          </button>
        </div>
      </div>
    </article>
  );
}
