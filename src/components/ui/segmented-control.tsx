"use client";

import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// SegmentedControl, pill group horizontal. La pill blanche (fond + shadow)
// GLISSE entre les options au lieu de sauter (transition tabs-sliding du
// skill transitions.dev) : JS écrit offsetLeft/offsetWidth de l'option
// active sur la pill, le CSS tween transform + width. Au premier paint et
// au resize, on écrit la position SANS transition (sinon la pill arrive en
// glissant depuis translateX(0)/width:0). Garde prefers-reduced-motion via
// la media query (la transition est neutralisée).
//
// API contrôlée : passer `value` + `onValueChange`. Les options sont
// définies par l'appelant. Boutons HTML standard avec `aria-pressed`.

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
  const pillRef = useRef<HTMLSpanElement>(null);
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const hasMoved = useRef(false);

  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  const moveTo = (index: number, animate: boolean) => {
    const pill = pillRef.current;
    const btn = btnRefs.current[index];
    if (!pill || !btn) return;
    if (!animate) {
      const prev = pill.style.transition;
      pill.style.transition = "none";
      pill.style.transform = `translateX(${btn.offsetLeft}px)`;
      pill.style.width = `${btn.offsetWidth}px`;
      void pill.offsetWidth; // reflow → la prochaine écriture tweenera
      pill.style.transition = prev;
    } else {
      pill.style.transform = `translateX(${btn.offsetLeft}px)`;
      pill.style.width = `${btn.offsetWidth}px`;
    }
  };

  useLayoutEffect(() => {
    moveTo(activeIndex, hasMoved.current);
    hasMoved.current = true;
  }, [activeIndex, options.length, size]);

  useLayoutEffect(() => {
    const onResize = () => moveTo(activeIndex, false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeIndex]);

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "relative inline-flex items-center gap-0.5 rounded-[var(--radius-pill)] border border-[color:var(--color-border)] bg-[color:var(--color-gray-100)] p-0.5",
        className,
      )}
    >
      <span
        ref={pillRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0.5 bottom-0.5 z-0 w-0 rounded-[var(--radius-pill)] bg-white shadow-[var(--shadow-sm)] transition-[transform,width] duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
      />
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              btnRefs.current[i] = el;
            }}
            type="button"
            aria-pressed={active}
            onClick={() => onValueChange(opt.value)}
            className={cn(
              "relative z-[1] inline-flex items-center justify-center rounded-[var(--radius-pill)] font-medium transition-colors",
              padding,
              active
                ? "text-[color:var(--color-ink)]"
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
