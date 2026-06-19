"use client";

import { useEffect, useRef, useState } from "react";
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
// Largeur du thumb (px), sert à recaler la bulle pile au-dessus du curseur.
const THUMB_PX = 20;

export function AffiliateHero() {
  const [referrals, setReferrals] = useState(DEFAULT_REFERRALS);
  const monthly = Math.round(referrals * COMMISSION_PER_SOLO);
  const animatedMonthly = Math.round(useAnimatedNumber(monthly));
  const pct = ((referrals - MIN_REFERRALS) / (MAX_REFERRALS - MIN_REFERRALS)) * 100;

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
          <div className="relative pt-12">
            {/* Bulle qui suit le curseur. Le décalage `(0.5 - pct/100)*THUMB`
             * recentre la bulle pile sur le thumb (qui ne va pas bord à
             * bord). transition-[left] pour un suivi fluide. */}
            <div
              className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-pill)] border border-[color:var(--color-border)] bg-white px-3 py-1 text-sm font-medium text-[color:var(--color-ink)] shadow-[var(--shadow-md)] transition-[left] duration-75 ease-out"
              style={{ left: `calc(${pct}% + ${(0.5 - pct / 100) * THUMB_PX}px)` }}
            >
              {referrals} {referrals > 1 ? "parrainages" : "parrainage"} Solo
            </div>
            <input
              id="affiliate-referrals"
              type="range"
              min={MIN_REFERRALS}
              max={MAX_REFERRALS}
              value={referrals}
              onChange={(e) => setReferrals(Number(e.target.value))}
              aria-describedby="affiliate-referrals-value"
              aria-label="Nombre de parrainages Solo"
              style={{
                background: `linear-gradient(to right, var(--color-accent) ${pct}%, var(--color-gray-100) ${pct}%)`,
              }}
              className="h-2.5 w-full cursor-pointer appearance-none rounded-full outline-none [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[color:var(--color-accent)] [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[var(--shadow-md)] [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[color:var(--color-accent)] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[var(--shadow-md)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
            />
          </div>

          <div className="text-center lg:text-right">
            <div
              id="affiliate-referrals-value"
              className="text-5xl font-bold tracking-tight text-[color:var(--color-accent)] tabular-nums sm:text-6xl"
            >
              {animatedMonthly.toLocaleString("fr-FR")}&nbsp;€
            </div>
            <p className="type-meta mt-1">par mois, à vie</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Tween d'un nombre vers sa cible (easeOutCubic, rAF) pour animer le
// compteur de gains quand on bouge le slider. SSR-safe : la valeur
// initiale = la cible, l'animation ne démarre qu'au montage client.
function useAnimatedNumber(target: number, duration = 350): number {
  const [display, setDisplay] = useState(target);
  const displayRef = useRef(target);
  const rafRef = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    const from = displayRef.current;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = from + (target - from) * eased;
      displayRef.current = value;
      setDisplay(value);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
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
