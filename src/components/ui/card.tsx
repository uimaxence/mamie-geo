import type { HTMLAttributes } from "react";

// Card éditoriale : fond blanc cassé léger, bordure subtile chaude,
// pas d'ombre violente — l'élévation vient du contraste cream/blanc.
// Variant `outlined` (default) ou `flat` (juste bordure haute façon
// section éditoriale, pas de cadre fermé).

type Variant = "outlined" | "flat";

const variantClass: Record<Variant, string> = {
  outlined:
    "bg-white border border-[color:var(--color-warm-gray-soft)] rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)]",
  flat: "border-t border-[color:var(--color-warm-gray-soft)] pt-6",
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
      className={`px-5 py-3 border-t border-[color:var(--color-warm-gray-soft)] ${className}`}
      {...props}
    />
  );
}
