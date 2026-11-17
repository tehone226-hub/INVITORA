import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  info: { box: "border-brand/20 bg-brand-soft text-ink", Icon: Info },
  success: { box: "border-emerald-200 bg-[#E3F6EE] text-emerald-900", Icon: CheckCircle2 },
  warning: { box: "border-sun/40 bg-[#FFF3D6] text-ink", Icon: AlertTriangle },
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
    <div role={tone === "error" ? "alert" : "status"} className={cn("flex gap-3 rounded-xl border px-4 py-3.5 text-[15px]", box, className)}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="leading-relaxed">
        {title && <p className="font-bold">{title}</p>}
        {children}
      </div>
    </div>
  );
}
