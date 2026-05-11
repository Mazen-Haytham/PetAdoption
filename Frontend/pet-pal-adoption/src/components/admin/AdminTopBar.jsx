/** Sticky strip above admin pages (bell only for now). */
import AdminNotificationBell from "./AdminNotificationBell";

export default function AdminTopBar() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-end border-b border-[rgb(var(--pa-primary))]/20 bg-[rgb(var(--pa-bg))]/80 px-6 py-3 backdrop-blur">
      <AdminNotificationBell />
    </header>
  );
}
