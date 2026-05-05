export default function PetAvatar({ seed, size = 48 }) {
  const bg =
    typeof seed === "string"
      ? seed.length % 2 === 0
        ? "bg-amber-100"
        : "bg-slate-200"
      : "bg-slate-200";

  return (
    <div
      className={`grid shrink-0 place-items-center rounded-2xl ${bg}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div className="h-7 w-7 rounded-full bg-black/30" />
    </div>
  );
}

