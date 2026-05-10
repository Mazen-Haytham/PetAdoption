import React from "react";
import RequestsView from "../../components/owner/shelterHome/RequestsView";
import { useShelterOwnerOutlet } from "../../hooks/useShelterOwnerOutlet";

export default function ShelterRequestsPage() {
  const {
    loading,
    loadError,
    receivedRequests,
    openDetails,
    handleAccept,
    handleReject,
    actingId,
  } = useShelterOwnerOutlet();

  return (
    <RequestsView
      loading={loading}
      loadError={loadError}
      requests={receivedRequests}
      onViewDetails={openDetails}
      onAccept={handleAccept}
      onReject={handleReject}
      actingId={actingId}
    />
  );
}
