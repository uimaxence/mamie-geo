"use client";

import { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import { EmptyState, SegmentedControl, type SegmentedControlOption } from "@/components/ui";
import { LineChart, type LineChartDatum } from "@/components/charts/line-chart";

// Section "Évolution" du dashboard, avec un SegmentedControl pour
// changer la fenêtre temporelle (7D / 30D / 90D). On reçoit l'intégral
// de l'historique côté serveur (jusqu'à 90 jours pour V0) et on filtre
// côté client — instant, pas de re-fetch.

type Range = "7d" | "30d" | "90d";

const RANGE_OPTIONS: ReadonlyArray<SegmentedControlOption<Range>> = [
  { value: "7d", label: "7 j" },
  { value: "30d", label: "30 j" },
  { value: "90d", label: "90 j" },
];

const RANGE_DAYS: Record<Range, number> = { "7d": 7, "30d": 30, "90d": 90 };
const MIN_POINTS = 3;

export function TrendSection({
  fullTrend,
  series,
}: {
  fullTrend: LineChartDatum[];
  series: string[];
}) {
  const [range, setRange] = useState<Range>("30d");

  const filtered = useMemo(() => {
    if (fullTrend.length === 0) return [];
    const cutoff = fullTrend.length - RANGE_DAYS[range];
    return cutoff <= 0 ? fullTrend : fullTrend.slice(cutoff);
  }, [fullTrend, range]);

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
      {filtered.length < MIN_POINTS ? (
        <EmptyState
          icon={TrendingUp}
          title="Pas assez d'historique"
          description="Le graphique s'affiche dès qu'au moins 3 jours de runs sont accumulés. Le cron quotidien tourne à 06:00 UTC."
          className="mt-6"
        />
      ) : (
        <div className="mt-6">
          <LineChart data={filtered} series={series} />
        </div>
      )}
    </section>
  );
}
