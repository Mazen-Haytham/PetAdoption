import { PawPrint } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import LogoutBtn from "../shared/LogoutBtn";

/** Shared header for adopter area (home + profile): same feel as the old profile TopNav. */
export default function AdopterShellNav({ brand = "PawAdopt" }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);

  const linkClass = ({ isActive }) =>
    [
      "text-sm font-bold transition",
      isActive ? "text-[rgb(var(--pa-primary))]" : "text-black/50 hover:text-black/70",
    ].join(" ");

  return (
    <header className="sticky top-0 z-10 border-b border-black/5 bg-white/80 backdrop-blur">
      <div className="pa-container flex h-auto min-h-16 flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-0 sm:h-16">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
          <Link to="/adopter" className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[rgb(var(--pa-primary))/12]">
              <PawPrint className="h-5 w-5 text-[rgb(var(--pa-primary))]" />
            </div>
            <span className="truncate text-base font-extrabold tracking-tight">{brand}</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <NavLink to="/adopter" end className={linkClass}>
              Browse pets
            </NavLink>
            {accessToken && role === "Adopter" ? (
              <NavLink to="/adopter/profile" className={linkClass}>
                My profile
              </NavLink>
            ) : null}
            {accessToken && role === "Owner" ? (
              <Link
                to="/owner"
                className="text-sm font-bold text-black/50 transition hover:text-black/70"
              >
                Shelter home
              </Link>
            ) : null}
            {accessToken && role === "Admin" ? (
              <Link
                to="/admin/dashboard"
                className="text-sm font-bold text-black/50 transition hover:text-black/70"
              >
                Admin
              </Link>
            ) : null}
          </nav>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {!accessToken ? (
            <Link
              to="/login"
              className="rounded-xl bg-[rgb(var(--pa-primary))] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:brightness-95"
            >
              Login
            </Link>
          ) : (
            <div className="inline-flex max-w-xs [&>button]:w-auto [&>button]:px-4 [&>button]:py-2">
              <LogoutBtn />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
