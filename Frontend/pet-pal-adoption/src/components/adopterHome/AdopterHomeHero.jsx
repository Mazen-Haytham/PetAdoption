import { useAuthStore } from "../../store/authStore";

export default function AdopterHomeHero() {
  const token = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);
  const isAdopter = Boolean(token) && role === "Adopter";

  return (
    <div className="mb-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-black/90">
        Pets ready for adoption
      </h1>
      <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-black/45">
        {isAdopter
          ? "You’re signed in — open a pet and send an adoption request to the shelter."
          : "Browse all available listings. Create an account and sign in to request an adoption."}
      </p>
    </div>
  );
}
