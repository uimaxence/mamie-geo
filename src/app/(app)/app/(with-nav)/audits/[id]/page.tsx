import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, OctagonAlert, TriangleAlert } from "lucide-react";
import { auth } from "@/lib/auth";
import { Badge, Card, CardBody, CardHeader } from "@/components/ui";
import { getDashboardData } from "@/lib/dashboard/queries";
import { getRecommendation } from "@/lib/audit/recommendations";
import type { CheckResult, SubScore } from "@/lib/audit/types";
import { getAuditDetail } from "../actions";

// /app/audits/[id], détail full d'un audit (rapport persisté en DB).
// Pas de teaser ni de gate email : tu es payant, tu vois tout.

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
  const failures = checks.filter((c) => c.status === "fail");
  const warnings = checks.filter((c) => c.status === "warn");
  const passed = checks.filter((c) => c.status === "pass");

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
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
              <strong className="text-[color:var(--color-error)]">{failures.length}</strong> à
              corriger
            </p>
            <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">
              <strong className="text-[color:var(--color-warning)]">{warnings.length}</strong> à
              surveiller
            </p>
            <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">
              <strong className="text-[color:var(--color-success)]">{passed.length}</strong> bons
              points
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

      {/* Issues à corriger */}
      {failures.length > 0 && (
        <section className="mt-12">
          <h2 className="type-h2">À corriger ({failures.length})</h2>
          <ul className="mt-6 flex flex-col gap-4">
            {failures.map((check) => (
              <CheckCard key={check.id} check={check} />
            ))}
          </ul>
        </section>
      )}

      {warnings.length > 0 && (
        <section className="mt-12">
          <h2 className="type-h2">À surveiller ({warnings.length})</h2>
          <ul className="mt-6 flex flex-col gap-4">
            {warnings.map((check) => (
              <CheckCard key={check.id} check={check} />
            ))}
          </ul>
        </section>
      )}

      {passed.length > 0 && (
        <section className="mt-12">
          <h2 className="type-h2">Bons points ({passed.length})</h2>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {passed.map((check) => (
              <li
                key={check.id}
                className="flex items-start gap-2.5 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white p-3"
              >
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0 text-[color:var(--color-success)]"
                />
                <p className="text-sm text-[color:var(--color-ink-soft)]">{check.label}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function CheckCard({ check }: { check: CheckResult }) {
  const reco = getRecommendation(check.id);
  const Icon = check.status === "fail" ? OctagonAlert : TriangleAlert;
  const iconColor = check.status === "fail" ? "var(--color-error)" : "var(--color-warning)";

  return (
    <li>
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <Icon size={20} className="mt-1 shrink-0" style={{ color: iconColor }} />
            <div className="flex-1">
              <h3 className="type-h3">{check.label}</h3>
              <p className="type-meta mt-1 font-mono">{check.id}</p>
            </div>
            {reco.geoImpact && (
              <Badge
                tone={
                  reco.geoImpact === "high"
                    ? "accent"
                    : reco.geoImpact === "medium"
                      ? "blue"
                      : "neutral"
                }
              >
                Impact GEO {reco.geoImpact}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardBody>
          {check.found && (
            <div className="mb-3 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] p-3">
              <p className="type-eyebrow">Trouvé sur la page</p>
              <p className="mt-1 font-mono text-xs text-[color:var(--color-ink)]">{check.found}</p>
            </div>
          )}
          {check.expected && (
            <p className="text-sm text-[color:var(--color-ink-soft)]">
              <strong className="text-[color:var(--color-ink)]">Attendu :</strong> {check.expected}
            </p>
          )}
          <div className="mt-4">
            <p className="type-eyebrow">Pourquoi</p>
            <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">{reco.why}</p>
          </div>
          <div className="mt-4">
            <p className="type-eyebrow">Comment fixer · ~{reco.estimatedEffort}</p>
            <pre className="mt-2 overflow-x-auto rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] p-3 text-xs leading-relaxed text-[color:var(--color-ink)] whitespace-pre-wrap">
              {reco.howToFix}
            </pre>
            {reco.externalDoc && (
              <p className="mt-2">
                <a
                  href={reco.externalDoc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[color:var(--color-ink-soft)] underline-offset-2 hover:underline"
                >
                  Doc officielle →
                </a>
              </p>
            )}
          </div>
        </CardBody>
      </Card>
    </li>
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
