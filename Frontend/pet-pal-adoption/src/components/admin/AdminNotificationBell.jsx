/** Bell + badge; click clears count (SignalR new posts). */
import { Bell } from "lucide-react";
import useAdminStore from "../../store/useAdminStore";

export default function AdminNotificationBell() {
  const count = useAdminStore((s) => s.newPostNotificationCount);
  const clear = useAdminStore((s) => s.clearNewPostNotifications);

  return (
    <button
      type="button"
      onClick={() => clear()}
      className="relative rounded-xl p-2.5 text-black/55 ring-1 ring-black/5 transition hover:bg-black/5 hover:text-black/80"
      aria-label={
        count > 0 ? `${count} new notifications, click to clear` : "Notifications"
      }
    >
      <Bell className="h-5 w-5" />
      {count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white ring-2 ring-white">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </button>
  );
}
