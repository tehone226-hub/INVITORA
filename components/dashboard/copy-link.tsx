"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { buttonClass } from "@/components/ui/form";

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input
        readOnly
        value={url}
        aria-label="Lien de l'invitation"
        onFocus={(e) => e.currentTarget.select()}
        className="h-11 min-w-0 flex-1 rounded-xl border border-ink/15 bg-cream px-3.5 text-sm text-ink"
      />
      <button
        type="button"
        className={buttonClass("outline")}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            /* le champ reste sélectionnable à la main */
          }
        }}
      >
        {copied ? <Check /> : <Copy />}
        {copied ? "Lien copié" : "Copier le lien"}
      </button>
    </div>
  );
}
