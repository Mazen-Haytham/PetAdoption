import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNotificationBell from "../../components/admin/AdminNotificationBell";
import { useAdminSignalR } from "../../hooks/useAdminSignalR";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useAdminSignalR();

  return (
    <div className="min-h-screen bg-[rgb(var(--pa-bg))]">
      <div className="flex min-h-screen">
        <AdminSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((o) => !o)}
          onNavigate={() => setSidebarOpen(false)}
        />

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex justify-end border-b border-[rgb(var(--pa-primary))]/20 bg-[rgb(var(--pa-bg))]/80 px-6 py-3 backdrop-blur">
            <AdminNotificationBell />
          </header>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
