import { ClipboardList, LayoutDashboard, PawPrint } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import LogoutBtn from "../shared/LogoutBtn";
const navItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/owner" },
  {
    key: "requests",
    label: "Adoption Requests",
    icon: ClipboardList,
    to: "/owner/requests",
  },
];

export default function ShelterSidebar({
  isOpen = false,
  onToggle,
  onNavigate,
}) {
  const navigate = useNavigate();

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
            <div className="text-base font-extrabold tracking-tight">
              Shelter Home
            </div>
            <div className="text-[11px] font-bold tracking-wide text-black/40">
              ADMIN PORTAL
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
                end={item.key === "dashboard"}
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

        <button
          type="button"
          onClick={() => {
            navigate("/owner/pets/new");
            onNavigate?.();
          }}
          className="hover:cursor-pointer mt-5 mb-3 w-full transition-all rounded-2xl border-2 text-[rgb(var(--pa-primary))] hover:bg-[rgb(var(--pa-primary))] px-5 py-3 text-sm font-extrabold hover:text-white hover:border-transparent hover:brightness-95"
        >
          Create a new post
        </button>
        <LogoutBtn />
      </aside>
    </>
  );
}
