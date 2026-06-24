"use client";

import { cn } from "@/lib/utils";

// SuccessCheck, coche de confirmation animée (transition success check du
// skill transitions.dev) : fade + rotation + Y-bob + tracé du stroke en
// parallèle quand `active` passe à true. Pour les moments de complétion
// (action marquée "Fait", audit terminé, scan envoyé). N'anime que
// l'apparition ; le masquage est à la charge de l'appelant (unmount).
// Garde prefers-reduced-motion dans globals.css.
//
// Le path est calibré : longueur ≈ 25u → stroke-dasharray 26 (globals.css).
// Couleur héritée via `currentColor` → pose `text-[…]` sur className.

export interface SuccessCheckProps {
  active: boolean;
  size?: number;
  className?: string;
}

export function SuccessCheck({ active, size = 20, className }: SuccessCheckProps) {
  return (
    <span
      className={cn("t-success-check", className)}
      data-state={active ? "in" : "out"}
      aria-hidden="true"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 48 48" fill="none" width={size} height={size}>
        <path
          d="M16 24.5 L22 30.5 L33 18.5"
          stroke="currentColor"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
