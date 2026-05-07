// Stat éditorial — eyebrow petite caps, value en serif large, hint
// warm-gray. Cf. Mubi / NYT pour le pattern. Composant visuel central
// du dashboard, donc pose la grammaire chiffrée.

import type { ReactNode } from "react";

export interface StatProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  // Trend optionnel : couleur sur la valeur (success/warning/neutral)
  tone?: "default" | "success" | "warning" | "muted";
}

const toneClass: Record<NonNullable<StatProps["tone"]>, string> = {
  default: "text-[color:var(--color-ink)]",
  success: "text-[color:var(--color-success)]",
  warning: "text-[color:var(--color-warning)]",
  muted: "text-[color:var(--color-warm-gray)]",
};

export function Stat({ label, value, hint, tone = "default" }: StatProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="type-eyebrow">{label}</span>
      <span className={`type-stat ${toneClass[tone]}`}>{value}</span>
      {hint && <span className="type-meta">{hint}</span>}
    </div>
  );
}
