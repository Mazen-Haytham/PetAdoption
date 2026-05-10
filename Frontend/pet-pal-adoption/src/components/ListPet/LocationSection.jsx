// src/components/ListPet/LocationSection.jsx
import { MapPin } from "lucide-react";

export default function LocationSection({ location, onChange }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
          <MapPin className="w-4 h-4 text-indigo-500" />
        </div>
        <h2 className="text-sm font-semibold text-slate-800">Location</h2>
      </div>

      <label className="block text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-1.5">
        City or Shelter Address
      </label>
      <input
        type="text"
        value={location}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Cairo, Egypt"
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition mb-3"
      />

      {/* Map placeholder */}
      <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-100 relative">
        {/* Simulated map grid */}
        <svg
          viewBox="0 0 400 180"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="400" height="180" fill="#e8eaf0" />
          {/* Grid lines */}
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={i * 36}
              y1="0"
              x2={i * 36}
              y2="180"
              stroke="#d1d5db"
              strokeWidth="0.8"
            />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1="0"
              y1={i * 26}
              x2="400"
              y2={i * 26}
              stroke="#d1d5db"
              strokeWidth="0.8"
            />
          ))}
          {/* Some road-like elements */}
          <rect x="60" y="0" width="4" height="180" fill="#c8cbd4" rx="2" />
          <rect x="180" y="0" width="4" height="180" fill="#c8cbd4" rx="2" />
          <rect x="300" y="0" width="4" height="180" fill="#c8cbd4" rx="2" />
          <rect x="0" y="60" width="400" height="4" fill="#c8cbd4" rx="2" />
          <rect x="0" y="130" width="400" height="4" fill="#c8cbd4" rx="2" />
          {/* Pin */}
          <circle cx="200" cy="90" r="10" fill="#4f46e5" opacity="0.2" />
          <circle cx="200" cy="90" r="5" fill="#4f46e5" />
        </svg>

        {/* Overlay label */}
        {location && (
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-xs font-medium text-slate-700 px-2 py-1 rounded-lg shadow-sm">
            📍 {location}
          </div>
        )}
      </div>
    </div>
  );
}
