"use client";

import { cn } from "@/lib/utils";

// SegmentedControl, pill group horizontal, actif = fond blanc + shadow,
// inactifs = transparent dans un container gray-100. Pattern courant pour
// les sélecteurs de fenêtre temporelle ("7D / 30D / 90D / 1Y / All") et
// les toggles d'agrégation ("Day / Week / Month").
//
// API contrôlée : passer `value` + `onValueChange`. Les options sont
// définies par l'appelant. Le composant ne dépend pas de Radix,
// boutons HTML standard avec `aria-pressed`.

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  value: T;
  onValueChange: (next: T) => void;
  options: ReadonlyArray<SegmentedControlOption<T>>;
  size?: "sm" | "md";
  ariaLabel?: string;
  className?: string;
}

export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  size = "md",
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  const padding = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm";
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-[var(--radius-pill)] border border-[color:var(--color-border)] bg-[color:var(--color-gray-100)] p-0.5",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onValueChange(opt.value)}
            className={cn(
              "inline-flex items-center justify-center rounded-[var(--radius-pill)] font-medium transition-colors",
              padding,
              active
                ? "bg-white text-[color:var(--color-ink)] shadow-[var(--shadow-sm)]"
                : "text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
