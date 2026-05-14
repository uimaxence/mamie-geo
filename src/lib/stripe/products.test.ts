import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Tests sur les helpers products — mapping plan ↔ price_id via env vars.
// On doit mocker `@/lib/env` car les vars peuvent être absentes en CI.

describe("stripe/products — isPurchasablePlan + PLAN_PRICE_EUR", () => {
  it("PURCHASABLE_PLANS contient exactement solo, starter, pro", async () => {
    const { PURCHASABLE_PLANS } = await import("./products");
    expect([...PURCHASABLE_PLANS]).toEqual(["solo", "starter", "pro"]);
  });

  it("isPurchasablePlan accepte solo/starter/pro et rejette le reste", async () => {
    const { isPurchasablePlan } = await import("./products");
    expect(isPurchasablePlan("solo")).toBe(true);
    expect(isPurchasablePlan("starter")).toBe(true);
    expect(isPurchasablePlan("pro")).toBe(true);
    expect(isPurchasablePlan("agency")).toBe(false);
    expect(isPurchasablePlan("trialing")).toBe(false);
    expect(isPurchasablePlan("")).toBe(false);
    expect(isPurchasablePlan(null)).toBe(false);
    expect(isPurchasablePlan(42)).toBe(false);
  });

  it("PLAN_PRICE_EUR expose les prix officiels affichés sur /pricing", async () => {
    const { PLAN_PRICE_EUR } = await import("./products");
    expect(PLAN_PRICE_EUR.solo).toBe(9.99);
    expect(PLAN_PRICE_EUR.starter).toBe(49);
    expect(PLAN_PRICE_EUR.pro).toBe(149);
  });
});

describe("stripe/products — priceIdForPlan + planFromPriceId (mocked env)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock("@/lib/env", () => ({
      env: {
        STRIPE_PRICE_SOLO: "price_solo_test",
        STRIPE_PRICE_STARTER: "price_starter_test",
        STRIPE_PRICE_PRO: "price_pro_test",
      },
    }));
  });

  afterEach(() => {
    vi.unmock("@/lib/env");
    vi.resetModules();
  });

  it("priceIdForPlan renvoie l'env var correspondante", async () => {
    const { priceIdForPlan } = await import("./products");
    expect(priceIdForPlan("solo")).toBe("price_solo_test");
    expect(priceIdForPlan("starter")).toBe("price_starter_test");
    expect(priceIdForPlan("pro")).toBe("price_pro_test");
  });

  it("planFromPriceId fait le mapping inverse", async () => {
    const { planFromPriceId } = await import("./products");
    expect(planFromPriceId("price_solo_test")).toBe("solo");
    expect(planFromPriceId("price_starter_test")).toBe("starter");
    expect(planFromPriceId("price_pro_test")).toBe("pro");
  });

  it("planFromPriceId renvoie null pour un price_id inconnu", async () => {
    const { planFromPriceId } = await import("./products");
    expect(planFromPriceId("price_unknown")).toBeNull();
  });
});

describe("stripe/products — priceIdForPlan throw si env var manquante", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock("@/lib/env", () => ({ env: {} }));
  });
  afterEach(() => {
    vi.unmock("@/lib/env");
    vi.resetModules();
  });

  it("throw avec un message qui pointe vers .env.example", async () => {
    const { priceIdForPlan } = await import("./products");
    expect(() => priceIdForPlan("solo")).toThrowError(/STRIPE_PRICE_SOLO/);
  });
});
