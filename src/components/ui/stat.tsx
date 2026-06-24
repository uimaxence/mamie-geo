import { type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { GlossaryInfo } from "./glossary-info";
import { TrendPill } from "./trend-pill";
import type { GlossaryTerm } from "@/lib/glossary";

// Stat enrichie, pattern inspiré des dashboards modernes :
//   ┌────────────────────────────────────┐
//   │ Label              [icon pastel]   │
//   │ 1.39K                              │
//   │ ↗ +12.4%  vs J-7                   │
//   └────────────────────────────────────┘
//
// - `icon` + `iconTone` : cercle pastel à droite (palette tokens
//   --color-{blue,green,orange,purple,pink,yellow,accent}).
// - `delta` : variation calculée par l'appelant ; flèche directionnelle
//   + couleur (vert > 0, rouge < 0, gris = 0/null).
// - `tone` sur la value : conservé pour le cas legacy (success/warning
//   /muted), nul effet visuel par défaut.

export type IconTone =
  | "neutral"
  | "blue"
  | "green"
  | "orange"
  | "purple"
  | "pink"
  | "yellow"
  | "accent";

export interface StatDelta {
  /** Variation signée en pourcentage. Positif → vert + flèche haut. */
  value: number;
  /** Période de comparaison ("vs J-7", "vs mois dernier", etc.). */
  period: string;
}

export interface StatProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "success" | "warning" | "muted";
  icon?: LucideIcon;
  iconTone?: IconTone;
  delta?: StatDelta | null;
  /** Terme du glossaire à expliquer en hover sur le label (icône info à droite du label). */
  glossaryTerm?: GlossaryTerm;
  /** Définition libre, utilisée si on veut un texte custom hors glossaire. */
  tooltip?: string;
}

const valueToneClass: Record<NonNullable<StatProps["tone"]>, string> = {
  default: "text-[color:var(--color-ink)]",
  success: "text-[color:var(--color-success)]",
  warning: "text-[color:var(--color-warning)]",
  muted: "text-[color:var(--color-muted)]",
};

const iconToneClass: Record<IconTone, string> = {
  neutral: "bg-[color:var(--color-gray-100)] text-[color:var(--color-gray-700)]",
  blue: "bg-[color:var(--color-blue-bg)] text-[color:var(--color-blue)]",
  green: "bg-[color:var(--color-green-bg)] text-[color:var(--color-green)]",
  orange: "bg-[color:var(--color-orange-bg)] text-[color:var(--color-orange)]",
  purple: "bg-[color:var(--color-purple-bg)] text-[color:var(--color-purple)]",
  pink: "bg-[color:var(--color-pink-bg)] text-[color:var(--color-pink)]",
  yellow: "bg-[color:var(--color-yellow-bg)] text-[color:var(--color-yellow)]",
  accent: "bg-[color:var(--color-accent-faint)] text-[color:var(--color-accent)]",
};

export function Stat({
  label,
  value,
  hint,
  tone = "default",
  icon: Icon,
  iconTone = "neutral",
  delta,
  glossaryTerm,
  tooltip,
}: StatProps) {
  const hasGlossary = Boolean(glossaryTerm || tooltip);
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-3">
        <span className="type-eyebrow inline-flex items-center gap-1.5">
          {label}
          {hasGlossary && (
            <GlossaryInfo
              term={glossaryTerm}
              definition={tooltip}
              ariaLabel={`Définition : ${label}`}
            />
          )}
        </span>
        {Icon && (
          <span
            aria-hidden
            className={cn(
              "inline-flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-pill)] shadow-[var(--shadow-sm)]",
              iconToneClass[iconTone],
            )}
          >
            <Icon size={15} strokeWidth={2} />
          </span>
        )}
      </div>
      <span className={`type-stat ${valueToneClass[tone]}`}>{value}</span>
      {delta ? (
        <TrendPill value={delta.value} period={delta.period} size="sm" className="self-start" />
      ) : hint ? (
        <span className="type-meta">{hint}</span>
      ) : null}
    </div>
  );
}
