"use client";

import { useEffect, useState } from "react";
import { scoreColor } from "@/lib/audit/score";
import { cn } from "@/lib/utils";

// Anneau de score SVG — gros chiffre 0-100 au centre, arc de progression
// coloré (vert/ambre/rouge via scoreColor). L'arc s'anime de 0 → valeur
// au montage (le « wow moment » gamifié du rapport d'audit). Refs :
// dashboards SEO/HR des screens d'inspiration (cf. doc 09 § 2026-06-09).
//
// Pur SVG, pas de dépendance. `size` = diamètre px, le chiffre est
// dimensionné proportionnellement (≈ 34 % du diamètre).

export interface ScoreRingProps {
  /** Score 0-100. */
  value: number;
  /** Diamètre en px. */
  size?: number;
  /** Épaisseur de l'anneau en px. */
  strokeWidth?: number;
  /** Légende sous le chiffre (ex « /100 »). null pour masquer. */
  suffix?: string | null;
  className?: string;
}

export function ScoreRing({
  value,
  size = 132,
  strokeWidth = 10,
  suffix = "/100",
  className,
}: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = scoreColor(clamped);

  // Anime l'arc de 0 vers la valeur réelle après le premier paint.
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setProgress(clamped));
    return () => cancelAnimationFrame(raf);
  }, [clamped]);
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-gray-200)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="type-tabular font-bold leading-none"
          style={{ color, fontSize: size * 0.34 }}
        >
          {clamped}
        </span>
        {suffix && (
          <span className="type-meta mt-1 leading-none text-[color:var(--color-muted)]">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
