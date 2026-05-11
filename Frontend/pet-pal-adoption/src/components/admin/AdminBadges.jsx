/** Colored pills for tables — keeps moderation pages short. */

export function AdminStatusBadge({ status }) {
  const key = String(status ?? "").toLowerCase();
  const map = {
    pending: "bg-amber-50 text-amber-700",
    approved: "bg-emerald-50 text-emerald-700",
    rejected: "bg-rose-50 text-rose-700",
  };
  const cls = map[key] ?? "bg-black/5 text-black/45";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${cls}`}>
      {status ?? "—"}
    </span>
  );
}

export function AdminRoleBadge({ role }) {
  const key = String(role ?? "").toLowerCase();
  const map = {
    admin: "bg-violet-50 text-violet-700",
    owner: "bg-blue-50 text-blue-700",
    adopter: "bg-sky-50 text-sky-700",
  };
  const cls = map[key] ?? "bg-black/5 text-black/45";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${cls}`}>
      {role ?? "—"}
    </span>
  );
}
