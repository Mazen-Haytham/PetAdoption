import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Plus, Search } from "lucide-react";
import ShelterSidebar from "../../components/owner/ShelterSidebar";
import AvatarButton from "../../components/owner/shelterHome/AvatarButton";
import { ClipboardIcon, HandshakeIcon, PawIcon } from "../../components/owner/shelterHome/OwnerIcons";
import RequestDetailsModal from "../../components/owner/shelterHome/RequestDetailsModal";
import RequestsView from "../../components/owner/shelterHome/RequestsView";
import StatCard from "../../components/owner/shelterHome/StatCard";
import StatusPill from "../../components/owner/shelterHome/StatusPill";
import {
  acceptAdoptionRequest,
  getMyPetPosts,
  getReceivedAdoptionRequests,
  rejectAdoptionRequest,
  resolveAssetUrl,
} from "../../api/api";

export default function ShelterHome() {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [pets, setPets] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [showAllPets, setShowAllPets] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actingId, setActingId] = useState(null);

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

  const refreshRequests = async () => {
    const requests = await getReceivedAdoptionRequests();
    setReceivedRequests(Array.isArray(requests) ? requests : []);
  };

  const openDetails = (req) => {
    setSelectedRequest(req);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedRequest(null);
  };

  const handleAccept = async (req) => {
    const id = req?.id ?? req?.requestId ?? req?.adoptionRequestId;
    if (!id) return;
    setActingId(id);
    try {
      await acceptAdoptionRequest(id);
      await refreshRequests();
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (req) => {
    const id = req?.id ?? req?.requestId ?? req?.adoptionRequestId;
    if (!id) return;
    setActingId(id);
    try {
      await rejectAdoptionRequest(id);
      await refreshRequests();
    } finally {
      setActingId(null);
    }
  };

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
    const pendingOnly = receivedRequests.filter(
      (r) => String(r?.status ?? "").toLowerCase() === "pending",
    );
    return pendingOnly.slice(0, 3).map((r) => ({
      key: r?.id ?? `${r?.adopter?.id}-${r?.pet?.id}`,
      raw: r,
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

          {active === "requests" ? (
            <RequestsView
              loading={loading}
              loadError={loadError}
              requests={receivedRequests}
              onViewDetails={openDetails}
              onAccept={handleAccept}
              onReject={handleReject}
              actingId={actingId}
            />
          ) : (
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
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => navigate("/owner/pets/new")}
                        className="flex items-center gap-1.5 rounded-full bg-[rgb(var(--pa-primary))] px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:opacity-90 transition-opacity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        List a Pet
                      </button>
                      <button
                        type="button"
                        className="pa-link"
                        onClick={() => setShowAllPets((v) => !v)}
                        disabled={loading || pets.length <= 3}
                      >
                        {showAllPets ? "View Less" : "View All"}
                      </button>
                    </div>
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
                      {/* <span className="rounded-full bg-[rgb(var(--pa-primary))] px-3 py-1 text-[11px] font-extrabold text-white">
                        {loading ? "…" : `${Math.min(receivedRequests.length, 99)} NEW`}
                      </span> */}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-5">
                    {requests.length ? requests.map((r) => (
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
                              {r.message}
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
                            onClick={() => openDetails(r.raw)}
                          >
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
          )}
        </main>
      </div>

      <RequestDetailsModal
        open={detailsOpen}
        request={selectedRequest}
        onClose={closeDetails}
      />
    </div>
  );
}