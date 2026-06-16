"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronRight, Globe } from "lucide-react";
import { EmptyState, EntityTypeBadge, GlossaryInfo } from "@/components/ui";
import { BrandFavicon } from "@/components/app/brand-favicon";
import { BrandMultiSelect } from "@/components/app/brand-multi-select";
import { encodeSourceSlug } from "@/lib/sources/slug";
import { classifySource } from "@/lib/sources/classify";
import { cn } from "@/lib/utils";
import type { SourceListItem } from "@/lib/sources/queries";
import type { EntityType } from "@/components/ui";

// Onglet /app/citations?tab=sources. Refonte conceptuelle 2026-06-09 :
// au-delà de la table, on répond aux 3 questions de l'utilisateur —
//   1. C'est quoi ? → explainer + glossaire
//   2. Pourquoi ça compte ? → encart présence ("ton domaine est-il là ?")
//   3. Concurrents ou pas ? → tag exact Vous/Concurrent + filtre par type
//
// Le tag Vous/Concurrent est exact (domaines en base via classifySource) ;
// reference/ugc heuristiques, le reste neutre en attendant le classifier
// LLM V1 (cf. doc 02 § Domain Types classification).

interface SourcesTableProps {
  sources: SourceListItem[];
  workspaceBrands: Array<{ id: string; name: string; domain: string }>;
  /** Domaine de ta marque, pour auto-tagger les sources en "Vous". */
  brandDomain: string | null;
  /** Domaines des concurrents suivis, pour tagger les sources en "Concurrent". */
  competitorDomains: (string | null)[];
}

interface ClassifiedSource extends SourceListItem {
  host: string;
  type: EntityType;
}

// Types affichés comme filtres, dans l'ordre de pertinence. On masque
// les filtres sans aucune source pour éviter les chips vides.
const FILTER_ORDER: EntityType[] = [
  "you",
  "competitor",
  "reference",
  "ugc",
  "editorial",
  "corporate",
  "other",
];
const FILTER_LABEL: Record<EntityType, string> = {
  you: "Vous",
  competitor: "Concurrents",
  reference: "Références",
  ugc: "UGC",
  editorial: "Éditorial",
  corporate: "Corporate",
  other: "Autres",
};

type Filter = EntityType | "all";

