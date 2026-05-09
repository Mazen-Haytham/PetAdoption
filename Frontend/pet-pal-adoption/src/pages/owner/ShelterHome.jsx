import React, { useEffect, useMemo, useState } from "react";
import { Bell, Search } from "lucide-react";
import * as signalR from "@microsoft/signalr";
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
  getCurrentUser,
  ORIGIN_URL,
  rejectAdoptionRequest,
  resolveAssetUrl,
} from "../../api/api";

export default function ShelterHome() {
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [pets, setPets] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [showAllPets, setShowAllPets] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actingId, setActingId] = useState(null);

  const [notifications, setNotifications] = useState([]);

  const pushNotification = ({ petName }) => {
    const id =
      (typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID()) ||
      `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setNotifications((prev) => [
      ...prev,
      {
        id,
        petName: petName ?? "—",
        createdAt: Date.now(),
      },
    ]);
  };

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

  useEffect(() => {
    let connection;

    const start = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      // ShelterHome is owner-only, but even if role mismatches we can no-op.
      const user = getCurrentUser();
      if (!user) return;

      connection = new signalR.HubConnectionBuilder()
        .withUrl(`${ORIGIN_URL}/hubs/notifications`, {
          accessTokenFactory: () => token,
          withCredentials: true,
        })
        .withAutomaticReconnect()
        .build();

      connection.on("AdoptionRequestCreated", (payload) => {
        const petName = payload?.petName ?? payload?.PetName;
        pushNotification({ petName });
      });

      try {
        await connection.start();
      } catch {
        // If it fails (server down / cert / etc.), we just skip realtime.
      }
    };

    start();

    return () => {
      if (connection) {
        connection.off("AdoptionRequestCreated");
        connection.stop().catch(() => {});
      }
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
    
    // Separate into available and adopted
    const available = visible.filter((p) => String(p?.status).toLowerCase() === "available");
    const adopted = visible.filter((p) => String(p?.status).toLowerCase() === "adopted");
    
    // Sort each group by date (newest first)
    const sortByDate = (a, b) => {
      const dateA = new Date(a?.createdAt || 0).getTime();
      const dateB = new Date(b?.createdAt || 0).getTime();
      return dateB - dateA;
    };
    
    const sorted = [...available.sort(sortByDate), ...adopted.sort(sortByDate)];
    
    return sorted.map((p) => ({
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
      <div className="pointer-events-none fixed left-1/2 top-4 z-[60] w-[min(560px,calc(100vw-2rem))] -translate-x-1/2">
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <AdoptionToast
              key={n.id}
              petName={n.petName}
              onClose={() => setNotifications((prev) => prev.filter((x) => x.id !== n.id))}
            />
          ))}
        </div>
      </div>

      <div className="flex min-h-screen">
        <ShelterSidebar 
          activeKey={active} 
          onSelect={(key) => {
            setActive(key);
            setSidebarOpen(false);
          }}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

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
                    <button
                      type="button"
                      className="pa-link"
                      onClick={() => setShowAllPets((v) => !v)}
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

function AdoptionToast({ petName, onClose }) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    const t = setTimeout(() => onClose?.(), 9000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [onClose]);

  return (
    <div
      className={[
        "pointer-events-auto rounded-2xl border border-black/10 bg-white/95 px-4 py-3 shadow-lg backdrop-blur",
        "transition-all duration-300 ease-out",
        entered ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0",
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[rgb(var(--pa-primary))]" />
        <div className="min-w-0">
          <div className="text-sm font-extrabold text-black/80">
            A new Adoption Request has been made on{" "}
            <span className="text-[rgb(var(--pa-primary))]">{petName}</span>.
          </div>
          <div className="mt-0.5 text-xs font-semibold text-black/50">
            Refresh or go the Adoptions tab to view the request
          </div>
        </div>
        <button
          type="button"
          className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full text-black/35 hover:bg-black/5"
          onClick={onClose}
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}