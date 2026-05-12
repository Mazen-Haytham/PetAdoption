import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useAuthStore } from "../../store/authStore";
import usePetStore from "../../store/usePetStore";
import AdopterHomeHero from "../../components/adopterHome/AdopterHomeHero";
import AdopterPetGrid from "../../components/adopterHome/AdopterPetGrid";
import AdopterAdoptModal from "../../components/adopterHome/AdopterAdoptModal";
import AdopterGuestLoginModal from "../../components/adopterHome/AdopterGuestLoginModal";
import { Search, X } from "lucide-react";

export default function AdopterHomePage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);
  const canRequestAdoption = Boolean(accessToken) && role === "Adopter";
  const [guestLoginOpen, setGuestLoginOpen] = useState(false);

  const pets = usePetStore((s) => s.browsePets);
  const loading = usePetStore((s) => s.browseLoading);
  const loadError = usePetStore((s) => s.browseError);
  const fetchBrowsePets = usePetStore((s) => s.fetchBrowsePets);
  const searchPets = usePetStore((s) => s.searchPets);
  const submitAdoptionRequest = usePetStore((s) => s.submitAdoptionRequest);
  const adoptSubmitting = usePetStore((s) => s.adoptSubmitting);
  const adoptError = usePetStore((s) => s.adoptError);
  const clearAdoptError = usePetStore((s) => s.clearAdoptError);

  // ── Search state ───────────────────────────────
  const [filters, setFilters] = useState({ type: '', breed: '', age: '', location: '' })
  const [hasSearched, setHasSearched] = useState(false)

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPetPostId, setSelectedPetPostId] = useState(null);
  const [selectedPetName, setSelectedPetName] = useState("");

  useEffect(() => {
    fetchBrowsePets();
    const handleFocus = () => fetchBrowsePets()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [fetchBrowsePets]);

  // ── Search handlers ────────────────────────────
  const handleSearch = async () => {
    // Remove empty fields before sending
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v.trim() !== '')
    )
    if (Object.keys(activeFilters).length === 0) {
      fetchBrowsePets()
      setHasSearched(false)
      return
    }
    await searchPets(activeFilters)
    setHasSearched(true)
  }

  const handleClearSearch = () => {
    setFilters({ type: '', breed: '', age: '', location: '' })
    setHasSearched(false)
    fetchBrowsePets()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

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
      await fetchBrowsePets()
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

      {/* ── Search Bar ──────────────────────────── */}
      <div className="mb-8 mt-6 rounded-2xl border border-black/8 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Type */}
          <input
            type="text"
            placeholder="Type (dog, cat…)"
            value={filters.type}
            onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
            onKeyDown={handleKeyDown}
            className="rounded-xl border border-black/10 bg-gray-50 px-4 py-2.5 text-sm font-semibold placeholder-black/30 focus:border-[rgb(var(--pa-primary))] focus:bg-white focus:outline-none transition-all"
          />
          {/* Breed */}
          <input
            type="text"
            placeholder="Breed"
            value={filters.breed}
            onChange={e => setFilters(f => ({ ...f, breed: e.target.value }))}
            onKeyDown={handleKeyDown}
            className="rounded-xl border border-black/10 bg-gray-50 px-4 py-2.5 text-sm font-semibold placeholder-black/30 focus:border-[rgb(var(--pa-primary))] focus:bg-white focus:outline-none transition-all"
          />
          {/* Age */}
          <input
            type="number"
            placeholder="Age (years)"
            value={filters.age}
            onChange={e => setFilters(f => ({ ...f, age: e.target.value }))}
            onKeyDown={handleKeyDown}
            min="0"
            className="rounded-xl border border-black/10 bg-gray-50 px-4 py-2.5 text-sm font-semibold placeholder-black/30 focus:border-[rgb(var(--pa-primary))] focus:bg-white focus:outline-none transition-all"
          />
          {/* Location */}
          <input
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
            onKeyDown={handleKeyDown}
            className="rounded-xl border border-black/10 bg-gray-50 px-4 py-2.5 text-sm font-semibold placeholder-black/30 focus:border-[rgb(var(--pa-primary))] focus:bg-white focus:outline-none transition-all"
          />
        </div>

        {/* Buttons row */}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 rounded-xl bg-[rgb(var(--pa-primary))] px-5 py-2.5 text-sm font-extrabold text-white hover:opacity-90 transition-opacity"
          >
            <Search size={15} />
            Search
          </button>
          {hasSearched && (
            <button
              onClick={handleClearSearch}
              className="flex items-center gap-2 rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold text-black/50 hover:bg-gray-50 transition-colors"
            >
              <X size={14} />
              Clear
            </button>
          )}
          {hasSearched && (
            <p className="ml-auto text-xs font-semibold text-black/40">
              {pets.length} result{pets.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>
      </div>

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
          {hasSearched ? 'No pets found matching your search.' : 'No available pets right now. Check back soon.'}
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