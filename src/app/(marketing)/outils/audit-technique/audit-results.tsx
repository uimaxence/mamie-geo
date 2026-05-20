"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronRight, OctagonAlert } from "lucide-react";
import { Badge, Banner, Button, Card, CardBody, CardHeader, LinkButton } from "@/components/ui";
import { getRecommendation } from "@/lib/audit/recommendations";
import type { AuditReport, CheckResult, SubScore } from "@/lib/audit/types";
import { EmailGate } from "./email-gate";

// Affichage teaser des résultats, score global + 4 sub-scores + 3-5
// issues prioritaires. Le rapport complet (toutes les issues + recos
// détaillées) est envoyé par email après que le user ait soumis son
// email via <EmailGate>.

export function AuditResults({ report, onReset }: { report: AuditReport; onReset: () => void }) {
  const { topIssues, passedCount, failedCount } = useMemo(
    () => extractTeaserData(report),
    [report],
  );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <p className="type-meta">
          Audit de <span className="font-medium text-[color:var(--color-ink)]">{report.url}</span>
        </p>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Auditer une autre URL
        </Button>
      </div>

      {report.jsRendered && (
        <Banner tone="info" className="mb-4">
          Cette page semble nécessiter JavaScript pour rendre son contenu. Certains checks reflètent
          ce que les crawlers (Google, ChatGPT) voient sans JS, qui est aussi ce qui compte le plus
          pour le GEO.
        </Banner>
      )}

      {report.psiUnavailable && (
        <Banner tone="warning" className="mb-4">
          Données Core Web Vitals indisponibles (PageSpeed Insights timeout). Le reste du rapport
          reste valide.
        </Banner>
      )}

      {/* Hero score */}
      <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-8 shadow-[var(--shadow-sm)]">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="type-eyebrow">Score global</p>
            <div className="mt-3 flex items-baseline gap-3">
              <span
                className="type-stat text-[5rem]"
                style={{ color: scoreColor(report.scoreGlobal) }}
              >
                {report.scoreGlobal}
              </span>
              <span className="type-h2 text-[color:var(--color-muted)]">/ 100</span>
            </div>
            <p className="type-meta mt-2">
              Pondéré : SEO 30 % · GEO 35 % · Accessibilité 15 % · Performance 20 %
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:text-right">
            <p className="text-sm text-[color:var(--color-ink-soft)]">
              <strong className="text-[color:var(--color-error)]">{failedCount}</strong> points
              d&apos;amélioration
            </p>
            <p className="text-sm text-[color:var(--color-ink-soft)]">
              <strong className="text-[color:var(--color-success)]">{passedCount}</strong> bons
              points
            </p>
          </div>
        </div>

        {/* 4 sub-scores */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {report.subScores.map((sub) => (
            <SubScoreCard key={sub.category} sub={sub} />
          ))}
        </div>
      </div>

      {/* Top issues teaser */}
      <section className="mt-10">
        <header className="mb-4">
          <h2 className="type-h2">À corriger en priorité</h2>
          <p className="type-meta mt-1">
            {topIssues.length} issue(s) prioritaire(s) affichée(s), reçois le rapport complet (30+
            checks) par email.
          </p>
        </header>
        <ul className="flex flex-col gap-3">
          {topIssues.map((issue) => (
            <li key={issue.id}>
              <IssueCard issue={issue} />
            </li>
          ))}
        </ul>
      </section>

      {/* Email gate pour rapport complet */}
      <div className="mt-10">
        <EmailGate token={report.token} />
      </div>

      {/* CTA produit */}
      <Card className="mt-10">
        <CardHeader>
          <h3 className="type-h3">Tu veux qu&apos;on tracke ta visibilité IA en continu ?</h3>
          <p className="type-meta mt-1">
            Cet audit te dit ce qui cloche sur ton site. Mamie GEO mesure quotidiennement si ta
            marque apparaît dans les réponses de ChatGPT, Claude, Perplexity, Gemini et Le Chat.
          </p>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-3">
            <LinkButton href="/pricing" variant="primary">
              Voir les plans dès 9,99 €/mois →
            </LinkButton>
            <LinkButton href="/outils/test-visibilite-ia" variant="ai">
              Audit visibilité IA gratuit
            </LinkButton>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 75) return "var(--color-success)";
  if (score >= 50) return "var(--color-warning)";
  return "var(--color-error)";
}

