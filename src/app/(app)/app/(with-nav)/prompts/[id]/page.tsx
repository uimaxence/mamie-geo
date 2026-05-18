import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { getPromptDetail } from "@/lib/prompts/queries";
import { Badge, Card, EmptyState, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { BreakdownBars } from "@/components/charts/breakdown-bars";
import { LLM_COLORS, LLM_LABELS } from "@/components/charts/llm-colors";
import { BatchesTable } from "@/components/app/batches-table";

// Page détail prompt /app/prompts/[id].
// Affiche : header (texte + actions) + 4 stats agrégées + breakdown par
// LLM + 10 derniers runs. Tab pour basculer entre vue d'ensemble et
// concurrents cités sur ce prompt.

export const dynamic = "force-dynamic";

export default async function PromptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const detail = await getPromptDetail(id, session.user.id);
  if (!detail) notFound();

  // Breakdown segments : 1 par LLM, valeur = avgScore sur 30j
  const breakdownSegments = detail.byLlm.map((row) => ({
    id: row.llm,
    label: LLM_LABELS[row.llm] ?? row.llm,
    value: Math.round(row.avgScore * 10) / 10,
    color: LLM_COLORS[row.llm] ?? "#737373",
    suffix: " / 100",
  }));

  const sentimentLabel: Record<
    string,
    { label: string; tone: "success" | "warning" | "error" | "neutral" }
  > = {
    positive: { label: "Positif", tone: "success" },
    neutral: { label: "Neutre", tone: "neutral" },
    negative: { label: "Négatif", tone: "error" },
    absent: { label: "Aucun", tone: "neutral" },
  };
  const sentimentDisplay = sentimentLabel[detail.dominantSentiment] ?? {
    label: "Aucun",
    tone: "neutral" as const,
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Link
        href="/app/prompts"
        className="type-eyebrow inline-flex items-center gap-1.5 hover:text-[color:var(--color-ink)]"
      >
        <ArrowLeft size={12} strokeWidth={2.5} />
        Retour aux prompts
      </Link>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          {detail.category && <Badge tone="neutral">{detail.category}</Badge>}
          <Badge tone={detail.isActive ? "success" : "neutral"}>
            {detail.isActive ? "Actif" : "En pause"}
          </Badge>
          <span className="type-meta">
            {detail.brand.name} · {detail.brand.domain}
          </span>
        </div>
        <h1 className="type-h2 mt-4">{detail.text}</h1>
      </header>

      {/* 4 stats agrégées */}
      <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <p className="type-eyebrow">Runs success (30 j)</p>
          <p className="type-stat mt-3">{detail.totals.totalRuns}</p>
          <p className="type-meta mt-2">tous LLMs confondus</p>
        </Card>
        <Card className="p-5">
          <p className="type-eyebrow">Marque citée</p>
          <p className="type-stat mt-3">
            {detail.totals.brandCited}
            <span className="text-base font-normal text-[color:var(--color-muted)]">
              {" "}
              / {detail.totals.totalRuns}
            </span>
          </p>
          <p className="type-meta mt-2">taux : {detail.totals.citationRate.toFixed(0)} %</p>
        </Card>
        <Card className="p-5">
          <p className="type-eyebrow">Sentiment dominant</p>
          <div className="mt-3">
            <Badge tone={sentimentDisplay.tone}>{sentimentDisplay.label}</Badge>
          </div>
          <p className="type-meta mt-3">via Claude Haiku 4.5</p>
        </Card>
        <Card className="p-5">
          <p className="type-eyebrow">Top concurrent</p>
          <p className="type-h3 mt-3">{detail.topCompetitors[0]?.name ?? "—"}</p>
          <p className="type-meta mt-2">
            {detail.topCompetitors[0]
              ? `${detail.topCompetitors[0].citationCount} mention(s)`
              : "aucune mention"}
          </p>
        </Card>
      </section>

      {/* Tabs : vue d'ensemble (breakdown) / concurrents */}
      <Tabs defaultValue="overview" className="mt-14">
        <TabsList>
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="competitors">
            Concurrents cités
            {detail.topCompetitors.length > 0 && (
              <span className="type-meta">({detail.topCompetitors.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="runs">Derniers runs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {breakdownSegments.length === 0 || breakdownSegments.every((s) => s.value === 0) ? (
            <EmptyState
              title="Pas encore de données"
              description="Le breakdown par LLM apparaît dès le premier run success. Le cron quotidien tourne à 06:00 UTC."
            />
          ) : (
            <div>
              <h2 className="type-h3">Score par LLM (30 j)</h2>
              <p className="type-meta mt-1">
                Score moyen 0–100 par moteur sur la fenêtre 30 jours.
              </p>
              <div className="mt-6">
                <BreakdownBars segments={breakdownSegments} mode="absolute" />
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="competitors">
          {detail.topCompetitors.length === 0 ? (
            <EmptyState
              title="Aucun concurrent cité"
              description="Soit la marque n'a pas encore de concurrent tracké, soit aucun n'est cité sur ce prompt."
            />
          ) : (
            <ol className="flex flex-col gap-3">
              {detail.topCompetitors.map((c, i) => (
                <li
                  key={c.name}
                  className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white px-5 py-3"
                >
                  <div className="flex items-center gap-4">
                    <span className="type-eyebrow">#{i + 1}</span>
                    <p className="type-h3">{c.name}</p>
                  </div>
                  <Badge tone="neutral">{c.citationCount} mention(s)</Badge>
                </li>
              ))}
            </ol>
          )}
        </TabsContent>

        <TabsContent value="runs">
          <BatchesTable
            batches={detail.recentBatches}
            showPromptColumn={false}
            emptyState={{
              title: "Aucun run pour l'instant",
              description:
                "Le cron quotidien se déclenche à 06:00 UTC. Tu peux aussi en lancer un depuis le dashboard.",
            }}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}
