import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopBar from "../../components/admin/AdminTopBar";
import { useAdminSignalR } from "../../hooks/useAdminSignalR";

/**
 * Admin area shell (matches owner layout idea):
 * sidebar | (top bar + routed page)
 */
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
          <AdminTopBar />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
