"use client";

import Image from "next/image";
import { useState } from "react";
import { Check } from "lucide-react";
import { COLORWAYS, DEFAULT_THEME, STYLES, THEMES, getTheme, type ColorwayId, type StyleId, type ThemeId } from "@/config/themes";
import { cn } from "@/lib/utils";

/**
 * Choix du fond d'invitation en deux temps : le style (10 étoffes), puis le coloris (10 couleurs),
 * soit 100 fonds. Le style affiché reflète toujours le coloris choisi.
 * La valeur choisie est envoyée avec le formulaire dans le champ caché « name ».
 */
export function ThemePicker({
  name = "theme",
  value,
  defaultValue = DEFAULT_THEME,
  onChange,
}: {
  name?: string;
  /** Mode contrôlé (le parent connaît le choix) ; sinon le sélecteur gère son propre état */
  value?: ThemeId;
  defaultValue?: ThemeId | string;
  onChange?: (id: ThemeId) => void;
}) {
  const [inner, setInner] = useState<ThemeId>(getTheme(defaultValue).id);
  const current = getTheme(value ?? inner);

  const pick = (style: StyleId, colorway: ColorwayId) => {
    const id = `${style}--${colorway}` as ThemeId;
    setInner(id);
    onChange?.(id);
  };

  return (
    <div>
      <input type="hidden" name={name} value={current.id} />

      <p className="mb-2 text-sm font-bold">
        Coloris : <span className="font-semibold text-ink/70">{COLORWAYS.find((c) => c.id === current.colorwayId)?.name}</span>
      </p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Coloris du fond">
        {COLORWAYS.map((cw) => {
          const swatch = THEMES[`${current.styleId}--${cw.id}` as ThemeId].color;
          const active = current.colorwayId === cw.id;
          return (
            <button
              key={cw.id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={cw.name}
              title={cw.name}
              onClick={() => pick(current.styleId, cw.id)}
              className={cn(
                "flex size-9 items-center justify-center rounded-full border-2 transition",
                active ? "border-ink ring-2 ring-brand/40 ring-offset-2 ring-offset-white" : "border-white shadow-card hover:scale-110",
              )}
              style={{ backgroundColor: swatch }}
            >
              {active && <Check className="size-4 text-white drop-shadow" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <p className="mt-5 mb-2 text-sm font-bold">
        Style : <span className="font-semibold text-ink/70">{STYLES.find((s) => s.id === current.styleId)?.name}</span>
      </p>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5" role="radiogroup" aria-label="Style du fond">
        {STYLES.map((style) => {
          const t = THEMES[`${style.id}--${current.colorwayId}` as ThemeId];
          const active = current.styleId === style.id;
          return (
            <button
              key={style.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => pick(style.id, current.colorwayId)}
              className={cn(
                "group relative aspect-[4/5] overflow-hidden rounded-xl text-left ring-offset-2 ring-offset-white transition",
                active ? "ring-3 ring-brand" : "ring-1 ring-ink/10 hover:ring-ink/30",
              )}
              style={{ backgroundColor: t.color }}
            >
              <Image src={t.image} alt="" fill sizes="(min-width: 640px) 150px, 44vw" className="object-cover" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent px-2.5 pt-8 pb-2 text-[13px] font-bold text-paper">
                {style.name}
              </span>
              {active && (
                <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-brand text-paper">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
