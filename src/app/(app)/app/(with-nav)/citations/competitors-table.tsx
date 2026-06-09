"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { EllipsisVertical, Pencil, Plus, Sparkles, Trash2, Users } from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyState,
  EntityTypeBadge,
  toast,
} from "@/components/ui";
import { BrandFavicon } from "@/components/app/brand-favicon";
import { LLM_LABELS } from "@/components/charts/llm-colors";
import { createCompetitor, deleteCompetitor, updateCompetitor } from "./actions";
import { CompetitorFormDialog } from "./competitor-form-dialog";
import { cn } from "@/lib/utils";
import type { CompetitorRow, CompetitorRowWithMetrics } from "@/lib/competitors/queries";
import type { BrandSelfMetrics, SuggestedCompetitor } from "@/lib/competitors/metrics";

// Table concurrents (onglet /app/citations?tab=competitors). Refonte
// 2026-06-08 issu de la veille Peec docs (cf. doc 09 § Polish UI) :
// tableau léger favicon + nom + badge + aliases, plus de cards bloated.
// CRUD via dropdown menu sur chaque ligne + bouton primaire en haut.
//
// Ta marque est rendue **en première ligne** avec badge "Vous" pour
// donner le repère « tu te compares à eux ». Le brand actif n'est pas
// éditable depuis ici (CRUD côté /app/settings).

interface CompetitorsTableProps {
  /** Domaine de ta marque, affiché en première ligne pour ancrer la comparaison. */
  brandDomain: string | null;
  plan: string;
  initialCompetitors: CompetitorRowWithMetrics[];
  maxCompetitors: number;
  /** Fenêtre temporelle (en jours) sur laquelle les métriques sont calculées. */
  windowDays: number;
  /** Total des runs success utilisés comme dénominateur d'apparitionPct. */
  totalRuns: number;
  /** Métriques de ta marque, baseline pour la comparaison « vs toi ». */
  brandSelf: BrandSelfMetrics;
  /** Marques citées par les IA mais pas encore suivies (auto-découverte). */
  suggestions: SuggestedCompetitor[];
}

