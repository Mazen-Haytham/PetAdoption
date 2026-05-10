import React from "react";
import { Bell, Search } from "lucide-react";
import AvatarButton from "./AvatarButton";

export default function ShelterHomeHeader() {
  return (
    <header className="border-[rgb(var(--pa-primary))]/20 top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
          <input
            className="h-11 w-full rounded-full bg-white px-10 text-sm font-semibold text-black/60 shadow-sm ring-1 ring-black/5 placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--pa-primary))/20]"
            placeholder="Search pets, applications..."
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="pa-icon-btn"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-black/55" />
          </button>
          <AvatarButton />
        </div>
      </div>
    </header>
  );
}
