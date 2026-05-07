import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";

// Bouton primitif — direction Airbnb-like : 3 variants posés sur fond
// blanc, accent terracotta réservé au CTA principal.
//
// `primary`   = ink plein avec hover plus foncé (Airbnb noir/gris-950)
// `accent`    = terracotta plein, pour CTA "Recevoir le lien" / "Lancer un run"
// `secondary` = blanc + bordure gris-300, hover gris-50
// `ghost`     = transparent, hover gris-50

type Variant = "primary" | "accent" | "secondary" | "ghost";
type Size = "md" | "sm" | "lg";

const variantClass: Record<Variant, string> = {
  primary:
    "bg-[color:var(--color-ink)] text-white hover:bg-[color:var(--color-gray-800)] border-[color:var(--color-ink)] no-underline",
  accent:
    "bg-[color:var(--color-accent)] text-white hover:bg-[color:var(--color-accent-dim)] border-[color:var(--color-accent)] no-underline",
  secondary:
    "bg-white text-[color:var(--color-ink)] border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-gray-50)] no-underline",
  ghost:
    "bg-transparent text-[color:var(--color-ink)] border-transparent hover:bg-[color:var(--color-gray-100)] no-underline",
};

const sizeClass: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
};

const baseClass =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border font-medium transition disabled:cursor-not-allowed disabled:opacity-50";

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
