import Image from "next/image";
import { THEMES } from "@/config/themes";
import { SectionHeading } from "@/components/section-heading";

/** Les quatre styles d'invitation, présentés comme des étoffes. */
export function ThemeShowcase() {
  const themes = Object.values(THEMES);

  return (
    <section aria-labelledby="styles-titre" className="mx-auto w-full max-w-[1180px] px-5 pb-16 lg:pb-24">
      <SectionHeading
        id="styles-titre"
        eyebrow="Nos étoffes"
        title="Quatre styles inspirés de chez nous"
        subtitle="Le tissage du Faso Dan Fani, la terre du bogolan, les murs peints de Tiébélé et la nuit indigo : choisissez l'étoffe de votre fête."
      />

      <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {themes.map((theme) => (
          <li
            key={theme.id}
            className="group relative aspect-[4/5] overflow-hidden rounded-3xl shadow-card transition-shadow hover:shadow-card-hover"
          >
            <Image
              src={theme.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 280px, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/60 to-transparent px-4 pt-14 pb-4 sm:px-5 sm:pb-5">
              <h3 className="text-lg font-semibold text-cream sm:text-xl">{theme.name}</h3>
              <p className="mt-1 text-[12px] leading-snug text-cream/80 sm:text-[13px]">{theme.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
