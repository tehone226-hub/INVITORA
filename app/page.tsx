import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { PLAN_LIST, formatPrice } from "@/config/plans";

const swatches = [
  { name: "terracotta", className: "bg-terracotta" },
  { name: "forest", className: "bg-forest" },
  { name: "gold", className: "bg-gold" },
  { name: "cream", className: "bg-cream border border-ink/10" },
  { name: "sand", className: "bg-sand" },
  { name: "ink", className: "bg-ink" },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Bande tissée */}
      <div
        aria-hidden="true"
        className="h-1 w-full"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, var(--terracotta) 0 64px, var(--forest) 64px 128px, var(--gold) 128px 192px)",
        }}
      />

      <main className="mx-auto flex w-full max-w-[1180px] flex-1 flex-col items-center justify-center gap-8 px-5 py-16 text-center">
        <Logo />

        <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[13px] font-semibold shadow-card">
          <span className="size-2 rounded-full bg-terracotta" />
          Bientôt disponible
        </span>

        <h1 className="max-w-2xl text-balance text-4xl font-bold leading-[1.05] sm:text-6xl">
          Votre invitation prête en{" "}
          <span className="italic text-gold underline decoration-terracotta decoration-wavy decoration-2 underline-offset-8">
            30 secondes
          </span>
        </h1>

        <p className="max-w-md text-base leading-relaxed text-ink/60">
          Nous préparons de belles invitations digitales pour vos fêtes, à
          partager sur WhatsApp. Revenez très vite.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button className="h-11 rounded-full bg-terracotta px-6 text-base font-bold text-cream shadow-card hover:bg-terracotta-dark">
            Créer mon invitation
          </Button>
          <Button
            variant="outline"
            className="h-11 rounded-full bg-white px-6 text-base font-bold"
          >
            Voir les modèles
          </Button>
        </div>

        {/* Vérification de la charte : couleurs et formules */}
        <section
          aria-label="Vérification de la charte"
          className="mt-6 w-full max-w-3xl rounded-[32px] bg-forest p-6 text-left text-cream sm:p-8"
        >
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-gold">
            Charte graphique
          </p>
          <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">
            Couleurs et formules
          </h2>

          <ul className="mt-5 flex flex-wrap gap-4">
            {swatches.map((s) => (
              <li key={s.name} className="flex items-center gap-2 text-sm">
                <span className={`size-8 rounded-xl ${s.className}`} />
                {s.name}
              </li>
            ))}
          </ul>

          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {PLAN_LIST.map((plan) => (
              <li
                key={plan.id}
                className="rounded-3xl bg-white p-4 text-ink shadow-card"
              >
                <p className="font-heading text-lg font-semibold">
                  {plan.name}
                </p>
                <p className="mt-1 text-xl font-bold text-terracotta">
                  {formatPrice(plan.price)}
                </p>
                <p className="mt-1 text-sm text-ink/60">{plan.tagline}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
