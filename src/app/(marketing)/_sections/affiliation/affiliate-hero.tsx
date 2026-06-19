"use client";

import { useState } from "react";
import { capture } from "@/lib/posthog-client";
import { LinkButton } from "@/components/ui";
import { AFFILIATE_CONTACT_HREF, COMMISSION_PER_SOLO } from "./constants";

// Hero de la page /affiliation, structure inspirée de taap.it/fr/affiliate
// (retour Max 2026-06-19) mais en DA Mamie GEO : Inter, accent bleu brand
// `--color-accent` (au lieu du vert taap.it), CTA noir pill, watermark en
// barres dans la card du hero. Le calculateur (slider → gains mensuels)
// est juste sous le hero, comme la ref.
//
// Modèle de commission acté 2026-06-19 (doc 09) : 40 % à vie sur Solo,
// 25 % sur Starter, Pro/Agency exclus (programme partenaire agence). Le
// calculateur se base sur Solo (le plan que les audiences poussent le
// plus, et le headline « 40 % à vie »).

const MIN_REFERRALS = 1;
const MAX_REFERRALS = 200;
const DEFAULT_REFERRALS = 100;

export function AffiliateHero() {
  const [referrals, setReferrals] = useState(DEFAULT_REFERRALS);
  const monthly = Math.round(referrals * COMMISSION_PER_SOLO);

  return (
    <section className="relative overflow-hidden bg-[color:var(--color-gray-50)] pt-16 pb-12 sm:pt-20">
      <div className="mx-auto max-w-6xl px-6">
        {/* Card hero avec watermark en barres (rappel du dashboard) */}
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white px-6 py-16 text-center sm:py-20">
          <BarsWatermark />

          <div className="relative mx-auto max-w-2xl">
            <h1 className="type-display">
              Ton audience mérite Mamie GEO.
              <br />
              Tu mérites <span className="text-[color:var(--color-accent)]">40 % à vie</span>.
            </h1>
            <p className="type-body-lg mt-6 text-[color:var(--color-ink-soft)]">
              Mamie GEO est l&apos;outil que les SEO et marketeurs FR adoptent pour mesurer leur
              visibilité dans les IA. Tu amènes l&apos;audience, on fournit le produit, et tu gardes
              40 % de chaque abonnement Solo que tu génères. À vie.
            </p>
            <div className="mt-9 flex justify-center">
              <LinkButton
                href={AFFILIATE_CONTACT_HREF}
                variant="primary"
                size="lg"
                onClick={() => capture("affiliate_cta_clicked", { section: "hero" })}
              >
                Devenir affilié maintenant
              </LinkButton>
            </div>
          </div>
        </div>

        {/* Calculateur de gains : slider → montant mensuel récurrent */}
        <div className="mt-6 grid items-center gap-8 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white px-6 py-10 sm:px-10 lg:grid-cols-[1fr_auto]">
          <div>
            <label
              htmlFor="affiliate-referrals"
              className="type-eyebrow text-[color:var(--color-ink-soft)]"
            >
              Combien tu peux gagner
            </label>
            <input
              id="affiliate-referrals"
              type="range"
              min={MIN_REFERRALS}
              max={MAX_REFERRALS}
              value={referrals}
              onChange={(e) => setReferrals(Number(e.target.value))}
              className="mt-5 w-full accent-[color:var(--color-accent)]"
              aria-describedby="affiliate-referrals-value"
            />
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[color:var(--color-border)] bg-white px-3 py-1 text-sm font-medium text-[color:var(--color-ink)]">
              {referrals} {referrals > 1 ? "parrainages" : "parrainage"} Solo
            </div>
          </div>

          <div className="text-center lg:text-right">
            <div
              id="affiliate-referrals-value"
              className="text-5xl font-bold tracking-tight text-[color:var(--color-accent)] sm:text-6xl"
            >
              {monthly.toLocaleString("fr-FR")}&nbsp;€
            </div>
            <p className="type-meta mt-1">par mois, à vie</p>
          </div>
        </div>

        <p className="type-meta mt-4 text-center">
          Estimation sur le plan Solo (9,99 €, commission 40 %). Un parrainage Starter (49 €) te
          rapporte 25 %, soit 12,25 € par mois. Les plans Pro et Agency passent par le programme
          partenaire agence.
        </p>
      </div>
    </section>
  );
}

// Watermark décoratif : barres verticales bleu brand très diffuses,
// rappel des charts du dashboard. Hauteurs fixes (pas de Math.random,
// interdit côté workflow et inutile ici).
function BarsWatermark() {
  const heights = [38, 62, 48, 80, 56, 94, 70, 50, 86, 64, 44, 76];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-end gap-3 px-6 opacity-[0.06]">
      {heights.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-md bg-[color:var(--color-accent)]"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}
