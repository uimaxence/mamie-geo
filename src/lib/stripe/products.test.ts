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
