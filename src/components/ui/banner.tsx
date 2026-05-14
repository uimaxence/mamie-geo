import { AlertTriangle, CheckCircle2, Info, OctagonAlert, type LucideIcon } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Banner / Alert horizontal. Tones mappés sur les couleurs status :
//   info     → gris neutre
//   success  → vert
//   warning  → orange/ambre
//   error    → rouge
//
// Slot `action` à droite pour CTA contextuel (ex: "Mettre à niveau",
// "Configurer carte"). Slot icon override l'icône par défaut.

type Tone = "info" | "success" | "warning" | "error";

const toneConfig: Record<Tone, { bg: string; text: string; border: string; icon: LucideIcon }> = {
  info: {
    bg: "bg-[color:var(--color-gray-50)]",
    text: "text-[color:var(--color-ink)]",
    border: "border-[color:var(--color-border)]",
    icon: Info,
  },
  success: {
    bg: "bg-[color:var(--color-success-bg)]",
    text: "text-[color:var(--color-success)]",
    border: "border-[color:var(--color-success)]/20",
    icon: CheckCircle2,
  },
  warning: {
    bg: "bg-[color:var(--color-warning-bg)]",
    text: "text-[color:var(--color-warning)]",
    border: "border-[color:var(--color-warning)]/20",
    icon: AlertTriangle,
  },
  error: {
    bg: "bg-[color:var(--color-error-bg)]",
    text: "text-[color:var(--color-error)]",
    border: "border-[color:var(--color-error)]/20",
    icon: OctagonAlert,
  },
};

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  tone?: Tone;
  title?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
}

export function Banner({
  tone = "info",
  title,
  action,
  icon,
  className,
  children,
  ...props
}: BannerProps) {
  const { bg, text, border, icon: DefaultIcon } = toneConfig[tone];
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-[var(--radius-lg)] border px-4 py-3",
        bg,
        text,
        border,
        className,
      )}
      {...props}
    >
      <span className="mt-0.5 shrink-0">{icon ?? <DefaultIcon size={16} strokeWidth={2} />}</span>
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold leading-snug">{title}</p>}
        {children && <div className={cn("text-sm", title && "mt-1 opacity-90")}>{children}</div>}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}
