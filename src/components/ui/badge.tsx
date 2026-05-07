import type { HTMLAttributes } from "react";

// Badge minimaliste — fond gris-100, texte gris-700 par défaut.
// Tones success/warning/error utilisent un fond très léger + texte
// coloré pour rester sobre. Tone `accent` réservé au branding rare.

type Tone = "neutral" | "success" | "warning" | "error" | "accent";

const toneClass: Record<Tone, string> = {
  neutral: "bg-[color:var(--color-gray-100)] text-[color:var(--color-gray-700)]",
  success: "bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]",
  warning: "bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]",
  error: "bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]",
  accent: "bg-[color:var(--color-accent-faint)] text-[color:var(--color-accent)]",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "neutral", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-2 py-0.5 text-xs font-medium ${toneClass[tone]} ${className}`}
      {...props}
    />
  );
}
