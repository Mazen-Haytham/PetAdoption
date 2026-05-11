/**
 * Small pure helpers for the admin module (no React).
 */

// ─── API errors (axios rejects with string or object) ─────────

export function apiErrorMessage(err) {
  if (typeof err === "string") return err;
  if (!err || typeof err !== "object") return "Something went wrong.";
  if (typeof err.message === "string" && err.message) return err.message;
  if (typeof err.Message === "string" && err.Message) return err.Message;
  if (typeof err.title === "string" && err.detail)
    return `${err.title}: ${err.detail}`;
  if (typeof err.title === "string") return err.title;
  if (err.success === false && !err.message && !err.Message)
    return "Request failed (e.g. not found or already processed).";
  return "Something went wrong.";
}

// ─── Pet moderation rows (backend: approval request + pet post) ─

/** PUT approve/reject uses this id (PostApprovalRequest), not pet post id. */
export function adminApprovalRequestId(row) {
  return row?.approvalRequestId ?? row?.ApprovalRequestId;
}

/** Pet post id when present (keys / display). */
export function adminPetPostId(row) {
  return row?.petPostId ?? row?.id;
}

export function isPendingStatus(value) {
  return String(value ?? "").toLowerCase() === "pending";
}
