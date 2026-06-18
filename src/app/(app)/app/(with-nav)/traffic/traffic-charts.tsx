import { MousePointerClick, Sparkles, TrendingUp } from "lucide-react";
import { Card, Stat } from "@/components/ui";
import { BreakdownBars } from "@/components/charts/breakdown-bars";
import { DownloadableChart } from "@/components/charts/downloadable-chart";
import { DualAxisChart } from "@/components/charts/dual-axis-chart";
import { LLM_COLORS, LLM_LABELS } from "@/components/charts/llm-colors";
import type { AiTrafficData } from "@/lib/dashboard/queries";

// Courbes « Trafic IA » : stats + graphe double-axe (trafic × visibilité) +
// répartition par moteur. Rendu uniquement quand au moins une visite IA a été
// détectée (cf. page /app/traffic). Extrait de l'ancienne section dashboard.

const SOURCE_ORDER = ["chatgpt", "claude", "perplexity", "gemini", "lechat"] as const;

export function TrafficCharts({ data }: { data: AiTrafficData }) {
  const deltaCard =
    data.deltaPct !== null ? { value: data.deltaPct, period: "7j vs 7j préc." } : null;
  const topSourceLabel = data.topSource
    ? (LLM_LABELS[data.topSource.source] ?? data.topSource.source)
    : "-";

  const segments = SOURCE_ORDER.map((source) => {
    const row = data.bySource.find((s) => s.source === source);
    return {
      id: source,
      label: LLM_LABELS[source] ?? source,
      value: row?.visits ?? 0,
      color: LLM_COLORS[source] ?? "#737373",
      suffix: " visite(s)",
    };
  });
  const maxVisits = Math.max(1, ...segments.map((s) => s.value));

  return (
    <section>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-6">
          <Stat
            label="Visites IA (30 j)"
            value={data.totalVisits.toLocaleString("fr-FR")}
            icon={MousePointerClick}
            iconTone="blue"
            delta={deltaCard}
            hint="toutes sources IA confondues"
          />
        </Card>
        <Card className="p-6">
          <Stat
            label="Top source IA"
            value={topSourceLabel}
            icon={TrendingUp}
            iconTone="green"
            hint={data.topSource ? `${data.topSource.visits} visite(s)` : "aucune visite"}
          />
        </Card>
        <Card className="p-6">
          <Stat
            label="Moteurs actifs"
            value={String(data.bySource.length)}
            icon={Sparkles}
            iconTone="purple"
            hint="sources IA ayant amené du trafic"
          />
        </Card>
      </div>

      <div className="mt-6">
        <DownloadableChart filename="trafic-ia-vs-visibilite">
          <div className="p-4">
            <DualAxisChart data={data.proof} />
          </div>
        </DownloadableChart>
      </div>

      <div className="mt-6">
        <h3 className="type-h3">Répartition par moteur</h3>
        <div className="mt-4">
          <BreakdownBars segments={segments} mode="absolute" maxValue={maxVisits} />
        </div>
      </div>
    </section>
  );
}
