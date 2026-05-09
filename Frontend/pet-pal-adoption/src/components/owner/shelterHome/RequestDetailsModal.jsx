import React from "react";
import { formatWhen } from "./utils";

function InfoRow({ label, value }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex items-start justify-between gap-6 border-b border-black/5 py-3">
      <div className="text-xs font-extrabold tracking-wide text-black/45">
        {label}
      </div>
      <div className="text-sm font-bold text-black/70">{String(value)}</div>
    </div>
  );
}

export default function RequestDetailsModal({ open, request, onClose }) {
  if (!open || !request) return null;

  const adopter = request?.adopter ?? {};
  const pet = request?.pet ?? {};
  const status = request?.status ?? "—";
  const createdAt = request?.createdAt;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/10">
        <div className="flex items-start justify-between gap-6 border-b border-black/5 px-6 py-5">
          <div className="min-w-0">
            <div className="text-lg font-extrabold tracking-tight">
              Adoption Request Details
            </div>
            <div className="mt-1 text-sm font-semibold text-black/45">
              {adopter?.name ? `${adopter.name} • ` : ""}
              {pet?.name ? `Applying for ${pet.name}` : "Application"}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="pa-btn inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-black/45 shadow-sm ring-1 ring-black/5 hover:bg-black/5"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="max-h-[70vh] overflow-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="pa-card p-5">
              <div className="text-sm font-extrabold">Applicant</div>
              <div className="mt-3">
                <InfoRow label="Name" value={adopter?.name} />
                <InfoRow label="Applicant ID" value={adopter?.id} />
              </div>
            </div>

            <div className="pa-card p-5">
              <div className="text-sm font-extrabold">Pet</div>
              <div className="mt-3">
                <InfoRow label="Name" value={pet?.name} />
                <InfoRow label="Pet Post ID" value={pet?.id} />
                <InfoRow label="Breed" value={request?.petBreed} />
              </div>
            </div>
          </div>

          <div className="mt-6 pa-card p-5">
            <div className="text-sm font-extrabold">Request</div>
            <div className="mt-3">
              <InfoRow label="Status" value={status} />
              <InfoRow label="Submitted" value={formatWhen(createdAt)} />
              <InfoRow label="Message" value={request?.message} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

