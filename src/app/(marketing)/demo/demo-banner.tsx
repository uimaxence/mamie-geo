"use client";

import { Sparkles } from "lucide-react";
import { TrackedLinkButton } from "@/components/marketing/tracked-link-button";

// Banner sticky en haut de /demo. Rappel constant que c'est une démo
// (pour éviter toute ambiguïté sur la véracité des données) +
// CTA principal "Démarrer pour 9,99 €/mois" toujours visible au scroll.

export function DemoBanner({
  brandName,
  brandDomain,
}: {
  brandName: string;
  brandDomain: string;
}) {
  return (
    <div className="sticky top-0 z-40 border-b border-[color:var(--color-border)] bg-[color:var(--color-gray-50)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3 lg:px-10">
        <div className="flex items-center gap-2.5 text-sm">
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-white text-[color:var(--color-accent)] shadow-[var(--shadow-sm)]">
            <Sparkles size={14} strokeWidth={2.2} />
          </span>
          <span className="text-[color:var(--color-ink-soft)]">
            Démo · marque fictive{" "}
            <strong className="text-[color:var(--color-ink)]">{brandName}</strong> ({brandDomain})
            avec 60 jours de données simulées
          </span>
        </div>
        <TrackedLinkButton
          href="/pricing"
          variant="primary"
          size="sm"
          trackEvent="demo_cta_clicked"
          trackProperties={{ cta_label: "Démarrer 9,99 €/mois", section: "banner" }}
        >
          Démarrer — 9,99&nbsp;€/mois
        </TrackedLinkButton>
      </div>
    </div>
  );
}
