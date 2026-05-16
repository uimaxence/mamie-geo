import { describe, expect, it } from "vitest";
import {
  computeUsageRatio,
  getHardCapThreshold,
  getMonthlyTheoreticalRuns,
  isPlanWithHardcap,
} from "./quotas";

describe("getMonthlyTheoreticalRuns", () => {
  it("solo : 5 prompts × 5 LLMs × 4 weeks = 100 runs/mois", () => {
    expect(getMonthlyTheoreticalRuns("solo")).toBe(100);
  });

  it("starter : 25 × 5 × 30 = 3750 runs/mois (daily cadence)", () => {
    expect(getMonthlyTheoreticalRuns("starter")).toBe(3750);
  });

  it("pro : 100 × 5 × 30 = 15000 runs/mois", () => {
    expect(getMonthlyTheoreticalRuns("pro")).toBe(15000);
  });

  it("agency : 300 × 5 × 30 = 45000 runs/mois", () => {
    expect(getMonthlyTheoreticalRuns("agency")).toBe(45000);
  });

  it("enterprise : Infinity (illimité)", () => {
    expect(getMonthlyTheoreticalRuns("enterprise")).toBe(Number.POSITIVE_INFINITY);
  });

  it("trialing : 0 prompts → 0 runs", () => {
    expect(getMonthlyTheoreticalRuns("trialing")).toBe(0);
  });
});

describe("getHardCapThreshold", () => {
  it("solo hard-cap = 200 runs (200 % du théorique)", () => {
    expect(getHardCapThreshold("solo")).toBe(200);
  });

  it("starter hard-cap = 7500", () => {
    expect(getHardCapThreshold("starter")).toBe(7500);
  });

  it("enterprise hard-cap = Infinity", () => {
    expect(getHardCapThreshold("enterprise")).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("isPlanWithHardcap", () => {
  it("solo/starter/pro/agency ont un hard-cap", () => {
    expect(isPlanWithHardcap("solo")).toBe(true);
    expect(isPlanWithHardcap("starter")).toBe(true);
    expect(isPlanWithHardcap("pro")).toBe(true);
    expect(isPlanWithHardcap("agency")).toBe(true);
  });

  it("enterprise n'a pas de hard-cap (Infinity)", () => {
    expect(isPlanWithHardcap("enterprise")).toBe(false);
  });

  it("trialing/expired n'ont pas de hard-cap (0 théorique)", () => {
    expect(isPlanWithHardcap("trialing")).toBe(false);
    expect(isPlanWithHardcap("expired")).toBe(false);
    expect(isPlanWithHardcap("past_due")).toBe(false);
  });
});

describe("computeUsageRatio", () => {
  it("ratio = runs/théorique", () => {
    expect(computeUsageRatio(50, "solo").ratio).toBe(0.5); // 50/100
    expect(computeUsageRatio(100, "solo").ratio).toBe(1); // 100% du théorique
    expect(computeUsageRatio(200, "solo").ratio).toBe(2); // hard-cap
  });

  it("expose theoreticalMonthly + hardCap", () => {
    const r = computeUsageRatio(50, "starter");
    expect(r.theoreticalMonthly).toBe(3750);
    expect(r.hardCap).toBe(7500);
  });
});
