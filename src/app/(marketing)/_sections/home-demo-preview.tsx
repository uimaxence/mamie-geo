import Link from "next/link";
import { ArrowUpRight, Flame, PieChart, Users } from "lucide-react";
import { Badge, Card, Section, Stat } from "@/components/ui";
import { LLM_COLORS, LLM_LABELS } from "@/components/charts/llm-colors";
import type { BreakdownSegment } from "@/components/charts/breakdown-bars";
import type { LLMValue } from "@/lib/llm";
import { buildDemoBundle } from "@/lib/demo/seed";
import { HomeDemoPreviewBars } from "./home-demo-preview-bars";

// "Aperçu en direct", section show-don't-tell inspirée du pattern
// DataFast (datafa.st) : le visiteur voit le dashboard incrusté dans la
// home avant de cliquer vers /demo. Réutilise le même seed déterministe
// (buildDemoBundle), pas d'appel DB, pas d'appel LLM, full statique.
// Placée après HowItWorks et avant TesOutils : narratif "tu viens de
// comprendre comment ça marche → regarde le résultat".

const LLM_ORDER: readonly LLMValue[] = [
  "chatgpt",
  "claude",
  "perplexity",
  "gemini",
  "lechat",
] as const;

function buildSegments(values: Record<LLMValue, number>): BreakdownSegment[] {
  return LLM_ORDER.map((llm) => ({
    id: llm,
    label: LLM_LABELS[llm] ?? llm,
    value: Math.round(values[llm] * 10) / 10,
    color: LLM_COLORS[llm] ?? "#737373",
    suffix: " / 100",
  }));
}

export function HomeDemoPreview() {
  const { dashboard, trend } = buildDemoBundle();
  const agg = dashboard.metricsAggregated;

  // Snapshot du jour, lu depuis metricsToday.
  const snapshot = LLM_ORDER.reduce(
    (acc, llm) => {
      const row = dashboard.metricsToday.find((m) => m.llm === llm);
      acc[llm] = row?.visibilityScore ?? 0;
      return acc;
    },
    {} as Record<LLMValue, number>,
  );

  // Moyennes glissantes calculées depuis le trend (90 jours dispos).
  function avgWindow(days: number): Record<LLMValue, number> {
    const window = trend.slice(-days);
    return LLM_ORDER.reduce(
      (acc, llm) => {
        const vals = window
          .map((p) => (typeof p[llm] === "number" ? (p[llm] as number) : 0))
          .filter((v) => v > 0);
        acc[llm] = vals.length === 0 ? 0 : vals.reduce((a, b) => a + b, 0) / vals.length;
        return acc;
      },
      {} as Record<LLMValue, number>,
    );
  }

  const todaySegments = buildSegments(snapshot);
  const segments7d = buildSegments(avgWindow(7));
  const segments30d = buildSegments(avgWindow(30));

  return (
    <Section variant="default" pad="xl" id="apercu">
      <div className="mx-auto max-w-3xl text-center">
        <span className="type-eyebrow">Aperçu en direct</span>
        <h2 className="type-h1 mt-3">Voilà ce que tu regardes chaque matin.</h2>
        <p className="type-body-lg mt-4 text-[color:var(--color-ink-soft)]">
          Une marque française de cosmétiques bio, trackée sur les 5 IA grand public.
        </p>
      </div>

      {/* Browser chrome mocké, contient un mini-dashboard interactif. */}
      <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-lg)]">
        {/* Topbar style macOS */}
        <div className="flex items-center gap-3 border-b border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] px-4 py-3">
          <div className="flex gap-1.5">
            <span aria-hidden className="size-3 rounded-full bg-[#ff5f57]" />
            <span aria-hidden className="size-3 rounded-full bg-[#febc2e]" />
            <span aria-hidden className="size-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 truncate rounded-md border border-[color:var(--color-border)] bg-white px-3 py-1 text-center text-xs text-[color:var(--color-muted)]">
            mamie-geo.fr/app/dashboard
          </div>
        </div>

        {/* Contenu dashboard miniaturisé */}
        <div className="p-6 sm:p-8">
          {/* Header brand */}
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="type-eyebrow">Aperçu</span>
              <h3 className="type-h2 mt-2">Floréal</h3>
              <p className="type-meta mt-1">cosmétiques bio · floreal.fr</p>
            </div>
            <Badge tone="green">5 IA suivies quotidiennement</Badge>
          </div>

          {/* Stats fixes, lues sur le snapshot J0 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="p-4">
              <Stat
                label="Score de visibilité"
                value={agg.visibilityScore.toFixed(1)}
                icon={Flame}
                iconTone="orange"
                hint="sur 100 · moyenne 5 IA"
              />
            </Card>
            <Card className="p-4">
              <Stat
                label="Top concurrent"
                value={agg.topCompetitor?.name ?? "Aucun"}
                icon={Users}
                iconTone="purple"
                hint={
                  agg.topCompetitor
                    ? `${agg.topCompetitor.citationCount} mentions`
                    : "aucune mention"
                }
              />
            </Card>
            <Card className="p-4">
              <Stat
                label="Part de voix"
                value={`${agg.partDeVoix.toFixed(1)}%`}
                icon={PieChart}
                iconTone="blue"
                hint={`${agg.brandCitedCount} citations / jour`}
              />
            </Card>
          </div>

          {/* Visibilité par LLM, interactif (today / 7j / 30j) */}
          <HomeDemoPreviewBars today={todaySegments} avg7d={segments7d} avg30d={segments30d} />
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          href="/demo"
          className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[color:var(--color-border)] bg-white px-5 py-2.5 text-sm font-medium text-[color:var(--color-ink)] shadow-[var(--shadow-sm)] transition hover:bg-[color:var(--color-gray-50)]"
        >
          Explorer la démo complète
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </Section>
  );
}
