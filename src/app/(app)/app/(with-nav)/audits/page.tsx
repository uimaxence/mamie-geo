import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowRight, GitCompare, Plus, Wrench } from "lucide-react";
import { auth } from "@/lib/auth";
import { Badge, Card, EmptyState, LinkButton } from "@/components/ui";
import { getDashboardData } from "@/lib/dashboard/queries";
import { getAuditUsage } from "@/lib/audits/counters";
import { quotasFor } from "@/lib/plans/quotas";
import { listAudits } from "./actions";

// /app/audits — historique des audits techniques de la workspace.
// Sprint 6 PR B (cf. doc 09 § 2026-05-17).

export const dynamic = "force-dynamic";

export default async function AuditsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const data = await getDashboardData(session.user.id);
  if (!data) redirect("/app/onboarding");

  const audits = await listAudits(data.workspace.id);
  const usage = await getAuditUsage(data.workspace.id, data.workspace.plan);
  const quotas = quotasFor(data.workspace.plan);

  const ownedAudits = audits.filter((a) => !a.isCompetitor);
  const competitorAudits = audits.filter((a) => a.isCompetitor);
  const hasComparison = quotas.comparisonCompetitors > 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:px-10">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <span className="type-eyebrow">Audits techniques</span>
          <h1 className="type-h1 mt-2">Diagnostic de tes sites.</h1>
          <p className="type-body mt-2 max-w-2xl text-sm text-[color:var(--color-ink-soft)]">
            30+ checks SEO + GEO + accessibilité + performance. Lance un audit, garde
            l&apos;historique, et compare-toi à tes concurrents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasComparison && (
            <LinkButton href="/app/audits/compare" variant="secondary" size="md">
              <GitCompare size={14} className="mr-1.5" />
              Comparer concurrents
            </LinkButton>
          )}
          <LinkButton href="/app/audits/new" variant="primary" size="md">
            <Plus size={14} className="mr-1.5" />
            Nouvel audit
          </LinkButton>
        </div>
      </header>

      {/* Quota usage banner */}
      <Card className="mt-8 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="type-eyebrow">Quota mensuel</p>
            <p className="mt-1 text-sm">
              <span className="font-semibold text-[color:var(--color-ink)]">
                {usage.auditsCount}
              </span>
              <span className="text-[color:var(--color-muted)]">
                {" "}
                / {Number.isFinite(usage.maxAudits) ? usage.maxAudits : "∞"} audits utilisés (
                {usage.periodStart} → renouvelle le mois prochain)
              </span>
            </p>
          </div>
          {hasComparison && (
            <div className="text-right">
              <p className="type-eyebrow">Concurrents audités</p>
              <p className="mt-1 text-sm">
                <span className="font-semibold text-[color:var(--color-ink)]">
                  {usage.competitorAuditsCount}
                </span>
                <span className="text-[color:var(--color-muted)]">
                  {" "}
                  /{" "}
                  {Number.isFinite(usage.maxComparisonCompetitors)
                    ? usage.maxComparisonCompetitors
                    : "∞"}
                </span>
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Mes audits */}
      <section className="mt-12">
        <h2 className="type-h2">Mes URLs</h2>
        {ownedAudits.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="Aucun audit pour l'instant"
            description="Lance ton premier audit en 10 secondes. URL pré-remplie depuis ta marque trackée."
            className="mt-6"
            action={
              <LinkButton href="/app/audits/new" variant="primary" size="md">
                Auditer mon site
              </LinkButton>
            }
          />
        ) : (
          <ul className="mt-6 divide-y divide-[color:var(--color-border)] rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white">
            {ownedAudits.map((audit) => (
              <AuditRow key={audit.url} audit={audit} />
            ))}
          </ul>
        )}
      </section>

      {/* Concurrents audités */}
      {hasComparison && competitorAudits.length > 0 && (
        <section className="mt-12">
          <h2 className="type-h2">Concurrents</h2>
          <ul className="mt-6 divide-y divide-[color:var(--color-border)] rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white">
            {competitorAudits.map((audit) => (
              <AuditRow key={audit.url} audit={audit} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function AuditRow({
  audit,
}: {
  audit: {
    url: string;
    latestId: string;
    latestScore: number;
    latestFetchedAt: Date;
    previousScore: number | null;
    historyCount: number;
    isCompetitor: boolean;
  };
}) {
  const delta = audit.previousScore !== null ? audit.latestScore - audit.previousScore : null;
  return (
    <li>
      <Link
        href={`/app/audits/${audit.latestId}`}
        className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[color:var(--color-gray-50)]"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[color:var(--color-ink)]">{audit.url}</p>
          <p className="type-meta mt-0.5">
            {audit.historyCount} audit{audit.historyCount > 1 ? "s" : ""} ·{" "}
            {formatRelative(audit.latestFetchedAt)}
            {audit.isCompetitor && (
              <Badge tone="neutral" className="ml-2">
                concurrent
              </Badge>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p
              className="type-tabular text-2xl font-semibold"
              style={{ color: scoreColor(audit.latestScore) }}
            >
              {audit.latestScore}
              <span className="text-sm font-normal text-[color:var(--color-muted)]">/100</span>
            </p>
            {delta !== null && (
              <p
                className="type-meta tabular-nums"
                style={{ color: delta < 0 ? "#dc2626" : delta > 0 ? "#16a34a" : undefined }}
              >
                {delta > 0 ? "+" : ""}
                {delta} vs précédent
              </p>
            )}
          </div>
          <ArrowRight size={16} className="text-[color:var(--color-muted)]" />
        </div>
      </Link>
    </li>
  );
}

function scoreColor(score: number): string {
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#d97706";
  return "#dc2626";
}

function formatRelative(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `il y a ${diffD} j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}
