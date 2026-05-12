import { useState } from "react";
import { X } from "lucide-react";

export default function AdopterAdoptModal({
  open,
  petName,
  onClose,
  onSubmit,
  submitting,
  error,
}) {
  const [message, setMessage] = useState(
    "I would love to give this pet a loving home. Please consider my application.",
  );

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await onSubmit(message.trim());
    if (ok) {
      setMessage(
        "I would love to give this pet a loving home. Please consider my application.",
      );
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/10"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="adopt-modal-title"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="adopt-modal-title" className="text-lg font-extrabold tracking-tight">
            Request to adopt {petName ? `“${petName}”` : "this pet"}
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
        <p className="mt-2 text-sm font-semibold text-black/45">
          The shelter will see your message with your request.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-extrabold tracking-wide text-black/40">
              MESSAGE
            </span>
            <textarea
              required
              minLength={10}
              maxLength={1000}
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-black/70 shadow-sm focus:border-[rgb(var(--pa-primary))]/30 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--pa-primary))]/15"
            />
          </label>

          {error ? (
            <p className="text-sm font-semibold text-rose-600">{error}</p>
          ) : null}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border-2 border-black/10 py-3 text-sm font-extrabold text-black/55 hover:bg-black/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="pa-btn-primary flex-1 py-3 text-sm font-extrabold disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Send request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
