import { cn } from "@/lib/utils";

// Barre proportionnelle segmentée — visualise une répartition (ex :
// critiques / avertissements / bons points d'un audit) en une seule
// barre fine, chaque segment dimensionné à sa part du total. Ref : barre
// de synthèse en tête des listes de sites des screens d'inspiration
// (cf. doc 09 § 2026-06-09).
//
// Server component (aucun état). Les segments à 0 sont omis. Si le total
// est nul, on rend une piste grise vide.

export type SegmentTone = "critical" | "warning" | "success" | "neutral";

const toneColor: Record<SegmentTone, string> = {
  critical: "#dc2626",
  warning: "#d97706",
  success: "#16a34a",
  neutral: "var(--color-gray-300)",
};

export interface SegmentBarSegment {
  value: number;
  tone: SegmentTone;
  /** Tooltip natif au survol (ex « 5 avertissements »). */
  label?: string;
}

export interface SegmentBarProps {
  segments: SegmentBarSegment[];
  /** Hauteur de la barre en px (défaut 10). */
  height?: number;
  className?: string;
}

export function SegmentBar({ segments, height = 10, className }: SegmentBarProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const visible = segments.filter((s) => s.value > 0);

  if (total === 0) {
    return (
      <div
        className={cn(
          "w-full rounded-[var(--radius-pill)] bg-[color:var(--color-gray-200)]",
          className,
        )}
        style={{ height }}
      />
    );
  }

  return (
    <div className={cn("flex w-full gap-1", className)} style={{ height }}>
      {visible.map((seg, i) => (
        <div
          key={i}
          className="h-full rounded-[var(--radius-pill)] transition-[width] duration-700 ease-out"
          style={{ width: `${(seg.value / total) * 100}%`, backgroundColor: toneColor[seg.tone] }}
          title={seg.label}
        />
      ))}
    </div>
  );
}
