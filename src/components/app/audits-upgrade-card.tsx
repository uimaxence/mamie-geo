"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { capture } from "@/lib/posthog-client";

// Upsell contextuel sur /app/audits : débloquer plus d'audits/mois et
// suivre plusieurs URLs. Au clic, ouvre le <PlanPickerModal> via le même
// CustomEvent que la sidebar Subscribe card (écouté par
// <PlanPickerModalTrigger> monté dans le layout (app)).
//
// Affiché uniquement pour les plans publics avec un palier supérieur
// atteignable depuis le picker (solo, starter) — cf. gate côté page.

export function AuditsUpgradeCard({ plan }: { plan: string }) {
  function handleClick() {
    capture("audits_upgrade_cta_clicked", { plan, source: "audits_page" });
    window.dispatchEvent(
      new CustomEvent("mamie:open-plan-picker", { detail: { trigger: "audits_upgrade" } }),
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-primary)]/25 bg-[color:var(--color-primary-soft)] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <span
            aria-hidden
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-white text-[color:var(--color-accent)] shadow-[var(--shadow-sm)]"
          >
            <Sparkles size={18} strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-base font-semibold text-[color:var(--color-ink)]">
              Besoin de plus d&apos;audits ?
            </h3>
            <p className="type-meta mt-1 max-w-xl">
              Passe à un plan supérieur pour lancer plus d&apos;audits chaque mois, suivre plusieurs
              URLs et comparer tes concurrents.
            </p>
          </div>
        </div>
        <Button variant="primary" size="md" onClick={handleClick} className="shrink-0">
          Voir les plans
        </Button>
      </div>
    </div>
  );
}
