export default function VolunteerCard() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-[rgb(36,41,88)] p-6 text-white shadow-md">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-14 -right-14 h-56 w-56 rounded-full bg-[rgb(var(--pa-primary))/35] blur-2xl"
        aria-hidden="true"
      />

      <h3 className="text-lg font-extrabold tracking-tight">Volunteer?</h3>
      <p className="mt-2 text-sm leading-6 text-white/75">
        Your profile strength is 85%. Add volunteer experience to increase your adoption
        chances!
      </p>

      <button type="button" className="pa-btn-primary mt-4 bg-[rgb(var(--pa-primary))]">
        Update Experience
      </button>
    </section>
  );
}

