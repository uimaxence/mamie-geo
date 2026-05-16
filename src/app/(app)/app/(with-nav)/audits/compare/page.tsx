import { and, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, GitCompare } from "lucide-react";
import { db } from "@/db/client";
import { technicalAudits } from "@/db/schema";
import { auth } from "@/lib/auth";
import { Badge, Banner, Card, EmptyState, LinkButton } from "@/components/ui";
import { getDashboardData } from "@/lib/dashboard/queries";
import { quotasFor } from "@/lib/plans/quotas";
import type { SubScore } from "@/lib/audit/types";
import { listAudits } from "../actions";
import { CompetitorsBatchButton } from "./competitors-batch-button";

// /app/audits/compare — matrice URL × catégorie (concurrents inclus).
// Sprint 6 PR B (cf. doc 09 § 2026-05-17).
//
// Réservé aux plans avec `comparisonCompetitors > 0` (Starter+).
// Solo : page accessible mais affichée comme verrouillée (upsell).

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ batchStarted?: string }>;
}

const CATEGORY_LABEL: Record<SubScore["category"], string> = {
  seo: "SEO",
  geo: "GEO",
  a11y: "A11y",
  perf: "Perf",
};
const CATEGORY_ORDER: ReadonlyArray<SubScore["category"]> = ["seo", "geo", "a11y", "perf"];

export default async function ComparePage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const data = await getDashboardData(session.user.id);
  if (!data) redirect("/app/onboarding");

  const { batchStarted } = await searchParams;
  const quotas = quotasFor(data.workspace.plan);

  if (quotas.comparisonCompetitors === 0) {
    return <LockedView plan={data.workspace.plan} />;
  }

  const audits = await listAudits(data.workspace.id);

  // listAudits ne renvoie que le score global ; pour la matrice on a besoin
  // des sub-scores → on re-query la liste des `latestId` (audit le plus récent
  // par URL) directement.
  const latestIds = audits.map((a) => a.latestId);
  const rows = latestIds.length
    ? await db
        .select({
          id: technicalAudits.id,
          url: technicalAudits.url,
          isCompetitor: technicalAudits.isCompetitor,
          scoreGlobal: technicalAudits.scoreGlobal,
          subScores: technicalAudits.subScores,
        })
        .from(technicalAudits)
        .where(
          and(
            eq(technicalAudits.workspaceId, data.workspace.id),
            inArray(technicalAudits.id, latestIds),
          ),
        )
    : [];

  // Respecter l'ordre de listAudits (le plus récent en haut).
  const byId = new Map(rows.map((r) => [r.id, r]));
  const latestRows = audits
    .map((a) => byId.get(a.latestId))
    .filter((r): r is NonNullable<typeof r> => r !== undefined);

  const ownedRows = latestRows.filter((r) => !r.isCompetitor);
  const competitorRows = latestRows.filter((r) => r.isCompetitor);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:px-10">
      <Link
        href="/app/audits"
        className="inline-flex items-center gap-2 text-sm text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
      >
        <ArrowLeft size={14} />
        Retour aux audits
      </Link>

      <header className="mt-6">
        <span className="type-eyebrow">Comparaison concurrents</span>
        <h1 className="type-h1 mt-2">Comment tu te situes vs tes concurrents.</h1>
        <p className="type-body mt-2 max-w-2xl text-sm text-[color:var(--color-ink-soft)]">
          Audite tes concurrents en batch (1 audit par domaine). La matrice affiche le score par
          catégorie pour identifier où tu es devant et où tu dois progresser.
        </p>
      </header>

      {batchStarted === "1" && (
        <Banner tone="info" className="mt-8">
          Audits concurrents en cours d&apos;exécution en arrière-plan. Recharge la page dans 1-2
          minutes pour voir les scores apparaître.
        </Banner>
      )}

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="type-meta">
          Quota :{" "}
          {Number.isFinite(quotas.comparisonCompetitors)
            ? `${quotas.comparisonCompetitors} concurrents max par batch`
            : "concurrents illimités"}
        </p>
        <CompetitorsBatchButton />
      </div>

      {/* Matrice */}
      {latestRows.length === 0 ? (
        <EmptyState
          icon={GitCompare}
          title="Aucun audit pour l'instant"
          description="Lance un audit batch concurrents depuis le bouton ci-dessus, ou audite manuellement chaque URL depuis /app/audits/new."
          className="mt-10"
        />
      ) : (
        <Card className="mt-10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--color-border)]">
                <th className="px-4 py-3 text-left font-medium">URL</th>
                <th className="px-3 py-3 text-right font-medium">Global</th>
                {CATEGORY_ORDER.map((cat) => (
                  <th key={cat} className="px-3 py-3 text-right font-medium">
                    {CATEGORY_LABEL[cat]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ownedRows.map((row) => (
                <CompareRow key={row.id} row={row} highlight />
              ))}
              {competitorRows.length > 0 && (
                <tr className="border-t-4 border-[color:var(--color-border)]">
                  <td
                    colSpan={6}
                    className="px-4 py-2 text-xs uppercase tracking-wider text-[color:var(--color-muted)]"
                  >
                    Concurrents
                  </td>
                </tr>
              )}
              {competitorRows.map((row) => (
                <CompareRow key={row.id} row={row} highlight={false} />
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function CompareRow({
  row,
  highlight,
}: {
  row: {
    id: string;
    url: string;
    scoreGlobal: number;
    subScores: unknown;
  };
  highlight: boolean;
}) {
  const subs = row.subScores as SubScore[];
  const byCat = new Map(subs.map((s) => [s.category, s.score]));
  return (
    <tr
      className={`border-b border-[color:var(--color-border)] ${highlight ? "bg-[color:var(--color-gray-50)]" : ""}`}
    >
      <td className="px-4 py-3">
        <Link
          href={`/app/audits/${row.id}`}
          className="truncate font-mono text-xs text-[color:var(--color-ink)] underline-offset-2 hover:underline"
        >
          {row.url}
        </Link>
      </td>
      <td className="px-3 py-3 text-right">
        <span className="type-tabular font-semibold" style={{ color: scoreColor(row.scoreGlobal) }}>
          {row.scoreGlobal}
        </span>
      </td>
      {CATEGORY_ORDER.map((cat) => {
        const s = byCat.get(cat) ?? 0;
        return (
          <td key={cat} className="px-3 py-3 text-right">
            <span className="type-tabular text-xs" style={{ color: scoreColor(s) }}>
              {s}
            </span>
          </td>
        );
      })}
    </tr>
  );
}

function LockedView({ plan }: { plan: string }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/app/audits"
        className="inline-flex items-center gap-2 text-sm text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
      >
        <ArrowLeft size={14} />
        Retour aux audits
      </Link>
      <header className="mt-6">
        <Badge tone="accent">Réservé Starter & plus</Badge>
        <h1 className="type-h1 mt-3">Comparaison concurrents.</h1>
        <p className="type-body mt-3 text-sm text-[color:var(--color-ink-soft)]">
          Audite en batch les domaines de tes concurrents pour voir où tu es devant et où tu dois
          progresser. Disponible à partir du plan Starter (3 concurrents) et Pro (10 concurrents).
        </p>
        <p className="type-meta mt-2">Plan actuel : {plan}</p>
      </header>
      <div className="mt-8">
        <LinkButton href="/pricing" variant="primary" size="lg">
          Voir les plans →
        </LinkButton>
      </div>
    </div>
  );
}

function scoreColor(score: number): string {
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#d97706";
  return "#dc2626";
}
