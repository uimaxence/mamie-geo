import { scoreColor } from "@/lib/audit/score";
import { cn } from "@/lib/utils";

// Sous-score en barre — petit bloc cadré : label + gros chiffre coloré +
// barre de progression + légende. Remplace les 4 cartes de sous-scores
// « chiffre nu » du rapport d'audit. Ref : barres SEO/AEO/GEO des
// dashboards des screens d'inspiration (cf. doc 09 § 2026-06-09).
//
// Server component. La barre est posée à sa largeur finale (pas
// d'animation d'entrée — l'<ScoreRing> porte le mouvement de la page).

export interface ScoreBarProps {
  label: string;
  /** Score 0-100. */
  value: number;
  /** Légende sous la barre (ex « 7.5/8 checks validés »). */
  hint?: string;
  className?: string;
}

export function ScoreBar({ label, value, hint, className }: ScoreBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const color = scoreColor(clamped);

  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white p-4",
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="type-eyebrow truncate">{label}</p>
        <span
          className="type-tabular shrink-0 text-xl font-semibold leading-none"
          style={{ color }}
        >
          {clamped}
        </span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-[var(--radius-pill)] bg-[color:var(--color-gray-200)]">
        <div
          className="h-full rounded-[var(--radius-pill)]"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
      {hint && <p className="type-meta mt-2">{hint}</p>}
    </div>
  );
}
