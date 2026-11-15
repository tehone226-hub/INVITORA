import { cn } from "@/lib/utils";

/** Bande tissée terre cuite / vert / or (rappel du Faso Dan Fani). */
export function WovenBand({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("h-1 w-full", className)}
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg, var(--terracotta) 0 96px, var(--forest) 96px 180px, var(--gold) 180px 228px, var(--forest) 228px 300px)",
      }}
    />
  );
}
