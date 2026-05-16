"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { SegmentedControl, type SegmentedControlOption } from "@/components/ui";
import { LineChart, type LineChartDatum } from "@/components/charts/line-chart";

// Section "Évolution" du dashboard, avec un SegmentedControl pour
// changer la fenêtre temporelle (7D / 30D / 90D). On reçoit l'intégral
// de l'historique côté serveur (jusqu'à 90 jours pour V0) et on filtre
// côté client — instant, pas de re-fetch.
//
// Comportement chart "vivant" (PR 2026-05-17) : on rend toujours la grille
// et l'axe temporel, même quand l'historique est vide ou sparse. On pad
// avec une baseline 0 sur la fenêtre demandée, et un overlay discret
// dit "Données en cours de collecte" tant qu'on n'a pas SPARSE_THRESHOLD
// jours réels. Permet à l'utilisateur de voir la promesse temporelle
// du tracking dès J0 (cf. doc 09 § 2026-05-17).

type Range = "7d" | "30d" | "90d";

const RANGE_OPTIONS: ReadonlyArray<SegmentedControlOption<Range>> = [
  { value: "7d", label: "7 j" },
  { value: "30d", label: "30 j" },
  { value: "90d", label: "90 j" },
];

const RANGE_DAYS: Record<Range, number> = { "7d": 7, "30d": 30, "90d": 90 };
// En dessous de ce seuil de jours réels, on garde l'overlay éducatif.
const SPARSE_THRESHOLD = 3;
// Phase A : un seul LLM tracké (Claude Haiku). Sert de fallback si
// `series` arrive vide depuis le serveur (aucun run jamais).
const DEFAULT_SERIES = ["claude"];

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

// Construit la fenêtre temporelle complète sur N jours en mergeant les
// vraies données reçues. Les jours sans donnée prennent 0 pour tous les
// LLMs — visuellement la ligne "monte du sol" à mesure que des runs
// arrivent, ce qui donne l'impression d'un outil vivant dès J0.
function buildScaffold(
  days: number,
  effectiveSeries: string[],
  realData: LineChartDatum[],
): LineChartDatum[] {
  const byDate = new Map(realData.map((p) => [p.date, p]));
  const result: LineChartDatum[] = [];
  const today = new Date(todayIsoDate());
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const existing = byDate.get(dateStr);
    if (existing) {
      result.push(existing);
      continue;
    }
    const point: LineChartDatum = { date: dateStr };
    for (const llm of effectiveSeries) point[llm] = 0;
    result.push(point);
  }
  return result;
}

export function TrendSection({
  fullTrend,
  series,
}: {
  fullTrend: LineChartDatum[];
  series: string[];
}) {
  const [range, setRange] = useState<Range>("30d");

  const effectiveSeries = series.length > 0 ? series : DEFAULT_SERIES;
  const isSparse = fullTrend.length < SPARSE_THRESHOLD;

  const scaffold = useMemo(
    () => buildScaffold(RANGE_DAYS[range], effectiveSeries, fullTrend),
    [fullTrend, range, effectiveSeries],
  );

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="type-h2">Évolution de visibilité</h2>
          <p className="type-meta mt-1">Score 0–100 par LLM</p>
        </div>
        <SegmentedControl
          value={range}
          onValueChange={setRange}
          options={RANGE_OPTIONS}
          ariaLabel="Fenêtre temporelle"
          size="sm"
        />
      </div>
      <div className="relative mt-6">
        <LineChart data={scaffold} series={effectiveSeries} />
        {isSparse && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-white/85 px-4 py-2 text-sm text-[color:var(--color-ink-soft)] shadow-[var(--shadow-sm)] backdrop-blur-sm">
              <Sparkles size={14} className="text-[color:var(--color-accent)]" />
              <span>
                Données en cours de collecte —{" "}
                <span className="font-medium text-[color:var(--color-ink)]">
                  {fullTrend.length === 0
                    ? "le premier run remplit la courbe"
                    : `${fullTrend.length} jour${fullTrend.length > 1 ? "s" : ""} sur ${SPARSE_THRESHOLD} requis`}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
