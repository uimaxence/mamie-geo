import type { HTMLAttributes } from "react";

// CornerFrame, wrapper qui pose 4 cross-hairs (+ stylisés) aux coins
// de son enfant. Inspiration screen 1 du brief 2026-05-11 : signature
// "print éditorial" qui casse la planéité sans bruiter, déjà observée
// chez designme.agency. À utiliser sur les cards showcase (hero,
// section feature, screenshot dashboard), pas partout.
//
// Les cross-hairs sont en gris très clair (border) et sortent
// légèrement du cadre (-2.5 = 10px) pour s'aligner avec une grille
// virtuelle plutôt qu'avec la bordure de la card.

export function CornerFrame({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`relative ${className}`} {...props}>
      <Mark className="-top-2.5 -left-2.5" />
      <Mark className="-top-2.5 -right-2.5" />
      <Mark className="-bottom-2.5 -left-2.5" />
      <Mark className="-bottom-2.5 -right-2.5" />
      {children}
    </div>
  );
}

function Mark({ className }: { className: string }) {
  return (
    <span aria-hidden className={`pointer-events-none absolute size-5 ${className}`}>
      {/* Croix fine, 1px sur chaque axe, gris-300 */}
      <span className="absolute top-1/2 left-0 h-px w-full bg-[color:var(--color-border-strong)]" />
      <span className="absolute top-0 left-1/2 h-full w-px bg-[color:var(--color-border-strong)]" />
    </span>
  );
}
