"use client";

import { cn } from "@/lib/utils";

// AnimatedNumber, pop-in chiffre par chiffre (transition number pop-in du
// skill transitions.dev). Chaque caractère ré-entre avec un léger blur ;
// les deux derniers sont staggerés (`data-stagger`) pour que les décimales
// arrivent juste après. L'animation rejoue quand `value` change : on pose
// `value` en `key` sur le groupe → React remonte l'élément → les keyframes
// `both` repartent de zéro. Garde prefers-reduced-motion dans globals.css.
//
// Usage : <AnimatedNumber value="1.39K" /> ou value={42}. Garde l'unité /
// le suffixe dans la string si tu veux qu'ils poppent aussi.

export interface AnimatedNumberProps {
  value: string | number;
  className?: string;
}

export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const str = String(value);
  const chars = [...str];
  return (
    <span key={str} className={cn("t-digit-group is-animating", className)}>
      {chars.map((ch, i) => {
        const stagger =
          i === chars.length - 2 ? "1" : i === chars.length - 1 ? "2" : undefined;
        return (
          <span key={i} className="t-digit" data-stagger={stagger}>
            {ch}
          </span>
        );
      })}
    </span>
  );
}
