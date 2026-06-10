"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Minus, Trophy } from "lucide-react";
import { Badge, EmptyState, EntityTypeBadge, SegmentedControl } from "@/components/ui";
import { BrandFavicon } from "@/components/app/brand-favicon";
import { LLM_LABELS } from "@/components/charts/llm-colors";
import { capture } from "@/lib/posthog-client";
import type { RankingData } from "@/lib/competitors/queries";
import type { RankingEntry } from "@/lib/competitors/ranking";

// Onglet Classement de /app/citations (cf. doc 02 § Ranking, étapes 1+2).
// Leaderboard marque + concurrents trackés + marques détectées, trié par
// mentions sur la fenêtre, avec delta de rang vs J-7 et filtre par LLM.
// Données pré-calculées côté serveur (getRankingData) — zéro appel LLM.

type Scope = "all" | string;

export function RankingTab({ data }: { data: RankingData }) {
  const [scope, setScope] = useState<Scope>("all");

  useEffect(() => {
    capture("ranking_viewed", {
      window_days: data.windowDays,
      total_runs: data.totalRuns,
      entries: data.all.length,
    });
    // fire 1× au montage de l'onglet — les changements de filtre ont leur
    // propre event ci-dessous.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (data.totalRuns === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="Pas encore de classement"
        description={`Le classement se construit avec les runs quotidiens : dès que les IA répondent à tes prompts, tu verras qui domine les réponses sur les ${data.windowDays} derniers jours.`}
      />
    );
  }

  const entries = scope === "all" ? data.all : (data.byLlm[scope] ?? data.all);
  const scopeOptions = [
    { value: "all", label: "Tous les LLMs" },
    ...data.llms.map((llm) => ({ value: llm, label: LLM_LABELS[llm] ?? llm })),
  ];

  function handleScopeChange(next: Scope) {
    setScope(next);
    capture("ranking_scope_changed", { from: scope, to: next });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          value={scope}
          onValueChange={handleScopeChange}
          options={scopeOptions}
          ariaLabel="Filtrer le classement par LLM"
          size="sm"
        />
        <span className="type-meta">
          {data.windowDays} derniers jours · delta vs J-{data.deltaDays}
        </span>
      </div>

      <div className="mt-4 overflow-x-auto rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[color:var(--color-border)]">
              <Th className="w-16">Rang</Th>
              <Th>Marque</Th>
              <Th className="hidden w-20 md:table-cell" aria-label="Évolution" />
              <Th className="w-[18%] text-right">Citations</Th>
              <Th className="w-[18%] text-right">Apparition</Th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr
                key={e.key}
                className={`border-b border-[color:var(--color-border)] last:border-0 ${
                  e.type === "you" ? "bg-[color:var(--color-gray-50)]/40" : ""
                }`}
              >
                <Td>
                  <span className="tabular-nums font-semibold text-[color:var(--color-ink)]">
                    #{e.rank}
                  </span>
                </Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <BrandFavicon domain={e.domain ?? e.name} name={e.name} size={22} />
                    <span
                      className={`truncate ${
                        e.type === "you"
                          ? "font-semibold text-[color:var(--color-ink)]"
                          : "font-medium text-[color:var(--color-ink)]"
                      }`}
                    >
                      {e.name}
                    </span>
                    {e.type === "you" && <EntityTypeBadge type="you" />}
                    {e.type === "discovered" && (
                      <Badge tone="neutral" className="text-[11px]">
                        détectée, non suivie
                      </Badge>
                    )}
                  </div>
                </Td>
                <Td className="hidden md:table-cell">
                  <RankDelta entry={e} />
                </Td>
                <Td className="text-right tabular-nums">
                  {e.mentions === 0 ? (
                    <span className="text-[color:var(--color-faint)]">0</span>
                  ) : (
                    <span className="font-medium text-[color:var(--color-ink)]">{e.mentions}</span>
                  )}
                </Td>
                <Td className="text-right">
                  {e.mentions === 0 ? (
                    <span className="text-[0.8125rem] text-[color:var(--color-muted)]">
                      jamais citée sur la fenêtre
                    </span>
                  ) : (
                    <span className="tabular-nums text-[color:var(--color-ink)]">
                      {e.apparitionPct.toFixed(1)}%
                    </span>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="type-meta mt-3">
        Les marques « détectées » sont citées par les IA dans les réponses à tes prompts mais pas
        encore suivies — ajoute-les depuis l&apos;onglet Concurrents pour les suivre finement.
      </p>
    </div>
  );
}

// Delta de rang vs la même fenêtre décalée de deltaDays. previousRank
// null = pas encore d'historique comparable (pas de backfill).
function RankDelta({ entry }: { entry: RankingEntry }) {
  if (entry.previousRank === null) {
    return (
      <span className="text-[0.75rem] text-[color:var(--color-faint)]" title="Pas encore d'historique">
        —
      </span>
    );
  }
  const delta = entry.previousRank - entry.rank;
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[0.75rem] text-[color:var(--color-muted)]">
        <Minus size={12} strokeWidth={2.2} aria-hidden />
        stable
      </span>
    );
  }
  const up = delta > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[0.75rem] font-medium tabular-nums ${
        up ? "text-[color:var(--color-green)]" : "text-[color:var(--color-error)]"
      }`}
    >
      {up ? (
        <ArrowUp size={12} strokeWidth={2.2} aria-hidden />
      ) : (
        <ArrowDown size={12} strokeWidth={2.2} aria-hidden />
      )}
      {Math.abs(delta)}
    </span>
  );
}

function Th({
  children,
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`px-4 py-2.5 text-left text-[0.75rem] font-medium text-[color:var(--color-muted)] ${className ?? ""}`}
      scope="col"
      {...props}
    >
      {children}
    </th>
  );
}

function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className ?? ""}`}>{children}</td>;
}
