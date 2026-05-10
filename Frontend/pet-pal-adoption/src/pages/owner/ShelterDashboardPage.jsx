import React from "react";
import ShelterDashboard from "../../components/owner/shelterHome/ShelterDashboard";
import { useShelterOwnerOutlet } from "../../hooks/useShelterOwnerOutlet";

export default function ShelterDashboardPage() {
  const {
    loading,
    loadError,
    pets,
    showAllPets,
    setShowAllPets,
    openDetails,
    stats,
    petRows,
    recentRequestItems,
  } = useShelterOwnerOutlet();

  return (
    <ShelterDashboard
      loading={loading}
      loadError={loadError}
      stats={stats}
      pets={pets}
      showAllPets={showAllPets}
      onToggleShowAllPets={() => setShowAllPets((v) => !v)}
      petRows={petRows}
      recentRequestItems={recentRequestItems}
      onOpenRequestDetails={openDetails}
    />
  );
}
