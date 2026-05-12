import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Star, X } from "lucide-react";
import {
  getAdoptionHistory,
  getMe,
  resolveAssetUrl,
} from "../../api/api";
import {
  appendClientReview,
  CLIENT_REVIEWS_CHANGED_EVENT,
  getReviewByAdoptionKey,
  loadAllClientReviews,
} from "../../utils/clientReviewsStorage";

function petPostFromRow(row) {
  return row?.petPost ?? row?.PetPost ?? null;
}

function petNameFromHistoryRow(row) {
  const pp = petPostFromRow(row);
  return (
    pp?.name ??
    pp?.Name ??
    row?.pet?.name ??
    row?.pet?.Name ??
    "Pet"
  );
}

function imageUrlFromHistoryRow(row) {
  const pp = petPostFromRow(row);
  if (pp) {
    const primary = pp.primaryImage ?? pp.PrimaryImage;
    if (primary) return resolveAssetUrl(primary);
    const imgs = pp.images ?? pp.Images;
    if (Array.isArray(imgs) && imgs.length > 0) return resolveAssetUrl(imgs[0]);
  }
  return null;
}

function adoptionKeyFromHistoryRow(row) {
  const pp = petPostFromRow(row) ?? {};
  const ownerId = pp.ownerId ?? pp.OwnerId;
  const petPostId = pp.petPostId ?? pp.PetPostId ?? row?.pet?.id ?? row?.pet?.Id;
  if (ownerId == null || petPostId == null) return null;
  return `${ownerId}:${petPostId}`;
}

