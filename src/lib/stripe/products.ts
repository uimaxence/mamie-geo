import { env } from "@/lib/env";
import type { PlanKey } from "@/lib/plans/quotas";

// Mapping plan ↔ Stripe price_id. Lookup via env vars pour pouvoir
// avoir des IDs distincts en test mode vs live mode (Stripe ne mélange
// pas les environnements ; cf. doc 09 § 2026-05-14).
//
// Plans souscriptibles publiquement : solo / starter / pro.
// Les autres états (trialing, agency, enterprise, past_due, expired, canceled)
// ne sont pas associés à un price Stripe (gestion interne ou sur devis).

export type PurchasablePlan = "solo" | "starter" | "pro";

export const PURCHASABLE_PLANS: readonly PurchasablePlan[] = ["solo", "starter", "pro"] as const;

export function isPurchasablePlan(value: unknown): value is PurchasablePlan {
  return typeof value === "string" && (PURCHASABLE_PLANS as readonly string[]).includes(value);
}

/** Renvoie le `price_id` Stripe associé à un plan souscriptible. Throw si l'env var manque. */
export function priceIdForPlan(plan: PurchasablePlan): string {
  const id =
    plan === "solo"
      ? env.STRIPE_PRICE_SOLO
      : plan === "starter"
        ? env.STRIPE_PRICE_STARTER
        : env.STRIPE_PRICE_PRO;
  if (!id) {
    throw new Error(`STRIPE_PRICE_${plan.toUpperCase()} manquant — voir .env.example.`);
  }
  return id;
}

/** Mapping inverse : depuis un `price_id` Stripe (webhook), retrouve le PlanKey associé. */
export function planFromPriceId(priceId: string): PlanKey | null {
  if (env.STRIPE_PRICE_SOLO && priceId === env.STRIPE_PRICE_SOLO) return "solo";
  if (env.STRIPE_PRICE_STARTER && priceId === env.STRIPE_PRICE_STARTER) return "starter";
  if (env.STRIPE_PRICE_PRO && priceId === env.STRIPE_PRICE_PRO) return "pro";
  return null;
}

/** Affichage marketing du prix (utilisé page pricing + billing section). EUR HT. */
export const PLAN_PRICE_EUR: Record<PurchasablePlan, number> = {
  solo: 9.99,
  starter: 49,
  pro: 149,
};
