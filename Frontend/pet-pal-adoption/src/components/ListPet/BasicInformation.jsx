// src/components/ListPet/BasicInformation.jsx
import { FileText } from "lucide-react";

const ANIMAL_TYPES = ["Dog", "Cat", "Bird", "Rabbit", "Hamster", "Other"];
const HEALTH_OPTIONS = ["Vaccinated", "Neutered", "Microchipped", "Special Needs"];

export default function BasicInformation({ form, onChange }) {
  const toggle = (field, value) => {
    const current = form[field] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange(field, updated);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      {/* Title */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
          <FileText className="w-4 h-4 text-indigo-500" />
        </div>
        <h2 className="text-sm font-semibold text-slate-800">Basic Information</h2>
      </div>

      {/* Pet Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Pet Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="e.g. Buddy"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
        />
      </div>

      {/* Animal Type + Breed */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Animal Type</label>
          <div className="relative">
            <select
              value={form.type}
              onChange={(e) => onChange("type", e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition pr-8"
            >
              {ANIMAL_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▾</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Breed</label>
          <input
            type="text"
            value={form.breed}
            onChange={(e) => onChange("breed", e.target.value)}
            placeholder="e.g. Golden Retriever"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
          />
        </div>
      </div>

      {/* Age + Gender */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Age</label>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              value={form.age}
              onChange={(e) => onChange("age", e.target.value)}
              placeholder="2"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
            />
            <div className="relative shrink-0">
              <select
                value={form.ageUnit || "Years"}
                onChange={(e) => onChange("ageUnit", e.target.value)}
                className="appearance-none h-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition pr-6"
              >
                <option>Years</option>
                <option>Months</option>
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▾</span>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Gender</label>
          <div className="flex rounded-xl border border-slate-200 overflow-hidden">
            {["Male", "Female"].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onChange("gender", g)}
                className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                  form.gender === g
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Health Status */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">Health Status</label>
        <div className="flex flex-wrap gap-2">
          {HEALTH_OPTIONS.map((opt) => {
            const active = (form.healthStatus || []).includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggle("healthStatus", opt)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  active
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200"
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-500"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Story &amp; Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => onChange("description", e.target.value)}
          rows={4}
          placeholder="Tell potential owners about Buddy's personality, habits, and background..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition resize-none"
        />
      </div>
    </div>
  );
}
