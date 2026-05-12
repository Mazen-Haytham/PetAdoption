export default function PetAvatar({
  seed,
  size = 48,
  src = null,
  alt = "",
  roundedClass = "rounded-2xl",
}) {
  const bg =
    typeof seed === "string"
      ? seed.length % 2 === 0
        ? "bg-amber-100"
        : "bg-slate-200"
      : "bg-slate-200";

  const resolvedSrc =
    typeof src === "string" && src.trim() !== "" ? src.trim() : null;

  return (
    <div
      className={`grid shrink-0 place-items-center overflow-hidden ${roundedClass} ${resolvedSrc ? "" : bg}`}
      style={{ width: size, height: size }}
    >
      {resolvedSrc ? (
        <img
          src={resolvedSrc}
          alt={alt || "Pet"}
          className="col-start-1 row-start-1 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div
          className="col-start-1 row-start-1 h-7 w-7 rounded-full bg-black/30"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
