import { env } from "@/lib/env";
import type { PlanKey } from "@/lib/plans/quotas";
import type { PurchasablePlan } from "./plan-catalog";

// Helpers Stripe price_id ↔ plan — **server-only** car ils accèdent
// aux env vars (`STRIPE_PRICE_*`) qui ne sont pas exposées au client.
// Pour les types et constantes d'affichage côté client, voir `./plan-catalog.ts`.

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
