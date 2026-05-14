"use client";

import { useState, useTransition } from "react";
import { Badge, Banner, Button, toast } from "@/components/ui";
import { PLAN_PRICE_EUR, type PurchasablePlan } from "@/lib/stripe/plan-catalog";
import { openCheckout, openPortal } from "./billing-actions";

// Section Facturation dans /app/settings.
// - Plan actif → affiche le plan + prochaine facturation + bouton portal
// - Plan non actif (trialing / expired / canceled) → encart "Choisis ton plan"
//   avec 3 cards Solo / Starter / Pro → bouton checkout
// - past_due → bannière "Paiement échoué" + portal

interface BillingSectionProps {
  plan: string;
  currentPeriodEnd: Date | null;
  hasSubscription: boolean;
}

const PLAN_DETAILS: Record<PurchasablePlan, { label: string; bullets: string[] }> = {
  solo: {
    label: "Solo",
    bullets: ["5 prompts trackés", "3 concurrents", "1 run / semaine (lundi)", "5 IA suivies"],
  },
  starter: {
    label: "Starter",
    bullets: ["25 prompts trackés", "5 concurrents", "Tracking quotidien", "5 IA suivies"],
  },
  pro: {
    label: "Pro",
    bullets: ["100 prompts trackés", "10 concurrents", "Tracking quotidien", "Scoring premium"],
  },
};

export function BillingSection({ plan, currentPeriodEnd, hasSubscription }: BillingSectionProps) {
  const isActive = ["solo", "starter", "pro", "agency", "enterprise"].includes(plan);
  const isPastDue = plan === "past_due";

  return (
    <div className="flex flex-col gap-5">
      {isPastDue && (
        <Banner tone="error">
          Ton dernier prélèvement a échoué. Mets à jour ta carte sous 7 jours pour éviter la
          suspension du tracking.
        </Banner>
      )}

      {isActive && <ActiveBillingCard plan={plan} currentPeriodEnd={currentPeriodEnd} />}

      {!isActive && <ChoosePlanGrid hasSubscription={hasSubscription} />}
    </div>
  );
}

function ActiveBillingCard({
  plan,
  currentPeriodEnd,
}: {
  plan: string;
  currentPeriodEnd: Date | null;
}) {
  const [pending, startTransition] = useTransition();
  const planLabel = PLAN_DETAILS[plan as PurchasablePlan]?.label ?? plan;
  const nextDate = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  function handlePortal() {
    startTransition(async () => {
      const result = await openPortal();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      window.location.href = result.url;
    });
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <Badge tone="accent">{planLabel}</Badge>
        <div className="text-sm text-[color:var(--color-ink-soft)]">
          Prochaine facturation :{" "}
          <span className="font-medium text-[color:var(--color-ink)]">{nextDate}</span>
        </div>
      </div>
      <Button variant="secondary" onClick={handlePortal} disabled={pending}>
        {pending ? "Ouverture…" : "Gérer mon abonnement"}
      </Button>
    </div>
  );
}

function ChoosePlanGrid({ hasSubscription }: { hasSubscription: boolean }) {
  return (
    <div>
      <p className="type-meta">
        {hasSubscription
          ? "Réactive ton abonnement en choisissant un plan."
          : "Choisis un plan pour démarrer ton tracking. Garantie remboursement 14 jours."}
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {(Object.keys(PLAN_DETAILS) as PurchasablePlan[]).map((p) => (
          <PlanCard key={p} plan={p} />
        ))}
      </div>
    </div>
  );
}

function PlanCard({ plan }: { plan: PurchasablePlan }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const details = PLAN_DETAILS[plan];

  function handleSubscribe() {
    setError(null);
    startTransition(async () => {
      const result = await openCheckout(plan);
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      window.location.href = result.url;
    });
  }

  return (
    <div className="flex flex-col rounded-[var(--radius-lg)] border border-[color:var(--color-border-strong)] bg-white p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-base font-semibold">{details.label}</h3>
        <div className="text-right">
          <div className="text-xl font-semibold tabular-nums">{PLAN_PRICE_EUR[plan]} €</div>
          <div className="type-meta">/ mois HT</div>
        </div>
      </div>
      <ul className="mt-4 flex flex-1 flex-col gap-1.5 text-sm text-[color:var(--color-ink-soft)]">
        {details.bullets.map((b) => (
          <li key={b}>· {b}</li>
        ))}
      </ul>
      <Button
        variant={plan === "starter" ? "primary" : "secondary"}
        onClick={handleSubscribe}
        disabled={pending}
        className="mt-5 w-full"
      >
        {pending ? "Ouverture…" : `S'abonner ${details.label}`}
      </Button>
      {error && <p className="mt-2 text-xs text-[color:var(--color-error)]">{error}</p>}
    </div>
  );
}
