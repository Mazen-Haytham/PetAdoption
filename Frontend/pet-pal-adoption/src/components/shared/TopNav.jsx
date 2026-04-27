import { Bell, Settings } from "lucide-react";

function LogoMark() {
  return (
    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[rgb(var(--pa-primary))/12]">
      <div className="h-4 w-4 rotate-45 rounded-sm bg-[rgb(var(--pa-primary))]" />
    </div>
  );
}

export default function TopNav({ brand }) {
  return (
    <header className="sticky top-0 z-10 border-b border-black/5 bg-white/80 backdrop-blur">
      <div className="pa-container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <LogoMark />
          <span className="text-base font-extrabold tracking-tight">{brand}</span>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" className="pa-icon-btn" aria-label="Notifications">
            <Bell className="h-5 w-5 text-[rgb(var(--pa-primary))]" />
          </button>
          <button type="button" className="pa-icon-btn" aria-label="Settings">
            <Settings className="h-5 w-5 text-[rgb(var(--pa-primary))]" />
          </button>
        </div>
      </div>
    </header>
  );
}

