import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { Badge, Card, ScoreBar, ScoreRing, SegmentBar } from "@/components/ui";
import { PageViewTracker } from "@/components/app/page-view-tracker";
import { getDashboardData } from "@/lib/dashboard/queries";
import type { CheckResult, SubScore } from "@/lib/audit/types";
import { getAuditDetail } from "../actions";
import { ChecksBySeverity } from "./checks-by-severity";

// /app/audits/[id], détail full d'un audit (rapport persisté en DB).
// Pas de teaser ni de gate email : tu es payant, tu vois tout.
//
// Refonte UX 2026-05-20 : groupement par sévérité (critical/warning/info)
// au lieu du précédent status (fail/warn/pass), via <ChecksBySeverity>.

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<SubScore["category"], string> = {
  seo: "SEO classique",
  geo: "Generative Engine Optimization",
  a11y: "Accessibilité",
  perf: "Performance",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AuditDetailPage({ params }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const data = await getDashboardData(session.user.id);
  if (!data) redirect("/app/onboarding");

  const { id } = await params;
  const audit = await getAuditDetail(data.workspace.id, id);
  if (!audit) notFound();

  const subScores = audit.subScores as SubScore[];
  const checks = audit.checks as CheckResult[];

  // Groupement par sévérité (refonte 2026-05-20). Logique :
  // - Critique : severity=critical ET le check échoue (status=fail)
  // - Avertissement : severity=warning ET le check warn/fail
  // - Info & bons points : tout le reste (severity=info, ou check qui
  //   pass quelle que soit sa sévérité = bon point)
  const critical = checks.filter((c) => c.severity === "critical" && c.status === "fail");
  const warnings = checks.filter(
    (c) => c.severity === "warning" && (c.status === "warn" || c.status === "fail"),
  );
  const info = checks.filter(
    (c) => !critical.includes(c) && !warnings.includes(c),
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
      <PageViewTracker
        event="audit_viewed"
        properties={{
          audit_id: id,
          score_global: audit.scoreGlobal,
          is_competitor: audit.isCompetitor,
          has_critical: critical.length > 0,
          critical_count: critical.length,
          warnings_count: warnings.length,
        }}
      />
      <Link
        href="/app/audits"
        className="inline-flex items-center gap-2 text-sm text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
      >
        <ArrowLeft size={14} />
        Retour aux audits
      </Link>

      {/* Header score — anneau + répartition par sévérité + sous-scores */}
      <Card className="mt-6 p-6 shadow-[var(--shadow-sm)] sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <ScoreRing value={audit.scoreGlobal} size={128} />

          <div className="min-w-0 flex-1">
            <p className="type-eyebrow flex items-center gap-2">
              <span>Score global</span>
              {audit.isCompetitor && <Badge tone="neutral">concurrent</Badge>}
            </p>
            <p className="mt-2 truncate font-mono text-sm text-[color:var(--color-ink)]">
              {audit.url}
            </p>
            <p className="type-meta mt-1">
              Audité {formatDate(audit.fetchedAt)} · HTTP {audit.httpStatus}
              {audit.psiUnavailable && " · PSI indisponible"}
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2">
            <IssuePill tone="critical" count={critical.length} singular="critique" plural="critiques" />
            <IssuePill
              tone="warning"
              count={warnings.length}
              singular="avertissement"
              plural="avertissements"
            />
            <IssuePill tone="success" count={info.length} singular="bon point" plural="info & bons points" />
          </div>
        </div>

        {/* Barre de répartition critiques / avertissements / bons points */}
        <SegmentBar
          className="mt-6"
          segments={[
            { value: critical.length, tone: "critical", label: `${critical.length} critiques` },
            { value: warnings.length, tone: "warning", label: `${warnings.length} avertissements` },
            { value: info.length, tone: "success", label: `${info.length} bons points` },
          ]}
        />

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {subScores.map((sub) => (
            <ScoreBar
              key={sub.category}
              label={CATEGORY_LABEL[sub.category]}
              value={sub.score}
              hint={`${sub.passed}/${sub.total} checks validés`}
            />
          ))}
        </div>
      </Card>

      <ChecksBySeverity critical={critical} warnings={warnings} info={info} />
    </div>
  );
}

// Pastille d'issue colorée (point + compteur + libellé), pattern des
// pills « 2 Critical / 8 high » des screens d'inspiration.
function IssuePill({
  tone,
  count,
  singular,
  plural,
}: {
  tone: "critical" | "warning" | "success";
  count: number;
  singular: string;
  plural: string;
}) {
  const styles = {
    critical: { dot: "#dc2626", bg: "var(--color-error-bg)" },
    warning: { dot: "#d97706", bg: "var(--color-warning-bg)" },
    success: { dot: "#16a34a", bg: "var(--color-success-bg)" },
  }[tone];
  return (
    <span
      className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-3 py-1 text-sm text-[color:var(--color-ink-soft)]"
      style={{ backgroundColor: styles.bg }}
    >
      <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ backgroundColor: styles.dot }} />
      <strong className="text-[color:var(--color-ink)] tabular-nums">{count}</strong>
      {count > 1 ? plural : singular}
    </span>
  );
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
