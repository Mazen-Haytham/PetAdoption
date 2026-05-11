import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useAuthStore } from "../../store/authStore";
import usePetStore from "../../store/usePetStore";
import AdopterHomeHero from "../../components/adopterHome/AdopterHomeHero";
import AdopterPetGrid from "../../components/adopterHome/AdopterPetGrid";
import AdopterAdoptModal from "../../components/adopterHome/AdopterAdoptModal";
import AdopterGuestLoginModal from "../../components/adopterHome/AdopterGuestLoginModal";

export default function AdopterHomePage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);
  const canRequestAdoption = Boolean(accessToken) && role === "Adopter";

  const [guestLoginOpen, setGuestLoginOpen] = useState(false);

  const pets = usePetStore((s) => s.browsePets);
  const loading = usePetStore((s) => s.browseLoading);
  const loadError = usePetStore((s) => s.browseError);
  const fetchBrowsePets = usePetStore((s) => s.fetchBrowsePets);
  const submitAdoptionRequest = usePetStore((s) => s.submitAdoptionRequest);
  const adoptSubmitting = usePetStore((s) => s.adoptSubmitting);
  const adoptError = usePetStore((s) => s.adoptError);
  const clearAdoptError = usePetStore((s) => s.clearAdoptError);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPetPostId, setSelectedPetPostId] = useState(null);
  const [selectedPetName, setSelectedPetName] = useState("");

  useEffect(() => {
    fetchBrowsePets();
  }, [fetchBrowsePets]);

  function openModal(petPostId, petName) {
    clearAdoptError();
    setSelectedPetPostId(petPostId);
    setSelectedPetName(petName);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedPetPostId(null);
    setSelectedPetName("");
    clearAdoptError();
  }

  async function handleSubmit(message) {
    if (!selectedPetPostId) return false;
    const res = await submitAdoptionRequest(selectedPetPostId, message);
    if (res.ok) {
      toast.success("Adoption request sent!");
      return true;
    }
    toast.error(res.error || "Could not send request.");
    return false;
  }

  const onRequestBlocked = useCallback(() => {
    if (!accessToken) {
      setGuestLoginOpen(true);
      return;
    }
    toast("Sign in with an adopter account to send a request.", {
      description: "Log out and log in as an adopter, or register as one.",
    });
  }, [accessToken]);

  return (
    <main className="pa-container pb-16 pt-8">
      {accessToken ? <AdopterHomeHero /> : null}

      {loadError ? (
        <div className="pa-card border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">
          {loadError}
        </div>
      ) : null}

      {loading && !pets.length ? (
        <div className="pa-card p-8 text-center text-sm font-semibold text-black/45">
          Loading pets…
        </div>
      ) : !loading && pets.length === 0 ? (
        <div className="pa-card p-8 text-center text-sm font-semibold text-black/45">
          No available pets right now. Check back soon.
        </div>
      ) : (
        <AdopterPetGrid
          pets={pets}
          canRequestAdoption={canRequestAdoption}
          onRequestAdopt={openModal}
          onRequestBlocked={onRequestBlocked}
        />
      )}

      <AdopterGuestLoginModal open={guestLoginOpen} onClose={() => setGuestLoginOpen(false)} />

      <AdopterAdoptModal
        open={modalOpen}
        petName={selectedPetName}
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitting={adoptSubmitting}
        error={adoptError}
      />
    </main>
  );
}
