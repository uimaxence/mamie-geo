import type { Metadata } from "next";
import { Activity, Eye, Flame, Layers, PieChart, Quote, Users } from "lucide-react";
import { Card, Stat } from "@/components/ui";
import { BreakdownBars } from "@/components/charts/breakdown-bars";
import { DownloadableChart } from "@/components/charts/downloadable-chart";
import { LLM_COLORS, LLM_LABELS } from "@/components/charts/llm-colors";
import { BatchesTable } from "@/components/app/batches-table";
import { PageViewTracker } from "@/components/app/page-view-tracker";
import { TrendSection } from "@/app/(app)/app/(with-nav)/dashboard/trend-section";
import { computeDelta } from "@/lib/dashboard/queries";
import { deriveSourcesFunnelRatios } from "@/lib/metrics/sources-funnel";
import { buildDemoBundle } from "@/lib/demo/seed";
import { MarketingFooter } from "../_sections/marketing-footer";
import { MarketingHeader } from "../_sections/marketing-header";
import { DemoBanner } from "./demo-banner";
import { DemoFinalCta } from "./demo-final-cta";

// /demo — Dashboard public avec données fictives Floréal (cosmétiques bio).
// Aucun appel LLM, aucune DB : tout est dérivé du seed déterministe dans
// src/lib/demo/seed.ts. Permet aux visiteurs de voir exactement ce qu'ils
// obtiennent après onboarding, avant de payer.
//
// Réutilise les mêmes composants que /app/dashboard (Stat, TrendSection,
// BreakdownBars, BatchesTable) pour que le visuel soit pixel-identique
// à la version réelle.

