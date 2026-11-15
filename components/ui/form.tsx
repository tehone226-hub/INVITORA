"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-xl border border-ink/15 bg-white px-3.5 text-[15px] text-ink placeholder:text-ink/40 outline-none transition focus:border-terracotta focus:ring-3 focus:ring-terracotta/15 disabled:opacity-60 aria-invalid:border-red-600";

export function Label({ htmlFor, children, hint }: { htmlFor: string; children: React.ReactNode; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-bold text-ink">
      {children}
      {hint && <span className="ml-1 font-normal text-ink/50">{hint}</span>}
    </label>
  );
}

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(fieldBase, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(fieldBase, "min-h-28 py-2.5 leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <select className={cn(fieldBase, "h-11 appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-9", className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23211915' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-sm font-semibold text-red-700">{message}</p>;
}

export function Field({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id} hint={hint}>
        {label}
      </Label>
      {children}
      <FieldError message={error} />
    </div>
  );
}

const buttonStyles = {
  primary: "bg-terracotta text-cream hover:bg-terracotta-dark shadow-card",
  forest: "bg-forest text-cream hover:bg-forest-dark",
  outline: "border border-ink/15 bg-white text-ink hover:bg-sand",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
  gold: "bg-gold text-forest hover:bg-gold-dark",
};

export type ButtonVariant = keyof typeof buttonStyles;

export function buttonClass(variant: ButtonVariant = "primary", className?: string) {
  return cn(
    "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-[15px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:size-4",
    buttonStyles[variant],
    className,
  );
}

/** Bouton d'envoi qui affiche un indicateur pendant l'action serveur. */
export function SubmitButton({
  children,
  pendingLabel = "Un instant…",
  variant = "primary",
  className,
  ...props
}: React.ComponentProps<"button"> & { pendingLabel?: string; variant?: ButtonVariant }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || props.disabled} className={buttonClass(variant, className)} {...props}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" aria-hidden="true" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
