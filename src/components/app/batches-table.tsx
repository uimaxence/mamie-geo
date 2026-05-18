"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  EmptyState,
  StatusDot,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Badge,
} from "@/components/ui";
import { RunStatusBadge } from "@/components/app/run-status-badge";
import { LLM_LABELS } from "@/components/charts/llm-colors";
import { cn } from "@/lib/utils";
import {
  LLM_ORDER,
  type RunBatch,
  type RunBatchEntry,
} from "@/lib/runs/batches-grouping";

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
  /** Empty state custom — par défaut un message générique */
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
      <span className="type-eyebrow w-32">LLMs</span>
      <span className="type-eyebrow w-16 text-right">Citée</span>
      <span className="type-eyebrow w-20 text-right">Durée</span>
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
          <LlmDots runs={batch.runs} />
        </div>
        <span className="type-tabular w-16 text-right text-sm">
          {batch.summary.citedCount}/{batch.summary.totalRuns}
        </span>
        <span className="type-tabular w-20 text-right text-sm">
          {batch.summary.durationAvgMs !== null
            ? `${(batch.summary.durationAvgMs / 1000).toFixed(1)}s`
            : "—"}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="border-b border-[color:var(--color-border)] bg-[color:var(--color-gray-50)]">
        <BatchRunsDetail runs={batch.runs} />
      </CollapsibleContent>
    </Collapsible>
  );
}

/**
 * 5 dots dans l'ordre canonique (ChatGPT, Claude, Perplexity, Gemini,
 * Le Chat). Tooltip au survol pour le détail par LLM.
 * Tones :
 *   - success (vert) : run réussi ET marque citée
 *   - warning (jaune) : run réussi mais marque pas citée
 *   - error (rouge) : run failed
 *   - neutral (gris) : skipped / pending / running / absent du batch
 */
function LlmDots({ runs }: { runs: RunBatchEntry[] }) {
  const byLlm = new Map(runs.map((r) => [r.llm, r]));
  return (
    <div className="flex items-center gap-1.5">
      {LLM_ORDER.map((llm) => {
        const run = byLlm.get(llm);
        const tone = dotToneFor(run);
        return (
          <Tooltip key={llm}>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <StatusDot tone={tone} />
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

function dotToneFor(
  run: RunBatchEntry | undefined,
): "success" | "warning" | "error" | "neutral" {
  if (!run) return "neutral";
  if (run.status === "failed") return "error";
  if (run.status !== "success") return "neutral";
  // success
  if (run.brandMentioned === true) return "success";
  return "warning";
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
 * Mini-table dépliée : 5 lignes (LLM × statut × citée × coût × durée).
 * Chaque ligne pointe vers /app/runs/[id] pour le détail complet.
 */
function BatchRunsDetail({ runs }: { runs: RunBatchEntry[] }) {
  return (
    <div className="overflow-x-auto px-3 py-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[color:var(--color-muted)]">
            <DetailTh>LLM</DetailTh>
            <DetailTh>Statut</DetailTh>
            <DetailTh>Citée</DetailTh>
            <DetailTh align="right">Durée</DetailTh>
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
              <DetailTd align="right">
                <span className="type-tabular">
                  {run.durationMs !== null
                    ? `${(run.durationMs / 1000).toFixed(1)}s`
                    : "—"}
                </span>
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
