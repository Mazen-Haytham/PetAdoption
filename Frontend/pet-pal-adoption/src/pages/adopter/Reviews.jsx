import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";

const API_BASE = "https://localhost:7081/api";

export default function Reviews() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const [reviews, setReviews]         = useState([]);
  const [ownerIdInput, setOwnerIdInput] = useState("");
  const [adoptionId, setAdoptionId]   = useState("");
  const [rating, setRating]           = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment]         = useState("");
  const [alert, setAlert]             = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(false);

  function showAlert(msg, type = "error") {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  }

  // ── Rating Summary ─────────────────────────────
  function getAvg() {
    if (!reviews.length) return 0;
    return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  }

  function getRatingCount(n) {
    return reviews.filter((r) => r.rating === n).length;
  }

  // ── Load Reviews ───────────────────────────────
  async function loadReviews() {
    if (!ownerIdInput) { showAlert("Please enter an Owner ID."); return; }
    setLoadingReviews(true);
    try {
      const res = await fetch(`${API_BASE}/reviews/${ownerIdInput}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (data.success) setReviews(data.data || []);
      else showAlert(data.message || "Failed to load reviews.");
    } catch {
      showAlert("Could not connect to the server.");
    } finally {
      setLoadingReviews(false);
    }
  }

  // ── Submit Review ──────────────────────────────
  async function submitReview() {
    if (!adoptionId) { showAlert("Please enter Adoption ID."); return; }
    if (rating === 0) { showAlert("Please select a rating."); return; }
    if (!accessToken) { showAlert("You must be logged in."); return; }

    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ adoptionId: parseInt(adoptionId), rating, comment }),
      });
      const data = await res.json();
      if (data.success) {
        showAlert("Review posted successfully!", "success");
        setAdoptionId("");
        setComment("");
        setRating(0);
      } else {
        showAlert(data.message || "Failed to post review.");
      }
    } catch {
      showAlert("Could not connect to the server.");
    }
  }

  const avg = getAvg();

  return (
    <div className="min-h-screen bg-[#f7f5ff] px-6 md:px-40 py-10">
      {/* Alert */}
      {alert && (
        <div className={`mb-4 rounded-lg px-4 py-3 text-sm font-semibold ${alert.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {alert.msg}
        </div>
      )}

      {/* Rating Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-[#6a79e0]/10 flex flex-col md:flex-row gap-8 items-center mb-8">
        <div className="flex flex-col items-center px-8 md:border-r border-[#6a79e0]/10">
          <p className="text-6xl font-black text-[#2a2f63]">{reviews.length ? avg : "—"}</p>
          <div className="flex text-[#6a79e0] text-xl my-1">
            {[1,2,3,4,5].map((i) => (
              <span key={i}>{i <= Math.round(avg) ? "★" : "☆"}</span>
            ))}
          </div>
          <p className="text-slate-500 text-sm">{reviews.length} Verified Review{reviews.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex-1 w-full space-y-2">
          {[5,4,3,2,1].map((n) => {
            const pct = reviews.length ? Math.round((getRatingCount(n) / reviews.length) * 100) : 0;
            return (
              <div key={n} className="grid grid-cols-[20px_1fr_40px] items-center gap-3">
                <span className="text-sm text-slate-600 font-semibold">{n}</span>
                <div className="h-2.5 rounded-full bg-[#6a79e0]/10 overflow-hidden">
                  <div className="h-full rounded-full bg-[#6a79e0]" style={{ width: `${pct}%` }}></div>
                </div>
                <span className="text-xs text-slate-500 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Form */}
      <div className="bg-[#6a79e0]/5 rounded-xl p-8 border-2 border-dashed border-[#6a79e0]/30 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-[#2a2f63]">Share Your Experience</h3>
            <p className="text-slate-500 text-sm mt-1">Rate your adoption experience</p>
          </div>
          <span className="bg-[#6a79e0] text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">Eligible</span>
        </div>

        {/* Stars */}
        <div className="flex gap-1 text-[#6a79e0] text-3xl cursor-pointer mb-4">
          {[1,2,3,4,5].map((i) => (
            <span
              key={i}
              onClick={() => setRating(i)}
              onMouseEnter={() => setHoverRating(i)}
              onMouseLeave={() => setHoverRating(0)}
            >
              {i <= (hoverRating || rating) ? "★" : "☆"}
            </span>
          ))}
        </div>

        {/* Adoption ID */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-[#2a2f63]/80 block mb-1">Adoption ID</label>
          <input
            type="number"
            value={adoptionId}
            onChange={(e) => setAdoptionId(e.target.value)}
            placeholder="Enter your adoption ID"
            className="w-full border border-[#6a79e0]/20 rounded-lg px-4 py-2 text-[#2a2f63] focus:ring-2 focus:ring-[#6a79e0] outline-none"
          />
        </div>

        {/* Comment */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-[#2a2f63]/80 block mb-1">Your Review</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about the adoption process..."
            rows={3}
            className="w-full border border-[#6a79e0]/20 rounded-lg px-4 py-3 text-[#2a2f63] focus:ring-2 focus:ring-[#6a79e0] outline-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={submitReview}
            className="bg-[#6a79e0] text-white font-bold py-3 px-8 rounded-lg hover:brightness-110 transition shadow-lg"
          >
            Post Review →
          </button>
        </div>
      </div>

      {/* Load Reviews */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#2a2f63]">Community Feedback</h2>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={ownerIdInput}
            onChange={(e) => setOwnerIdInput(e.target.value)}
            placeholder="Owner ID"
            className="border border-[#6a79e0]/30 rounded px-3 py-1.5 w-28 text-sm outline-none focus:ring-2 focus:ring-[#6a79e0]"
          />
          <button
            onClick={loadReviews}
            className="bg-[#6a79e0] text-white text-xs font-bold px-4 py-2 rounded-lg hover:brightness-110 transition"
          >
            {loadingReviews ? "Loading..." : "Load"}
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="flex flex-col gap-6">
        {reviews.length === 0 && (
          <p className="text-slate-400 text-sm text-center">Enter an Owner ID above and click Load.</p>
        )}
        {reviews.map((r) => (
          <div key={r.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-[#6a79e0]/20 flex items-center justify-center text-[#6a79e0] font-bold text-lg">
                  {r.reviewer?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-bold text-[#2a2f63]">{r.reviewer || "Anonymous"}</p>
                  <p className="text-xs text-slate-400">{new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                </div>
              </div>
              <div className="text-[#6a79e0] text-lg">
                {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}