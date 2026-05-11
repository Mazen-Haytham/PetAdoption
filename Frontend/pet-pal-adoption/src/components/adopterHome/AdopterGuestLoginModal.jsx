import { Link } from "react-router-dom";
import { X } from "lucide-react";

/** Shown when a guest taps “Request to adopt” — must sign in first. */
export default function AdopterGuestLoginModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/10"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-login-modal-title"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="guest-login-modal-title" className="text-lg font-extrabold tracking-tight">
            Adoption request
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-black/45 hover:bg-black/5 hover:text-black/70"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-4 text-sm font-semibold leading-relaxed text-black/55">
          Please login first
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border-2 border-black/10 py-3 text-sm font-extrabold text-black/55 hover:bg-black/5"
          >
            Cancel
          </button>
          <Link
            to="/login"
            className="pa-btn-primary flex flex-1 items-center justify-center py-3 text-center text-sm font-extrabold"
            onClick={onClose}
          >
            Go to login
          </Link>
        </div>
      </div>
    </div>
  );
}
