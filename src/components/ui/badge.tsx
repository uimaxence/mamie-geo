import type { HTMLAttributes } from "react";

// Badge / status pill — palette warm aligned sur globals.css.

type Tone = "neutral" | "success" | "warning" | "error" | "accent" | "mustard";

const toneClass: Record<Tone, string> = {
  neutral:
    "bg-[color:var(--color-cream-dim)] text-[color:var(--color-ink-soft)] border-[color:var(--color-warm-gray-soft)]",
  success:
    "bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] border-[color:var(--color-success)]/30",
  warning:
    "bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] border-[color:var(--color-warning)]/30",
  error:
    "bg-[color:var(--color-error-bg)] text-[color:var(--color-error)] border-[color:var(--color-error)]/30",
  accent:
    "bg-[color:var(--color-terracotta)]/10 text-[color:var(--color-terracotta)] border-[color:var(--color-terracotta)]/30",
  mustard:
    "bg-[color:var(--color-mustard)]/15 text-[color:var(--color-warning)] border-[color:var(--color-mustard)]/40",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "neutral", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[var(--radius-sm)] border px-2 py-0.5 text-xs font-medium tracking-wide ${toneClass[tone]} ${className}`}
      {...props}
    />
  );
}
