/**
 * One small file for admin-only stuff that is not React:
 *
 * - Filter dropdown values + default API query objects (used by the store + pages).
 * - Tiny helpers for API errors and pet-moderation row ids (used by the store + tables).
 *
 * You could move this into `useAdminStore.js` instead; it is separate so the store file
 * stays shorter and these pieces are easy to find.
 */

// --- Filter options (must match backend enum names) ---
export const PET_STATUS_FILTER_OPTIONS = ["", "Pending", "Approved", "Rejected"];
export const USER_ROLE_FILTER_OPTIONS = ["", "Admin", "Owner", "Adopter"];
export const USER_STATUS_FILTER_OPTIONS = ["", "Pending", "Approved", "Rejected"];

// --- Default GET /admin/pets shapes ---
export const DEFAULT_PETS_QUERY = { status: "", page: 1, pageSize: 50 };
export const DASHBOARD_PETS_QUERY = { status: "", page: 1, pageSize: 500 };

// --- API error text (axios may reject with a string or an object) ---
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

// --- Pet moderation row: approve/reject URL uses approval request id, not pet post id ---
export function adminApprovalRequestId(row) {
  return row?.approvalRequestId ?? row?.ApprovalRequestId;
}

export function adminPetPostId(row) {
  return row?.petPostId ?? row?.id;
}

export function isPendingStatus(value) {
  return String(value ?? "").toLowerCase() === "pending";
}
