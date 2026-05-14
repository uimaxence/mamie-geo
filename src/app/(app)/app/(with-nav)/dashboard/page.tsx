import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Activity, BarChart3, DollarSign, Flame, Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { computeDelta, getDashboardData, getVisibilityTrend } from "@/lib/dashboard/queries";
import { Card, EmptyState, Stat } from "@/components/ui";
import { BreakdownBars } from "@/components/charts/breakdown-bars";
import { LLM_COLORS, LLM_LABELS } from "@/components/charts/llm-colors";
import { RecentRunsTable } from "./recent-runs-table";
import { TrendSection } from "./trend-section";
import { TriggerRunForm } from "./trigger-form";

// Dashboard data dynamique. Direction Airbnb-like (pivot 2026-05-07).
// Polish 2026-05-12 : 4 stats avec icône pastel + delta vs J-7,
// chart évolution avec time-range, breakdown par LLM en bars verticales.

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

  const claudeMetrics = data.metricsToday.find((m) => m.llm === "claude");
  const visibilityScore = claudeMetrics?.visibilityScore ?? 0;

  // Deltas vs J-7 (Claude visibilityScore). Si pas d'historique suffisant
  // → null, et la Stat se rabat sur `hint` au lieu d'afficher le delta.
  const trendClaude = fullTrend
    .map((p) => ({ date: p.date as string, value: (p as Record<string, number>).claude ?? 0 }))
    .filter((p) => Number.isFinite(p.value));
  const j7 = trendClaude.length >= 8 ? trendClaude[trendClaude.length - 8]?.value : undefined;
  const scoreDelta = computeDelta(visibilityScore, j7);

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
       * sidebar — pas la peine de la répéter ici. */}
      <header className="flex flex-wrap items-center justify-between gap-6">
        <h1 className="type-h1">Vue d&apos;ensemble</h1>
        <TriggerRunForm />
      </header>

      {/* 4 Stats — chaque stat dans sa Card pour borner visuellement
       * l'icône (sinon elle flotte ambiguë entre 2 colonnes). */}
      <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <Stat
            label="Score de visibilité"
            value={claudeMetrics ? visibilityScore.toFixed(1) : "—"}
            icon={Flame}
            iconTone="orange"
            delta={scoreDelta !== null ? { value: scoreDelta, period: "vs J-7" } : null}
            hint={!claudeMetrics ? "aucun run aujourd'hui" : "Claude · sur 100"}
          />
        </Card>
        <Card className="p-5">
          <Stat
            label="Marque citée"
            value={
              claudeMetrics ? `${claudeMetrics.brandCitedCount}/${claudeMetrics.totalRuns}` : "—"
            }
            icon={Activity}
            iconTone="green"
            hint="runs Claude aujourd'hui"
          />
        </Card>
        <Card className="p-5">
          <Stat
            label="Top concurrent"
            value={claudeMetrics?.topCompetitors[0]?.name ?? "—"}
            icon={Users}
            iconTone="purple"
            hint={
              claudeMetrics?.topCompetitors[0]
                ? `${claudeMetrics.topCompetitors[0].citationCount} mention(s)`
                : "aucune mention"
            }
          />
        </Card>
        <Card className="p-5">
          <Stat
            label="Coût LLM (mois)"
            value={`$${data.usage.llmCostUsd.toFixed(2)}`}
            icon={DollarSign}
            iconTone="blue"
            hint={`${data.usage.runsCount} run(s) cumulé(s)`}
          />
        </Card>
      </section>

      {/* Évolution avec time-range picker */}
      <div className="mt-14">
        <TrendSection fullTrend={fullTrend} series={trendSeries} />
      </div>

      {/* Breakdown par LLM (bars verticales + légende + liste) */}
      <section className="mt-14">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="type-h2">Visibilité par LLM</h2>
            <p className="type-meta mt-1">Snapshot du jour, score 0–100 par moteur</p>
          </div>
        </div>
        {breakdownSegments.every((s) => s.value === 0) ? (
          <EmptyState
            icon={BarChart3}
            title="Aucun score aujourd'hui"
            description="Le score se calcule après les premiers runs du jour. Tu peux en lancer un via le bouton en haut à droite."
            className="mt-6"
          />
        ) : (
          <div className="mt-6">
            <BreakdownBars segments={breakdownSegments} mode="absolute" />
          </div>
        )}
      </section>

      {/* Runs récents */}
      <section className="mt-14">
        <div className="flex items-baseline justify-between">
          <h2 className="type-h2">10 derniers runs</h2>
          <span className="type-meta">tous statuts</span>
        </div>
        {data.recentRuns.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="Aucun run pour l'instant"
            description="Le cron quotidien se déclenche à 06:00 UTC. Tu peux aussi lancer un run immédiatement via le bouton en haut à droite."
            className="mt-6"
          />
        ) : (
          <RecentRunsTable rows={data.recentRuns} />
        )}
      </section>

      <footer className="mt-20">
        <p className="type-meta">
          Phase A — moteur sur Claude Haiku 4.5 uniquement. Bascule Sonnet 4.6 et 4 autres LLMs en
          Phase C. Détail dans <code>geo-project/09-decisions-journal.md</code> § 2026-05-07.
        </p>
      </footer>
    </div>
  );
}
