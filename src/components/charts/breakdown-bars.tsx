"use client";

import { cn } from "@/lib/utils";

// BreakdownBars : N segments catégoriels rendus en lignes horizontales
// label | barre proportionnelle | valeur. Pattern « Linear / Vercel ».
//
// Modes :
//   - "absolute" (défaut) : largeur de la barre = `value / maxValue * 100%`.
//     Si `maxValue` est omis, on prend le max des segments. Pour un score
//     /100 (ex: visibilité par LLM), passer explicitement `maxValue={100}`
//     pour que les barres reflètent la performance absolue (sinon le top
//     performer remplit toujours 100 % et masque la sous-performance).
//   - "share" : largeur = `value / sum * 100%` (parts d'un total).
//
// Pour Mamie GEO : « Visibilité par LLM aujourd'hui ». 5 segments, un par
// moteur (chatgpt/claude/perplexity/gemini/lechat) avec score 0–100.

export interface BreakdownSegment {
  /** Clé stable (ex: identifiant LLM) */
  id: string;
  /** Label affiché dans la légende et la liste */
  label: string;
  /** Valeur numérique (pourcentage ou compte selon `mode`) */
  value: number;
  /** Couleur hex (typiquement issue de LLM_COLORS / palette pastel) */
  color: string;
  /** Suffixe d'unité dans la liste (ex: " mentions", " /100") */
  suffix?: string;
}

interface Props {
  segments: BreakdownSegment[];
  mode?: "absolute" | "share";
  /** Pour mode="absolute" : valeur considérée comme 100 %. Défaut : max
   *  des segments (classement relatif). Pour un score /100, passer 100. */
  maxValue?: number;
  /** Total affiché au-dessus du chart (ex: somme, ou score global) */
  total?: string | number;
  totalLabel?: string;
  className?: string;
}

function formatValue(value: number): string {
  return value === Math.floor(value) ? String(value) : value.toFixed(1);
}

export function BreakdownBars({
  segments,
  mode = "absolute",
  maxValue,
  total,
  totalLabel,
  className,
}: Props) {
  const sumValues = segments.reduce((acc, s) => acc + s.value, 0);
  const denom =
    mode === "share" ? sumValues : (maxValue ?? Math.max(...segments.map((s) => s.value), 1));

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {total !== undefined && (
        <div className="flex items-baseline gap-2">
          <span className="type-stat text-3xl">{total}</span>
          {totalLabel && <span className="type-meta">{totalLabel}</span>}
        </div>
      )}

      <ul className="flex flex-col gap-3.5">
        {segments.map((seg) => {
          const pct = denom > 0 ? Math.min(100, (seg.value / denom) * 100) : 0;
          const formatted = formatValue(seg.value);
          const isEmpty = seg.value === 0;
          return (
            <li
              key={seg.id}
              className="grid grid-cols-[7rem_1fr_auto] items-center gap-4"
              title={`${seg.label} · ${formatted}${seg.suffix ?? ""}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  aria-hidden
                  className="inline-block size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="truncate text-sm font-medium text-[color:var(--color-ink)]">
                  {seg.label}
                </span>
              </div>
              <div
                className="relative h-2.5 overflow-hidden rounded-full bg-[color:var(--color-gray-100)]"
                role="progressbar"
                aria-valuenow={Math.round(seg.value)}
                aria-valuemin={0}
                aria-valuemax={mode === "share" ? Math.round(sumValues) : Math.round(denom)}
                aria-label={seg.label}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-500 ease-out"
                  style={{
                    width: `${isEmpty ? 0 : Math.max(2, pct)}%`,
                    backgroundColor: seg.color,
                  }}
                />
              </div>
              <span className="type-tabular shrink-0 text-right text-sm font-medium tabular-nums text-[color:var(--color-ink)]">
                {formatted}
                {seg.suffix ? (
                  <span className="text-[color:var(--color-muted)]">{seg.suffix}</span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