function SubScoreCard({ sub }: { sub: SubScore }) {
  const label =
    sub.category === "seo"
      ? "SEO"
      : sub.category === "geo"
        ? "GEO"
        : sub.category === "a11y"
          ? "A11Y"
          : "Performance";
  const color = scoreColor(sub.score);
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] p-4">
      <p className="type-eyebrow">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums" style={{ color }}>
        {sub.score}
        <span className="text-sm text-[color:var(--color-muted)]"> /100</span>
      </p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--color-gray-200)]">
        <div
          className="h-full transition-all"
          style={{ width: `${sub.score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function IssueCard({ issue }: { issue: CheckResult }) {
  const reco = getRecommendation(issue.id);
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={`rounded-[var(--radius-lg)] border-l-4 bg-white p-4 shadow-[var(--shadow-sm)] ${
        issue.severity === "critical"
          ? "border-l-[color:var(--color-error)]"
          : issue.severity === "warning"
            ? "border-l-[color:var(--color-warning)]"
            : "border-l-[color:var(--color-border-strong)]"
      } border border-[color:var(--color-border)]`}
    >
      <div className="flex items-start gap-3">
        <SeverityIcon severity={issue.severity} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2">
            <p className="font-medium text-sm">{issue.label}</p>
            <Badge tone={severityTone(issue.severity)}>{severityLabel(issue.severity)}</Badge>
            {reco.geoImpact === "high" && <Badge tone="purple">Impact GEO ↑</Badge>}
            <span className="type-meta">{reco.estimatedEffort}</span>
          </div>
          {issue.found && (
            <p className="mt-2 text-xs text-[color:var(--color-muted)]">
              Trouvé :{" "}
              <code className="rounded bg-[color:var(--color-gray-100)] px-1.5 py-0.5">
                {issue.found}
              </code>
            </p>
          )}
          {issue.expected && (
            <p className="text-xs text-[color:var(--color-muted)]">Attendu : {issue.expected}</p>
          )}

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
          >
            {expanded ? "Masquer" : "Voir pourquoi + comment fixer"}
            <ChevronRight
              size={12}
              className={`transition-transform ${expanded ? "rotate-90" : ""}`}
            />
          </button>

          {expanded && (
            <div className="mt-3 rounded-[var(--radius-md)] bg-[color:var(--color-gray-50)] p-3 text-xs leading-relaxed text-[color:var(--color-ink-soft)]">
              <p className="mb-2 font-medium text-[color:var(--color-ink)]">Pourquoi ?</p>
              <p className="mb-3">{reco.why}</p>
              <p className="mb-2 font-medium text-[color:var(--color-ink)]">Comment fixer</p>
              <p className="whitespace-pre-wrap">{reco.howToFix}</p>
              {reco.externalDoc && (
                <p className="mt-3">
                  <a
                    href={reco.externalDoc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link"
                  >
                    Doc officielle →
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SeverityIcon({ severity }: { severity: CheckResult["severity"] }) {
  if (severity === "critical")
    return <OctagonAlert size={18} className="mt-0.5 shrink-0 text-[color:var(--color-error)]" />;
  if (severity === "warning")
    return (
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[color:var(--color-warning)]" />
    );
  return <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[color:var(--color-muted)]" />;
}

function severityTone(s: CheckResult["severity"]) {
  switch (s) {
    case "critical":
      return "error" as const;
    case "warning":
      return "warning" as const;
    case "info":
      return "neutral" as const;
  }
}

function severityLabel(s: CheckResult["severity"]): string {
  switch (s) {
    case "critical":
      return "critique";
    case "warning":
      return "à corriger";
    case "info":
      return "info";
  }
}

function extractTeaserData(report: AuditReport) {
  const failed = report.checks.filter((c) => c.status === "fail" || c.status === "warn");
  const passed = report.checks.filter((c) => c.status === "pass");
  const sevWeight = (c: CheckResult) =>
    (c.severity === "critical" ? 30 : c.severity === "warning" ? 10 : 1) +
    (getRecommendation(c.id).geoImpact === "high" ? 15 : 0);
  const topIssues = failed.sort((a, b) => sevWeight(b) - sevWeight(a)).slice(0, 5);
  return { topIssues, passedCount: passed.length, failedCount: failed.length };
}
