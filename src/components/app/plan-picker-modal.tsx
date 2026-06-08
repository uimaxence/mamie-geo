"use client";

import { useState, useTransition } from "react";
import { Check, Crown, Sparkles } from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui";
import { capture } from "@/lib/posthog-client";
import {
  ANNUAL_DISCOUNT_PCT,
  PLANS,
  annualMonthly,
  type Plan,
  type PlanId,
} from "@/app/(marketing)/_sections/pricing/pricing-data";
import { openCheckout } from "@/app/(app)/app/(with-nav)/settings/billing-actions";

// Modal plan picker — pattern Waalaxy adapté Mamie.
//
// Variantes :
//   - "default"  : signup / nouveau workspace en trialing (X close, sobre)
//   - "urgent"   : trialing en cours et trialEndsAt < J+2 (bandeau orange + compteur, X discret)
//   - "expired"  : plan expired/canceled (bandeau rouge, X retiré, lien "plus tard 24h" en dessous)
//
// Cycle : Annuel par défaut, toggle Mensuel/Annuel. Badge "Save 20 %" sur
// l'annuel (cf. ANNUAL_DISCOUNT_PCT).
//
// CTA par card : "Démarrer mon essai 14 jours" → openCheckout(plan, cycle).
// Stripe Checkout collecte la carte, trial_period_days: 14 côté backend,
// l'user n'est pas facturé pendant 14 j (cf. doc 09 § 2026-06-08).

export type PlanPickerVariant = "default" | "urgent" | "expired";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: PlanPickerVariant;
  /** ISO date de fin de trial, utilisée pour le compteur en mode urgent. */
  trialEndsAt?: string | null;
  /** Pour PostHog plan_picker_opened — savoir d'où ça vient. */
  trigger?: "post_onboarding" | "auto_re_prompt" | "sidebar_click" | "banner_click";
}

