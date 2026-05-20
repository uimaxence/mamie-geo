import type { HTMLAttributes } from "react";

// Card minimaliste, fond blanc, bordure gris-200, radius xl (20px,
// langage designme.agency / taap.it). Pas d'ombre par défaut.
// Variant `flat` = pas de bordure, juste filet haut pour listes
// éditoriales sans cadre fermé.

type Variant = "outlined" | "flat";

const variantClass: Record<Variant, string> = {
  outlined: "bg-white border border-[color:var(--color-border)] rounded-[var(--radius-xl)]",
  flat: "border-t border-[color:var(--color-border)] pt-6",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
}

export function Card({ variant = "outlined", className = "", ...props }: CardProps) {
  return <div className={`${variantClass[variant]} ${className}`} {...props} />;
}

export function CardHeader({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`px-6 pt-6 pb-3 ${className}`} {...props} />;
}

export function CardBody({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`px-6 pb-6 ${className}`} {...props} />;
}

export function CardFooter({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`px-6 py-4 border-t border-[color:var(--color-border)] ${className}`}
      {...props}
    />
  );
}
