import { cn } from "@/lib/utils";

// Mini-badge inline pour valeur métrique dans une table, pattern Peec
// docs Brand Insights (cf. doc 09 § 2026-06-08) :
//
//   ┌──┐
//   ┃86┃   ← barre verticale colorée + valeur tabulaire
//   └──┘
//
// Encode la dimension de la métrique visuellement (vert = bon, rouge =
// mauvais) sans alourdir la ligne. À privilégier sur les tableaux de
// classement (Rankings, Top concurrents, Sources by domain).
//
// `tone` :
//   - "success" : vert (valeur favorable)
//   - "warning" : ambre (valeur mitigée)
//   - "error"   : rouge (valeur défavorable)
//   - "neutral" : gris (snapshot sans jugement)
//   - "info"    : bleu brand (highlight neutre)

export type MetricBadgeTone = "success" | "warning" | "error" | "neutral" | "info";

interface MetricBadgeProps {
  value: string | number;
  tone?: MetricBadgeTone;
  /** Override l'épaisseur de la barre gauche en px (défaut 3) */
  barWidth?: number;
  className?: string;
}

const toneClass: Record<MetricBadgeTone, { bar: string; text: string; bg: string }> = {
  success: {
    bar: "bg-[color:var(--color-success)]",
    text: "text-[color:var(--color-ink)]",
    bg: "bg-[color:var(--color-success-bg)]",
  },
  warning: {
    bar: "bg-[color:var(--color-warning)]",
    text: "text-[color:var(--color-ink)]",
    bg: "bg-[color:var(--color-warning-bg)]",
  },
  error: {
    bar: "bg-[color:var(--color-error)]",
    text: "text-[color:var(--color-ink)]",
    bg: "bg-[color:var(--color-error-bg)]",
  },
  neutral: {
    bar: "bg-[color:var(--color-gray-400)]",
    text: "text-[color:var(--color-ink)]",
    bg: "bg-[color:var(--color-gray-50)]",
  },
  info: {
    bar: "bg-[color:var(--color-primary)]",
    text: "text-[color:var(--color-ink)]",
    bg: "bg-[color:var(--color-primary-soft)]",
  },
};

export function MetricBadge({
  value,
  tone = "neutral",
  barWidth = 3,
  className,
}: MetricBadgeProps) {
  const tones = toneClass[tone];
  return (
    <span
      className={cn(
        "inline-flex items-stretch overflow-hidden rounded-[var(--radius-sm)] text-sm tabular-nums",
        tones.bg,
        tones.text,
        className,
      )}
    >
      <span
        aria-hidden
        className={cn("shrink-0", tones.bar)}
        style={{ width: `${barWidth}px` }}
      />
      <span className="px-2 py-0.5 font-semibold">{value}</span>
    </span>
  );
}
