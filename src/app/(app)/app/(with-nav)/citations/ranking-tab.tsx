"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Info, Minus, Plus, Target, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Badge, EmptyState, EntityTypeBadge, SegmentedControl } from "@/components/ui";
import { BrandFavicon } from "@/components/app/brand-favicon";
import { DownloadableChart } from "@/components/charts/downloadable-chart";
import { LLM_LABELS } from "@/components/charts/llm-colors";
import { RankLineChart } from "@/components/charts/rank-line-chart";
import { capture } from "@/lib/posthog-client";
import type { RankingData } from "@/lib/competitors/queries";
import { RANKING_RELIABLE_AFTER_DAYS, type RankingEntry } from "@/lib/competitors/ranking";
import { createCompetitor } from "./actions";

// Onglet Classement de /app/citations (cf. doc 02 § Ranking, étapes 1+2).
// Leaderboard marque + concurrents trackés + marques détectées, trié par
// mentions sur la fenêtre, avec delta de rang vs J-7 et filtre par LLM.
// Données pré-calculées côté serveur (getRankingData) — zéro appel LLM.
// Tant que l'historique est < RANKING_RELIABLE_AFTER_DAYS jours, un hint
// discret précise que le classement est encore jeune — il disparaît de
// lui-même quand les données suffisent (piloté par la donnée, rien à
// stocker côté client).

type Scope = "all" | string;

export function RankingTab({ data }: { data: RankingData }) {
  const router = useRouter();
  const [scope, setScope] = useState<Scope>("all");
  const [pending, startTransition] = useTransition();
  // Marque détectée en cours d'ajout (désactive son bouton Suivre).
  const [addingKey, setAddingKey] = useState<string | null>(null);

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
  const history = scope === "all" ? data.history : (data.historyByLlm[scope] ?? []);
  const scopeOptions = [
    { value: "all", label: "Tous les LLMs" },
    ...data.llms.map((llm) => ({ value: llm, label: LLM_LABELS[llm] ?? llm })),
  ];

  function handleScopeChange(next: Scope) {
    setScope(next);
    capture("ranking_scope_changed", { from: scope, to: next });
  }

  function handleTrack(entry: RankingEntry) {
    setAddingKey(entry.key);
    startTransition(async () => {
      const result = await createCompetitor({ name: entry.name, aliases: [] });
      if (result.ok) {
        toast.success(`${entry.name} ajouté aux concurrents suivis`);
        capture("ranking_discovered_tracked", { name: entry.name, rank: entry.rank });
        router.refresh();
      } else {
        toast.error(result.error);
      }
      setAddingKey(null);
    });
  }

  const isYoung = data.dataDays < RANKING_RELIABLE_AFTER_DAYS;

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

      {/* Hint de fiabilité : visible tant que l'historique est jeune,
       * disparaît seul au-delà du seuil — volontairement discret (texte
       * muted, pas un Banner). */}
      {isYoung && (
        <p className="mt-3 flex items-start gap-1.5 text-[0.8125rem] text-[color:var(--color-muted)]">
          <Info size={13} strokeWidth={2} aria-hidden className="mt-0.5 shrink-0" />
          <span>
            Classement encore jeune ({data.dataDays} jour{data.dataDays > 1 ? "s" : ""} de données)
            : les résultats gagnent en fiabilité au fil des runs quotidiens, compte environ{" "}
            {RANKING_RELIABLE_AFTER_DAYS} jours. Ce message disparaîtra de lui-même.
          </span>
        </p>
      )}

      <RankStatus entries={entries} scopeLabel={scopeLabel(scope)} />

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
                      <>
                        <Badge tone="neutral" className="text-[11px]">
                          détectée
                        </Badge>
                        <button
                          type="button"
                          onClick={() => handleTrack(e)}
                          disabled={pending}
                          className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] border border-[color:var(--color-border)] bg-white px-2 py-0.5 text-[0.6875rem] font-medium text-[color:var(--color-ink-soft)] transition hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)] disabled:opacity-40"
                        >
                          <Plus size={11} strokeWidth={2.2} aria-hidden />
                          {addingKey === e.key ? "Ajout…" : "Suivre"}
                        </button>
                      </>
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
        encore suivies — clique « Suivre » pour les ajouter à tes concurrents.
      </p>

      {/* Évolution du rang : un point par jour (sous-fenêtre glissante 7 j),
       * affichée dès 2 points pour éviter un chart vide le premier jour.
       * Export PNG pour partage (rapport client, LinkedIn). */}
      {history.length >= 2 && (
        <section className="mt-8">
          <h3 className="text-sm font-semibold text-[color:var(--color-ink)]">
            Évolution de ton rang
            {scope !== "all" && ` · ${LLM_LABELS[scope] ?? scope}`}
          </h3>
          <div className="mt-3 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-4">
            <DownloadableChart filename={`rang-${scope}`} className="pt-2">
              <RankLineChart
                data={history.map((p) => ({ date: formatDay(p.date), rank: p.rank }))}
                maxRank={Math.max(...history.map((p) => p.outOf))}
              />
            </DownloadableChart>
          </div>
        </section>
      )}
    </div>
  );
}

