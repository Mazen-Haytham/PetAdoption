import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import ShelterSidebar from "../../components/owner/ShelterSidebar";
import AdoptionToast from "../../components/owner/shelterHome/AdoptionToast";
import RequestDetailsModal from "../../components/owner/shelterHome/RequestDetailsModal";
import { useShelterDashboard } from "../../hooks/useShelterDashboard";

export default function ShelterOwnerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const dashboard = useShelterDashboard();

  return (
    <div className="min-h-screen bg-[rgb(var(--pa-bg))]">
      <div className="pointer-events-none fixed left-1/2 top-4 z-[60] w-[min(560px,calc(100vw-2rem))] -translate-x-1/2">
        <div className="flex flex-col gap-3">
          {dashboard.notifications.map((n) => (
            <AdoptionToast
              key={n.id}
              petName={n.petName}
              notificationId={n.id}
              onDismiss={dashboard.dismissNotification}
            />
          ))}
        </div>
      </div>

      <div className="flex min-h-screen">
        <ShelterSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((o) => !o)}
          onNavigate={() => setSidebarOpen(false)}
        />

        <main className="flex-1">
          <Outlet context={dashboard} />
        </main>
      </div>

      <RequestDetailsModal
        open={dashboard.detailsOpen}
        request={dashboard.selectedRequest}
        onClose={dashboard.closeDetails}
      />
    </div>
  );
}
