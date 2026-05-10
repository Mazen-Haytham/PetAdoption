// src/pages/owner/ListPetPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import usePetStore from "../../store/usePetStore";

import PhotoUpload      from "../../components/ListPet/PhotoUpload";
import LocationSection  from "../../components/ListPet/LocationSection";
import BasicInformation from "../../components/ListPet/BasicInformation";
import PreviewListing   from "../../components/ListPet/PreviewListing";
import Toast            from "../../components/ListPet/Toast";
import { ArrowLeft, ArrowRight, PawPrint } from "lucide-react";

const INITIAL_FORM = {
  name: "",
  type: "Dog",
  breed: "",
  age: "",
  ageUnit: "Years",
  gender: "Male",
  healthStatus: [],
  description: "",
};

export default function ListPetPage() {
  const navigate = useNavigate();

  // ── Local UI state ──────────────────────────────────────────
  const [form, setForm]         = useState(INITIAL_FORM);
  const [images, setImages]     = useState([]);
  const [location, setLocation] = useState("");
  const [toast, setToast]       = useState(null); // { message, type }

  // ── Zustand ─────────────────────────────────────────────────
  const { createPetPost, isCreating, resetCreateState } = usePetStore();

  // ── Helpers ──────────────────────────────────────────────────
  const handleFieldChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const showToast = (message, type = "success") =>
    setToast({ message, type });

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.name.trim())                    return showToast("Pet name is required.", "error");
    if (!form.breed.trim())                   return showToast("Breed is required.", "error");
    if (!form.age || isNaN(Number(form.age))) return showToast("Valid age is required.", "error");
    if (!location.trim())                     return showToast("Location is required.", "error");
    if (images.length === 0)                  return showToast("At least one photo is required.", "error");

    const result = await createPetPost({
      name:         form.name,
      age:          Number(form.age),
      breed:        form.breed,
      gender:       form.gender,
      location,
      type:         form.type,
      description:  form.description,
      healthStatus: form.healthStatus.join(", "),
      images,
    });

    if (result.success) {
      showToast(`🐾 ${form.name} has been listed successfully!`, "success");
      resetCreateState();
      setForm(INITIAL_FORM);
      setImages([]);
      setLocation("");
      // Give the toast a moment to show before navigating away
      setTimeout(() => navigate("/owner/dashboard"), 1500);
    } else {
      showToast(result.error || "Something went wrong.", "error");
    }
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* ── Page header ── */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <PawPrint className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 leading-tight">List a Pet</p>
              <p className="text-[11px] text-indigo-500 font-medium leading-tight">Step 1 of 1</p>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* LEFT */}
          <div className="flex flex-col gap-5">
            <PhotoUpload images={images} onChange={setImages} />
            <LocationSection location={location} onChange={setLocation} />
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-5">
            <BasicInformation form={form} onChange={handleFieldChange} />
            <PreviewListing onClick={() => showToast("Preview coming soon!", "success")} />
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 text-sm font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isCreating}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-md shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isCreating ? "Publishing..." : "Publish Listing"}
            {!isCreating && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
