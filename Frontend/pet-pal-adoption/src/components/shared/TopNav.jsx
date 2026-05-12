
import { Bell, Settings, Heart, Star, User } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

function LogoMark() {
  return (
    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[rgb(var(--pa-primary))/12]">
      <div className="h-4 w-4 rotate-45 rounded-sm bg-[rgb(var(--pa-primary))]" />
    </div>
  );
}

export default function TopNav({ brand }) {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate  = useNavigate();

  async function handleLogout() {
    try {
      await fetch("https://localhost:7081/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    clearAuth();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-10 border-b border-black/5 bg-white/80 backdrop-blur">
      <div className="pa-container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <LogoMark />
          <span className="text-base font-extrabold tracking-tight">{brand}</span>
        </div>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink
            to="/adopter/profile"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-[rgb(var(--pa-primary))/10] text-[rgb(var(--pa-primary))]"
                  : "text-black/60 hover:text-black hover:bg-black/5"
              }`
            }
          >
            <User className="h-4 w-4" />
            Profile
          </NavLink>

          <NavLink
            to="/adopter/favorites"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-[rgb(var(--pa-primary))/10] text-[rgb(var(--pa-primary))]"
                  : "text-black/60 hover:text-black hover:bg-black/5"
              }`
            }
          >
            <Heart className="h-4 w-4" />
            Favorites
          </NavLink>

          <NavLink
            to="/adopter/reviews"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-[rgb(var(--pa-primary))/10] text-[rgb(var(--pa-primary))]"
                  : "text-black/60 hover:text-black hover:bg-black/5"
              }`
            }
          >
            <Star className="h-4 w-4" />
            Reviews
          </NavLink>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button type="button" className="pa-icon-btn" aria-label="Notifications">
            <Bell className="h-5 w-5 text-[rgb(var(--pa-primary))]" />
          </button>
          <button type="button" className="pa-icon-btn" aria-label="Settings">
            <Settings className="h-5 w-5 text-[rgb(var(--pa-primary))]" />
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm font-semibold text-black/50 hover:text-rose-500 transition-colors px-2 py-1 rounded-lg hover:bg-rose-50"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

