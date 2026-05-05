import TopNav from "./../../components/shared/TopNav";
import ProfileHeaderCard from "../../components/adopterProfile/ProfileHeaderCard";
import ActiveApplicationsCard from "../../components/adopterProfile/ActiveApplicationsCard";
import AdoptionHistoryCard from "../../components/adopterProfile/AdoptionHistoryCard";
import PageFooter from "./../../components/shared/PageFooter";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/authContext";
import { getAdoptionHistory, getMyAdoptionRequests } from "../../api/api";

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
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [myReq, myHistory] = await Promise.all([
          getMyAdoptionRequests(),
          getAdoptionHistory(),
        ]);
        if (cancelled) return;
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
    return requests.map((r) => ({
      id: String(r.id ?? r.requestId ?? `${r?.pet?.id ?? ""}-${r?.createdAt ?? ""}`),
      petName: r?.pet?.name ?? r?.petName ?? "Unknown Pet",
      subtitle: r?.createdAt ? `Applied ${formatDate(r.createdAt)}` : null,
      status: toTitleCaseStatus(r.status),
      trailingText: r?.createdAt ? formatDate(r.createdAt).toUpperCase() : "",
    }));
  }, [requests]);

  const adoptionHistoryItems = useMemo(() => {
    return history.map((h) => ({
      id: String(h?.pet?.id ?? `${h?.adoptedAt ?? ""}-${h?.status ?? ""}`),
      petName: h?.pet?.name ?? "Unknown Pet",
      secondary: h?.adoptedAt ? `Adopted ${formatDate(h.adoptedAt)}` : "Adopted",
      note: h?.status ? `Status: ${toTitleCaseStatus(h.status)}` : null,
    }));
  }, [history]);

  return (
    <div className="min-h-dvh">
      <TopNav brand="PawAdopt" />

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
            <AdoptionHistoryCard items={adoptionHistoryItems} />
          </div>

          <div className="space-y-6" />
        </section>
      </main>

      <PageFooter brand="PawAdopt" />
    </div>
  );
}

