import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Activity, Flame, PieChart, Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { computeDelta, getDashboardData, getVisibilityTrend } from "@/lib/dashboard/queries";
import { Card, Stat } from "@/components/ui";
import { BreakdownBars } from "@/components/charts/breakdown-bars";
import { LLM_COLORS, LLM_LABELS } from "@/components/charts/llm-colors";
import { BatchesTable } from "@/components/app/batches-table";
import { TrendSection } from "./trend-section";
import { TriggerRunForm } from "./trigger-form";

// Dashboard data dynamique. Direction Airbnb-like (pivot 2026-05-07).
// 4 stats agrégées tous-LLMs (PR6 2026-05-18) : Score de visibilité moyen,
// Marque citée (somme), Top concurrent (agrégé), Part de voix vs concurrents.
// Le coût LLM USD a été retiré (donnée technique sans valeur pour le client).

export const dynamic = "force-dynamic";

const LLM_ORDER = ["chatgpt", "claude", "perplexity", "gemini", "lechat"] as const;

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const data = await getDashboardData(session.user.id);
  if (!data) redirect("/app/onboarding");

  // Trend sur 90 jours (max range exposée par le SegmentedControl) ;
  // le filtrage 7d/30d/90d se fait client-side dans <TrendSection>.
  const fullTrend = await getVisibilityTrend(data.brand.id, 90);

  // Stats agrégées tous-LLMs (PR6), remplace l'ancienne logique Claude-only.
  const agg = data.metricsAggregated;
  const visibilityScore = agg.visibilityScore;
  const hasRunsToday = agg.totalRuns > 0;

  // Delta vs J-7 : on calcule la moyenne tous-LLMs de J-7 (sur le trend
  // 90j déjà chargé) pour rester homogène avec le score agrégé du jour.
  const j7Point = fullTrend.length >= 8 ? fullTrend[fullTrend.length - 8] : undefined;
  const j7Avg =
    j7Point !== undefined
      ? (() => {
          const values = Object.entries(j7Point)
            .filter(([k]) => k !== "date")
            .map(([, v]) => (typeof v === "number" ? v : 0))
            .filter((v) => v > 0);
          return values.length === 0
            ? undefined
            : Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
        })()
      : undefined;
  const scoreDelta = computeDelta(visibilityScore, j7Avg);

  // Données breakdown : un segment par LLM, valeur = visibilityScore
  // d'aujourd'hui. LLMs sans métrique → value 0 (barre grisée).
  const breakdownSegments = LLM_ORDER.map((llm) => {
    const row = data.metricsToday.find((m) => m.llm === llm);
    return {
      id: llm,
      label: LLM_LABELS[llm] ?? llm,
      value: row ? Math.round(row.visibilityScore * 10) / 10 : 0,
      color: LLM_COLORS[llm] ?? "#737373",
      suffix: " / 100",
    };
  });

  const trendSeries = Array.from(
    new Set(fullTrend.flatMap((p) => Object.keys(p).filter((k) => k !== "date"))),
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:px-10">
      {/* Header simple : titre de page + action principale.
       * L'identité (workspace, brand, plan, domaine) est portée par la
       * sidebar, pas la peine de la répéter ici. */}
      <header className="flex flex-wrap items-center justify-between gap-6">
        <h1 className="type-h1">Vue d&apos;ensemble</h1>
        <TriggerRunForm />
      </header>

      {/* 4 Stats, agrégées tous-LLMs (cf. PR6 2026-05-18). */}
      <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <Stat
            label="Score de visibilité"
            value={hasRunsToday ? visibilityScore.toFixed(1) : "—"}
            icon={Flame}
            iconTone="orange"
            delta={scoreDelta !== null ? { value: scoreDelta, period: "vs J-7" } : null}
            hint={
              !hasRunsToday
                ? "aucun run aujourd'hui"
                : `moyenne sur ${agg.llmsCount} LLM${agg.llmsCount > 1 ? "s" : ""} · sur 100`
            }
          />
        </Card>
        <Card className="p-5">
          <Stat
            label="Marque citée"
            value={hasRunsToday ? `${agg.brandCitedCount}/${agg.totalRuns}` : "—"}
            icon={Activity}
            iconTone="green"
            hint="runs tous LLMs aujourd'hui"
          />
        </Card>
        <Card className="p-5">
          <Stat
            label="Top concurrent"
            value={agg.topCompetitor?.name ?? "—"}
            icon={Users}
            iconTone="purple"
            hint={
              agg.topCompetitor
                ? `${agg.topCompetitor.citationCount} mention(s)`
                : "aucune mention"
            }
          />
        </Card>
        <Card className="p-5">
          <Stat
            label="Part de voix"
            value={hasRunsToday ? `${agg.partDeVoix.toFixed(1)}%` : "—"}
            icon={PieChart}
            iconTone="blue"
            hint={
              hasRunsToday
                ? `${agg.brandCitedCount} pour toi · ${agg.topCompetitor?.citationCount ?? 0} top concurrent`
                : "en attente du premier run"
            }
          />
        </Card>
      </section>

      {/* Évolution avec time-range picker */}
      <div className="mt-14">
        <TrendSection fullTrend={fullTrend} series={trendSeries} />
      </div>

      {/* Breakdown par LLM (bars verticales + légende + liste).
       * Toujours rendu, même quand tous les scores sont à 0, les 5 LLMs
       * trackés restent visibles avec leur couleur et leur label, ce qui
       * fait pédagogie sur la dimension du tracking dès J0. Les barres à 0
       * ont déjà un rendu fantôme (opacity 0.18 + hauteur min 8%) côté
       * <BreakdownBars>. Cf. doc 09 § 2026-05-17. */}
      <section className="mt-14">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="type-h2">Visibilité par LLM</h2>
            <p className="type-meta mt-1">
              {breakdownSegments.every((s) => s.value === 0)
                ? "Snapshot du jour, en attente du premier run"
                : "Snapshot du jour, score 0–100 par moteur"}
            </p>
          </div>
        </div>
        <div className="mt-6">
          <BreakdownBars segments={breakdownSegments} mode="absolute" />
        </div>
      </section>

      {/* Runs récents, groupés par batch (prompt × jour) */}
      <section className="mt-14">
        <div className="flex items-baseline justify-between">
          <h2 className="type-h2">10 derniers batches</h2>
          <span className="type-meta">tous statuts · cliquer pour le détail par LLM</span>
        </div>
        <BatchesTable
          batches={data.recentBatches}
          emptyState={{
            title: "Aucun run pour l'instant",
            description:
              "Le cron quotidien se déclenche à 06:00 UTC. Tu peux aussi lancer un run immédiatement via le bouton en haut à droite.",
          }}
        />
      </section>

    </div>
  );
}
