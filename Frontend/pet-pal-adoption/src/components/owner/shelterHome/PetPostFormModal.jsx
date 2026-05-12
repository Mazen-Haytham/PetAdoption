import React, { useEffect, useState } from "react";

const emptyForm = {
  name: "",
  age: "",
  breed: "",
  gender: "Male",
  type: "Dog",
  location: "",
  healthStatus: "",
  description: "",
};

function pickPetPostId(p) {
  if (!p) return undefined;
  const v = p.petPostId ?? p.PetPostId ?? p.id;
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
}

export default function PetPostFormModal({
  open,
  mode,
  initialPet,
  onClose,
  onCreate,
  onUpdate,
}) {
  const [values, setValues] = useState(emptyForm);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setFiles([]);
    if (mode === "edit" && initialPet) {
      setValues({
        name: initialPet.name ?? "",
        age: String(initialPet.age ?? ""),
        breed: initialPet.breed ?? "",
        gender: initialPet.gender ?? "Male",
        type: initialPet.type ?? "Dog",
        location: initialPet.location ?? "",
        healthStatus: initialPet.healthStatus ?? "",
        description: initialPet.description ?? "",
      });
    } else {
      setValues(emptyForm);
    }
  }, [open, mode, initialPet]);

  if (!open) return null;

  const handleChange = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const parseError = (err) => {
    if (typeof err === "string") return err;
    if (err?.message) return err.message;
    if (err?.title) return err.title;
    if (err?.errors && typeof err.errors === "object") {
      const parts = Object.entries(err.errors).flatMap(([key, val]) => {
        const msg = Array.isArray(val) ? val.join(" ") : String(val);
        return `${key}: ${msg}`;
      });
      if (parts.length) return parts.join("; ");
    }
    return "Something went wrong.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "create") {
        if (!files.length) {
          setError("Please add at least one photo.");
          setBusy(false);
          return;
        }
        const fd = new FormData();
        fd.append("Name", values.name.trim());
        fd.append("Age", String(parseInt(values.age, 10) || 0));
        fd.append("Breed", values.breed.trim());
        fd.append("Gender", values.gender);
        fd.append("Type", values.type.trim());
        fd.append("Location", values.location.trim());
        fd.append("HealthStatus", values.healthStatus.trim());
        fd.append("Description", values.description.trim());
        files.forEach((f) => fd.append("Images", f));
        await onCreate(fd);
      } else {
        const petPostId = pickPetPostId(initialPet);
        if (!petPostId) {
          setError("Missing listing id.");
          setBusy(false);
          return;
        }
        const ageNum = parseInt(values.age, 10);
        await onUpdate(petPostId, {
          name: values.name.trim(),
          age: Number.isFinite(ageNum) ? ageNum : undefined,
          breed: values.breed.trim(),
          gender: values.gender,
          type: values.type.trim(),
          location: values.location.trim(),
          healthStatus: values.healthStatus.trim(),
          description: values.description.trim() || null,
        });
      }
      onClose();
    } catch (err) {
      setError(parseError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onMouseDown={(ev) => {
        if (ev.target === ev.currentTarget) onClose();
      }}
    >
      <div
        className="pa-card max-h-[min(90vh,720px)] w-full max-w-lg overflow-y-auto p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pet-form-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="pet-form-title" className="text-lg font-extrabold tracking-tight">
            {mode === "create" ? "New pet listing" : "Edit listing"}
          </h2>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-sm font-semibold text-black/50 hover:bg-black/5"
            onClick={onClose}
            disabled={busy}
          >
            Close
          </button>
        </div>

        <p className="mt-1 text-xs font-semibold text-black/45">
          {mode === "create"
            ? "New listings are submitted for admin approval before they appear publicly."
            : "Photos cannot be changed here yet; update text and pet details below."}
        </p>

        {error ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-xs font-extrabold tracking-wide text-black/40">
            Name
            <input
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold outline-none ring-indigo-500/0 focus:ring-2"
              value={values.name}
              onChange={handleChange("name")}
              required
              maxLength={100}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-extrabold tracking-wide text-black/40">
              Age (years)
              <input
                type="number"
                min={0}
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/30"
                value={values.age}
                onChange={handleChange("age")}
                required
              />
            </label>
            <label className="block text-xs font-extrabold tracking-wide text-black/40">
              Gender
              <select
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/30"
                value={values.gender}
                onChange={handleChange("gender")}
              >
                <option>Male</option>
                <option>Female</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-extrabold tracking-wide text-black/40">
              Species / type
              <input
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/30"
                value={values.type}
                onChange={handleChange("type")}
                required
                maxLength={50}
                list="pet-species-suggestions"
              />
              <datalist id="pet-species-suggestions">
                <option value="Dog" />
                <option value="Cat" />
                <option value="Bird" />
                <option value="Rabbit" />
              </datalist>
            </label>
            <label className="block text-xs font-extrabold tracking-wide text-black/40">
              Breed
              <input
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/30"
                value={values.breed}
                onChange={handleChange("breed")}
                required
                maxLength={100}
              />
            </label>
          </div>

          <label className="block text-xs font-extrabold tracking-wide text-black/40">
            Location
            <input
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/30"
              value={values.location}
              onChange={handleChange("location")}
              required
              maxLength={200}
            />
          </label>

          <label className="block text-xs font-extrabold tracking-wide text-black/40">
            Health status
            <input
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/30"
              value={values.healthStatus}
              onChange={handleChange("healthStatus")}
              required
              maxLength={100}
            />
          </label>

          <label className="block text-xs font-extrabold tracking-wide text-black/40">
            Description
            <textarea
              className="mt-1 min-h-[88px] w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/30"
              value={values.description}
              onChange={handleChange("description")}
              rows={4}
            />
          </label>

          {mode === "create" ? (
            <label className="block text-xs font-extrabold tracking-wide text-black/40">
              Photos (required)
              <input
                type="file"
                accept="image/*"
                multiple
                className="mt-1 w-full text-sm font-semibold file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-100 file:px-3 file:py-2 file:font-bold file:text-indigo-900"
                onChange={handleFileChange}
              />
            </label>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="rounded-xl px-4 py-2 text-sm font-extrabold text-black/50 hover:bg-black/5"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-extrabold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              {busy ? "Saving…" : mode === "create" ? "Create listing" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
