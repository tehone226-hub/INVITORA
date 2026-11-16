"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { buttonClass, type ButtonVariant } from "@/components/ui/button-class";
import type { ActionState } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Bouton qui exécute une action serveur, avec confirmation optionnelle et message de résultat. */
export function ActionButton({
  action,
  children,
  variant = "outline",
  confirm,
  pendingLabel = "Un instant…",
  className,
}: {
  action: () => Promise<ActionState | void>;
  children: React.ReactNode;
  variant?: ButtonVariant;
  confirm?: string;
  pendingLabel?: string;
  className?: string;
}) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionState>(null);
  const router = useRouter();

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <button
        type="button"
        disabled={pending}
        className={buttonClass(variant)}
        onClick={() => {
          if (confirm && !window.confirm(confirm)) return;
          start(async () => {
            const res = await action();
            setResult(res ?? null);
            router.refresh();
          });
        }}
      >
        {pending ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            {pendingLabel}
          </>
        ) : (
          children
        )}
      </button>
      {result?.message && (
        <p role="status" className={cn("text-sm font-semibold", result.ok ? "text-forest" : "text-red-700")}>
          {result.message}
        </p>
      )}
    </div>
  );
}
