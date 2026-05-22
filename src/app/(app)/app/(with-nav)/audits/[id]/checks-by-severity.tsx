"use client";

import { CheckCircle2, ChevronRight, OctagonAlert, TriangleAlert } from "lucide-react";
import {
  Badge,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui";
import { getRecommendation } from "@/lib/audit/recommendations";
import type { CheckResult } from "@/lib/audit/types";
import { cn } from "@/lib/utils";

// Groupement des checks d'un rapport audit par SÉVÉRITÉ (critique /
// avertissement / info), avec sections dépliables fusionnées : le
// header (trigger) et les items (content) vivent dans la MÊME card
// pour qu'il n'y ait pas de cassure visuelle entre "Critique 3" et
// les 3 items critiques. Itération 2026-05-22.
//
// Critical + warning ouverts par défaut, info fermé (focus user sur
// l'actionnable).

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
          <div className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[color:var(--color-success-bg)] px-4 py-3">
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

// Une "carte unique" par sévérité : container `rounded border bg-white`
// qui englobe le trigger ET le content. La séparation interne entre
// trigger (header) et content (liste) se fait via une `border-t` quand
// la section est ouverte — visuellement fondu.
function Section({ tone, label, description, checks, defaultOpen, emptyState }: SectionProps) {
  if (checks.length === 0 && emptyState) {
    return <div>{emptyState}</div>;
  }
  if (checks.length === 0) return null;

  const borderClass =
    tone === "critical"
      ? "border-[color:var(--color-error)]/30"
      : tone === "warning"
        ? "border-[color:var(--color-warning)]/35"
        : "border-[color:var(--color-border)]";

  const headerBgClass =
    tone === "critical"
      ? "bg-[color:var(--color-error-bg)]/60 hover:bg-[color:var(--color-error-bg)]"
      : tone === "warning"
        ? "bg-[color:var(--color-warning-bg)]/60 hover:bg-[color:var(--color-warning-bg)]"
        : "bg-[color:var(--color-bg)] hover:bg-[color:var(--color-gray-50)]";

  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className={cn(
        "overflow-hidden rounded-[var(--radius-xl)] border bg-[color:var(--color-bg)]",
        borderClass,
      )}
    >
      <CollapsibleTrigger
        className={cn(
          "group flex w-full items-center gap-3 px-5 py-4 text-left transition-colors",
          headerBgClass,
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
          <ul className="grid grid-cols-1 gap-0 border-t border-[color:var(--color-border)] sm:grid-cols-2">
            {checks.map((check, i) => (
              <InfoChip
                key={check.id}
                check={check}
                last={i === checks.length - 1}
                lastInRow={i === checks.length - 1 || (i % 2 === 1)}
              />
            ))}
          </ul>
        ) : (
          <ul className="divide-y divide-[color:var(--color-border)] border-t border-[color:var(--color-border)]">
            {checks.map((check) => (
              <CheckItem key={check.id} check={check} />
            ))}
          </ul>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

function InfoChip({
  check,
  last,
  lastInRow,
}: {
  check: CheckResult;
  last: boolean;
  lastInRow: boolean;
}) {
  const isPass = check.status === "pass";
  return (
    <li
      className={cn(
        "flex items-start gap-2.5 px-4 py-3",
        !last && "border-b border-[color:var(--color-border)] sm:border-b",
        !lastInRow && "sm:border-r sm:border-[color:var(--color-border)]",
      )}
    >
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

function CheckItem({ check }: { check: CheckResult }) {
  const reco = getRecommendation(check.id);
  const Icon = check.severity === "critical" ? OctagonAlert : TriangleAlert;
  const iconColor =
    check.severity === "critical" ? "var(--color-error)" : "var(--color-warning)";

  return (
    <li className="px-5 py-5">
      <div className="flex items-start gap-3">
        <Icon size={20} className="mt-1 shrink-0" style={{ color: iconColor }} />
        <div className="flex-1 min-w-0">
          <h3 className="type-h3 text-base">{check.label}</h3>
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

      <div className="mt-4 space-y-4 pl-8">
        {check.found && (
          <div className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] p-3">
            <p className="type-eyebrow">Trouvé sur la page</p>
            <p className="mt-1 font-mono text-xs text-[color:var(--color-ink)]">{check.found}</p>
          </div>
        )}
        {check.expected && (
          <p className="text-sm text-[color:var(--color-ink-soft)]">
            <strong className="text-[color:var(--color-ink)]">Attendu :</strong> {check.expected}
          </p>
        )}
        <div>
          <p className="type-eyebrow">Pourquoi</p>
          <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">{reco.why}</p>
        </div>
        <div>
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
      </div>
    </li>
  );
}
