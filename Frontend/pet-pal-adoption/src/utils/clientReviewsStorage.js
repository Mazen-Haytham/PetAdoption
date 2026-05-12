const STORAGE_KEY = "pa_client_reviews_v1";
export const CLIENT_REVIEWS_CHANGED_EVENT = "pa-client-reviews-changed";

function notifyClientReviewsChanged() {
  window.dispatchEvent(new CustomEvent(CLIENT_REVIEWS_CHANGED_EVENT));
}

export function loadAllClientReviews() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** @param {object} entry */
export function appendClientReview(entry) {
  const list = loadAllClientReviews();
  const key = entry?.adoptionKey;
  const next = key ? list.filter((r) => r.adoptionKey !== key) : [...list];
  next.unshift({
    ...entry,
    submittedAt: entry?.submittedAt ?? new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  notifyClientReviewsChanged();
  return next;
}

export function getReviewByAdoptionKey(adoptionKey) {
  return loadAllClientReviews().find((r) => r.adoptionKey === adoptionKey) ?? null;
}

export function getReviewsForOwner(ownerId) {
  const id = Number(ownerId);
  if (Number.isNaN(id)) return [];
  return loadAllClientReviews().filter((r) => Number(r.ownerId) === id);
}
