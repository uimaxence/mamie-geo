import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Header de page app, pattern Peec docs (2026-06-08, cf. doc 09) :
//   ┌─────────────────────────────────────────────────────────────┐
//   │ [▢] Vue d'ensemble · Score en hausse de 5,2 % cette semaine │
//   │                                              [bouton/KPIs] │
//   └─────────────────────────────────────────────────────────────┘
//
// - `icon`  : petite icône carrée (28x28) à gauche, donne un ancrage visuel
// - `title` : nom de page (type-h3, semibold ink)
// - `summary` : phrase courte en ligne, séparée par un « · » silencieux,
//   typiquement un insight calculé sur la data du jour
// - `right` : slot libre côté droit (CTA, sélecteur, ou <PageHeaderKpis>)
//
// Densité d'info × 2 par rapport à un h1 nu, sans rupture identitaire.

export interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  summary?: ReactNode;
  right?: ReactNode;
  className?: string;
}

export function PageHeader({ icon: Icon, title, summary, right, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-wrap items-center justify-between gap-4", className)}>
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <span
            aria-hidden
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-white text-[color:var(--color-ink-soft)]"
          >
            <Icon size={14} strokeWidth={2} />
          </span>
        )}
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
          <h1 className="text-lg font-semibold tracking-tight text-[color:var(--color-ink)]">
            {title}
          </h1>
          {summary && (
            <>
              <span
                aria-hidden
                className="text-[color:var(--color-faint)] text-base leading-none"
              >
                ·
              </span>
              <p className="text-[0.9375rem] leading-snug text-[color:var(--color-muted)]">
                {summary}
              </p>
            </>
          )}
        </div>
      </div>
      {right && <div className="flex shrink-0 items-center gap-3">{right}</div>}
    </header>
  );
}

// Mini-trio de KPIs alignés à droite du header, façon Peec :
//   « Visibility: 3/14 ↓ · Sentiment: 2/14 ↑ · Position: 5/14 ↑ »
// Chaque KPI est un label + value + flèche directionnelle optionnelle.

export interface PageHeaderKpi {
  label: string;
  value: string;
  trend?: "up" | "down" | "flat";
}

export function PageHeaderKpis({ items }: { items: PageHeaderKpi[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8125rem]">
      {items.map((kpi, idx) => (
        <div key={`${kpi.label}-${idx}`} className="flex items-center gap-1.5">
          <span className="text-[color:var(--color-muted)]">{kpi.label}:</span>
          <span className="font-semibold text-[color:var(--color-ink)] tabular-nums">
            {kpi.value}
          </span>
          {kpi.trend === "up" && (
            <TrendingUp
              size={13}
              strokeWidth={2.25}
              className="text-[color:var(--color-success)]"
              aria-label="en hausse"
            />
          )}
          {kpi.trend === "down" && (
            <TrendingDown
              size={13}
              strokeWidth={2.25}
              className="text-[color:var(--color-error)]"
              aria-label="en baisse"
            />
          )}
        </div>
      ))}
    </div>
  );
}
