"use client";

import Link from "next/link";
import { Bot, Cat, ChevronRight, MessageCircle, Search, Sparkles, type LucideIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  EmptyState,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Badge,
} from "@/components/ui";
import { RunStatusBadge } from "@/components/app/run-status-badge";
import { LLM_COLORS, LLM_LABELS } from "@/components/charts/llm-colors";
import { cn } from "@/lib/utils";
import {
  LLM_ORDER,
  type BatchDominantSentiment,
  type RunBatch,
  type RunBatchEntry,
} from "@/lib/runs/batches-grouping";
import type { LLMValue } from "@/lib/llm";

// Map LLM → icône Lucide identifiée (même mapping que <LLMPill>).
// Choix sémantique : MessageCircle (chat) pour ChatGPT, Bot pour Claude
// (Anthropic), Search pour Perplexity (search engine), Sparkles pour
// Gemini (magic), Cat pour Le Chat (référence directe au nom Mistral).
const LLM_ICONS: Record<LLMValue, LucideIcon> = {
  chatgpt: MessageCircle,
  claude: Bot,
  perplexity: Search,
  gemini: Sparkles,
  lechat: Cat,
};

// Tableau « derniers runs » version V0+ (refonte 2026-05-18 issu veille
// concurrence 2026-05-11). 1 ligne = 1 batch (prompt × jour, regroupe les
// runs des 5 LLMs). Dépliable au clic pour voir le détail par LLM.
//
// Réutilisable sur :
// - /app/dashboard (showPromptColumn=true, brand-scoped)
// - /app/prompts/[id] (showPromptColumn=false, prompt-scoped)
// - autres usages futurs (filtré par LLM, par concurrent, etc.)

interface BatchesTableProps {
  batches: RunBatch[];
  /** Affiche la colonne "Prompt" (dashboard). False sur la page détail prompt. */
  showPromptColumn?: boolean;
  /** Empty state custom, par défaut un message générique */
  emptyState?: {
    title: string;
    description: string;
  };
}

