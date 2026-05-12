import ProfileHeaderCard from "../../components/adopterProfile/ProfileHeaderCard";
import ActiveApplicationsCard from "../../components/adopterProfile/ActiveApplicationsCard";
import AdoptionHistoryCard from "../../components/adopterProfile/AdoptionHistoryCard";
import { useEffect, useMemo, useState } from "react";
import {
  getAdoptionHistory,
  getMe,
  getMyAdoptionRequests,
  resolveAssetUrl,
} from "../../api/api";

function petPostSnapshot(row) {
  return row?.petPost ?? row?.PetPost ?? null;
}

function petNameFromAdoptionRow(row) {
  const pp = petPostSnapshot(row);
  return pp?.name ?? pp?.Name ?? row?.pet?.name ?? row?.petName ?? "Unknown Pet";
}

function imageUrlFromPetPostRow(row) {
  const pp = petPostSnapshot(row);
  if (pp) {
    const primary = pp.primaryImage ?? pp.PrimaryImage;
    if (primary) return resolveAssetUrl(primary);
    const imgs = pp.images ?? pp.Images;
    if (Array.isArray(imgs) && imgs.length > 0) return resolveAssetUrl(imgs[0]);
  }
  const rootPrimary = row?.primaryImage ?? row?.PrimaryImage;
  if (rootPrimary) return resolveAssetUrl(rootPrimary);
  return null;
}

function toTitleCaseStatus(status) {
  if (!status) return "Unknown";
  const s = String(status).toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

export default function AdopterProfile() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [me, myReq, myHistory] = await Promise.all([
          getMe(),
          getMyAdoptionRequests(),
          getAdoptionHistory(),
        ]);
        if (cancelled) return;
        setUser(me ?? null);
        setRequests(Array.isArray(myReq) ? myReq : []);
        setHistory(Array.isArray(myHistory) ? myHistory : []);
      } catch (e) {
        if (cancelled) return;
        setError(e?.message ?? "Failed to load profile data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const adopter = useMemo(() => {
    const name = user?.name ?? user?.Name ?? "Adopter";
    const email = user?.email ?? user?.Email ?? null;
    return {
      name,
      email,
      tierLabel: user?.role ?? user?.Role ?? null,
      adoptionsCount: history.length,
    };
  }, [user, history.length]);

  const activeApplications = useMemo(() => {
    const pending = requests.filter((r) => String(r?.status ?? "").toLowerCase() === "pending");
    return pending.map((r) => ({
      id: String(r.id ?? r.requestId ?? `${r?.pet?.id ?? ""}-${r?.createdAt ?? ""}`),
      petName: petNameFromAdoptionRow(r),
      imageUrl: imageUrlFromPetPostRow(r),
      subtitle: r?.createdAt ? `Applied ${formatDate(r.createdAt)}` : null,
      status: toTitleCaseStatus(r.status),
      trailingText: r?.createdAt ? formatDate(r.createdAt).toUpperCase() : "",
    }));
  }, [requests]);

  const adoptionHistoryItems = useMemo(() => {
    const decided = requests
      .filter((r) => {
        const s = String(r?.status ?? "").toLowerCase();
        return s && s !== "pending";
      })
      .map((r) => {
        const status = String(r?.status ?? "").toLowerCase();
        const petName = petNameFromAdoptionRow(r);
        const when = r?.createdAt ? formatDate(r.createdAt) : null;
        const secondary =
          status === "accepted"
            ? (when ? `Accepted ${when}` : "Accepted")
            : status === "rejected"
              ? (when ? `Rejected ${when}` : "Rejected")
              : (when ? `${toTitleCaseStatus(status)} ${when}` : toTitleCaseStatus(status));

        return {
          id: `req-${String(r.id ?? r.requestId ?? `${petName}-${r?.createdAt ?? ""}`)}`,
          petName,
          imageUrl: imageUrlFromPetPostRow(r),
          secondary,
          note: r?.notes ?? r?.note ?? (status ? `Status: ${toTitleCaseStatus(status)}` : null),
          _sortDate: r?.createdAt ?? null,
        };
      });

    const completed = history.map((h) => ({
      id: `hist-${String(h?.pet?.id ?? `${h?.adoptedAt ?? ""}-${h?.status ?? ""}`)}`,
      petName: petNameFromAdoptionRow(h),
      imageUrl: imageUrlFromPetPostRow(h),
      secondary: h?.adoptedAt ? `Adopted ${formatDate(h.adoptedAt)}` : "Adopted",
      note: h?.status ? `Status: ${toTitleCaseStatus(h.status)}` : null,
      _sortDate: h?.adoptedAt ?? null,
    }));

    const merged = [...decided, ...completed].sort((a, b) => {
      const ta = a._sortDate ? new Date(a._sortDate).getTime() : 0;
      const tb = b._sortDate ? new Date(b._sortDate).getTime() : 0;
      return tb - ta;
    });

    const seen = new Set();
    const deduped = [];
    for (const item of merged) {
      const key = `${item.petName}__${item.secondary}`;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(item);
    }

    return deduped.map(({ _sortDate, ...rest }) => rest);
  }, [history, requests]);

  const visibleAdoptionHistoryItems = useMemo(() => {
    return showAllHistory ? adoptionHistoryItems : adoptionHistoryItems.slice(0, 4);
  }, [adoptionHistoryItems, showAllHistory]);

  return (
    <main className="pa-container pb-12 pt-8">
      <ProfileHeaderCard adopter={adopter} />

      {loading ? (
        <div className="mt-8 pa-card p-6 text-sm text-black/55">Loading…</div>
      ) : error ? (
        <div className="mt-8 pa-card p-6 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200">
          {error}
        </div>
      ) : null}

      <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">
          <ActiveApplicationsCard items={activeApplications} />
          <AdoptionHistoryCard
            items={visibleAdoptionHistoryItems}
            canToggle={adoptionHistoryItems.length > 4}
            toggleLabel={showAllHistory ? "Show Recent" : "Show All"}
            onToggle={() => setShowAllHistory((v) => !v)}
          />
        </div>

        <div className="space-y-6" />
      </section>
    </main>
  );
}
