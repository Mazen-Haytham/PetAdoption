// src/pages/ListPetPage.jsx
import { useState } from "react";
import usePetStore from "../store/usePetStore";

import ListingHeader  from "../components/ListPet/ListingHeader";
import StepProgress   from "../components/ListPet/StepProgress";
import PhotoUpload    from "../components/ListPet/PhotoUpload";
import LocationSection from "../components/ListPet/LocationSection";
import BasicInformation from "../components/ListPet/BasicInformation";
import PreviewListing from "../components/ListPet/PreviewListing";
import FormFooter     from "../components/ListPet/FormFooter";
import Toast          from "../components/ListPet/Toast";

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
  // ── Local UI state ──────────────────────────────────────────
  const [form, setForm]       = useState(INITIAL_FORM);
  const [images, setImages]   = useState([]);
  const [location, setLocation] = useState("");
  const [toast, setToast]     = useState(null); // { message, type }

  // ── Zustand ─────────────────────────────────────────────────
  const { createPetPost, isCreating, resetCreateState } = usePetStore();

  // ── Handlers ─────────────────────────────────────────────────
  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handlePublish = async () => {
    await handleSubmit();
  };

  const handleNext = async () => {
    await handleSubmit();
  };

  const handleSubmit = async () => {
    // ── Basic validation ──────────────────────────────────────
    if (!form.name.trim()) return showToast("Pet name is required.", "error");
    if (!form.breed.trim()) return showToast("Breed is required.", "error");
    if (!form.age || isNaN(Number(form.age))) return showToast("Valid age is required.", "error");
    if (!location.trim()) return showToast("Location is required.", "error");
    if (images.length === 0) return showToast("At least one photo is required.", "error");

    const healthStatusStr = form.healthStatus.join(", ");

    const result = await createPetPost({
      name:         form.name,
      age:          Number(form.age),
      breed:        form.breed,
      gender:       form.gender,
      location:     location,
      type:         form.type,
      description:  form.description,
      healthStatus: healthStatusStr,
      images:       images,
    });

    if (result.success) {
      showToast(`🐾 ${form.name} has been listed successfully!`, "success");
      resetCreateState();
      setForm(INITIAL_FORM);
      setImages([]);
      setLocation("");
      // navigate("/dashboard") ← wire up your router here
    } else {
      showToast(result.error || "Something went wrong.", "error");
    }
  };

  const handleCancel = () => {
    // navigate(-1) ← wire up your router here
    resetCreateState();
  };

  const handleBack = () => {
    // navigate(-1) ← wire up your router here
  };

  const handlePreview = () => {
    showToast("Preview coming soon!", "success");
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ── Top bar ── */}
      <ListingHeader
        onCancel={handleCancel}
        onPublish={handlePublish}
        isPublishing={isCreating}
      />

      {/* ── Step progress ── */}
      <StepProgress currentStep={2} />

      {/* ── Main content ── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col gap-5">
            <PhotoUpload images={images} onChange={setImages} />
            <LocationSection location={location} onChange={setLocation} />
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="flex flex-col gap-5">
            <BasicInformation form={form} onChange={handleFieldChange} />
            <PreviewListing onClick={handlePreview} />
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <FormFooter
        onBack={handleBack}
        onNext={handleNext}
        isSubmitting={isCreating}
      />

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