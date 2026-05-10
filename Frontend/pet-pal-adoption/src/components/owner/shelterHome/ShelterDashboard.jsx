import React from "react";
import { ClipboardIcon, HandshakeIcon, PawIcon } from "./OwnerIcons";
import StatCard from "./StatCard";
import StatusPill from "./StatusPill";

export default function ShelterDashboard({
  loading,
  loadError,
  stats,
  pets,
  showAllPets,
  onToggleShowAllPets,
  petRows,
  recentRequestItems,
  onOpenRequestDetails,
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Shelter Dashboard
        </h1>
        <p className="mt-1 text-sm font-semibold text-black/45">
          Manage your shelter&apos;s activity and pet listings efficiently.
        </p>
      </div>

      {loadError ? (
        <div className="pa-card mt-6 border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {loadError}
        </div>
      ) : null}

      <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<PawIcon />}
          label="Available Pets"
          value={loading ? "…" : String(stats.available)}
        />
        <StatCard
          icon={<ClipboardIcon />}
          label="Pending Adoptions"
          value={loading ? "…" : String(stats.pendingAdoptions)}
        />
        <StatCard
          icon={<HandshakeIcon />}
          label="Total Adopted"
          value={loading ? "…" : String(stats.adopted)}
        />
      </section>

      <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="pa-section-title">Active Pet Posts</h2>
            <button
              type="button"
              className="pa-link"
              onClick={onToggleShowAllPets}
              disabled={loading || pets.length <= 3}
            >
              {showAllPets ? "View Less" : "View All"}
            </button>
          </div>

          <div className="pa-card mt-4 overflow-x-auto lg:overflow-hidden">
            <div className="min-w-[600px] lg:min-w-0">
              <div className="grid grid-cols-5 gap-2 bg-[rgb(var(--pa-primary))/4] px-6 py-4 text-[11px] font-extrabold tracking-wider text-black/40">
                <div className="col-span-2">PET</div>
                <div>SPECIES</div>
                <div>STATUS</div>
                <div className="text-right">DATE POSTED</div>
              </div>

              <div className="divide-y divide-black/5">
                {petRows.length ? (
                  petRows.map((row) => (
                    <div
                      key={row.key}
                      className="grid grid-cols-5 items-center gap-2 px-6 py-5"
                    >
                      <div className="col-span-2 flex items-center gap-4">
                        <div className="h-10 w-10 overflow-hidden rounded-full bg-black/10">
                          {row.avatar ? (
                            <img
                              alt={`${row.name} avatar`}
                              className="h-full w-full object-cover"
                              src={row.avatar}
                            />
                          ) : null}
                        </div>
                        <div className="text-sm font-extrabold">{row.name}</div>
                      </div>
                      <div className="text-sm font-semibold text-black/45">
                        {row.species}
                      </div>
                      <div>
                        <StatusPill status={row.status} />
                      </div>
                      <div className="flex items-center justify-end gap-6">
                        <div className="text-sm font-semibold text-black/45">
                          {row.date}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-10 text-sm font-semibold text-black/45">
                    {loading ? "Loading pets…" : "No pet posts yet."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="pa-section-title">New Requests</h2>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-5">
            {recentRequestItems.length ? (
              recentRequestItems.map((r) => (
                <div key={r.key} className="pa-card p-5">
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 overflow-hidden rounded-full bg-black/10">
                      {r.avatar ? (
                        <img
                          alt={`${r.name} avatar`}
                          className="h-full w-full object-cover"
                          src={r.avatar}
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-extrabold">
                        {r.name}
                      </div>
                      <div className="mt-0.5 text-xs font-semibold text-black/45">
                        wants to adopt{" "}
                        <span className="font-bold text-[rgb(var(--pa-primary))]">
                          {r.petName}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] font-semibold text-black/35">
                        {r.time}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      className="pa-btn-primary flex-1"
                      onClick={() => onOpenRequestDetails(r.raw)}
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="pa-card p-5 text-sm font-semibold text-black/45">
                {loading ? "Loading requests…" : "No adoption requests yet."}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
