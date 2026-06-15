import { describe, expect, it } from "vitest";
import { ACTIVE_PLANS, isActivePlan, quotaReached, quotasFor } from "./quotas";

describe("quotasFor", () => {
  it("retourne 0/0/weekly pour trialing (compte sans paiement)", () => {
    const q = quotasFor("trialing");
    expect(q.prompts).toBe(0);
    expect(q.competitors).toBe(0);
    expect(q.cadence).toBe("weekly");
  });

  it("retourne 15/5/weekly pour beta (accès gratuit offert)", () => {
    const q = quotasFor("beta");
    expect(q.prompts).toBe(15);
    expect(q.competitors).toBe(5);
    expect(q.cadence).toBe("weekly");
    expect(q.brands).toBe(1);
  });

  it("retourne 5/3/weekly pour solo", () => {
    const q = quotasFor("solo");
    expect(q.prompts).toBe(5);
    expect(q.competitors).toBe(3);
    expect(q.cadence).toBe("weekly");
  });

  it("retourne 25/5/daily pour starter", () => {
    const q = quotasFor("starter");
    expect(q.prompts).toBe(25);
    expect(q.competitors).toBe(5);
    expect(q.cadence).toBe("daily");
  });

  it("retourne 100/10/daily pour pro", () => {
    const q = quotasFor("pro");
    expect(q.prompts).toBe(100);
    expect(q.competitors).toBe(10);
    expect(q.cadence).toBe("daily");
  });

  it("retourne competitors illimités pour agency", () => {
    const q = quotasFor("agency");
    expect(q.prompts).toBe(300);
    expect(q.competitors).toBe(Number.POSITIVE_INFINITY);
    expect(q.cadence).toBe("daily");
  });

  it("retourne prompts ET competitors illimités pour enterprise", () => {
    const q = quotasFor("enterprise");
    expect(q.prompts).toBe(Number.POSITIVE_INFINITY);
    expect(q.competitors).toBe(Number.POSITIVE_INFINITY);
  });

  it("retourne 0/0/weekly pour les états dégradés", () => {
    for (const plan of ["past_due", "expired", "canceled"] as const) {
      const q = quotasFor(plan);
      expect(q.prompts, plan).toBe(0);
      expect(q.competitors, plan).toBe(0);
      expect(q.cadence, plan).toBe("weekly");
    }
  });

  it("retourne le quota starter par défaut pour un plan inconnu", () => {
    const q = quotasFor("ufo_plan");
    expect(q.prompts).toBe(25);
  });
});

describe("ACTIVE_PLANS / isActivePlan", () => {
  it("contient beta/solo/starter/pro/agency/enterprise mais ni trialing ni les dégradés", () => {
    expect(ACTIVE_PLANS).toEqual(["beta", "solo", "starter", "pro", "agency", "enterprise"]);
  });

  it("isActivePlan retourne true pour beta/solo, false pour trialing/past_due/expired", () => {
    expect(isActivePlan("beta")).toBe(true);
    expect(isActivePlan("solo")).toBe(true);
    expect(isActivePlan("starter")).toBe(true);
    expect(isActivePlan("trialing")).toBe(false);
    expect(isActivePlan("past_due")).toBe(false);
    expect(isActivePlan("expired")).toBe(false);
    expect(isActivePlan("canceled")).toBe(false);
  });
});

describe("quotaReached", () => {
  it("construit une erreur typée avec resource/current/max/plan", () => {
    const err = quotaReached("prompts", 25, 25, "starter");
    expect(err.ok).toBe(false);
    expect(err.error).toBe("quota_reached");
    expect(err.resource).toBe("prompts");
    expect(err.current).toBe(25);
    expect(err.max).toBe(25);
    expect(err.plan).toBe("starter");
  });
});
