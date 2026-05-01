import React, { useEffect, useMemo, useState } from "react";
import { Bell, Search } from "lucide-react";
import ShelterSidebar from "../../components/owner/ShelterSidebar";
import {
  getMyPetPosts,
  getReceivedAdoptionRequests,
  resolveAssetUrl,
} from "../../api/api";

function StatCard({ icon, label, value, delta, deltaLabel }) {
  return (
    <div className="pa-card flex items-start justify-between p-5">
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[rgb(var(--pa-primary))/10] text-[rgb(var(--pa-primary))]">
          {icon}
        </div>
        <div className="pt-1">
          <div className="text-xs font-bold text-black/45">{label}</div>
          <div className="mt-1 text-3xl font-extrabold tracking-tight">
            {value}
          </div>
        </div>
      </div>

      {deltaLabel ? (
        <span className="pa-pill bg-emerald-100 text-emerald-700">
          {deltaLabel}
        </span>
      ) : (
        <span className="pa-pill bg-emerald-100 text-emerald-700">{delta}</span>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const cls = useMemo(() => {
    const s = String(status || "").toLowerCase();
    if (s === "available") return "bg-emerald-100 text-emerald-700";
    if (s === "pending") return "bg-indigo-100 text-indigo-700";
    if (s === "adopted") return "bg-black/5 text-black/55";
    return "bg-black/5 text-black/55";
  }, [status]);

  return (
    <span className={["pa-pill", cls].join(" ")}>{String(status)}</span>
  );
}

function AvatarButton() {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-3 rounded-full bg-white px-2 py-1.5 shadow-sm ring-1 ring-black/5 hover:bg-black/5"
      aria-label="Account"
    >
      <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-black/10">
        <img
          alt="User avatar"
          className="h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
        />
      </div>
    </button>
  );
}

export default function ShelterHome() {
  const [active, setActive] = useState("dashboard");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [pets, setPets] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [showAllPets, setShowAllPets] = useState(false);

  useEffect(() => {
    let alive = true;
    async function run() {
      setLoading(true);
      setLoadError(null);
      try {
        const [myPets, requests] = await Promise.all([
          getMyPetPosts(),
          getReceivedAdoptionRequests(),
        ]);
        if (!alive) return;
        setPets(Array.isArray(myPets) ? myPets : []);
        setReceivedRequests(Array.isArray(requests) ? requests : []);
      } catch (e) {
        if (alive) setLoadError(e?.message || "Failed to load dashboard.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, []);

  const stats = useMemo(() => {
    const available = pets.filter((p) => String(p?.status).toLowerCase() === "available").length;
    const adopted = pets.filter((p) => String(p?.status).toLowerCase() === "adopted").length;
    const pendingAdoptions = receivedRequests.filter(
      (r) => String(r?.status).toLowerCase() === "pending",
    ).length;
    return {
      available,
      pendingAdoptions,
      adopted,
      volunteers: 0,
    };
  }, [pets, receivedRequests]);

  const petRows = useMemo(() => {
    const visible = showAllPets ? pets : pets.slice(0, 3);
    return visible.map((p) => ({
      key: p?.petPostId ?? p?.petPostID ?? p?.petId ?? p?.id ?? p?.name,
      name: p?.name ?? "—",
      species: p?.type ?? "—",
      status: p?.status ?? "—",
      date: p?.createdAt ? new Date(p.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }) : "—",
      action: String(p?.status).toLowerCase() === "adopted" ? "View" : "Edit",
      avatar: resolveAssetUrl(p?.primaryImage) ?? null,
    }));
  }, [pets, showAllPets]);

  const requests = useMemo(() => {
    return receivedRequests.slice(0, 3).map((r) => ({
      key: r?.id ?? `${r?.adopter?.id}-${r?.pet?.id}`,
      name: r?.adopter?.name ?? "—",
      message: (
        <>
          wants to adopt{" "}
          <span className="font-bold text-[rgb(var(--pa-primary))]">
            {r?.pet?.name ?? "—"}
          </span>
        </>
      ),
      time: r?.createdAt
        ? new Date(r.createdAt).toLocaleString(undefined, {
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
      primary: "Review",
      avatar: resolveAssetUrl(r?.primaryImage) ?? null,
    }));
  }, [receivedRequests]);

  return (
    <div className="min-h-screen bg-[rgb(var(--pa-bg))]">
      <div className="flex min-h-screen">
        <ShelterSidebar activeKey={active} onSelect={setActive} />

        <main className="flex-1">
          <header className="border-[rgb(var(--pa-primary))]/20 top-0 z-10 border-b backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
                <input
                  className="h-11 w-full rounded-full bg-white px-10 text-sm font-semibold text-black/60 shadow-sm ring-1 ring-black/5 placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--pa-primary))/20]"
                  placeholder="Search pets, applications..."
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="pa-icon-btn"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5 text-black/55" />
                </button>
                <AvatarButton />
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-6xl px-6 py-10">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Dashboard Overview
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
                delta="+2%"
              />
              <StatCard
                icon={<ClipboardIcon />}
                label="Pending Adoptions"
                value={loading ? "…" : String(stats.pendingAdoptions)}
                delta="+5%"
              />
              <StatCard
                icon={<HandshakeIcon />}
                label="Total Adopted"
                value={loading ? "…" : String(stats.adopted)}
                delta="+10%"
              />
              
            </section>

            <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between">
                  <h2 className="pa-section-title">Active Pet Posts</h2>
                  <button
                    type="button"
                    className="pa-link"
                    onClick={() => setShowAllPets((v) => !v)}
                    disabled={loading || pets.length <= 3}
                  >
                    {showAllPets ? "View Less" : "View All"}
                  </button>
                </div>

                <div className="pa-card mt-4 overflow-hidden">
                  <div className="grid grid-cols-5 gap-2 bg-[rgb(var(--pa-primary))/4] px-6 py-4 text-[11px] font-extrabold tracking-wider text-black/40">
                    <div className="col-span-2">PET</div>
                    <div>SPECIES</div>
                    <div>STATUS</div>
                    <div className="text-right">DATE POSTED</div>
                  </div>

                  <div className="divide-y divide-black/5">
                    {petRows.length ? petRows.map((row) => (
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
                          <button
                            type="button"
                            className="text-sm font-extrabold text-[rgb(var(--pa-primary))] hover:opacity-90"
                          >
                            {row.action}
                          </button>
                        </div>
                      </div>
                    )) : (
                      <div className="px-6 py-10 text-sm font-semibold text-black/45">
                        {loading ? "Loading pets…" : "No pet posts yet."}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="pa-section-title">New Requests</h2>
                    <span className="rounded-full bg-[rgb(var(--pa-primary))] px-3 py-1 text-[11px] font-extrabold text-white">
                      {loading ? "…" : `${Math.min(receivedRequests.length, 99)} NEW`}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-5">
                  {requests.length ? requests.map((r) => (
                    <div key={r.name} className="pa-card p-5">
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
                            {r.message}
                          </div>
                          <div className="mt-1 text-[11px] font-semibold text-black/35">
                            {r.time}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-3">
                        <button type="button" className="pa-btn-primary flex-1">
                          {r.primary}
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-black/35 shadow-sm ring-1 ring-black/5 hover:bg-black/5"
                          aria-label="Dismiss"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="pa-card p-5 text-sm font-semibold text-black/45">
                      {loading ? "Loading requests…" : "No adoption requests yet."}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function PawIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 13.2c-2.7 0-4.8 1.6-5.8 3.2-.9 1.4 0 3.3 1.7 3.6 1.1.2 2.4.0 4.1-.6.7-.2 1.4-.2 2.1 0 1.7.6 3 .8 4.1.6 1.7-.3 2.6-2.2 1.7-3.6-1-1.6-3.1-3.2-5.8-3.2Z" />
      <path d="M8.2 12.3c-1.2 0-2.2-1.3-2.2-2.8S7 6.8 8.2 6.8s2.2 1.3 2.2 2.8-1 2.7-2.2 2.7Zm7.6 0c-1.2 0-2.2-1.2-2.2-2.7 0-1.5 1-2.8 2.2-2.8s2.2 1.2 2.2 2.7-1 2.8-2.2 2.8ZM6.4 13.6c-1 0-1.9-1-1.9-2.2s.9-2.2 1.9-2.2 1.9 1 1.9 2.2-.9 2.2-1.9 2.2Zm11.2 0c-1 0-1.9-1-1.9-2.2s.9-2.2 1.9-2.2 1.9 1 1.9 2.2-.9 2.2-1.9 2.2Z" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9 3a2 2 0 0 0-2 2H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1a2 2 0 0 0-2-2H9Zm0 2h6v2H9V5Zm1 7h8v2h-8v-2Zm0 4h6v2h-6v-2Z" />
    </svg>
  );
}

function HandshakeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M7.7 10.2 5 7.6 2.4 10.2l3.4 3.4c.5.5 1.3.5 1.8 0l.8-.8c.5-.5.5-1.3 0-1.8l-1-1Zm13.9 0L19 7.6l-2.6 2.6-1 1c-.5.5-.5 1.3 0 1.8l.8.8c.5.5 1.3.5 1.8 0l3.5-3.4ZM9 12.7l2.2-2.2c.5-.5 1.3-.5 1.8 0l2.2 2.2c.5.5.5 1.3 0 1.8l-2 2c-.7.7-1.9.7-2.6 0l-2-2c-.5-.5-.5-1.3 0-1.8Z" />
    </svg>
  );
}

function VolunteerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z" />
    </svg>
  );
}

