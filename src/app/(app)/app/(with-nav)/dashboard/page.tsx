import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { count, eq } from "drizzle-orm";
import { Activity, Eye, Flame, Home, Layers, PieChart, Quote, Users } from "lucide-react";
import { db } from "@/db/client";
import { prompts } from "@/db/schema";
import { auth } from "@/lib/auth";
import { computeDelta, getDashboardData, getVisibilityTrend } from "@/lib/dashboard/queries";
import { Card, PageContainer, PageHeader, Stat } from "@/components/ui";
import { BreakdownBars } from "@/components/charts/breakdown-bars";
import { DownloadableChart } from "@/components/charts/downloadable-chart";
import { LLM_COLORS, LLM_LABELS } from "@/components/charts/llm-colors";
import { BatchesTable } from "@/components/app/batches-table";
import { RecentMentionsCard } from "@/components/app/recent-mentions-card";
import { TopSourcesCard } from "@/components/app/top-sources-card";
import { listPromptsWithMetrics } from "@/lib/prompts/queries";
import { listCitedSources } from "@/lib/sources/queries";
import { aggregateSourceDomains } from "@/lib/sources/domain";
import { deriveSourcesFunnelRatios } from "@/lib/metrics/sources-funnel";
import { bestWorstLlm, interpretPartDeVoix } from "@/lib/metrics/interpret";
import { quotasFor } from "@/lib/plans/quotas";
import { nextScheduledRunAt } from "@/lib/scheduler/next-run";
import { getRankSummary } from "@/lib/competitors/queries";
import {
  buildActionContext,
  loadAuditSignal,
  selectActionsForBrand,
} from "@/lib/weekly-actions/queries";
import { loadSidebarData } from "@/app/(app)/app-sidebar-data";
import { DashboardSetupGuide } from "./dashboard-setup-guide";
import { DashboardTracker } from "./dashboard-tracker";
import { NextRunBar } from "./next-run-bar";
import { RankSummaryCard } from "./rank-summary-card";
import { WeeklyActionsCard } from "./weekly-actions-card";
import { TrendSection } from "./trend-section";

// Dashboard data dynamique. Direction Airbnb-like (pivot 2026-05-07).
// 4 stats agrégées tous-LLMs (PR6 2026-05-18) : Score de visibilité moyen,
// Marque citée (somme), Top concurrent (agrégé), Part de voix vs concurrents.
// Le coût LLM USD a été retiré (donnée technique sans valeur pour le client).

export const dynamic = "force-dynamic";
// L'action "Lancer maintenant" (./actions.ts) draine la queue en tâche de
// fond via after() après la réponse : il faut un budget d'exécution large
// (cf. doc 09 § 2026-06-19, réduction du cron dispatch */5 → 1 h).
export const maxDuration = 300;

