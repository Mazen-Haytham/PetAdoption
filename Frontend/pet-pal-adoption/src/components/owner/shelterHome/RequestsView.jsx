import React, { useMemo } from "react";
import { Trash2 } from "lucide-react";
import { resolveAssetUrl } from "../../../api/api";
import { formatWhen } from "./utils";

export default function RequestsView({
  loading,
  loadError,
  requests,
  onViewDetails,
  onAccept,
  onReject,
  actingId,
}) {
  const pending = useMemo(() => {
    return (Array.isArray(requests) ? requests : []).filter(
      (r) => String(r?.status ?? "pending").toLowerCase() === "pending",
    );
  }, [requests]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Adoption Requests
          </h1>
          <p className="mt-1 text-sm font-semibold text-black/45">
            Review and manage adoption applications.
          </p>
        </div>
      </div>

      {loadError ? (
        <div className="pa-card mt-6 border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {loadError}
        </div>
      ) : null}

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="pa-section-title">Pending Applications</h2>
          <div className="text-sm font-extrabold text-black/35">
            {loading ? "…" : `${pending.length} pending`}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-5">
          {pending.length ? (
            pending.map((r) => {
              const id = r?.id ?? r?.requestId ?? r?.adoptionRequestId;
              const adopter = r?.adopter ?? {};
              const pet = r?.pet ?? {};
              const avatar = resolveAssetUrl(r?.primaryImage) ?? null;
              const when = r?.createdAt;

              return (
                <div
                  key={String(id ?? `${adopter?.id}-${pet?.id}-${when}`)}
                  className="pa-card p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 overflow-hidden rounded-full bg-black/10">
                        {avatar ? (
                          <img
                            alt={`${adopter?.name ?? "Applicant"} avatar`}
                            className="h-full w-full object-cover"
                            src={avatar}
                          />
                        ) : null}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="truncate text-sm font-extrabold">
                            {adopter?.name ?? "—"}
                          </div>
                        </div>
                        <div className="mt-0.5 text-xs font-semibold text-black/45">
                          Applying for:{" "}
                          <span className="font-extrabold text-[rgb(var(--pa-primary))]">
                            {pet?.name ?? "—"}
                          </span>
                          {r?.petBreed ? ` (${r.petBreed})` : ""}
                        </div>
                        <div className="mt-1 text-[11px] font-semibold text-black/35">
                          Applied {formatWhen(when)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3">
                      <button
                        type="button"
                        className="pa-btn border hover:bg-black hover:text-white hover:border-transparent"
                        onClick={() => onViewDetails?.(r)}
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        className="pa-btn-primary"
                        onClick={() => onAccept?.(r)}
                        disabled={!id || actingId === id}
                      >
                        {actingId === id ? "Accepting…" : "Accept"}
                      </button>
                      <button
                        type="button"
                        className="pa-btn border text-red-500 hover:bg-red-500 hover:text-white"
                        aria-label="Reject"
                        onClick={() => onReject?.(r)}
                        disabled={!id || actingId === id}
                      >
                        <p className="mr-2">Reject</p>
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="pa-card p-5 text-sm font-semibold text-black/45">
              {loading ? "Loading requests…" : "No pending adoption requests."}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

