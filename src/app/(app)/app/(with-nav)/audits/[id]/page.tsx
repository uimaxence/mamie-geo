import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { Badge, Card } from "@/components/ui";
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

      {/* Header score */}
      <Card className="mt-6 p-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="type-eyebrow flex items-center gap-2">
              <span>Score global</span>
              {audit.isCompetitor && <Badge tone="neutral">concurrent</Badge>}
            </p>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="type-stat text-7xl" style={{ color: scoreColor(audit.scoreGlobal) }}>
                {audit.scoreGlobal}
              </span>
              <span className="type-h2 text-[color:var(--color-muted)]">/100</span>
            </div>
            <p className="type-meta mt-3 font-mono">{audit.url}</p>
            <p className="type-meta mt-1">
              Audité {formatDate(audit.fetchedAt)} · HTTP {audit.httpStatus}
              {audit.psiUnavailable && " · PSI indisponible"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[color:var(--color-ink-soft)]">
              <strong className="text-[color:var(--color-error)]">{critical.length}</strong>{" "}
              critique{critical.length > 1 ? "s" : ""}
            </p>
            <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">
              <strong className="text-[color:var(--color-warning)]">{warnings.length}</strong>{" "}
              avertissement{warnings.length > 1 ? "s" : ""}
            </p>
            <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">
              <strong className="text-[color:var(--color-success)]">{info.length}</strong> info
              & bons points
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {subScores.map((sub) => (
            <div
              key={sub.category}
              className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] p-4"
            >
              <p className="type-eyebrow">{CATEGORY_LABEL[sub.category]}</p>
              <p className="type-stat mt-1.5 text-3xl" style={{ color: scoreColor(sub.score) }}>
                {sub.score}
              </p>
              <p className="type-meta mt-1">
                {sub.passed}/{sub.total} checks validés
              </p>
            </div>
          ))}
        </div>
      </Card>

      <ChecksBySeverity critical={critical} warnings={warnings} info={info} />
    </div>
  );
}

function scoreColor(score: number): string {
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#d97706";
  return "#dc2626";
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
