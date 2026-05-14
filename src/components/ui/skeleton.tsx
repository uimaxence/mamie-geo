import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// Bloc loading. Anim gradient gray-100 ↔ gray-200 (cf. globals.css
// keyframes skeleton-pulse). Compose-le pour reproduire la forme du
// contenu (rectangle texte, cercle avatar, etc.).

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={cn(
        "animate-skeleton-pulse rounded-[var(--radius-md)] bg-[color:var(--color-gray-100)]",
        className,
      )}
      {...props}
    />
  );
}
