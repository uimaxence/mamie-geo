import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";

// Bouton primitif — 3 variants alignés sur la palette doc 10.
// `primary`   = terracotta plein, CTA fort
// `secondary` = ink outline sur cream, action secondaire
// `ghost`     = pas de fond, juste hover, navigation discrète

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "sm" | "lg";

const variantClass: Record<Variant, string> = {
  primary:
    "bg-[color:var(--color-terracotta)] text-white hover:bg-[color:var(--color-terracotta-dim)] border-[color:var(--color-terracotta)] disabled:bg-[color:var(--color-warm-gray-soft)] disabled:border-[color:var(--color-warm-gray-soft)]",
  secondary:
    "bg-white text-[color:var(--color-ink)] border-[color:var(--color-ink)] hover:bg-[color:var(--color-cream-dim)]",
  ghost:
    "bg-transparent text-[color:var(--color-ink)] border-transparent hover:bg-[color:var(--color-cream-dim)]",
};

const sizeClass: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

const baseClass =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border font-medium transition disabled:cursor-not-allowed disabled:opacity-60 no-underline";

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
