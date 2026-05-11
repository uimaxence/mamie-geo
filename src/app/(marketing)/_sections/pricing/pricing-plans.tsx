"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Badge, LinkButton, Section } from "@/components/ui";
import { ANNUAL_DISCOUNT_PCT, annualMonthly, PLANS, type Plan } from "./pricing-data";

// 4 cards plans + toggle mensuel/annuel. Client component pour le
// useState du toggle. Plan "pro" reçoit un badge "Plus populaire" +
// bordure terracotta pour le mettre en avant (cf. doc 10 § Pricing).

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

      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} period={period} />
        ))}
      </div>
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
  const isEnterprise = monthly === null;

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
        {isEnterprise ? (
          <span className="type-h2">Sur devis</span>
        ) : (
          <>
            <span className="type-stat text-[2.5rem]">
              {period === "monthly" ? monthly : annualMonthly(monthly)}
            </span>
            <span className="text-[color:var(--color-muted)]">€/mois</span>
          </>
        )}
      </div>
      {!isEnterprise && period === "annual" && (
        <p className="type-meta mt-1">
          Facturé {annualMonthly(monthly!) * 12} €/an (économie −{ANNUAL_DISCOUNT_PCT} %)
        </p>
      )}
      {!isEnterprise && period === "monthly" && (
        <p className="type-meta mt-1">
          Annuel : {annualMonthly(monthly!)} €/mois (−{ANNUAL_DISCOUNT_PCT} %)
        </p>
      )}

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
