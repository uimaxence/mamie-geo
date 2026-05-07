import type { ReactNode } from "react";

// Stat sans-serif épais — Airbnb-like. Eyebrow petite caps, value
// large weight 600, hint en gris muted. Plus de serif, plus d'italique.
// Tone porte du sens : success/warning/muted (jamais default rouge).

export interface StatProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "success" | "warning" | "muted";
}

const toneClass: Record<NonNullable<StatProps["tone"]>, string> = {
  default: "text-[color:var(--color-ink)]",
  success: "text-[color:var(--color-success)]",
  warning: "text-[color:var(--color-warning)]",
  muted: "text-[color:var(--color-muted)]",
};

export function Stat({ label, value, hint, tone = "default" }: StatProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="type-eyebrow">{label}</span>
      <span className={`type-stat ${toneClass[tone]}`}>{value}</span>
      {hint && <span className="type-meta">{hint}</span>}
    </div>
  );
}