const LLM_ORDER = ["chatgpt", "claude", "perplexity", "gemini", "lechat"] as const;

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const data = await getDashboardData(session.user.id);
  if (!data) redirect("/app/onboarding");

  // Trend sur 90 jours (max range exposée par le SegmentedControl) ;
  // le filtrage 7d/30d/90d se fait client-side dans <TrendSection>.
  const fullTrend = await getVisibilityTrend(data.brand.id, 90);

  // Aucun prompt → le dashboard est vide et inutile : on déclenche le guide
  // d'activation (carte + modale). Couvre surtout les comptes "Configurer
  // plus tard" (quickSetup, pas de prompt créé).
  const promptCountRow = await db
    .select({ n: count() })
    .from(prompts)
    .where(eq(prompts.brandId, data.brand.id));
  const promptCount = promptCountRow[0]?.n ?? 0;

  // Cadence du plan → date du prochain run automatique (compte à rebours).
  // loadSidebarData est mémoïsé par requête (déjà appelé par le layout).
  const sidebar = await loadSidebarData();
  const planCadence = quotasFor(sidebar?.workspace.plan ?? "trialing").cadence;
  const nextRunISO = nextScheduledRunAt(planCadence, new Date()).toISOString();

  // Statut de rang « où tu te situes » (relatif vs concurrents) — réutilise
  // le classement déjà calculé, zéro appel LLM. Affiché si des runs existent.
  const rankSummary = promptCount > 0 ? await getRankSummary(session.user.id) : null;

  // Aperçus par-prompt + top domaines sources (mêmes données que les vues
  // Analytics des prompts / onglet Sources, zéro appel LLM). Affichés
  // seulement quand des prompts existent.
  const [promptMetrics, citedSources] =
    promptCount > 0
      ? await Promise.all([
          listPromptsWithMetrics(session.user.id),
          listCitedSources([data.brand.id]),
        ])
      : [null, []];
  // Mentions récentes : prompts déjà analysés, du plus récent au plus ancien.
  const recentMentions = (promptMetrics?.prompts ?? [])
    .filter((p) => p.lastAnalyzedAt !== null)
    .sort((a, b) => (b.lastAnalyzedAt?.getTime() ?? 0) - (a.lastAnalyzedAt?.getTime() ?? 0))
    .slice(0, 5);
  const topSourceDomains = aggregateSourceDomains(citedSources, 5);

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

  // Lectures RELATIVES (cf. doc 09 § 2026-06-17) : part de voix vs concurrents,
  // et meilleure/plus faible IA. Aucun seuil absolu sur le score 0-100.
  const partDeVoixReading = interpretPartDeVoix({
    brandCited: agg.brandCitedCount,
    topCompetitorCited: agg.topCompetitor?.citationCount ?? 0,
    topName: agg.topCompetitor?.name ?? null,
  });
  const llmReading = bestWorstLlm(breakdownSegments);
  // Map le ton de lecture (MetricBadgeTone) vers le ton de la value du Stat.
  const partDeVoixStatTone =
    partDeVoixReading.tone === "success"
      ? "success"
      : partDeVoixReading.tone === "warning"
        ? "warning"
        : "default";

  // Actions de la semaine : 1-2 gestes priorisés dérivés des données DÉJÀ
  // chargées (agg, rankSummary, llmReading) + un signal audit. Zéro appel LLM,
  // zéro re-fetch des métriques. Seulement quand des prompts existent, sinon
  // le DashboardSetupGuide gère l'amorçage (pas deux CTA empilés).
  const weeklyActions =
    promptCount > 0
      ? await selectActionsForBrand(
          data.brand.id,
          buildActionContext({
            promptsCount: data.promptsCount,
            competitorsCount: data.competitorsCount,
            agg,
            llmReading,
            rankSummary,
            audit: await loadAuditSignal(data.workspace.id),
          }),
        )
      : [];

  return (
    <PageContainer>
      <DashboardTracker
        hasRuns={hasRunsToday}
        visibilityScore={visibilityScore}
        trackedLlms={data.metricsToday.length}
      />
      {/* Header pattern Peec docs (2026-06-08, cf. doc 09) : titre + summary
       * inline dynamique (insight calculé sur le delta J-7) + slot droit
       * pour l'action principale. L'identité (workspace, brand, plan,
       * domaine) est portée par la sidebar. */}
      <PageHeader
        icon={Home}
        title="Vue d'ensemble"
        summary={buildDashboardSummary({
          hasRunsToday,
          scoreDelta,
          totalRuns: agg.totalRuns,
          llmsCount: agg.llmsCount,
        })}
      />

      <DashboardSetupGuide promptCount={promptCount} />

      {/* Compte à rebours du prochain run + « Lancer maintenant ». Caché
       * tant qu'aucun prompt (le guide d'activation prend le relais). */}
      {promptCount > 0 && <NextRunBar nextRunISO={nextRunISO} cadence={planCadence} />}

      {/* Actions de la semaine : data → gestes concrets, en haut car c'est
       * l'élément le plus actionnable du dashboard. */}
      {promptCount > 0 && <WeeklyActionsCard actions={weeklyActions} />}

      {/* 4 Stats, agrégées tous-LLMs (cf. PR6 2026-05-18). */}
      <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <Stat
            label="Score de visibilité"
            glossaryTerm="visibility-score"
            value={hasRunsToday ? visibilityScore.toFixed(1) : "-"}
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
        <Card className="p-6">
          <Stat
            label="Marque citée"
            glossaryTerm="marque-citee"
            value={hasRunsToday ? `${agg.brandCitedCount}/${agg.totalRuns}` : "-"}
            icon={Activity}
            iconTone="green"
            hint="runs tous LLMs aujourd'hui"
          />
        </Card>
        <Card className="p-6">
          <Stat
            label="Top concurrent"
            glossaryTerm="top-concurrent"
            value={agg.topCompetitor?.name ?? "-"}
            icon={Users}
            iconTone="purple"
            hint={
              agg.topCompetitor ? `${agg.topCompetitor.citationCount} mention(s)` : "aucune mention"
            }
          />
        </Card>
        <Card className="p-6">
          <Stat
            label="Part de voix"
            glossaryTerm="part-de-voix"
            value={hasRunsToday ? `${agg.partDeVoix.toFixed(1)}%` : "-"}
            // Teinte relative : vert si tu mènes tes concurrents, ambre sinon
            // (jamais de seuil absolu — cf. doc 09 § 2026-06-17).
            tone={hasRunsToday ? partDeVoixStatTone : "default"}
            icon={PieChart}
            iconTone="blue"
            hint={hasRunsToday ? partDeVoixReading.text : "en attente du premier run"}
          />
        </Card>
      </section>

      {/* « Où tu te situes » : rang relatif vs concurrents, juste sous les
       * stats. Réponse directe à « mes données sont-elles bonnes ? ». */}
      {rankSummary && rankSummary.totalRuns > 0 && <RankSummaryCard summary={rankSummary} />}

      {/* Aperçu par-prompt : derniers prompts analysés + rang vs concurrents.
       * Renvoie vers la vue Analytics complète de /app/prompts. */}
      {recentMentions.length > 0 && (
        <section className="mt-14">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="type-h2">Mentions récentes</h2>
            <Link
              href="/app/prompts"
              className="type-meta hover:text-[color:var(--color-ink)]"
            >
              Voir tous les prompts →
            </Link>
          </div>
          <RecentMentionsCard brandName={data.brand.name} prompts={recentMentions} />
        </section>
      )}

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
            {/* Lecture inter-IA : le score absolu varie énormément d'une IA à
             * l'autre, donc on situe par IA plutôt qu'en absolu (enseignement
             * n°1 de l'étude 50 marques). */}
            {llmReading && (
              <p className="type-meta mt-1 text-[color:var(--color-ink-soft)]">
                Ta meilleure IA : <strong>{llmReading.best.label}</strong> ({llmReading.best.value})
                {llmReading.worst && (
                  <>
                    {" "}
                    · ta plus faible : <strong>{llmReading.worst.label}</strong> (
                    {llmReading.worst.value}). Concentre tes efforts là où tu es absent.
                  </>
                )}
              </p>
            )}
          </div>
        </div>
        <div className="mt-6">
          <DownloadableChart filename="visibilite-par-llm">
            <div className="p-4">
              <BreakdownBars segments={breakdownSegments} mode="absolute" maxValue={100} />
            </div>
          </DownloadableChart>
        </div>
      </section>

      {/* Funnel sources V0+ (cf. doc 02 § Glossaire) — 3 stats dérivées
       * de citation_metrics_daily, agrégées tous-LLMs : Apparition →
       * Fréquence → Citation. Données alimentées au fil des runs ;
       * historique pré-2026-06-08 reste à 0 (pas de backfill rétro). */}
      <section className="mt-14">
        <FunnelSourcesSection
          totalRuns={agg.totalRuns}
          retrievedCount={agg.sourcesFunnel.retrievedCount}
          retrievalsTotal={agg.sourcesFunnel.retrievalsTotal}
          citationsCount={agg.sourcesFunnel.citationsCount}
        />
      </section>

      {/* Top domaines cités comme sources par les IA. Données repliées par
       * domaine depuis les URLs (aggregateSourceDomains). */}
      {promptCount > 0 && (
        <section className="mt-14">
          <DownloadableChart filename="top-sources">
            <TopSourcesCard domains={topSourceDomains} />
          </DownloadableChart>
        </section>
      )}

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
    </PageContainer>
  );
}

