"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight, Clock, ListChecks, Sparkles, X } from "lucide-react";
import type { SelectedAction } from "@/lib/weekly-actions/select";
import {
  setWeeklyActionStatus,
  type WeeklyActionStatusInput,
} from "./weekly-actions-actions";

// Card « Actions de la semaine » du dashboard. 1-2 gestes priorisés, dérivés
// des données réelles de la marque (cf. src/lib/weekly-actions). Boutons
// Fait / Reporter / Ignorer → server action + retrait optimiste de la liste.
// La validation est manuelle (V0) : robuste, pas de faux positifs liés au
// bruit run-à-run. cf. doc 09 § 2026-06-21.

const EFFORT_LABEL: Record<SelectedAction["effort"], string> = {
  "5min": "5 min",
  "15min": "15 min",
  "1h": "1 h",
  "1day": "1 jour",
};

export function WeeklyActionsCard({ actions }: { actions: SelectedAction[] }) {
  const [items, setItems] = useState(actions);
  const [pending, startTransition] = useTransition();
  const [busySlug, setBusySlug] = useState<string | null>(null);

  function act(slug: string, status: WeeklyActionStatusInput) {
    setBusySlug(slug);
    // Retrait optimiste : l'action quitte la liste tout de suite.
    setItems((prev) => prev.filter((a) => a.slug !== slug));
    startTransition(async () => {
      try {
        await setWeeklyActionStatus({ slug, status });
      } catch {
        // En cas d'échec, on remet l'action (révocation de l'optimisme).
        setItems((prev) =>
          prev.some((a) => a.slug === slug)
            ? prev
            : [...prev, actions.find((a) => a.slug === slug)!].filter(Boolean),
        );
      } finally {
        setBusySlug(null);
      }
    });
  }

  if (items.length === 0) {
    return (
      <section className="mt-8 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-gray-50)]">
            <Check size={18} strokeWidth={2} className="text-[color:var(--color-success)]" aria-hidden />
          </span>
          <div>
            <p className="type-eyebrow">Actions de la semaine</p>
            <p className="mt-1 text-sm text-[color:var(--color-ink)]">
              Bravo, tout est traité pour cette semaine.
            </p>
            <p className="mt-0.5 text-[0.8125rem] text-[color:var(--color-muted)]">
              Reviens lundi pour les prochaines.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-gray-50)]">
          <ListChecks size={18} strokeWidth={2} className="text-[color:var(--color-accent)]" aria-hidden />
        </span>
        <div>
          <p className="type-eyebrow">Actions de la semaine</p>
          <p className="mt-0.5 text-[0.8125rem] text-[color:var(--color-muted)]">
            Priorisées à partir de tes données. Fais-en {items.length > 1 ? "une ou deux" : "une"}, valide, recommence.
          </p>
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-3">
        {items.map((action) => (
          <li
            key={action.slug}
            className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] p-4"
          >
            <div className="flex items-start gap-2">
              <Sparkles
                size={15}
                strokeWidth={2}
                className="mt-1 shrink-0 text-[color:var(--color-accent)]"
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-[color:var(--color-ink)]">
                    {action.title}
                  </h3>
                  <span className="inline-flex items-center rounded-full bg-[color:var(--color-gray-50)] px-2 py-0.5 text-[0.6875rem] font-medium text-[color:var(--color-muted)]">
                    {EFFORT_LABEL[action.effort]}
                  </span>
                </div>
                {/* Résultat attendu : la promesse, en relatif. */}
                <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">
                  {action.expectedOutcome}
                </p>
                <p className="mt-1 text-[0.8125rem] text-[color:var(--color-muted)]">{action.why}</p>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <Link
                    href={action.cta.href}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-ink)] px-3.5 py-1.5 text-[0.8125rem] font-medium text-white no-underline transition-opacity hover:opacity-90"
                  >
                    {action.cta.label}
                    <ArrowRight size={14} />
                  </Link>
                  {action.geoTip && (
                    <Link
                      href={`/app/conseils#${action.geoTip.slug}`}
                      className="inline-flex items-center gap-1 text-[0.8125rem] text-[color:var(--color-ink-soft)] no-underline hover:text-[color:var(--color-ink)]"
                    >
                      En savoir plus
                      <ChevronRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Micro-actions de validation. */}
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[color:var(--color-border)] pt-3">
              <button
                type="button"
                onClick={() => act(action.slug, "done")}
                disabled={pending && busySlug === action.slug}
                className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-white px-3 py-1.5 text-xs font-medium text-[color:var(--color-success)] transition-colors hover:border-[color:var(--color-success)] hover:bg-[color:var(--color-success)]/5 disabled:opacity-50"
              >
                <Check size={14} /> Fait
              </button>
              <button
                type="button"
                onClick={() => act(action.slug, "snoozed")}
                disabled={pending && busySlug === action.slug}
                className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-white px-3 py-1.5 text-xs font-medium text-[color:var(--color-ink-soft)] transition-colors hover:border-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-gray-50)] disabled:opacity-50"
              >
                <Clock size={14} /> Reporter
              </button>
              <button
                type="button"
                onClick={() => act(action.slug, "dismissed")}
                disabled={pending && busySlug === action.slug}
                className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-white px-3 py-1.5 text-xs font-medium text-[color:var(--color-muted)] transition-colors hover:border-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-gray-50)] disabled:opacity-50"
              >
                <X size={14} /> Ignorer
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
