"use client";

import Image from "next/image";
import { useState } from "react";
import { Check } from "lucide-react";
import { DEFAULT_THEME, THEME_LIST, getTheme, type ThemeId } from "@/config/themes";
import { cn } from "@/lib/utils";

/**
 * Choix du fond d'invitation parmi la collection (config/themes.ts).
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

  return (
    <div>
      <input type="hidden" name={name} value={current.id} />
      <p className="mb-2 text-sm font-bold">
        Fond de l&apos;invitation : <span className="font-semibold text-ink/70">{current.name}</span>
      </p>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6" role="radiogroup" aria-label="Fond de l'invitation">
        {THEME_LIST.map((t) => {
          const active = current.id === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={t.name}
              title={`${t.name} — ${t.description}`}
              onClick={() => {
                setInner(t.id);
                onChange?.(t.id);
              }}
              className={cn(
                "relative aspect-[9/16] overflow-hidden rounded-lg ring-offset-2 ring-offset-white transition",
                active ? "ring-3 ring-brand" : "ring-1 ring-ink/10 hover:ring-ink/30",
              )}
              style={{ backgroundColor: t.color }}
            >
              <Image src={t.image} alt="" fill sizes="(min-width: 1024px) 110px, 30vw" className="object-cover" />
              {active && (
                <span className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-brand text-white">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[13px] text-ink/55">{current.description} Vos invités ouvrent d&apos;abord une enveloppe scellée.</p>
    </div>
  );
}
