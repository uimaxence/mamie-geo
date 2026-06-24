import type { LucideIcon } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { RevealOnMount } from "./reveal-on-mount";

// EmptyState, pattern icône + titre + description + CTA optionnel,
// centré sur un fond gris-50 doux. Pour la 1ère visite d'une section
// avant qu'il y ait de la donnée (pas de runs, pas de prompts, etc.).
//
// Reste un composant SERVEUR (le prop `icon` est un composant Lucide, qui
// ne traverserait pas la frontière server→client). L'entrée staggerée
// (texts reveal du skill transitions.dev) est portée par <RevealOnMount>,
// un wrapper client qui ne reçoit que les éléments déjà rendus : icône →
// titre → description → action montent décalés de `--stagger-stagger` avec
// un léger blur. Garde prefers-reduced-motion dans globals.css.

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <RevealOnMount
      className={cn(
        "flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] px-6 py-12 text-center",
        className,
      )}
      {...props}
    >
      {Icon && (
        <div className="t-stagger-line t-stagger-line--1 mb-1 inline-flex size-10 items-center justify-center rounded-[var(--radius-pill)] bg-white text-[color:var(--color-muted)] shadow-[var(--shadow-sm)]">
          <Icon size={18} strokeWidth={1.75} />
        </div>
      )}
      <p className="t-stagger-line t-stagger-line--2 type-h3">{title}</p>
      {description && (
        <p className="t-stagger-line t-stagger-line--3 type-body max-w-md text-sm text-[color:var(--color-muted)]">
          {description}
        </p>
      )}
      {action && <div className="t-stagger-line t-stagger-line--4 mt-3">{action}</div>}
    </RevealOnMount>
  );
}
