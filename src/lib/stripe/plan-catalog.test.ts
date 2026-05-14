import { describe, expect, it } from "vitest";
import { isPurchasablePlan, PLAN_PRICE_EUR, PURCHASABLE_PLANS } from "./plan-catalog";

// Tests sur le catalogue plans côté client + serveur — pas d'env, pas de
// mock. Les helpers env-dépendants (priceIdForPlan, planFromPriceId)
// sont testés dans `./products.test.ts`.

describe("plan-catalog", () => {
  it("PURCHASABLE_PLANS contient exactement solo, starter, pro", () => {
    expect([...PURCHASABLE_PLANS]).toEqual(["solo", "starter", "pro"]);
  });

  it("isPurchasablePlan accepte solo/starter/pro et rejette le reste", () => {
    expect(isPurchasablePlan("solo")).toBe(true);
    expect(isPurchasablePlan("starter")).toBe(true);
    expect(isPurchasablePlan("pro")).toBe(true);
    expect(isPurchasablePlan("agency")).toBe(false);
    expect(isPurchasablePlan("trialing")).toBe(false);
    expect(isPurchasablePlan("")).toBe(false);
    expect(isPurchasablePlan(null)).toBe(false);
    expect(isPurchasablePlan(42)).toBe(false);
  });

  it("PLAN_PRICE_EUR expose les prix officiels affichés sur /pricing", () => {
    expect(PLAN_PRICE_EUR.solo).toBe(9.99);
    expect(PLAN_PRICE_EUR.starter).toBe(49);
    expect(PLAN_PRICE_EUR.pro).toBe(149);
  });
});
