// Catalogue plans côté client + serveur — types et données d'affichage
// uniquement. **Aucun import** de `@/lib/env` ici pour rester importable
// par les composants client (billing-section, pricing). Les helpers qui
// touchent aux env vars Stripe (priceIdForPlan, planFromPriceId) vivent
// dans `./products.ts` (server-only).

export type PurchasablePlan = "solo" | "starter" | "pro";

export const PURCHASABLE_PLANS: readonly PurchasablePlan[] = ["solo", "starter", "pro"] as const;

export function isPurchasablePlan(value: unknown): value is PurchasablePlan {
  return typeof value === "string" && (PURCHASABLE_PLANS as readonly string[]).includes(value);
}

/** Affichage marketing du prix (utilisé page pricing + billing section). EUR HT. */
export const PLAN_PRICE_EUR: Record<PurchasablePlan, number> = {
  solo: 9.99,
  starter: 49,
  pro: 149,
};
