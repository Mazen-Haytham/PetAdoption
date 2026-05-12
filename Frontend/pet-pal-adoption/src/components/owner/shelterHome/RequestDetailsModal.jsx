import React, { useEffect, useState } from "react";
import { getAdopterAdoptionHistoryForShelter, resolveAssetUrl } from "../../../api/api";
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

function petPostSnapshot(row) {
  return row?.petPost ?? row?.PetPost ?? null;
}

function petNameFromHistoryRow(row) {
  const pp = petPostSnapshot(row);
  return pp?.name ?? pp?.Name ?? row?.pet?.name ?? row?.pet?.Name ?? "Unknown pet";
}

function imageUrlFromHistoryRow(row) {
  const pp = petPostSnapshot(row);
  if (pp) {
    const primary = pp.primaryImage ?? pp.PrimaryImage;
    if (primary) return resolveAssetUrl(primary);
    const imgs = pp.images ?? pp.Images;
    if (Array.isArray(imgs) && imgs.length > 0) return resolveAssetUrl(imgs[0]);
  }
  return null;
}

function formatHistoryError(err) {
  if (typeof err === "string") return err;
  if (err?.message) return err.message;
  return "Could not load adoption history.";
}

export default function RequestDetailsModal({ open, request, onClose }) {
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  const adopter = request?.adopter ?? {};
  const pet = request?.pet ?? {};
  const status = request?.status ?? "—";
  const createdAt = request?.createdAt;
  const adopterId = adopter?.id ?? adopter?.Id ?? request?.adopterId ?? request?.AdopterId;

  useEffect(() => {
    if (!open) {
      setHistory([]);
      setHistoryLoading(false);
      setHistoryError(null);
      return;
    }
    if (adopterId == null || adopterId === "") {
      setHistory([]);
      setHistoryError(null);
      return;
    }

    let alive = true;
    setHistoryLoading(true);
    setHistoryError(null);
    setHistory([]);

    getAdopterAdoptionHistoryForShelter(adopterId)
      .then((rows) => {
        if (!alive) return;
        setHistory(Array.isArray(rows) ? rows : []);
      })
      .catch((err) => {
        if (!alive) return;
        setHistoryError(formatHistoryError(err));
        setHistory([]);
      })
      .finally(() => {
        if (alive) setHistoryLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [open, adopterId]);

  if (!open || !request) return null;

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
                <InfoRow label="Applicant ID" value={adopter?.id ?? adopter?.Id} />
              </div>
            </div>

            <div className="pa-card p-5">
              <div className="text-sm font-extrabold">Pet</div>
              <div className="mt-3">
                <InfoRow label="Name" value={pet?.name} />
                <InfoRow label="Pet Post ID" value={pet?.id ?? pet?.Id} />
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

          <div className="mt-6 pa-card p-5">
            <div className="text-sm font-extrabold">Applicant adoption history</div>
            <p className="mt-1 text-xs font-semibold text-black/45">
              Completed adoptions recorded in Pet Pal (from any shelter).
            </p>

            {historyLoading ? (
              <div className="mt-4 text-sm font-semibold text-black/45">
                Loading history…
              </div>
            ) : historyError ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                {historyError}
              </div>
            ) : history.length === 0 ? (
              <div className="mt-4 text-sm font-semibold text-black/45">
                No completed adoptions on file yet.
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-black/5">
                {history.map((row) => {
                  const name = petNameFromHistoryRow(row);
                  const img = imageUrlFromHistoryRow(row);
                  const when = row?.adoptedAt ?? row?.AdoptedAt;
                  const st = row?.status ?? row?.Status ?? "—";
                  const key = `${name}-${when}-${st}`;
                  return (
                    <li key={key} className="flex items-center gap-4 py-4 first:pt-0">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-black/10">
                        {img ? (
                          <img
                            alt=""
                            className="h-full w-full object-cover"
                            src={img}
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-extrabold">{name}</div>
                        <div className="mt-0.5 text-xs font-semibold text-black/45">
                          {when ? formatWhen(when) : "—"}
                          {st ? ` · ${String(st)}` : ""}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
