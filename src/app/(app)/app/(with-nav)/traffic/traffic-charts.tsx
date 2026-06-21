import { Globe, MousePointerClick, PieChart, TrendingUp } from "lucide-react";
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
  const siteDeltaCard =
    data.siteDeltaPct !== null ? { value: data.siteDeltaPct, period: "7j vs 7j préc." } : null;
  const topSourceLabel = data.topSource
    ? (LLM_LABELS[data.topSource.source] ?? data.topSource.source)
    : "-";

  // Le trafic total doit toujours être >= trafic IA. Les données total ne
  // démarrent qu'à l'activation du comptage global ; tant qu'elles sont
  // partielles, on plancher sur le trafic IA pour éviter un total < IA.
  const effectiveTotal = Math.max(data.totalSiteVisits, data.totalVisits);
  const sharePct =
    effectiveTotal > 0 ? Math.round((data.totalVisits / effectiveTotal) * 1000) / 10 : null;

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <Stat
            label="Visites totales (30 j)"
            value={effectiveTotal.toLocaleString("fr-FR")}
            icon={Globe}
            iconTone="blue"
            delta={siteDeltaCard}
            hint="toutes origines, pages vues"
          />
        </Card>
        <Card className="p-6">
          <Stat
            label="Visites IA (30 j)"
            value={data.totalVisits.toLocaleString("fr-FR")}
            icon={MousePointerClick}
            iconTone="purple"
            delta={deltaCard}
            hint="toutes sources IA confondues"
          />
        </Card>
        <Card className="p-6">
          <Stat
            label="Part venue des IA"
            value={sharePct !== null ? `${sharePct.toFixed(1)}%` : "-"}
            icon={PieChart}
            iconTone="orange"
            hint={sharePct !== null ? "du trafic total mesuré" : "en attente de données"}
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
      </div>

      <p className="mt-3 type-meta text-[color:var(--color-ink-soft)]">
        Mesure cookieless, sans cookie ni IP stockée : on compte des pages vues, pas des visiteurs
        uniques. Le trafic total démarre à l&apos;activation du pixel.
      </p>

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