export function SourcesTable({
  sources,
  workspaceBrands,
  brandDomain,
  competitorDomains,
}: SourcesTableProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const classified = useMemo<ClassifiedSource[]>(
    () =>
      sources.map((s) => {
        const host = extractHost(s.url);
        return { ...s, host, type: classifySource(host, { brandDomain, competitorDomains }) };
      }),
    [sources, brandDomain, competitorDomains],
  );

  const counts = useMemo(() => {
    const c = {} as Record<EntityType, number>;
    for (const s of classified) c[s.type] = (c[s.type] ?? 0) + 1;
    return c;
  }, [classified]);

  const youCount = counts.you ?? 0;
  const competitorCount = counts.competitor ?? 0;

  const visible = filter === "all" ? classified : classified.filter((s) => s.type === filter);
  const activeFilters = FILTER_ORDER.filter((t) => (counts[t] ?? 0) > 0);

  return (
    <>
      {/* 1. Explainer — c'est quoi une source, en une phrase. */}
      <div className="flex items-start gap-2.5 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white px-4 py-3">
        <Globe
          size={15}
          strokeWidth={2}
          className="mt-0.5 shrink-0 text-[color:var(--color-muted)]"
          aria-hidden
        />
        <p className="text-[0.8125rem] leading-relaxed text-[color:var(--color-ink-soft)]">
          Quand une IA répond sur ton marché, elle s&apos;appuie sur ces pages.{" "}
          <span className="inline-flex items-center gap-1">
            Y être présent augmente tes chances d&apos;être cité
            <GlossaryInfo term="source" />
          </span>
          .
        </p>
      </div>

      {sources.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Globe}
            title="Aucune source pour l'instant"
            description="Les sources apparaîtront après les premiers runs avec recherche web activée. Lance un run depuis le dashboard pour amorcer la collecte."
          />
        </div>
      ) : (
        <>
          {/* 2. Présence — la question GEO clé : ton domaine est-il là ? */}
          <PresenceCallout
            youCount={youCount}
            competitorCount={competitorCount}
            hasBrandDomain={Boolean(brandDomain)}
          />

          {/* 3. Filtre par type + scope multi-marque. */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <FilterChip
                label="Tous"
                count={classified.length}
                active={filter === "all"}
                onClick={() => setFilter("all")}
              />
              {activeFilters.map((t) => (
                <FilterChip
                  key={t}
                  label={FILTER_LABEL[t]}
                  count={counts[t] ?? 0}
                  active={filter === t}
                  onClick={() => setFilter(t)}
                />
              ))}
            </div>
            {workspaceBrands.length > 1 && <BrandMultiSelect brands={workspaceBrands} />}
          </div>

          <div className="mt-4 overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[color:var(--color-border)]">
                  <Th className="w-[50%]">Domaine</Th>
                  <Th className="w-[15%]">Type</Th>
                  <Th className="w-[15%] text-right">Citations</Th>
                  <Th className="w-[15%]">Dernière</Th>
                  <Th className="w-12" aria-label="Détail" />
                </tr>
              </thead>
              <tbody>
                {visible.map((s) => {
                  const slug = encodeSourceSlug(s.url);
                  return (
                    <tr
                      key={s.url}
                      className="border-b border-[color:var(--color-border)] last:border-0 transition-colors hover:bg-[color:var(--color-gray-50)]"
                    >
                      <td className="px-4 py-3 align-middle">
                        <Link
                          href={`/app/citations/sources/${slug}`}
                          className="group flex min-w-0 items-center gap-3"
                        >
                          <BrandFavicon domain={s.host} name={s.host} size={22} />
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium text-[color:var(--color-ink)] group-hover:underline">
                              {s.host}
                            </div>
                            {s.title && (
                              <div className="truncate text-[0.75rem] text-[color:var(--color-muted)]">
                                {s.title}
                              </div>
                            )}
                          </div>
                        </Link>
                      </td>
                      <Td>
                        <EntityTypeBadge type={s.type} />
                      </Td>
                      <Td className="text-right tabular-nums font-medium text-[color:var(--color-ink)]">
                        {s.citationCount}
                      </Td>
                      <Td className="text-[0.8125rem] text-[color:var(--color-muted)]">
                        {formatRelative(s.lastCitedAt)}
                      </Td>
                      <td className="px-4 py-3 align-middle">
                        <Link
                          href={`/app/citations/sources/${slug}`}
                          aria-label={`Détail de ${s.host}`}
                          className="inline-flex size-7 items-center justify-center rounded-[var(--radius-sm)] text-[color:var(--color-muted)] hover:bg-[color:var(--color-gray-100)] hover:text-[color:var(--color-ink)]"
                        >
                          <ChevronRight size={14} strokeWidth={2} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

// Encart présence : répond à « est-ce que je suis dans le territoire que
// l'IA juge crédible ? ». Vert si oui, ambre actionnable si non.
function PresenceCallout({
  youCount,
  competitorCount,
  hasBrandDomain,
}: {
  youCount: number;
  competitorCount: number;
  hasBrandDomain: boolean;
}) {
  // Sans domaine de marque renseigné, on ne peut pas statuer — on guide
  // vers les settings plutôt que d'afficher un faux négatif.
  if (!hasBrandDomain) {
    return (
      <Callout tone="neutral" icon={AlertTriangle}>
        Renseigne le domaine de ta marque dans les{" "}
        <Link href="/app/settings" className="font-medium underline underline-offset-2">
          réglages
        </Link>{" "}
        pour savoir si tu apparais parmi les sources des IA.
      </Callout>
    );
  }

  if (youCount > 0) {
    return (
      <Callout tone="success" icon={CheckCircle2}>
        <strong className="font-semibold">
          Ton domaine apparaît dans {youCount} source{youCount > 1 ? "s" : ""}.
        </strong>{" "}
        Les IA te citent déjà comme référence sur ton marché. Continue à publier pour renforcer
        cette présence.
      </Callout>
    );
  }

  return (
    <Callout tone="warning" icon={AlertTriangle}>
      <strong className="font-semibold">Ton domaine n&apos;apparaît dans aucune source.</strong>{" "}
      C&apos;est ton principal levier GEO : fais-toi mentionner sur les pages ci-dessous
      {competitorCount > 0
        ? `, dont ${competitorCount} sont déjà des concurrents que les IA citent.`
        : " que les IA jugent crédibles."}
    </Callout>
  );
}

function Callout({
  tone,
  icon: Icon,
  children,
}: {
  tone: "success" | "warning" | "neutral";
  icon: typeof CheckCircle2;
  children: React.ReactNode;
}) {
  const toneClass = {
    success:
      "border-[color:var(--color-success)]/25 bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]",
    warning:
      "border-[color:var(--color-warning)]/25 bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]",
    neutral:
      "border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] text-[color:var(--color-muted)]",
  }[tone];

  return (
    <div
      className={cn(
        "mt-5 flex items-start gap-2.5 rounded-[var(--radius-lg)] border px-4 py-3",
        toneClass,
      )}
    >
      <Icon size={16} strokeWidth={2} className="mt-0.5 shrink-0" aria-hidden />
      <p className="text-[0.8125rem] leading-relaxed text-[color:var(--color-ink-soft)]">
        {children}
      </p>
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-3 py-1 text-[0.8125rem] font-medium transition-colors",
        active
          ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-white"
          : "border-[color:var(--color-border)] bg-white text-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-gray-50)]",
      )}
    >
      {label}
      <span
        className={cn("tabular-nums", active ? "text-white/70" : "text-[color:var(--color-muted)]")}
      >
        {count}
      </span>
    </button>
  );
}

function extractHost(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
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

function Th({ children, className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`px-4 py-2.5 text-left text-[0.75rem] font-medium text-[color:var(--color-muted)] ${className ?? ""}`}
      {...props}
    >
      {children}
    </th>
  );
}

function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className ?? ""}`}>{children}</td>;
}
