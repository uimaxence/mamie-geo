"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Badge, LinkButton, Section } from "@/components/ui";
import { ANNUAL_DISCOUNT_PCT, annualMonthly, PLANS, type Plan } from "./pricing-data";

// 3 cards plans + toggle mensuel/annuel + ligne "Plus de volume ? Contact".
// Client component pour le useState du toggle. Le plan "popular" reçoit
// un badge "Plus populaire" + bordure ink pour le mettre en avant
// (cf. doc 10 § Pricing). Le plan Agency est retiré de l'UI publique en
// V0 (cf. doc 09 § 2026-05-14).

export function PricingPlans() {
  const [period, setPeriod] = useState<"monthly" | "annual">("monthly");

  return (
    <Section pad="xl">
      <div className="mx-auto max-w-3xl text-center">
        <span className="type-eyebrow">Tarifs</span>
        <h1 className="type-display mt-3">À chaque profil son plan.</h1>
        <p className="type-body-lg mt-6">
          Pas de frais cachés, pas de paywall sur des features promises. Tu paies à l&apos;usage
          réel, en € hébergé en Europe.
        </p>

        {/* Toggle mensuel / annuel */}
        <div
          role="tablist"
          className="mt-10 inline-flex items-center rounded-[var(--radius-pill)] border border-[color:var(--color-border)] bg-white p-1"
        >
          <PeriodTab
            active={period === "monthly"}
            onClick={() => setPeriod("monthly")}
            label="Mensuel"
          />
          <PeriodTab
            active={period === "annual"}
            onClick={() => setPeriod("annual")}
            label={`Annuel −${ANNUAL_DISCOUNT_PCT} %`}
          />
        </div>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} period={period} />
        ))}
      </div>

      <p className="mt-10 text-center type-meta">
        Plus de volume ou besoins agence ?{" "}
        <a
          href="mailto:hello@mamie-geo.fr?subject=Mamie%20GEO%20—%20devis%20agence"
          className="font-medium text-[color:var(--color-ink)] underline-offset-2 hover:underline"
        >
          Écris-nous
        </a>
        , on te fait un devis.
      </p>
    </Section>
  );
}

function PeriodTab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded-[var(--radius-pill)] px-4 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-[color:var(--color-ink)] text-white"
          : "text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
      }`}
    >
      {label}
    </button>
  );
}

function PlanCard({ plan, period }: { plan: Plan; period: "monthly" | "annual" }) {
  const isPopular = plan.popular === true;
  const monthly = plan.monthlyEur;
  const monthlyDisplay = period === "monthly" ? monthly : annualMonthly(monthly);

  // Bordure et fond différents pour le plan populaire — ressort sans
  // utiliser un fond coloré (règle DA : pas de fond coloré).
  const cardClass = isPopular
    ? "border-[color:var(--color-ink)] border-2 relative"
    : "border-[color:var(--color-border)]";

  return (
    <div className={`rounded-[var(--radius-xl)] bg-white p-6 flex flex-col ${cardClass}`}>
      {isPopular && (
        <Badge tone="accent" className="absolute -top-3 left-6 px-2.5 py-1">
          Le plus populaire
        </Badge>
      )}

      <div>
        <h3 className="type-h3">{plan.name}</h3>
        <p className="type-meta mt-1">{plan.audience}</p>
        <p className="type-body mt-4 text-sm min-h-[3rem]">{plan.tagline}</p>
      </div>

      {/* Prix */}
      <div className="mt-6 flex items-baseline gap-1.5">
        <span className="type-stat text-[2.5rem]">
          {monthlyDisplay.toFixed(monthly < 20 ? 2 : 0).replace(".", ",")}
        </span>
        <span className="text-[color:var(--color-muted)]">€/mois HT</span>
      </div>
      <p className="type-meta mt-1">
        {period === "annual"
          ? `Facturé ${(annualMonthly(monthly) * 12).toFixed(monthly < 20 ? 2 : 0).replace(".", ",")} €/an (économie −${ANNUAL_DISCOUNT_PCT} %)`
          : `Annuel : ${annualMonthly(monthly)
              .toFixed(monthly < 20 ? 2 : 0)
              .replace(".", ",")} €/mois (−${ANNUAL_DISCOUNT_PCT} %)`}
      </p>

      {/* Features */}
      <ul className="mt-6 flex flex-col gap-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <span className="mt-0.5 flex shrink-0 size-4 items-center justify-center rounded-full bg-[color:var(--color-gray-100)] text-[color:var(--color-ink)]">
              <Check size={10} strokeWidth={3.5} />
            </span>
            <span className="text-[color:var(--color-ink-soft)]">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex-1" />
      <LinkButton
        href={plan.ctaHref}
        variant={isPopular ? "primary" : "secondary"}
        className="w-full"
      >
        {plan.ctaLabel}
      </LinkButton>
    </div>
  );
}
