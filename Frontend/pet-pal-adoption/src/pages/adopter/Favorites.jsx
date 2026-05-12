import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";

const API_BASE = "https://localhost:7081/api";

export default function Favorites() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [alert, setAlert]         = useState(null);
  const [filter, setFilter]       = useState("all");

  function showAlert(msg, type = "error") {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  }

  // ── Load Favorites ─────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/favorites`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        if (data.success) setFavorites(data.data || []);
        else showAlert(data.message || "Failed to load favorites.");
      } catch {
        showAlert("Could not connect to the server.");
      } finally {
        setLoading(false);
      }
    }
    if (accessToken) load();
  }, [accessToken]);

  // ── Remove Favorite ────────────────────────────
  async function removeFavorite(petPostId) {
    try {
      const res = await fetch(`${API_BASE}/favorites/${petPostId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setFavorites((prev) => prev.filter((p) => p.id !== petPostId));
        showAlert("Removed from favorites.", "success");
      } else {
        showAlert(data.message || "Failed to remove.");
      }
    } catch {
      showAlert("Could not connect to the server.");
    }
  }

  // ── Filter ─────────────────────────────────────
  const filtered =
    filter === "all"
      ? favorites
      : filter === "other"
      ? favorites.filter((p) => !["dog", "cat"].includes(p.type?.toLowerCase()))
      : favorites.filter((p) => p.type?.toLowerCase() === filter);

  const dogs  = favorites.filter((p) => p.type?.toLowerCase() === "dog").length;
  const cats  = favorites.filter((p) => p.type?.toLowerCase() === "cat").length;
  const other = favorites.filter((p) => !["dog","cat"].includes(p.type?.toLowerCase())).length;

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-primary font-semibold text-lg">Loading favorites...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f7f5ff] px-6 md:px-20 py-10">
      {/* Alert */}
      {alert && (
        <div className={`mb-4 rounded-lg px-4 py-3 text-sm font-semibold ${alert.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {alert.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">❤ Saved for later</p>
          <h1 className="text-3xl font-extrabold text-[#2a2f63]">My Favorites</h1>
          <p className="text-slate-500 mt-1">You have {favorites.length} pet{favorites.length !== 1 ? "s" : ""} saved.</p>
        </div>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 rounded-xl bg-[#6a79e0] text-white font-bold text-sm shadow hover:brightness-110 transition"
        >
          ← Back to Search
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-8 border-b border-[#6a79e0]/20 mb-8">
        {[
          { key: "all",   label: `All Pets (${favorites.length})` },
          { key: "dog",   label: `Dogs (${dogs})` },
          { key: "cat",   label: `Cats (${cats})` },
          { key: "other", label: `Other (${other})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              filter === tab.key
                ? "border-[#6a79e0] text-[#6a79e0]"
                : "border-transparent text-slate-400 hover:text-[#2a2f63]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {favorites.length === 0 && (
        <div className="flex flex-col items-center py-20 gap-3 text-center">
          <p className="text-5xl">💔</p>
          <h2 className="text-2xl font-extrabold text-[#2a2f63]">No favorites yet</h2>
          <p className="text-slate-500">Start exploring pets and save your favorites!</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((pet) => {
          const imgSrc = pet.image
            ? pet.image.startsWith("http") ? pet.image : `https://localhost:7081${pet.image}`
            : `https://placehold.co/400x500/e0e7ff/6a79e0?text=${encodeURIComponent(pet.name)}`;

          const statusColor =
            pet.status?.toLowerCase() === "available" ? "bg-emerald-500" :
            pet.status?.toLowerCase() === "pending"   ? "bg-amber-500"   : "bg-slate-500";

          return (
            <div key={pet.id} className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition border border-[#6a79e0]/5">
              <div className="relative aspect-[4/5] overflow-hidden">
                <img src={imgSrc} alt={pet.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"/>
                <button
                  onClick={() => removeFavorite(pet.id)}
                  className="absolute top-4 right-4 size-10 rounded-full bg-white/90 text-[#6a79e0] flex items-center justify-center shadow hover:scale-110 transition"
                  title="Remove from favorites"
                >
                  ❤
                </button>
                <span className={`absolute bottom-4 left-4 px-3 py-1 rounded-lg text-white text-[10px] font-bold uppercase ${statusColor}`}>
                  {pet.status}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-extrabold text-[#2a2f63]">{pet.name}</h3>
                <p className="text-slate-500 text-sm mt-1">{pet.breed} • {pet.age} yr{pet.age !== 1 ? "s" : ""}</p>
                <button className="mt-4 w-full py-3 bg-[#6a79e0]/10 text-[#6a79e0] font-bold text-sm rounded-xl hover:bg-[#6a79e0] hover:text-white transition">
                  {pet.status?.toLowerCase() === "pending" ? "Check Status" : "View Profile"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}