export function CompetitorsTable({
  brandDomain,
  plan,
  initialCompetitors,
  maxCompetitors,
  windowDays,
  totalRuns,
  brandSelf,
  suggestions,
}: CompetitorsTableProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editCompetitor, setEditCompetitor] = useState<CompetitorRow | null>(null);
  const [deleteCompetitorRow, setDeleteCompetitorRow] = useState<CompetitorRow | null>(null);
  // Nom en cours d'ajout depuis l'auto-découverte (désactive son bouton).
  const [addingName, setAddingName] = useState<string | null>(null);

  const atQuota =
    maxCompetitors !== Number.POSITIVE_INFINITY && initialCompetitors.length >= maxCompetitors;

  const quotaText =
    maxCompetitors === Number.POSITIVE_INFINITY
      ? `${initialCompetitors.length} concurrent${initialCompetitors.length > 1 ? "s" : ""}`
      : `${initialCompetitors.length} / ${maxCompetitors}`;

  function handleAddSuggestion(name: string) {
    if (atQuota) {
      toast.error(`Quota atteint (${maxCompetitors}). Passe à un plan supérieur pour suivre plus de concurrents.`);
      return;
    }
    setAddingName(name);
    startTransition(async () => {
      const result = await createCompetitor({ name, aliases: [] });
      if (result.ok) {
        toast.success(`${name} ajouté aux concurrents suivis`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
      setAddingName(null);
    });
  }

  function handleDelete() {
    if (!deleteCompetitorRow) return;
    startTransition(async () => {
      const result = await deleteCompetitor(deleteCompetitorRow.id);
      if (result.ok) {
        toast.success("Concurrent supprimé");
        setDeleteCompetitorRow(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.8125rem] text-[color:var(--color-muted)]">
          Plan {plan} · {quotaText} · métriques sur {windowDays} jours ({totalRuns} run
          {totalRuns > 1 ? "s" : ""})
        </p>
        <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus size={14} strokeWidth={2.2} />
          Ajouter un concurrent
        </Button>
      </div>

      {suggestions.length > 0 && (
        <SuggestionsCard
          suggestions={suggestions}
          addingName={addingName}
          disabled={pending}
          onAdd={handleAddSuggestion}
        />
      )}

      {initialCompetitors.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Users}
            title="Aucun concurrent pour l'instant"
            description="Les concurrents sont détectés dans les réponses IA à tes prompts — aucun run supplémentaire, donc aucun coût en plus. Ajoute-les pour suivre leur citations face à toi."
            action={
              <Button variant="primary" onClick={() => setCreateOpen(true)}>
                <Plus size={14} strokeWidth={2.2} />
                Ajouter un concurrent
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-[color:var(--color-border)]">
                <Th className="w-[28%]">Marque</Th>
                <Th className="w-[12%]">Type</Th>
                <Th className="w-[14%] text-right">Citations</Th>
                <Th className="w-[14%] text-right">Apparition</Th>
                <Th className="w-[14%]">Top LLM</Th>
                <Th className="w-[14%]">Dernière</Th>
                <Th className="w-12" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {/* Ta marque, première ligne, badge Vous : sert de référence
               * pour la colonne Apparition. Le delta « vs toi » des concurrents
               * se lit par rapport à cette ligne. */}
              {brandDomain && (
                <tr className="border-b border-[color:var(--color-border)] bg-[color:var(--color-gray-50)]/40">
                  <Td>
                    <div className="flex items-center gap-3">
                      <BrandFavicon domain={brandDomain} name={brandDomain} size={22} />
                      <span className="font-medium text-[color:var(--color-ink)]">
                        {brandDomain}
                      </span>
                    </div>
                  </Td>
                  <Td>
                    <EntityTypeBadge type="you" />
                  </Td>
                  <Td className="text-right tabular-nums">
                    {brandSelf.citationsCount === 0 ? (
                      <Muted />
                    ) : (
                      <span className="font-medium text-[color:var(--color-ink)]">
                        {brandSelf.citationsCount}
                      </span>
                    )}
                  </Td>
                  <Td className="text-right">
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="tabular-nums font-medium text-[color:var(--color-ink)]">
                        {brandSelf.apparitionPct.toFixed(1)}%
                      </span>
                      <span className="text-[11px] text-[color:var(--color-muted)]">référence</span>
                    </div>
                  </Td>
                  <Td>
                    <Muted />
                  </Td>
                  <Td>
                    <Muted />
                  </Td>
                  <Td />
                </tr>
              )}

              {initialCompetitors.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-[color:var(--color-border)] last:border-0 transition-colors hover:bg-[color:var(--color-gray-50)]"
                >
                  <Td>
                    <div className="flex items-center gap-3">
                      <BrandFavicon domain={c.domain ?? c.name} name={c.name} size={22} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-[color:var(--color-ink)]">
                          {c.name}
                        </div>
                        {c.domain && (
                          <div className="truncate text-[0.75rem] text-[color:var(--color-muted)]">
                            {c.domain}
                          </div>
                        )}
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <EntityTypeBadge type="competitor" />
                  </Td>
                  <Td className="text-right tabular-nums">
                    {c.citationsCount === 0 ? (
                      <Muted />
                    ) : (
                      <span className="font-medium text-[color:var(--color-ink)]">
                        {c.citationsCount}
                      </span>
                    )}
                  </Td>
                  <Td className="text-right">
                    {c.citationsCount === 0 ? (
                      <div className="flex flex-col items-end gap-0.5">
                        <Muted />
                        <VsYou delta={-brandSelf.apparitionPct} />
                      </div>
                    ) : (
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="tabular-nums text-[color:var(--color-ink)]">
                          {c.apparitionPct.toFixed(1)}%
                        </span>
                        <VsYou delta={c.apparitionPct - brandSelf.apparitionPct} />
                      </div>
                    )}
                  </Td>
                  <Td>
                    {c.topLlm ? (
                      <Badge tone="neutral" className="text-[11px]">
                        {LLM_LABELS[c.topLlm] ?? c.topLlm}
                      </Badge>
                    ) : (
                      <Muted />
                    )}
                  </Td>
                  <Td className="text-[0.8125rem] text-[color:var(--color-muted)]">
                    {c.lastCitedAt ? formatRelative(c.lastCitedAt) : <Muted />}
                  </Td>
                  <Td>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        aria-label="Actions"
                        className="inline-flex size-7 items-center justify-center rounded-[var(--radius-sm)] text-[color:var(--color-muted)] hover:bg-[color:var(--color-gray-100)] hover:text-[color:var(--color-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)]"
                      >
                        <EllipsisVertical size={14} strokeWidth={2} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setEditCompetitor(c)}>
                          <Pencil size={14} strokeWidth={2} />
                          Éditer
                        </DropdownMenuItem>
                        <DropdownMenuItem danger onSelect={() => setDeleteCompetitorRow(c)}>
                          <Trash2 size={14} strokeWidth={2} />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CompetitorFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={async (data) => {
          const result = await createCompetitor(data);
          if (result.ok) {
            toast.success("Concurrent ajouté");
            setCreateOpen(false);
            router.refresh();
            return { ok: true };
          }
          toast.error(result.error);
          return { ok: false, error: result.error };
        }}
      />

      {editCompetitor && (
        <CompetitorFormDialog
          mode="edit"
          initial={editCompetitor}
          open
          onOpenChange={(o) => !o && setEditCompetitor(null)}
          onSubmit={async (data) => {
            const result = await updateCompetitor(editCompetitor.id, data);
            if (result.ok) {
              toast.success("Concurrent mis à jour");
              setEditCompetitor(null);
              router.refresh();
              return { ok: true };
            }
            toast.error(result.error);
            return { ok: false, error: result.error };
          }}
        />
      )}

      <Dialog
        open={deleteCompetitorRow !== null}
        onOpenChange={(o) => !o && setDeleteCompetitorRow(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce concurrent ?</DialogTitle>
            <DialogDescription>
              {deleteCompetitorRow?.name} ne sera plus tracké. Les runs passés restent en
              historique. Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteCompetitorRow(null)} disabled={pending}>
              Annuler
            </Button>
            <Button variant="accent" onClick={handleDelete} disabled={pending}>
              {pending ? "Suppression…" : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Auto-découverte : marques que les IA citent sur ton marché et que tu
// ne suis pas encore (extraites de scoring.competitorsMentioned, donc
// déjà payées). Montre que l'app voit plus large que ta liste + ajout
// en 1 clic. Cf. doc 09 § 2026-06-09 auto-découverte concurrents.
function SuggestionsCard({
  suggestions,
  addingName,
  disabled,
  onAdd,
}: {
  suggestions: SuggestedCompetitor[];
  addingName: string | null;
  disabled: boolean;
  onAdd: (name: string) => void;
}) {
  return (
    <div className="mt-4 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[color:var(--color-accent-faint)]/40 p-4">
      <div className="flex items-start gap-2.5">
        <Sparkles
          size={16}
          strokeWidth={2}
          className="mt-0.5 shrink-0 text-[color:var(--color-accent)]"
          aria-hidden
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[color:var(--color-ink)]">
            Détectés par les IA, pas encore suivis
          </p>
          <p className="mt-0.5 text-[0.8125rem] text-[color:var(--color-muted)]">
            Ces marques sont citées sur ton marché dans les réponses IA. Ajoute-les pour les
            suivre face à toi, sans coût supplémentaire.
          </p>
        </div>
      </div>

      <ul className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <li key={s.name}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onAdd(s.name)}
              className="group inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[color:var(--color-border)] bg-white py-1 pl-3 pr-2 text-sm transition-colors hover:border-[color:var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="font-medium text-[color:var(--color-ink)]">{s.name}</span>
              <span className="tabular-nums text-[0.75rem] text-[color:var(--color-muted)]">
                {s.citationsCount}×
              </span>
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-[color:var(--color-gray-100)] text-[color:var(--color-ink-soft)] group-hover:bg-[color:var(--color-accent)] group-hover:text-white">
                {addingName === s.name ? (
                  <span className="size-2.5 animate-pulse rounded-full bg-current" aria-label="Ajout…" />
                ) : (
                  <Plus size={13} strokeWidth={2.4} />
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Delta d'apparition d'un concurrent par rapport à toi, en points de %.
// Couleur du point de vue de l'utilisateur : rouge = le concurrent te
// dépasse (zone à reprendre), vert = tu es devant. Neutre si ex aequo.
function VsYou({ delta }: { delta: number }) {
  const rounded = Math.round(delta * 10) / 10;
  if (Math.abs(rounded) < 0.05) {
    return <span className="text-[11px] text-[color:var(--color-muted)]">= toi</span>;
  }
  const competitorAhead = rounded > 0;
  const sign = competitorAhead ? "+" : "−";
  return (
    <span
      className={cn(
        "text-[11px] font-medium tabular-nums",
        competitorAhead ? "text-[color:var(--color-error)]" : "text-[color:var(--color-success)]",
      )}
      title={
        competitorAhead
          ? "Ce concurrent apparaît plus souvent que toi"
          : "Tu apparais plus souvent que ce concurrent"
      }
    >
      {sign}
      {Math.abs(rounded).toFixed(1)} pts vs toi
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
      {...props}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 align-middle ${className ?? ""}`}>{children}</td>;
}

function Muted() {
  return <span className="text-[color:var(--color-faint)]">—</span>;
}

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  return `il y a ${diffD} j`;
}