const LLM_ORDER = ["chatgpt", "claude", "perplexity", "gemini", "lechat"] as const;

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Démo · Mamie GEO — Visibilité IA d'une marque française",
  description:
    "Vois exactement ce que Mamie GEO te livre. Dashboard public avec données fictives d'une marque de cosmétiques bio française trackée sur ChatGPT, Claude, Perplexity, Gemini et Le Chat.",
  alternates: { canonical: "/demo" },
  openGraph: {
    title: "Démo · Mamie GEO",
    description:
      "Dashboard public avec données fictives d'une marque française trackée sur les 5 IA grand public.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function DemoPage() {
  const { dashboard, trend } = buildDemoBundle();

  const agg = dashboard.metricsAggregated;
  const visibilityScore = agg.visibilityScore;

  const j7Point = trend.length >= 8 ? trend[trend.length - 8] : undefined;
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

  const breakdownSegments = LLM_ORDER.map((llm) => {
    const row = dashboard.metricsToday.find((m) => m.llm === llm);
    return {
      id: llm,
      label: LLM_LABELS[llm] ?? llm,
      value: row ? Math.round(row.visibilityScore * 10) / 10 : 0,
      color: LLM_COLORS[llm] ?? "#737373",
      suffix: " / 100",
    };
  });

  const trendSeries = Array.from(
    new Set(trend.flatMap((p) => Object.keys(p).filter((k) => k !== "date"))),
  );

  return (
    <>
      <MarketingHeader />
      <PageViewTracker
        event="demo_viewed"
        properties={{ brand: dashboard.brand.name, visibility_score: visibilityScore }}
      />
      <DemoBanner brandName={dashboard.brand.name} brandDomain={dashboard.brand.domain} />

      <main className="mx-auto max-w-6xl px-6 py-12 lg:px-10">
        {/* Header démo : reprend le visuel du dashboard avec
            un sous-titre explicite "marque fictive" pour éviter
            toute ambiguïté. */}
        <header>
          <span className="type-eyebrow">Démo · Données fictives</span>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <h1 className="type-h1">Vue d&apos;ensemble</h1>
              <p className="type-meta mt-1">
                Floréal · cosmétiques bio · {dashboard.brand.domain} · plan Starter (5 IA × 5
                prompts quotidiens)
              </p>
            </div>
          </div>
        </header>

        {/* 4 Stats agrégées tous-LLMs */}
        <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5">
            <Stat
              label="Score de visibilité"
              value={visibilityScore.toFixed(1)}
              icon={Flame}
              iconTone="orange"
              delta={scoreDelta !== null ? { value: scoreDelta, period: "vs J-7" } : null}
              hint={`moyenne sur ${agg.llmsCount} LLM${agg.llmsCount > 1 ? "s" : ""} · sur 100`}
            />
          </Card>
          <Card className="p-5">
            <Stat
              label="Marque citée"
              value={`${agg.brandCitedCount}/${agg.totalRuns}`}
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
              value={`${agg.partDeVoix.toFixed(1)}%`}
              icon={PieChart}
              iconTone="blue"
              hint={`${agg.brandCitedCount} pour toi · ${agg.topCompetitor?.citationCount ?? 0} top concurrent`}
            />
          </Card>
        </section>

        {/* Évolution avec time-range picker (client-side filtering, fonctionne sans backend) */}
        <div className="mt-14">
          <TrendSection fullTrend={trend} series={trendSeries} />
        </div>

        {/* Breakdown par LLM */}
        <section className="mt-14">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="type-h2">Visibilité par LLM</h2>
              <p className="type-meta mt-1">Snapshot du jour, score 0–100 par moteur</p>
            </div>
          </div>
          <div className="mt-6">
            <DownloadableChart filename="demo-visibilite-par-llm">
              <div className="p-4">
                <BreakdownBars segments={breakdownSegments} mode="absolute" />
              </div>
            </DownloadableChart>
          </div>
        </section>

        {/* Funnel sources */}
        <section className="mt-14">
          <DemoFunnelSources
            totalRuns={agg.totalRuns}
            retrievedCount={agg.sourcesFunnel.retrievedCount}
            retrievalsTotal={agg.sourcesFunnel.retrievalsTotal}
            citationsCount={agg.sourcesFunnel.citationsCount}
          />
        </section>

        {/* Runs récents */}
        <section className="mt-14">
          <div className="flex items-baseline justify-between">
            <h2 className="type-h2">10 derniers batches</h2>
            <span className="type-meta">tous statuts · cliquer pour le détail par LLM</span>
          </div>
          <BatchesTable
            batches={dashboard.recentBatches}
            emptyState={{
              title: "Aucun run pour l'instant",
              description: "Démo — les vrais runs apparaissent ici dès le J1 du tracking.",
            }}
          />
        </section>
      </main>

      <DemoFinalCta />
      <MarketingFooter />
    </>
  );
}

function DemoFunnelSources({
  totalRuns,
  retrievedCount,
  retrievalsTotal,
  citationsCount,
}: {
  totalRuns: number;
  retrievedCount: number;
  retrievalsTotal: number;
  citationsCount: number;
}) {
  const ratios = deriveSourcesFunnelRatios({
    totalRuns,
    retrievedCount,
    retrievalsTotal,
    citationsCount,
  });

  return (
    <>
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="type-h2">Funnel sources</h2>
          <p className="type-meta mt-1">
            Apparition → Fréquence → Citation. Suit le passage de tes URLs des résultats de
            retrieval vers une citation explicite.
          </p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <Stat
            label="Apparition"
            value={`${ratios.apparitionPct.toFixed(1)}%`}
            icon={Eye}
            iconTone="blue"
            hint={`${retrievedCount}/${totalRuns} réponses`}
          />
        </Card>
        <Card className="p-5">
          <Stat
            label="Fréquence"
            value={ratios.frequence.toFixed(2)}
            icon={Layers}
            iconTone="purple"
            hint={`${retrievalsTotal} apparitions au total`}
          />
        </Card>
        <Card className="p-5">
          <Stat
            label="Citation"
            value={`${ratios.citationPct.toFixed(1)}%`}
            icon={Quote}
            iconTone="green"
            hint={`${citationsCount} citation${citationsCount > 1 ? "s" : ""} explicite${citationsCount > 1 ? "s" : ""}`}
          />
        </Card>
      </div>
    </>
  );
}
