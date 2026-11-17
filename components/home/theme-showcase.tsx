import Image from "next/image";
import { COLORWAYS, STYLES, THEMES, type ThemeId } from "@/config/themes";
import { SectionHeading } from "@/components/section-heading";

/** Les 10 styles d'invitation, présentés comme des étoffes (chacun existe en 10 coloris : 100 fonds). */
export function ThemeShowcase() {
  return (
    <section aria-labelledby="styles-titre" className="mx-auto w-full max-w-[1180px] px-5 pb-16 lg:pb-24">
      <SectionHeading
        id="styles-titre"
        eyebrow="Nos étoffes"
        title="Dix styles inspirés de chez nous"
        subtitle={`Faso Dan Fani, bogolan, Tiébélé, wax, adinkra… Chaque étoffe existe en ${COLORWAYS.length} coloris : ${STYLES.length * COLORWAYS.length} fonds au choix pour votre fête.`}
      />

      <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {STYLES.map((style) => {
          const theme = THEMES[`${style.id}--origine` as ThemeId];
          return (
            <li
              key={style.id}
              className="group relative aspect-[4/5] overflow-hidden rounded-3xl shadow-card transition-shadow hover:shadow-card-hover"
              style={{ backgroundColor: theme.color }}
            >
              <Image
                src={theme.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 220px, (min-width: 640px) 30vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/60 to-transparent px-4 pt-14 pb-4">
                <h3 className="text-lg font-semibold text-cream">{style.name}</h3>
                <p className="mt-1 text-[12px] leading-snug text-cream/80">{style.description}</p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Aperçu des coloris d'une étoffe */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Coloris disponibles">
        {COLORWAYS.map((cw) => (
          <span
            key={cw.id}
            title={cw.name}
            className="size-7 rounded-full border-2 border-white shadow-card"
            style={{ backgroundColor: THEMES[`wax--${cw.id}` as ThemeId].color }}
          />
        ))}
        <span className="ml-2 text-sm font-semibold text-ink/60">{COLORWAYS.length} coloris</span>
      </div>
    </section>
  );
}