// Construit le résumé inline du <PageHeader> dashboard à partir de la
// data du jour. Insight prioritaire : delta du score visibilité vs J-7,
// fallback "X runs aujourd'hui" si pas d'historique exploitable.
function buildDashboardSummary({
  hasRunsToday,
  scoreDelta,
  totalRuns,
  llmsCount,
}: {
  hasRunsToday: boolean;
  scoreDelta: number | null;
  totalRuns: number;
  llmsCount: number;
}): string {
  if (!hasRunsToday) {
    return "Aucun run aujourd'hui · le cron quotidien se déclenche à 06:00 UTC";
  }
  const llmSuffix = llmsCount > 1 ? "s" : "";
  if (scoreDelta === null) {
    return `${totalRuns} run${totalRuns > 1 ? "s" : ""} aujourd'hui sur ${llmsCount} LLM${llmSuffix}`;
  }
  const abs = Math.abs(scoreDelta).toFixed(1).replace(".", ",");
  if (scoreDelta > 0.5) return `Score en hausse de ${abs} % vs J-7`;
  if (scoreDelta < -0.5) return `Score en baisse de ${abs} % vs J-7`;
  return `Score stable vs J-7 · ${totalRuns} run${totalRuns > 1 ? "s" : ""} sur ${llmsCount} LLM${llmSuffix}`;
}

