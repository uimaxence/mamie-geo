import type { HTMLAttributes } from "react";

// Card minimaliste — fond blanc, bordure gris-200, radius lg.
// Pas d'ombre par défaut (ajout possible via className `shadow-sm`).
// Variant `flat` = pas de bordure, juste un séparateur haut, pour les
// listes éditoriales sans cadre fermé.

type Variant = "outlined" | "flat";

const variantClass: Record<Variant, string> = {
  outlined: "bg-white border border-[color:var(--color-border)] rounded-[var(--radius-lg)]",
  flat: "border-t border-[color:var(--color-border)] pt-6",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
}

export function Card({ variant = "outlined", className = "", ...props }: CardProps) {
  return <div className={`${variantClass[variant]} ${className}`} {...props} />;
}

export function CardHeader({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`px-5 pt-5 pb-3 ${className}`} {...props} />;
}

export function CardBody({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`px-5 pb-5 ${className}`} {...props} />;
}

export function CardFooter({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`px-5 py-3 border-t border-[color:var(--color-border)] ${className}`}
      {...props}
    />
  );
}
