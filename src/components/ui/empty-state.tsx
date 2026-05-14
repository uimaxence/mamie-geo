import type { LucideIcon } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

// EmptyState — pattern icône + titre + description + CTA optionnel,
// centré sur un fond gris-50 doux. Pour la 1ère visite d'une section
// avant qu'il y ait de la donnée (pas de runs, pas de prompts, etc.).

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
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] px-6 py-12 text-center",
        className,
      )}
      {...props}
    >
      {Icon && (
        <div className="mb-1 inline-flex size-10 items-center justify-center rounded-full bg-white text-[color:var(--color-muted)] shadow-[var(--shadow-sm)]">
          <Icon size={18} strokeWidth={1.75} />
        </div>
      )}
      <p className="type-h3">{title}</p>
      {description && (
        <p className="type-body max-w-md text-sm text-[color:var(--color-muted)]">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
