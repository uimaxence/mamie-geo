import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";

// Bouton primitif — direction designme.agency / taap.it (cf. doc 10
// § Direction actée 2026-05-11). CTA principal = noir plein arrondi
// pill, secondaire = outline gris, ghost = transparent. Le terracotta
// ne sert plus pour les CTAs — il reste disponible via `accent` pour
// les cas marginaux mais doit rester rare.
//
// Tous les boutons sont en `rounded-pill` (full radius) pour matcher
// le langage des refs.

type Variant = "primary" | "secondary" | "ghost" | "accent";
type Size = "md" | "sm" | "lg";

const variantClass: Record<Variant, string> = {
  primary:
    "bg-[color:var(--color-ink)] text-white hover:bg-[color:var(--color-gray-800)] border-[color:var(--color-ink)] no-underline",
  secondary:
    "bg-white text-[color:var(--color-ink)] border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-gray-50)] no-underline",
  ghost:
    "bg-transparent text-[color:var(--color-ink)] border-transparent hover:bg-[color:var(--color-gray-100)] no-underline",
  // Rare — gardé pour cas marginaux (ex : bouton "Beta" décoratif), pas
  // pour CTA principal.
  accent:
    "bg-[color:var(--color-accent)] text-white hover:bg-[color:var(--color-accent-dim)] border-[color:var(--color-accent)] no-underline",
};

const sizeClass: Record<Size, string> = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-5 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

// La classe `button-shape` (cf. globals.css @layer components) pose la
// tactilité : highlight inset top + drop shadow + hover plus prononcé
// + active en ombre inverse + focus ring. Subtile mais visible.
const baseClass =
  "button-shape inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] border font-medium disabled:cursor-not-allowed disabled:opacity-50";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className = "", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`${baseClass} ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...props}
    />
  );
});

export interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  size?: Size;
}

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(function LinkButton(
  { variant = "primary", size = "md", className = "", ...props },
  ref,
) {
  return (
    <a
      ref={ref}
      className={`${baseClass} ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...props}
    />
  );
});