function scopeLabel(scope: Scope): string {
  return scope === "all" ? "tous LLMs confondus" : `sur ${LLM_LABELS[scope] ?? scope}`;
}

function formatDay(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${day}/${month}`;
}

// Statut compétitif au-dessus du leaderboard : où tu en es + le prochain
// objectif concret (gamification par le rang, cf. doc 02 § Gamification
// 2026-06-11 — pas de points ni de badges décoratifs, le rang EST le jeu).
function RankStatus({
  entries,
  scopeLabel,
}: {
  entries: RankingEntry[];
  scopeLabel: string;
}) {
  const you = entries.find((e) => e.type === "you");
  if (!you || you.mentions === 0) {
    // Cas « zéro citation » : runs présents mais ta marque jamais citée —
    // rendre l'invisibilité explicite plutôt qu'un tableau de tirets muets.
    const someoneCited = entries.some((e) => e.mentions > 0);
    return (
      <p className="mt-4 flex items-start gap-2 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] px-4 py-3 text-[0.8125rem] text-[color:var(--color-ink-soft)]">
        <Target size={14} strokeWidth={2} aria-hidden className="mt-0.5 shrink-0" />
        <span>
          Ta marque n&apos;a pas encore été citée sur la fenêtre, {scopeLabel}.{" "}
          {someoneCited
            ? "Le classement ci-dessous montre qui est recommandé à ta place — c'est ton point de départ."
            : "Aucune marque suivie n'a été citée non plus : les IA répondent sans recommander de marque sur tes prompts actuels, ou les marques citées ne sont pas encore détectées."}
        </span>
      </p>
    );
  }

  const above = entries.find((e) => e.rank === you.rank - 1);
  const below = entries.find((e) => e.rank === you.rank + 1);
  return (
    <p className="mt-4 flex items-start gap-2 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] px-4 py-3 text-[0.8125rem] text-[color:var(--color-ink-soft)]">
      {you.rank === 1 ? (
        <Trophy size={14} strokeWidth={2} aria-hidden className="mt-0.5 shrink-0 text-[color:var(--color-accent)]" />
      ) : (
        <Target size={14} strokeWidth={2} aria-hidden className="mt-0.5 shrink-0" />
      )}
      <span>
        {you.rank === 1 ? (
          <>
            <strong className="font-semibold text-[color:var(--color-ink)]">
              Ta marque est n°1
            </strong>{" "}
            {scopeLabel}
            {below &&
              (you.mentions === below.mentions
                ? ` — à égalité de citations avec ${below.name}.`
                : ` — ${you.mentions - below.mentions} citation${you.mentions - below.mentions > 1 ? "s" : ""} d'avance sur ${below.name}.`)}
          </>
        ) : (
          <>
            <strong className="font-semibold text-[color:var(--color-ink)]">
              Ta marque est n°{you.rank}
            </strong>{" "}
            sur {entries.length} {scopeLabel}
            {above &&
              (above.mentions === you.mentions
                ? ` — à égalité de citations avec ${above.name} (n°${above.rank}).`
                : ` — à ${above.mentions - you.mentions} citation${above.mentions - you.mentions > 1 ? "s" : ""} de ${above.name} (n°${above.rank}).`)}
          </>
        )}
      </span>
    </p>
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