function shelterLabelFromRow(row) {
  const pp = petPostFromRow(row) ?? {};
  return pp.ownerName ?? pp.OwnerName ?? "Shelter";
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export default function Reviews() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [adopterId, setAdopterId] = useState(null);
  const [adopterName, setAdopterName] = useState("");

  const [reviewKeysVersion, setReviewKeysVersion] = useState(0);
  const refreshLocalReviews = useCallback(() => {
    setReviewKeysVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "pa_client_reviews_v1") refreshLocalReviews();
    };
    const onCustom = () => refreshLocalReviews();
    window.addEventListener("storage", onStorage);
    window.addEventListener(CLIENT_REVIEWS_CHANGED_EVENT, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(CLIENT_REVIEWS_CHANGED_EVENT, onCustom);
    };
  }, [refreshLocalReviews]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [me, hist] = await Promise.all([getMe(), getAdoptionHistory()]);
        if (cancelled) return;
        const uid = me?.userId ?? me?.UserId;
        setAdopterId(uid != null ? Number(uid) : null);
        setAdopterName(me?.name ?? me?.Name ?? "");
        setHistory(Array.isArray(hist) ? hist : []);
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            typeof e === "string" ? e : e?.message ?? "Could not load adoptions.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const successfulAdoptions = useMemo(() => {
    return (Array.isArray(history) ? history : [])
      .map((row) => {
        const key = adoptionKeyFromHistoryRow(row);
        if (!key) return null;
        return {
          key,
          petName: petNameFromHistoryRow(row),
          imageUrl: imageUrlFromHistoryRow(row),
          shelterName: shelterLabelFromRow(row),
          adoptedAt: row?.adoptedAt ?? row?.AdoptedAt,
          raw: row,
        };
      })
      .filter(Boolean);
  }, [history]);

  const reviewedKeys = useMemo(() => {
    void reviewKeysVersion;
    const set = new Set();
    for (const r of loadAllClientReviews()) {
      if (r?.adoptionKey) set.add(r.adoptionKey);
    }
    return set;
  }, [reviewKeysVersion, successfulAdoptions]);

  const [modalAdoption, setModalAdoption] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const openModal = (item) => {
    setModalAdoption(item);
    const existing = getReviewByAdoptionKey(item.key);
    setRating(existing?.rating ?? 0);
    setComment(existing?.comment ?? "");
    setHoverRating(0);
  };

  const closeModal = () => {
    setModalAdoption(null);
    setRating(0);
    setHoverRating(0);
    setComment("");
    setSubmitting(false);
  };

  const submitReview = async () => {
    if (!modalAdoption) return;
    if (rating < 1 || rating > 5) {
      toast.error("Please choose a star rating.");
      return;
    }
    const pp = petPostFromRow(modalAdoption.raw) ?? {};
    const ownerId = pp.ownerId ?? pp.OwnerId;
    const petPostId = pp.petPostId ?? pp.PetPostId ?? modalAdoption.raw?.pet?.id;
    if (ownerId == null || petPostId == null) {
      toast.error("Missing listing data for this adoption.");
      return;
    }

    setSubmitting(true);
    try {
      appendClientReview({
        adoptionKey: modalAdoption.key,
        ownerId: Number(ownerId),
        petPostId: Number(petPostId),
        petName: modalAdoption.petName,
        shelterName: modalAdoption.shelterName,
        adopterId: adopterId ?? undefined,
        adopterName: adopterName || "Adopter",
        rating,
        comment: (comment || "").trim(),
      });
      toast.success("Thanks! Your review was sent to the shelter.");
      closeModal();
      refreshLocalReviews();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="pa-container pb-16 pt-8">
      <div className="max-w-6xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-black/90">
          My adoptions &amp; reviews
        </h1>
        <p className="mt-2 max-w-3xl text-sm font-semibold text-black/45">
          Every successful adoption appears below. Leave a star rating and an
          optional note for the shelter—they&apos;ll see it on their dashboard
          in this browser.
        </p>
      </div>

      {loading ? (
        <div className="mt-10 pa-card p-6 text-sm text-black/55">Loading…</div>
      ) : null}

      {!loading && loadError ? (
        <div className="mt-10 pa-card border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">
          {loadError}
        </div>
      ) : null}

      {!loading && !loadError && successfulAdoptions.length === 0 ? (
        <div className="mt-10 pa-card p-8 text-center text-sm font-semibold text-black/45">
          No completed adoptions yet. When a shelter accepts your application,
          the pet will show up here so you can leave a review.
        </div>
      ) : null}

      {!loading && !loadError && successfulAdoptions.length > 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {successfulAdoptions.map((item) => {
            const done = reviewedKeys.has(item.key);
            return (
              <li key={item.key} className="pa-card flex flex-col overflow-hidden">
                <div className="relative aspect-[5/3] w-full bg-black/5">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl text-black/20">
                      🐾
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-3">
                  <div>
                    <p className="text-base font-extrabold tracking-tight text-black/90">
                      {item.petName}
                    </p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-black/35">
                      {item.shelterName}
                    </p>
                    {item.adoptedAt ? (
                      <p className="mt-1.5 text-xs font-semibold text-black/45">
                        Adopted {formatDate(item.adoptedAt)}
                      </p>
                    ) : null}
                  </div>
                  <div className="mt-auto flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => openModal(item)}
                      className="pa-btn w-full rounded-xl bg-[rgb(var(--pa-primary))] px-3 py-2 text-xs font-extrabold text-white shadow-sm transition hover:brightness-95 sm:text-[13px]"
                    >
                      {done ? "View / update" : "Review"}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {modalAdoption ? (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 p-4 sm:items-center"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-dialog-title"
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-lg p-2 text-black/45 transition hover:bg-black/5 hover:text-black/70"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <h2
              id="review-dialog-title"
              className="pr-10 text-xl font-extrabold tracking-tight text-black/90"
            >
              Review {modalAdoption.petName}
            </h2>
            <p className="mt-1 text-sm font-semibold text-black/45">
              {modalAdoption.shelterName}
            </p>

            <p className="mt-6 text-sm font-bold text-black/55">Your rating</p>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => {
                const active = i <= (hoverRating || rating);
                return (
                  <button
                    key={i}
                    type="button"
                    className="p-1 text-amber-400 transition hover:scale-110"
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(i)}
                    aria-label={`${i} stars`}
                  >
                    <Star
                      className="h-9 w-9"
                      strokeWidth={1.5}
                      fill={active ? "currentColor" : "none"}
                    />
                  </button>
                );
              })}
            </div>

            <label className="mt-6 block text-sm font-bold text-black/55">
              Message{" "}
              <span className="font-semibold text-black/35">(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Share how the process went…"
              className="mt-2 w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black/80 outline-none ring-[rgb(var(--pa-primary))] focus:ring-2"
            />

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-2xl px-5 py-3 text-sm font-extrabold text-black/55 transition hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={submitReview}
                className="rounded-2xl bg-[rgb(var(--pa-primary))] px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:brightness-95 disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit review"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
