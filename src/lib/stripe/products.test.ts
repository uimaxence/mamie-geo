import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Tests sur les helpers env-dépendants — mapping price_id ↔ plan via
// env vars STRIPE_PRICE_*. On mock `@/lib/env`.
//
// Les tests du catalogue (types + display constants, sans env) vivent
// dans `./plan-catalog.test.ts`.

describe("stripe/products — priceIdForPlan + planFromPriceId (mocked env)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock("@/lib/env", () => ({
      env: {
        STRIPE_PRICE_SOLO: "price_solo_test",
        STRIPE_PRICE_STARTER: "price_starter_test",
        STRIPE_PRICE_PRO: "price_pro_test",
        STRIPE_PRICE_SOLO_ANNUAL: "price_solo_annual_test",
        STRIPE_PRICE_STARTER_ANNUAL: "price_starter_annual_test",
        STRIPE_PRICE_PRO_ANNUAL: "price_pro_annual_test",
      },
    }));
  });

  afterEach(() => {
    vi.unmock("@/lib/env");
    vi.resetModules();
  });

  it("priceIdForPlan renvoie l'env var mensuelle par défaut", async () => {
    const { priceIdForPlan } = await import("./products");
    expect(priceIdForPlan("solo")).toBe("price_solo_test");
    expect(priceIdForPlan("starter")).toBe("price_starter_test");
    expect(priceIdForPlan("pro")).toBe("price_pro_test");
  });

  it("priceIdForPlan renvoie l'env var annuelle si cycle=annual", async () => {
    const { priceIdForPlan } = await import("./products");
    expect(priceIdForPlan("solo", "annual")).toBe("price_solo_annual_test");
    expect(priceIdForPlan("starter", "annual")).toBe("price_starter_annual_test");
    expect(priceIdForPlan("pro", "annual")).toBe("price_pro_annual_test");
  });

  it("planFromPriceId fait le mapping inverse avec cycle détecté", async () => {
    const { planFromPriceId } = await import("./products");
    expect(planFromPriceId("price_solo_test")).toEqual({ plan: "solo", cycle: "monthly" });
    expect(planFromPriceId("price_starter_test")).toEqual({ plan: "starter", cycle: "monthly" });
    expect(planFromPriceId("price_pro_test")).toEqual({ plan: "pro", cycle: "monthly" });
    expect(planFromPriceId("price_solo_annual_test")).toEqual({ plan: "solo", cycle: "annual" });
    expect(planFromPriceId("price_starter_annual_test")).toEqual({
      plan: "starter",
      cycle: "annual",
    });
    expect(planFromPriceId("price_pro_annual_test")).toEqual({ plan: "pro", cycle: "annual" });
  });

  it("planFromPriceId renvoie null pour un price_id inconnu", async () => {
    const { planFromPriceId } = await import("./products");
    expect(planFromPriceId("price_unknown")).toBeNull();
  });

  it("annualBillingAvailable renvoie true quand les 3 prices annuels sont set", async () => {
    const { annualBillingAvailable } = await import("./products");
    expect(annualBillingAvailable()).toBe(true);
  });
});

describe("stripe/products — fallback annuel → mensuel", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock("@/lib/env", () => ({
      env: {
        STRIPE_PRICE_SOLO: "price_solo_test",
        STRIPE_PRICE_STARTER: "price_starter_test",
        STRIPE_PRICE_PRO: "price_pro_test",
        // Pas d'annuels configurés
      },
    }));
  });
  afterEach(() => {
    vi.unmock("@/lib/env");
    vi.resetModules();
  });

  it("priceIdForPlan(plan, 'annual') fallback sur le mensuel si annuel manquant", async () => {
    const { priceIdForPlan } = await import("./products");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(priceIdForPlan("solo", "annual")).toBe("price_solo_test");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("STRIPE_PRICE_SOLO_ANNUAL"));
    warn.mockRestore();
  });

  it("annualBillingAvailable renvoie false quand au moins un annuel manque", async () => {
    const { annualBillingAvailable } = await import("./products");
    expect(annualBillingAvailable()).toBe(false);
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
