"use client";

import { useState } from "react";
import { SegmentedControl, type SegmentedControlOption } from "@/components/ui";
import { BreakdownBars, type BreakdownSegment } from "@/components/charts/breakdown-bars";
import { capture } from "@/lib/posthog-client";

// Partie cliente de <HomeDemoPreview/>. Permet à l'utilisateur de switcher
// entre snapshot du jour, moyenne 7 jours et moyenne 30 jours sur les
// barres de visibilité par LLM. Les 3 datasets sont pré-calculés côté
// serveur depuis le seed démo : pas d'appel réseau, animation instantanée
// portée par la transition CSS du BreakdownBars (width 500 ms).

type Range = "today" | "7d" | "30d";

const OPTIONS: ReadonlyArray<SegmentedControlOption<Range>> = [
  { value: "today", label: "Aujourd'hui" },
  { value: "7d", label: "Moy. 7 j" },
  { value: "30d", label: "Moy. 30 j" },
];

const RANGE_HINT: Record<Range, string> = {
  today: "Snapshot du jour, score 0–100 par moteur",
  "7d": "Score moyen des 7 derniers jours",
  "30d": "Score moyen des 30 derniers jours",
};

export function HomeDemoPreviewBars({
  today,
  avg7d,
  avg30d,
}: {
  today: BreakdownSegment[];
  avg7d: BreakdownSegment[];
  avg30d: BreakdownSegment[];
}) {
  const [range, setRange] = useState<Range>("today");

  function onChange(next: Range) {
    if (next === range) return;
    capture("home_demo_range_changed", { from: range, to: next });
    setRange(next);
  }

  const segments = range === "today" ? today : range === "7d" ? avg7d : avg30d;

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h4 className="type-h3">Visibilité par LLM</h4>
          <p className="type-meta mt-0.5">{RANGE_HINT[range]}</p>
        </div>
        <SegmentedControl
          value={range}
          onValueChange={onChange}
          options={OPTIONS}
          ariaLabel="Fenêtre temporelle"
          size="sm"
        />
      </div>
      <div className="mt-5">
        <BreakdownBars segments={segments} mode="absolute" maxValue={100} />
      </div>
    </div>
  );
}
