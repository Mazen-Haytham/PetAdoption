/**
 * Left navigation for every /admin route (mobile drawer + desktop column).
 */
import { LayoutDashboard, PawPrint, Users } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../api/api";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/admin/dashboard" },
  { key: "users", label: "Manage Users", icon: Users, to: "/admin/users" },
  { key: "pets", label: "Pet Posts", icon: PawPrint, to: "/admin/pets" },
];

export default function AdminSidebar({ isOpen = false, onToggle, onNavigate }) {
  const navigate = useNavigate();

  const postLogout = async () => {
    await logout();
    navigate("/login");
  };

  const linkClasses = ({ isActive }) =>
    [
      "pa-btn group flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition",
      isActive
        ? "bg-[rgb(var(--pa-primary))] text-white shadow-sm"
        : "text-black/55 hover:bg-black/5",
    ].join(" ");

  const iconClasses = ({ isActive }) =>
    [
      "h-5 w-5",
      isActive ? "text-white" : "text-black/45 group-hover:text-black/60",
    ].join(" ");

  return (
    <>
      {/* Mobile toggle button */}
      <button
        type="button"
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-[rgb(var(--pa-primary))] text-white hover:brightness-90 transition"
      >
        <LayoutDashboard className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "bg-white flex h-full w-[260px] shrink-0 flex-col border border-[rgb(var(--pa-primary))]/20 px-5 py-6 ring-1 ring-black/5 rounded-br-2xl",
          "transition-transform duration-300 ease-in-out",
          "fixed left-0 top-0 z-40 lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="flex items-center gap-3 px-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[rgb(var(--pa-primary))/12]">
            <PawPrint className="h-5 w-5 text-[rgb(var(--pa-primary))]" />
          </div>
          <div className="leading-tight">
            <div className="text-base font-extrabold tracking-tight">PetAdopt</div>
            <div className="text-[11px] font-bold tracking-wide text-black/40">
              ADMIN PANEL
            </div>
          </div>
        </div>

        <nav className="mt-7 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.key}
                to={item.to}
                onClick={() => onNavigate?.()}
                className={linkClasses}
              >
                {(state) => (
                  <>
                    <Icon className={iconClasses(state)} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto pt-6">
          <button
            type="button"
            className="hover:cursor-pointer w-full rounded-2xl transition-all border-2 text-red-500 hover:bg-red-500 px-5 py-3 text-sm font-extrabold hover:text-white hover:border-transparent shadow-lg shadow-black/10 hover:brightness-95"
            onClick={postLogout}
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
