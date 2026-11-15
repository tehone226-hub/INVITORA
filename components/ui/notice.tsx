import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  info: { box: "border-forest/15 bg-forest/5 text-forest", Icon: Info },
  success: { box: "border-forest/20 bg-[#E7F1EA] text-forest", Icon: CheckCircle2 },
  warning: { box: "border-gold/40 bg-[#FBF1DC] text-ink", Icon: AlertTriangle },
  error: { box: "border-red-200 bg-red-50 text-red-800", Icon: AlertTriangle },
};

export function Notice({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: keyof typeof tones;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const { box, Icon } = tones[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("flex gap-3 rounded-2xl border px-4 py-3.5 text-[15px]", box, className)}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="leading-relaxed">
        {title && <p className="font-bold">{title}</p>}
        {children}
      </div>
    </div>
  );
}
