"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// RevealOnMount, wrapper client minimal pour l'entrée staggerée (texts
// reveal du skill transitions.dev). Il ne reçoit que des `children` déjà
// rendus (éléments React sérialisables) → utilisable depuis un composant
// serveur sans casser la frontière (contrairement à un prop fonction comme
// une icône Lucide). Pose `.is-shown` après le mount (rAF) ; les enfants
// portent les classes `t-stagger-line t-stagger-line--N`. Garde
// prefers-reduced-motion dans globals.css.

export function RevealOnMount({
  className,
  children,
  ...props
}: {
  className?: string;
  children: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className={cn("t-stagger", shown && "is-shown", className)} {...props}>
      {children}
    </div>
  );
}
