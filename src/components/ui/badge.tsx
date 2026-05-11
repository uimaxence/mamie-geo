import type { HTMLAttributes, ReactNode } from "react";

// Badge minimaliste avec slot icône optionnel. Inspiration screen 2 du
// brief 2026-05-11 : pills colorés pastel avec icône Lucide à gauche.
// Le tone décide à la fois du fond pastel et de la couleur texte+icône.
//
// Tones colorés (blue/green/orange/purple/pink/yellow) à utiliser pour
// catégoriser : LLMs, types de prompt, catégories blog… Pas pour CTA.
// Tones status (success/warning/error/accent) gardent leur sémantique.
// Tone neutral = fallback gris-100.

type Tone =
  | "neutral"
  | "success"
  | "warning"
  | "error"
  | "accent"
  | "blue"
  | "green"
  | "orange"
  | "purple"
  | "pink"
  | "yellow";

const toneClass: Record<Tone, string> = {
  neutral: "bg-[color:var(--color-gray-100)] text-[color:var(--color-gray-700)]",
  success: "bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]",
  warning: "bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]",
  error: "bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]",
  accent: "bg-[color:var(--color-accent-faint)] text-[color:var(--color-accent)]",
  blue: "bg-[color:var(--color-blue-bg)] text-[color:var(--color-blue)]",
  green: "bg-[color:var(--color-green-bg)] text-[color:var(--color-green)]",
  orange: "bg-[color:var(--color-orange-bg)] text-[color:var(--color-orange)]",
  purple: "bg-[color:var(--color-purple-bg)] text-[color:var(--color-purple)]",
  pink: "bg-[color:var(--color-pink-bg)] text-[color:var(--color-pink)]",
  yellow: "bg-[color:var(--color-yellow-bg)] text-[color:var(--color-yellow)]",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  // Slot icône à gauche (ex : <Bot size={12} /> de Lucide).
  // L'appelant fixe la taille pour rester souverain sur le sizing.
  icon?: ReactNode;
}

export function Badge({ tone = "neutral", icon, className = "", children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-medium ${toneClass[tone]} ${className}`}
      {...props}
    >
      {icon && <span className="flex shrink-0 items-center">{icon}</span>}
      {children}
    </span>
  );
}
