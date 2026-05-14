"use client";

import { cn } from "@/lib/utils";

// BreakdownBars — pattern « Lead Source Breakdown » : N segments
// catégoriels, chacun avec :
//   - une couleur (token pastel)
//   - une valeur (poids relatif → largeur de la barre dans la rangée)
//   - une légende (dot + label)
//   - un total chiffré dans une liste sous le chart
//
// Visuel : une rangée de bars adjacents proportionnels à `value`. Si
// `mode="absolute"` (défaut) chaque barre fait `value` % du max ; si
// `mode="share"` les barres remplissent 100 % de la largeur (parts).
//
// Pour Mamie GEO : « Visibilité par LLM aujourd'hui ». 5 segments, un
// par moteur (chatgpt/claude/perplexity/gemini/lechat).

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

export function BreakdownBars({
  segments,
  mode = "absolute",
  total,
  totalLabel,
  className,
}: {
  segments: BreakdownSegment[];
  mode?: "absolute" | "share";
  /** Total affiché au-dessus du chart (ex: somme, ou score global) */
  total?: string | number;
  totalLabel?: string;
  className?: string;
}) {
  const sumValues = segments.reduce((acc, s) => acc + s.value, 0);
  const max = mode === "share" ? sumValues : Math.max(...segments.map((s) => s.value), 1);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Total optionnel */}
      {total !== undefined && (
        <div className="flex items-baseline gap-2">
          <span className="type-stat text-3xl">{total}</span>
          {totalLabel && <span className="type-meta">{totalLabel}</span>}
        </div>
      )}

      {/* Bars : rangée horizontale, chaque barre = un segment.
       * Hauteur 32px, radius pill, espacement subtil entre barres. */}
      <div className="flex h-8 items-end gap-1.5">
        {segments.map((seg) => {
          const widthPct = (seg.value / max) * 100;
          const heightPct = mode === "absolute" ? Math.min(100, widthPct) : 100;
          return (
            <div
              key={seg.id}
              role="presentation"
              title={`${seg.label} · ${seg.value}${seg.suffix ?? ""}`}
              className="flex-1 rounded-[var(--radius-pill)] transition-opacity hover:opacity-80"
              style={{
                backgroundColor: seg.color,
                height: `${Math.max(8, heightPct)}%`,
                opacity: seg.value === 0 ? 0.18 : 1,
              }}
            />
          );
        })}
      </div>

      {/* Légende : dots horizontaux */}
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {segments.map((seg) => (
          <li key={`legend-${seg.id}`} className="flex items-center gap-2 text-xs">
            <span
              aria-hidden
              className="inline-block size-2 shrink-0 rounded-full"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-[color:var(--color-ink-soft)]">{seg.label}</span>
          </li>
        ))}
      </ul>

      <hr className="rule" />

      {/* Liste : label gauche, valeur à droite, séparateurs subtils */}
      <ul className="flex flex-col">
        {segments.map((seg, i) => (
          <li
            key={`row-${seg.id}`}
            className={cn(
              "flex items-center justify-between py-2.5",
              i < segments.length - 1 && "border-b border-[color:var(--color-border)]",
            )}
          >
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="inline-block size-2 shrink-0 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-sm text-[color:var(--color-ink-soft)]">{seg.label}</span>
            </div>
            <span className="type-tabular text-sm font-medium text-[color:var(--color-ink)]">
              {seg.value}
              {seg.suffix ?? ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
