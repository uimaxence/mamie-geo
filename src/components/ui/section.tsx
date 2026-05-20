import type { HTMLAttributes } from "react";

// Section pleine largeur avec variant `tinted` (fond gris-50) pour
// alterner avec les sections fond blanc, pattern designme.agency /
// taap.it qui crée un rythme visuel sans avoir besoin de cards.
//
// `inner` cale automatiquement la largeur max et le padding standard.

type Variant = "default" | "tinted";

const variantClass: Record<Variant, string> = {
  default: "bg-white",
  tinted: "bg-[color:var(--color-gray-50)]",
};

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  variant?: Variant;
  // Padding vertical (Y). Default `xl` = py-20, `lg` = py-16, `md` = py-12.
  pad?: "md" | "lg" | "xl";
}

const padClass: Record<NonNullable<SectionProps["pad"]>, string> = {
  md: "py-12",
  lg: "py-16",
  xl: "py-20 sm:py-24",
};

export function Section({
  variant = "default",
  pad = "xl",
  className = "",
  children,
  ...props
}: SectionProps) {
  return (
    <section className={`${variantClass[variant]} ${padClass[pad]} ${className}`} {...props}>
      <div className="mx-auto max-w-6xl px-6">{children}</div>
    </section>
  );
}
