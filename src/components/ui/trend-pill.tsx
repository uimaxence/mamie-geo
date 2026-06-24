import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Pilule de variation autonome, calée sur la réf "↗ 7.2% vs prior 12 months" :
// fond pastel très doux + flèche directionnelle + valeur signée + période de
// comparaison, le tout en pilule full-round. Variante "delta" du Badge soft,
// dédiée aux variations chiffrées (vs J-7, vs mois dernier, vs concurrents).
//
//   ╭───────────────────────────────╮
//   │ ↗  +7,2%  vs 12 derniers mois  │   tone vert (hausse)
//   ╰───────────────────────────────╯
//
// Couleur dérivée du signe (vert hausse / rouge baisse / gris neutre), via les
// tokens success/error/muted déjà utilisés par DeltaLine. `invert` pour les
// métriques où baisser est bon (taux de refus, coût, désabonnement).

export interface TrendPillProps {
  /** Variation signée en pourcentage. Positif → flèche haut. */
  value: number;
  /** Libellé de comparaison ("vs J-7", "vs 12 derniers mois"). Optionnel. */
  period?: string;
  /** Sémantique inversée : une baisse est "bonne" (rouge ↔ vert). */
  invert?: boolean;
  /** "md" (défaut, look réf) ou "sm" (compact, dans une Stat ou une ligne). */
  size?: "sm" | "md";
  className?: string;
}

type Tone = "up" | "down" | "flat";

const toneClass: Record<Tone, string> = {
  up: "bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]",
  down: "bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]",
  flat: "bg-[color:var(--color-gray-100)] text-[color:var(--color-muted)]",
};

const sizeClass: Record<NonNullable<TrendPillProps["size"]>, string> = {
  sm: "gap-1 px-2 py-0.5 text-xs",
  md: "gap-1.5 px-3 py-1 text-sm",
};

function formatDelta(value: number): string {
  const sign = value > 0 ? "+" : "";
  const body = Number.isInteger(value) ? `${value}` : value.toFixed(1);
  return `${sign}${body}%`;
}

export function TrendPill({
  value,
  period,
  invert = false,
  size = "md",
  className,
}: TrendPillProps) {
  const positive = value > 0;
  const negative = value < 0;
  // Le sens visuel (couleur) peut s'inverser, mais la flèche suit toujours la
  // direction réelle de la variation.
  const good = invert ? negative : positive;
  const bad = invert ? positive : negative;
  const tone: Tone = good ? "up" : bad ? "down" : "flat";
  const Arrow = positive ? TrendingUp : negative ? TrendingDown : null;
  const iconSize = size === "sm" ? 12 : 14;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-pill)] font-medium tabular-nums",
        toneClass[tone],
        sizeClass[size],
        className,
      )}
    >
      {Arrow && <Arrow size={iconSize} strokeWidth={2.25} className="shrink-0" />}
      <span className="font-semibold">{formatDelta(value)}</span>
      {period && <span className="font-medium opacity-80">{period}</span>}
    </span>
  );
}