function FunnelSourcesSection({
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
  const hasData = retrievedCount > 0 || retrievalsTotal > 0;

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
        <Card className="p-6">
          <Stat
            label="Apparition"
            glossaryTerm="apparition"
            value={hasData ? `${ratios.apparitionPct.toFixed(1)}%` : "-"}
            icon={Eye}
            iconTone="blue"
            hint={hasData ? `${retrievedCount}/${totalRuns} réponses` : "en attente de données"}
          />
        </Card>
        <Card className="p-6">
          <Stat
            label="Fréquence"
            glossaryTerm="frequence"
            value={hasData ? ratios.frequence.toFixed(2) : "-"}
            icon={Layers}
            iconTone="purple"
            hint={
              hasData
                ? `${retrievalsTotal} apparitions au total`
                : "moyenne par réponse où la marque apparaît"
            }
          />
        </Card>
        <Card className="p-6">
          <Stat
            label="Citation"
            glossaryTerm="citation"
            value={hasData ? `${ratios.citationPct.toFixed(1)}%` : "-"}
            icon={Quote}
            iconTone="green"
            hint={
              hasData
                ? `${citationsCount} citation${citationsCount > 1 ? "s" : ""} explicite${citationsCount > 1 ? "s" : ""}`
                : "% des apparitions converties"
            }
          />
        </Card>
      </div>
      {/* Comment lire : note pédagogique (relative au funnel), pas un verdict
       * coloré. Le funnel est une confiance croissante Apparition → Citation. */}
      {hasData && (
        <p className="mt-3 type-meta text-[color:var(--color-ink-soft)]">
          Comment lire : plus tes apparitions se transforment en citations explicites, mieux
          c&apos;est. Ici {ratios.citationPct.toFixed(1)} % le deviennent. Une apparition élevée
          mais peu de citations = les IA te trouvent sans encore te recommander.
        </p>
      )}
    </>
  );
}
