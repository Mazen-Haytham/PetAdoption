import { useCallback, useEffect, useMemo, useState } from "react";
import * as signalR from "@microsoft/signalr";
import {
  acceptAdoptionRequest,
  createPetPost,
  deletePetPost,
  getMe,
  getMyPetPosts,
  getReceivedAdoptionRequests,
  ORIGIN_URL,
  rejectAdoptionRequest,
  resolveAssetUrl,
  updatePetPost,
} from "../api/api";
import { useAuthStore } from "../store/authStore";

export function useShelterDashboard() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [pets, setPets] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
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
    const myPets = await getMyPetPosts();
    setPets(Array.isArray(myPets) ? myPets : []);
  }, []);

  const createPetListing = useCallback(
    async (formData) => {
      await createPetPost(formData);
      await refreshPets();
    },
    [refreshPets],
  );

  const updatePetListing = useCallback(
    async (petPostId, body) => {
      await updatePetPost(petPostId, body);
      await refreshPets();
    },
    [refreshPets],
  );

  const deletePetListing = useCallback(
    async (petPostId) => {
      await deletePetPost(petPostId);
      setPets((prev) =>
        prev.filter(
          (p) =>
            (p?.petPostId ?? p?.PetPostId ?? p?.id) !== petPostId,
        ),
      );
      await refreshPets();
    },
    [refreshPets],
  );

useEffect(() => {
  let alive = true;
  (async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const orEmpty = (promise) =>
        promise.catch((e) => {
          if (e?.status === 404 || e === "No pet posts found") return [];
          console.log(JSON.stringify(e));
          throw e; // re-throw anything that's a real error
          
        });

      const [myPets, requests] = await Promise.all([
        orEmpty(getMyPetPosts()),
        orEmpty(getReceivedAdoptionRequests()),
      ]);

      if (!alive) return;
      setPets(Array.isArray(myPets) ? myPets : []);
      setReceivedRequests(Array.isArray(requests) ? requests : []);
    } catch (e) {
      if (alive) {
        setLoadError(e?.message || "Failed to load dashboard.");
        console.log(e?.message);
      }
    } finally {
      if (alive) setLoading(false);
    }
  })();
  return () => { alive = false; };
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
  const sortByDate = (a, b) =>
    new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime();

  const normalize = (s) => String(s ?? "").toLowerCase();

  const available = pets.filter((p) => normalize(p?.status) === "available").sort(sortByDate);
  const adopted   = pets.filter((p) => normalize(p?.status) === "adopted").sort(sortByDate);
  const pending   = pets.filter((p) => normalize(p?.status) === "pending").sort(sortByDate);

  const toPetRow = (p) => ({
    key:     p?.petPostId ?? p?.petPostID ?? p?.petId ?? p?.id ?? p?.name,
    petPostId: p?.petPostId ?? p?.PetPostId,
    name:    p?.name ?? "—",
    species: p?.type ?? "—",
    status:  p?.status ?? "—",
    date:    p?.createdAt ? 
      new Date(p.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
      : "—",
    avatar: resolveAssetUrl(p?.primaryImage) ?? null,
    raw: p,
  });

  return [...available, ...adopted, ...pending].map(toPetRow);
}, [pets]);

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
    refreshPets,
    createPetListing,
    updatePetListing,
    deletePetListing,
  };
}
