import { env } from "@/lib/env";
import type { PlanKey } from "@/lib/plans/quotas";
import type { PurchasablePlan } from "./plan-catalog";

// Helpers Stripe price_id ↔ plan — **server-only** car ils accèdent
// aux env vars (`STRIPE_PRICE_*`) qui ne sont pas exposées au client.
// Pour les types et constantes d'affichage côté client, voir `./plan-catalog.ts`.
//
// Cycle annuel introduit 2026-06-08 (cf. doc 09) : si l'env var
// `STRIPE_PRICE_*_ANNUAL` correspondante manque, on fallback sur le mensuel
// et on log un warn serveur. Permet de déployer le code avant d'avoir créé
// les prices côté Stripe Dashboard.

export type BillingCycle = "monthly" | "annual";

/** Renvoie le `price_id` Stripe associé à un plan + cycle. Fallback mensuel
 *  si l'annuel n'est pas configuré (avec warn). Throw si même le mensuel manque. */
export function priceIdForPlan(plan: PurchasablePlan, cycle: BillingCycle = "monthly"): string {
  const monthlyId =
    plan === "solo"
      ? env.STRIPE_PRICE_SOLO
      : plan === "starter"
        ? env.STRIPE_PRICE_STARTER
        : env.STRIPE_PRICE_PRO;

  if (cycle === "annual") {
    const annualId =
      plan === "solo"
        ? env.STRIPE_PRICE_SOLO_ANNUAL
        : plan === "starter"
          ? env.STRIPE_PRICE_STARTER_ANNUAL
          : env.STRIPE_PRICE_PRO_ANNUAL;
    if (annualId) return annualId;
    console.warn(
      `[stripe/products] STRIPE_PRICE_${plan.toUpperCase()}_ANNUAL manquant, fallback mensuel.`,
    );
  }

  if (!monthlyId) {
    throw new Error(`STRIPE_PRICE_${plan.toUpperCase()} manquant — voir .env.example.`);
  }
  return monthlyId;
}

/** Vrai si les 3 prices annuels sont tous configurés. Utilisé pour décider
 *  si le picker affiche le toggle annuel/mensuel ou cache le toggle. */
export function annualBillingAvailable(): boolean {
  return Boolean(
    env.STRIPE_PRICE_SOLO_ANNUAL &&
      env.STRIPE_PRICE_STARTER_ANNUAL &&
      env.STRIPE_PRICE_PRO_ANNUAL,
  );
}

/** Mapping inverse : depuis un `price_id` Stripe (webhook), retrouve le
 *  PlanKey + cycle associé. Renvoie `null` si price_id inconnu. */
export function planFromPriceId(priceId: string): { plan: PlanKey; cycle: BillingCycle } | null {
  if (env.STRIPE_PRICE_SOLO && priceId === env.STRIPE_PRICE_SOLO)
    return { plan: "solo", cycle: "monthly" };
  if (env.STRIPE_PRICE_STARTER && priceId === env.STRIPE_PRICE_STARTER)
    return { plan: "starter", cycle: "monthly" };
  if (env.STRIPE_PRICE_PRO && priceId === env.STRIPE_PRICE_PRO)
    return { plan: "pro", cycle: "monthly" };
  if (env.STRIPE_PRICE_SOLO_ANNUAL && priceId === env.STRIPE_PRICE_SOLO_ANNUAL)
    return { plan: "solo", cycle: "annual" };
  if (env.STRIPE_PRICE_STARTER_ANNUAL && priceId === env.STRIPE_PRICE_STARTER_ANNUAL)
    return { plan: "starter", cycle: "annual" };
  if (env.STRIPE_PRICE_PRO_ANNUAL && priceId === env.STRIPE_PRICE_PRO_ANNUAL)
    return { plan: "pro", cycle: "annual" };
  return null;
}
