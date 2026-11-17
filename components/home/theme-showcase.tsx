import Image from "next/image";
import { COLORWAYS, STYLES, THEMES, type ThemeId } from "@/config/themes";
import { SectionHeading } from "@/components/section-heading";
import { cn } from "@/lib/utils";

/** Les 10 styles d'invitation, présentés comme des étoffes (chacun existe en 10 coloris : 100 fonds). */
export function ThemeShowcase() {
  return (
    <section aria-labelledby="styles-titre" className="border-y border-ink/8 bg-white">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-16 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            id="styles-titre"
            eyebrow="Nos étoffes"
            title="Dix styles inspirés de chez nous"
            subtitle={`Faso Dan Fani, bogolan, Tiébélé, wax, adinkra… Chaque étoffe existe en ${COLORWAYS.length} coloris : ${STYLES.length * COLORWAYS.length} fonds au choix pour votre fête.`}
          />

          {/* Aperçu des coloris d'une étoffe */}
          <div
            className="flex items-center gap-3 rounded-xl border border-ink/8 bg-paper px-4 py-3"
            aria-label="Coloris disponibles"
          >
            <span className="flex -space-x-1.5">
              {COLORWAYS.map((cw) => (
                <span
                  key={cw.id}
                  title={cw.name}
                  className="size-6 rounded-full border-2 border-white"
                  style={{ backgroundColor: THEMES[`wax--${cw.id}` as ThemeId].color }}
                />
              ))}
            </span>
            <span className="text-sm font-bold text-ink">{COLORWAYS.length} coloris</span>
          </div>
        </div>

        {/* Grille bento : deux étoffes sont présentées en grand */}
        <ul className="mt-10 grid auto-rows-[190px] grid-cols-2 gap-3 sm:auto-rows-[220px] sm:grid-cols-3 lg:grid-cols-6">
          {STYLES.map((style, index) => {
            const theme = THEMES[`${style.id}--origine` as ThemeId];
            const big = index === 0 || index === 5;
            return (
              <li
                key={style.id}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-ink/8 transition-all hover:border-brand hover:shadow-card-hover",
                  big && "lg:col-span-2 lg:row-span-2",
                  // Les deux dernières s'étirent pour fermer la grille (18 cases sur 6 colonnes).
                  index >= 8 && "lg:col-span-2",
                )}
                style={{ backgroundColor: theme.color }}
              >
                <Image
                  src={theme.image}
                  alt=""
                  fill
                  sizes={
                    big
                      ? "(min-width: 1024px) 400px, (min-width: 640px) 33vw, 50vw"
                      : "(min-width: 1024px) 200px, (min-width: 640px) 33vw, 50vw"
                  }
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night via-night/75 to-transparent px-4 pt-14 pb-4">
                  <h3 className={cn("font-bold text-white", big ? "lg:text-xl" : "text-base")}>{style.name}</h3>
                  <p className={cn("mt-1 text-[12px] leading-snug text-white/80", !big && "line-clamp-2")}>
                    {style.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
