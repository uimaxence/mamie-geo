import type { HTMLAttributes } from "react";

// Status dot avec glow doux — inspiration screen 1 "Active Node".
// Petit cercle coloré (8px) avec halo de la même couleur pour signaler
// l'état en cours. À utiliser à côté d'un label ("Active Node",
// "Run en cours…", "Provider live").
//
// Tones : success (vert running), error (rouge offline/failed),
// warning (orange dégradé), accent (terracotta, brand), neutral
// (gris idle).

type Tone = "success" | "error" | "warning" | "accent" | "neutral";

const toneClass: Record<Tone, string> = {
  success: "bg-[color:var(--color-green)] shadow-[var(--glow-green)]",
  error: "bg-[color:var(--color-error)] shadow-[var(--glow-red)]",
  warning: "bg-[color:var(--color-orange)] shadow-[var(--glow-orange)]",
  accent: "bg-[color:var(--color-accent)] shadow-[var(--glow-orange)]",
  neutral: "bg-[color:var(--color-gray-400)]",
};

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  // `pulse` ajoute une animation de pulsation pour signaler "vivant"
  // (ex : run en cours). À utiliser avec parcimonie.
  pulse?: boolean;
}

export function StatusDot({
  tone = "neutral",
  pulse = false,
  className = "",
  ...props
}: StatusDotProps) {
  return (
    <span
      className={`inline-block size-2 rounded-full ${toneClass[tone]} ${pulse ? "animate-pulse" : ""} ${className}`}
      aria-hidden
      {...props}
    />
  );
}
