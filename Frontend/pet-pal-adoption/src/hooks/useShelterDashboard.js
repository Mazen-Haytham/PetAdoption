import { useCallback, useEffect, useMemo, useState } from "react";
import * as signalR from "@microsoft/signalr";
import {
  acceptAdoptionRequest,
  getMe,
  getMyPetPosts,
  getReceivedAdoptionRequests,
  ORIGIN_URL,
  rejectAdoptionRequest,
  resolveAssetUrl,
} from "../api/api";
import { useAuthStore } from "../store/authStore";

export function useShelterDashboard() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [pets, setPets] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [showAllPets, setShowAllPets] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actingId, setActingId] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const accessToken = useAuthStore((s) => s.accessToken);

  const pushNotification = useCallback(({ petName }) => {
    const id =
      (typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID()) ||
      `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const newNotification = {
      id,
      petName: petName ?? "—",
      createdAt: Date.now(),
    };
    setNotifications((prev) => [...prev, newNotification]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 6000);
  }, []);

  const refreshRequests = useCallback(async () => {
    const requests = await getReceivedAdoptionRequests();
    setReceivedRequests(Array.isArray(requests) ? requests : []);
  }, []);

  const refreshPets = useCallback(async () => {
    const myPets = await getMyPetPosts()
    setPets(Array.isArray(myPets) ? myPets : [])
}, [])

  useEffect(() => {
    let alive = true;
    (async () => {
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
        if (alive) {
          setLoadError(e?.message || "Failed to load dashboard.");
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let connection;

    (async () => {
      const token = accessToken;
      if (!token) return;

      try {
        await getMe();
      } catch (e) {
        console.error("Failed to validate user for notifications:", e);
        return;
      }

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
        refreshRequests();
      });

      try {
        await connection.start();
      } catch {
        // If it fails (server down / cert / etc.), we just skip realtime.
      }
    })();

    return () => {
      if (connection) {
        connection.off("AdoptionRequestCreated");
        connection.stop().catch(() => {});
      }
    };
  }, [accessToken, pushNotification, refreshRequests]);

  const openDetails = (req) => {
    setSelectedRequest(req);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedRequest(null);
  };


  
  const handleAccept = async (req) => {
    const id = req?.id ?? req?.requestId ?? req?.adoptionRequestId
    const petPostId = req?.pet?.id
    if (!id) return
    setActingId(id)
    try {
        await acceptAdoptionRequest(id)
        await refreshRequests()

        //  Optimistic update only — NO refreshPets call
        setPets(prev => prev.map(p =>
            p?.petPostId === petPostId
                ? { ...p, status: 'Adopted' }
                : p
        ))
    } finally {
        setActingId(null)
    }
}


  const handleReject = async (req) => {
    const id = req?.id ?? req?.requestId ?? req?.adoptionRequestId;
    if (!id) return;
    setActingId(id);
    try {
      await rejectAdoptionRequest(id);
      await refreshRequests();
      await refreshPets()
    } finally {
      setActingId(null);
    }
  };

  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((x) => x.id !== id));
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

    const available = visible.filter((p) => String(p?.status).toLowerCase() === "available");
    const adopted = visible.filter((p) => String(p?.status).toLowerCase() === "adopted");

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
      date: p?.createdAt
        ? new Date(p.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "2-digit",
          })
        : "—",
      avatar: resolveAssetUrl(p?.primaryImage) ?? null,
    }));
  }, [pets, showAllPets]);

  const recentRequestItems = useMemo(() => {
    const pendingOnly = receivedRequests.filter(
      (r) => String(r?.status ?? "").toLowerCase() === "pending",
    );
    return pendingOnly.slice(0, 3).map((r) => ({
      key: r?.id ?? `${r?.adopter?.id}-${r?.pet?.id}`,
      raw: r,
      name: r?.adopter?.name ?? "—",
      petName: r?.pet?.name ?? "—",
      time: r?.createdAt
        ? new Date(r.createdAt).toLocaleString(undefined, {
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
      avatar: resolveAssetUrl(r?.primaryImage) ?? null,
    }));
  }, [receivedRequests]);

  return {
    loading,
    loadError,
    pets,
    receivedRequests,
    showAllPets,
    setShowAllPets,
    detailsOpen,
    selectedRequest,
    actingId,
    notifications,
    dismissNotification,
    openDetails,
    closeDetails,
    handleAccept,
    handleReject,
    stats,
    petRows,
    recentRequestItems,
  };
}
