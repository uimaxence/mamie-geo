"use client";

import { CheckCircle2, ChevronRight, OctagonAlert, TriangleAlert } from "lucide-react";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui";
import { getRecommendation } from "@/lib/audit/recommendations";
import type { CheckResult } from "@/lib/audit/types";
import { cn } from "@/lib/utils";

// Refonte UX 2026-05-20 : groupe les checks d'un rapport audit par
// SÉVÉRITÉ (critique / avertissement / info) en sections dépliables,
// avec critical + warning ouverts par défaut et info fermé (focus
// utilisateur sur l'actionnable).
//
// Remplace l'ancien groupement par status (fail/warn/pass) qui mélangeait
// la nature du check et son résultat.

interface ChecksBySeverityProps {
  critical: CheckResult[];
  warnings: CheckResult[];
  info: CheckResult[];
}

export function ChecksBySeverity({ critical, warnings, info }: ChecksBySeverityProps) {
  return (
    <div className="mt-12 flex flex-col gap-6">
      <Section
        tone="critical"
        label="Critique"
        description="À corriger en priorité"
        checks={critical}
        defaultOpen
        emptyState={
          <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-success-bg)] px-4 py-3">
            <CheckCircle2 size={18} className="text-[color:var(--color-success)]" />
            <p className="text-sm text-[color:var(--color-ink)]">
              Aucun problème critique <span aria-hidden>🎉</span>
            </p>
          </div>
        }
      />
      <Section
        tone="warning"
        label="Avertissement"
        description="À surveiller, pas bloquant"
        checks={warnings}
        defaultOpen
      />
      <Section
        tone="info"
        label="Info & bons points"
        description="Ce qui passe et les checks informatifs"
        checks={info}
        defaultOpen={false}
      />
    </div>
  );
}

interface SectionProps {
  tone: "critical" | "warning" | "info";
  label: string;
  description: string;
  checks: CheckResult[];
  defaultOpen: boolean;
  emptyState?: React.ReactNode;
}

function Section({ tone, label, description, checks, defaultOpen, emptyState }: SectionProps) {
  if (checks.length === 0 && emptyState) {
    return <div>{emptyState}</div>;
  }
  if (checks.length === 0) return null;

  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger
        className={cn(
          "group flex w-full items-center gap-3 rounded-[var(--radius-lg)] border px-4 py-3 text-left transition-colors",
          tone === "critical"
            ? "border-[color:var(--color-error)]/30 bg-[color:var(--color-error-bg)] hover:bg-[color:var(--color-error-bg)]/80"
            : tone === "warning"
              ? "border-[color:var(--color-warning)]/30 bg-[color:var(--color-warning-bg)] hover:bg-[color:var(--color-warning-bg)]/80"
              : "border-[color:var(--color-border)] bg-white hover:bg-[color:var(--color-gray-50)]",
        )}
      >
        <ChevronRight
          size={16}
          strokeWidth={2}
          className="text-[color:var(--color-muted)] transition-transform duration-150 group-data-[state=open]:rotate-90"
        />
        <h2 className="type-h3 flex-1 text-base">{label}</h2>
        <span className="type-meta hidden sm:inline">{description}</span>
        <Badge
          tone={tone === "critical" ? "error" : tone === "warning" ? "warning" : "neutral"}
        >
          {checks.length}
        </Badge>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {tone === "info" ? (
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {checks.map((check) => (
              <InfoChip key={check.id} check={check} />
            ))}
          </ul>
        ) : (
          <ul className="mt-4 flex flex-col gap-4">
            {checks.map((check) => (
              <CheckCard key={check.id} check={check} />
            ))}
          </ul>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

function InfoChip({ check }: { check: CheckResult }) {
  const isPass = check.status === "pass";
  return (
    <li className="flex items-start gap-2.5 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white p-3">
      {isPass ? (
        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[color:var(--color-success)]" />
      ) : (
        <span
          aria-hidden
          className="mt-1.5 size-2 shrink-0 rounded-full bg-[color:var(--color-muted)]"
        />
      )}
      <p className="text-sm text-[color:var(--color-ink-soft)]">{check.label}</p>
    </li>
  );
}

function CheckCard({ check }: { check: CheckResult }) {
  const reco = getRecommendation(check.id);
  const Icon = check.severity === "critical" ? OctagonAlert : TriangleAlert;
  const iconColor =
    check.severity === "critical" ? "var(--color-error)" : "var(--color-warning)";

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
