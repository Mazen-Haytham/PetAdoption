export default function Avatar({ name, size = "lg" }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const sizeClass =
    size === "sm"
      ? "h-11 w-11 text-sm"
      : size === "md"
        ? "h-14 w-14 text-base"
        : "h-24 w-24 text-2xl";

  return (
    <div
      className={`relative grid place-items-center rounded-full ring-4 ring-white ${sizeClass}`}
      style={{
        background:
          "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(93,99,255,0.25))",
      }}
      aria-label={`Avatar for ${name}`}
    >
      <span className="font-extrabold text-[rgb(var(--pa-text))]">{initials}</span>
    </div>
  );
}