export function BatchesTable({
  batches,
  showPromptColumn = true,
  emptyState,
}: BatchesTableProps) {
  if (batches.length === 0) {
    return (
      <EmptyState
        title={emptyState?.title ?? "Aucun run pour l'instant"}
        description={
          emptyState?.description ??
          "Le cron quotidien se déclenche à 06:00 UTC. Tu peux aussi en lancer un manuellement depuis le dashboard."
        }
      />
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="mt-4 border-t border-[color:var(--color-border)]">
        {/* Header */}
        <HeaderRow showPromptColumn={showPromptColumn} />

        {/* Batches */}
        {batches.map((batch) => (
          <BatchRow key={batch.key} batch={batch} showPromptColumn={showPromptColumn} />
        ))}
      </div>
    </TooltipProvider>
  );
}

function HeaderRow({ showPromptColumn }: { showPromptColumn: boolean }) {
  return (
    <div className="flex items-center gap-3 border-b border-[color:var(--color-border)] px-3 py-2.5">
      <span className="size-4" aria-hidden />
      {showPromptColumn && <span className="type-eyebrow flex-1">Prompt</span>}
      <span className="type-eyebrow w-24">Exécuté</span>
      <span className="type-eyebrow w-32">IA</span>
      <span className="type-eyebrow w-16 text-right">Citée</span>
      <span className="type-eyebrow w-24 text-right">Sentiment</span>
    </div>
  );
}

function BatchRow({
  batch,
  showPromptColumn,
}: {
  batch: RunBatch;
  showPromptColumn: boolean;
}) {
  return (
    <Collapsible>
      <CollapsibleTrigger
        className={cn(
          "group flex w-full items-center gap-3 border-b border-[color:var(--color-border)] px-3 py-3 text-left transition-colors",
          "hover:bg-[color:var(--color-gray-50)] focus-visible:bg-[color:var(--color-gray-50)] focus-visible:outline-none",
        )}
      >
        <ChevronRight
          size={16}
          strokeWidth={2}
          className="text-[color:var(--color-muted)] transition-transform duration-150 group-data-[state=open]:rotate-90"
        />
        {showPromptColumn && (
          <span
            className="flex-1 truncate text-[color:var(--color-ink)]"
            title={batch.promptText}
          >
            {batch.promptText}
          </span>
        )}
        <span className="type-meta w-24">{formatRelative(batch.latestScheduledAt)}</span>
        <div className="w-32">
          <LlmIcons runs={batch.runs} />
        </div>
        <span className="type-tabular w-16 text-right text-sm">
          {batch.summary.citedCount}/{batch.summary.totalRuns}
        </span>
        <span className="flex w-24 justify-end">
          <SentimentBadge sentiment={batch.summary.dominantBrandSentiment} />
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="border-b border-[color:var(--color-border)] bg-[color:var(--color-gray-50)]">
        <BatchRunsDetail runs={batch.runs} />
      </CollapsibleContent>
    </Collapsible>
  );
}

/**
 * 5 avatars LLM dans l'ordre canonique (ChatGPT, Claude, Perplexity,
 * Gemini, Le Chat). Refonte 2026-05-26 : remplace les <StatusDot> par
 * des avatars colorés à logo Lucide (cohérent avec <LLMPill> mais
 * compact, sans label). Le statut du run est encodé via opacité +
 * ring de couleur :
 *   - cité (marque mentionnée) : avatar plein, ring vert subtil
 *   - run réussi non-cité : avatar plein (couleur LLM), pas de ring
 *   - run failed : avatar plein + ring rouge
 *   - pas exécuté / pending / skipped : avatar grisé (gray-100), faible opacité
 */
function LlmIcons({ runs }: { runs: RunBatchEntry[] }) {
  const byLlm = new Map(runs.map((r) => [r.llm, r]));
  return (
    <div className="flex items-center gap-1.5">
      {LLM_ORDER.map((llm) => {
        const run = byLlm.get(llm);
        return (
          <Tooltip key={llm}>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <LlmAvatar llm={llm} run={run} />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <span className="font-medium">{LLM_LABELS[llm] ?? llm}</span>
              {run ? <> · {dotTooltipFor(run)}</> : <> · pas exécuté</>}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

function LlmAvatar({ llm, run }: { llm: LLMValue; run: RunBatchEntry | undefined }) {
  const Icon = LLM_ICONS[llm];
  const tone = avatarToneFor(run);

  if (tone === "muted") {
    // Pas exécuté / pending / skipped : cercle gris clair, icône
    // grise. Ne pas masquer complètement pour garder le compte visuel
    // « 5 IA trackées » même quand certaines sont en attente.
    return (
      <span className="inline-flex size-5 items-center justify-center rounded-full bg-[color:var(--color-gray-100)] text-[color:var(--color-gray-400)]">
        <Icon size={11} strokeWidth={2} />
      </span>
    );
  }

  const ringClass =
    tone === "cited"
      ? "ring-2 ring-[color:var(--color-success)]/30"
      : tone === "failed"
        ? "ring-2 ring-[color:var(--color-error)]/40"
        : ""; // "neutral" (réussi non-cité) : pas de ring

  return (
    <span
      className={cn(
        "inline-flex size-5 items-center justify-center rounded-full text-white",
        ringClass,
      )}
      style={{ backgroundColor: LLM_COLORS[llm] }}
    >
      <Icon size={11} strokeWidth={2.5} />
    </span>
  );
}

function avatarToneFor(
  run: RunBatchEntry | undefined,
): "cited" | "neutral" | "failed" | "muted" {
  if (!run) return "muted";
  if (run.status === "failed") return "failed";
  if (run.status !== "success") return "muted";
  // success
  if (run.brandMentioned === true) return "cited";
  return "neutral";
}

function dotTooltipFor(run: RunBatchEntry): string {
  if (run.status === "failed") return "échec";
  if (run.status === "skipped") return "skippé";
  if (run.status === "pending") return "en attente";
  if (run.status === "running") return "en cours";
  // success
  if (run.brandMentioned === true) return "citée";
  if (run.brandMentioned === false) return "non citée";
  if (run.brandMentioned === "skipped") return "regex 0";
  return "non scoré";
}

/**
 * Badge sentiment dominant du batch — KPI business introduit
 * 2026-05-26 en remplacement de la colonne "Durée" (jugée technique
 * sans valeur métier).
 */
function SentimentBadge({ sentiment }: { sentiment: BatchDominantSentiment }) {
  if (sentiment === "positive") return <Badge tone="success">Positif</Badge>;
  if (sentiment === "negative") return <Badge tone="error">Négatif</Badge>;
  if (sentiment === "neutral") return <Badge tone="warning">Neutre</Badge>;
  if (sentiment === "mixed") return <Badge tone="neutral">Mixte</Badge>;
  // "absent" ou null : marque non citée ou pas encore scorée → pas
  // de signal sentiment exploitable
  return <span className="type-meta">—</span>;
}

/**
 * Mini-table dépliée : 5 lignes (LLM × statut × citée × coût × durée).
 * Chaque ligne pointe vers /app/runs/[id] pour le détail complet.
 */
function BatchRunsDetail({ runs }: { runs: RunBatchEntry[] }) {
  return (
    <div className="overflow-x-auto px-3 py-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[color:var(--color-muted)]">
            <DetailTh>IA</DetailTh>
            <DetailTh>Statut</DetailTh>
            <DetailTh>Citée</DetailTh>
            <DetailTh>Sentiment</DetailTh>
            <DetailTh align="right" />
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr key={run.id}>
              <DetailTd>
                <span className="font-medium">{LLM_LABELS[run.llm] ?? run.llm}</span>
                {run.cacheHit && (
                  <span className="ml-2 type-meta">cache</span>
                )}
              </DetailTd>
              <DetailTd>
                <RunStatusBadge status={run.status} />
              </DetailTd>
              <DetailTd>
                <BrandSignal value={run.brandMentioned} />
              </DetailTd>
              <DetailTd>
                <EntrySentimentBadge sentiment={run.brandSentiment} />
              </DetailTd>
              <DetailTd align="right">
                <Link
                  href={`/app/runs/${run.id}`}
                  className="type-meta hover:text-[color:var(--color-ink)] hover:underline"
                >
                  Détail →
                </Link>
              </DetailTd>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DetailTh({
  children,
  align = "left",
}: {
  children?: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      scope="col"
      className={cn(
        "type-eyebrow py-1.5 px-2",
        align === "right" ? "text-right" : "text-left",
      )}
    >
      {children}
    </th>
  );
}

function DetailTd({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td
      className={cn("py-1.5 px-2 align-middle", align === "right" ? "text-right" : "text-left")}
    >
      {children}
    </td>
  );
}

function BrandSignal({ value }: { value: RunBatchEntry["brandMentioned"] }) {
  if (value === true) return <Badge tone="success">citée</Badge>;
  if (value === false) return <span className="type-meta">non</span>;
  if (value === "skipped") return <span className="type-meta">regex 0</span>;
  return <span className="type-meta">—</span>;
}

/**
 * Sentiment d'un run individuel (LLM unique) — utilisé dans la
 * mini-table dépliée. Plus granulaire que <SentimentBadge> qui agrège
 * sur tout le batch.
 */
function EntrySentimentBadge({ sentiment }: { sentiment: RunBatchEntry["brandSentiment"] }) {
  if (sentiment === "positive") return <Badge tone="success">Positif</Badge>;
  if (sentiment === "negative") return <Badge tone="error">Négatif</Badge>;
  if (sentiment === "neutral") return <Badge tone="warning">Neutre</Badge>;
  return <span className="type-meta">—</span>;
}

function formatRelative(date: Date): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  return `il y a ${diffD} j`;
}
