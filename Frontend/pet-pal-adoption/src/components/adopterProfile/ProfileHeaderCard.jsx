import { Calendar, MapPin, PawPrint, Camera, Mail } from "lucide-react";
import Avatar from "./Avatar";

function InfoItem({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 text-sm text-black/60">
      <Icon className="h-4 w-4 text-[rgb(var(--pa-primary))]" />
      <span>{text}</span>
    </div>
  );
}

export default function ProfileHeaderCard({ adopter }) {
  const infoItems = [
    adopter.location ? { icon: MapPin, text: adopter.location } : null,
    adopter.joined ? { icon: Calendar, text: adopter.joined } : null,
    typeof adopter.adoptionsCount === "number"
      ? { icon: PawPrint, text: `${adopter.adoptionsCount} Adoptions` }
      : null,
    adopter.email ? { icon: Mail, text: adopter.email } : null,
  ].filter(Boolean);

  return (
    <section className="pa-card p-6 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <div className="relative shrink-0">
          <div className="rounded-full bg-[rgb(var(--pa-primary))/10] p-1">
            <Avatar name={adopter.name} />
          </div>
          <button
            type="button"
            aria-label="Change profile photo"
            className="absolute bottom-1 right-1 grid h-10 w-10 place-items-center rounded-full bg-[rgb(var(--pa-primary))] text-white shadow-sm ring-4 ring-white hover:brightness-95"
          >
            <Camera className="h-5 w-5" />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight">
                  {adopter.name}
                </h1>
                {adopter.tierLabel ? (
                  <span className="pa-pill-neutral bg-[rgb(var(--pa-primary))]/20 text-[rgb(var(--pa-primary))]">
                    {adopter.tierLabel}
                  </span>
                ) : null}
              </div>

              {adopter.bio ? (
                <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">
                  {adopter.bio}
                </p>
              ) : null}

              {infoItems.length ? (
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                  {infoItems.map((it) => (
                    <InfoItem key={it.text} icon={it.icon} text={it.text} />
                  ))}
                </div>
              ) : null}
            </div>

            <div className="shrink-0">
              <button type="button" className="pa-btn-primary">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