export function PlanPickerModal({
  open,
  onOpenChange,
  variant = "default",
  trialEndsAt,
  trigger = "auto_re_prompt",
}: Props) {
  const [cycle, setCycle] = useState<"monthly" | "annual">("annual");

  function handleCycleToggle(next: "monthly" | "annual") {
    if (next === cycle) return;
    capture("plan_picker_billing_cycle_toggled", { from: cycle, to: next, variant });
    setCycle(next);
  }

  function handleClose(reason: "x_button" | "later_link" | "esc_or_overlay") {
    capture("plan_picker_skipped", { variant, reason });
    onOpenChange(false);
  }

  const allowClose = variant !== "expired";
  // useState lazy initializer = Date.now() évalué 1 fois au mount,
  // conforme à eslint react-hooks/purity.
  const [now] = useState(() => Date.now());
  const daysLeft =
    variant === "urgent" && trialEndsAt
      ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - now) / 86_400_000))
      : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !allowClose) return;
        if (!next) {
          handleClose("esc_or_overlay");
          return;
        }
        onOpenChange(next);
      }}
    >
      <DialogContent
        showClose={allowClose}
        className="max-w-4xl p-0 overflow-hidden"
        onInteractOutside={(e) => {
          if (!allowClose) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (!allowClose) e.preventDefault();
        }}
      >
        {/* Bandeau header selon variante */}
        {variant === "urgent" && (
          <div className="bg-[color:var(--color-warning-bg)] px-6 py-3 text-sm text-[color:var(--color-warning)]">
            <strong>
              Ton essai se termine dans {daysLeft} jour{daysLeft && daysLeft > 1 ? "s" : ""}.
            </strong>{" "}
            Pour ne pas perdre ton tracking, choisis ton plan maintenant.
          </div>
        )}
        {variant === "expired" && (
          <div className="bg-[color:var(--color-error-bg)] px-6 py-3 text-sm text-[color:var(--color-error)]">
            <strong>Ton essai est terminé.</strong> Ton tracking est suspendu, reprends-le en
            choisissant un plan.
          </div>
        )}

        <div className="p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <Crown
              size={28}
              className="text-[color:var(--color-accent)]"
              strokeWidth={2.2}
              aria-hidden
            />
            <DialogTitle className="mt-3 type-h2">
              {variant === "expired"
                ? "Reprends ton tracking en 1 clic"
                : variant === "urgent"
                  ? "Choisis ton plan avant la fin de l'essai"
                  : "Débloque ton tracking quotidien"}
            </DialogTitle>
            <DialogDescription className="mt-2 max-w-lg">
              {variant === "expired"
                ? "Carte requise pour réactiver. Sans engagement, annulation 1 clic."
                : "14 jours gratuits, carte requise. Tu n'es facturé qu'au début du 15ᵉ jour. Annulation 1 clic depuis ton compte."}
            </DialogDescription>

            {/* Toggle cycle */}
            <div
              role="tablist"
              className="mt-6 inline-flex items-center rounded-[var(--radius-pill)] border border-[color:var(--color-border)] bg-white p-1"
            >
              <CycleTab
                active={cycle === "monthly"}
                onClick={() => handleCycleToggle("monthly")}
                label="Mensuel"
              />
              <CycleTab
                active={cycle === "annual"}
                onClick={() => handleCycleToggle("annual")}
                label={`Annuel −${ANNUAL_DISCOUNT_PCT} %`}
              />
            </div>
          </div>

          {/* 3 cards */}
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {PLANS.map((plan) => (
              <PlanPickerCard key={plan.id} plan={plan} cycle={cycle} trigger={trigger} />
            ))}
          </div>

          {/* Microcopy de réassurance + lien "plus tard" si pas urgent */}
          <p className="mt-6 text-center text-xs text-[color:var(--color-muted)]">
            <Sparkles size={12} className="mr-1 inline" aria-hidden />
            Pendant l&apos;essai, ton tracking quotidien tourne déjà sur les 5 IA. Tu peux annuler
            à tout moment depuis ton compte.
          </p>

          {variant === "expired" && (
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => handleClose("later_link")}
                className="text-xs text-[color:var(--color-muted)] underline-offset-2 hover:text-[color:var(--color-ink)] hover:underline"
              >
                Plus tard
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CycleTab({
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

function PlanPickerCard({
  plan,
  cycle,
  trigger,
}: {
  plan: Plan;
  cycle: "monthly" | "annual";
  trigger: "post_onboarding" | "auto_re_prompt" | "sidebar_click" | "banner_click";
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const monthlyDisplay = cycle === "monthly" ? plan.monthlyEur : annualMonthly(plan.monthlyEur);
  const isPopular = plan.popular === true;

  function handleStart() {
    setError(null);
    capture("plan_picker_trial_started", {
      plan: plan.id,
      billing_cycle: cycle,
      trigger,
    });
    startTransition(async () => {
      const result = await openCheckout(plan.id as PlanId, cycle, { trial: true });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      window.location.href = result.url;
    });
  }

  const cardClass = isPopular
    ? "border-2 border-[color:var(--color-ink)] relative"
    : "border border-[color:var(--color-border)]";

  return (
    <div
      className={`flex flex-col rounded-[var(--radius-lg)] bg-white p-5 ${cardClass}`}
    >
      {isPopular && (
        <Badge tone="accent" className="absolute -top-3 left-5 px-2.5 py-1">
          Le plus populaire
        </Badge>
      )}

      <h3 className="type-h3">{plan.name}</h3>
      <p className="type-meta mt-1">{plan.audience}</p>

      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="type-stat text-3xl">
          {monthlyDisplay.toFixed(plan.monthlyEur < 20 ? 2 : 0).replace(".", ",")}
        </span>
        <span className="text-xs text-[color:var(--color-muted)]">€ HT/mois</span>
      </div>
      {cycle === "annual" && (
        <p className="type-meta mt-1 text-[color:var(--color-success)]">
          −{ANNUAL_DISCOUNT_PCT} % vs mensuel
        </p>
      )}

      <ul className="mt-4 flex flex-col gap-2">
        {plan.features.slice(0, 4).map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-xs">
            <Check
              size={12}
              strokeWidth={3}
              className="mt-0.5 shrink-0 text-[color:var(--color-ink-soft)]"
            />
            <span className="text-[color:var(--color-ink-soft)]">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex-1" />
      <Button
        type="button"
        variant={isPopular ? "primary" : "secondary"}
        size="md"
        className="w-full"
        disabled={pending}
        onClick={handleStart}
      >
        {pending ? "Redirection…" : "Démarrer mon essai 14 jours"}
      </Button>
      {error && (
        <p className="mt-2 text-xs text-[color:var(--color-error)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
