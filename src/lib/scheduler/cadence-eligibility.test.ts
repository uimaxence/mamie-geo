import { describe, expect, it } from "vitest";
import { cadenceLabel, isPromptEligibleToday } from "./cadence-eligibility";

// Dates UTC pour les tests (les utc functions seront utilisées peu importe
// le fuseau local du run).
const MONDAY = new Date("2026-06-08T06:00:00Z"); // lundi
const TUESDAY = new Date("2026-06-09T06:00:00Z"); // mardi
const FIRST_OF_MONTH = new Date("2026-07-01T06:00:00Z"); // mercredi 01/07
const MID_MONTH = new Date("2026-06-15T06:00:00Z"); // lundi 15/06

describe("isPromptEligibleToday", () => {
  describe("cadence='daily'", () => {
    it("éligible n'importe quel jour", () => {
      expect(
        isPromptEligibleToday({ now: MONDAY, promptCadence: "daily", planCadence: "daily" }),
      ).toBe(true);
      expect(
        isPromptEligibleToday({ now: TUESDAY, promptCadence: "daily", planCadence: "weekly" }),
      ).toBe(true);
    });
  });

  describe("cadence='weekly'", () => {
    it("éligible uniquement le lundi UTC", () => {
      expect(
        isPromptEligibleToday({ now: MONDAY, promptCadence: "weekly", planCadence: "daily" }),
      ).toBe(true);
      expect(
        isPromptEligibleToday({ now: TUESDAY, promptCadence: "weekly", planCadence: "daily" }),
      ).toBe(false);
    });
  });

  describe("cadence='monthly'", () => {
    it("éligible uniquement le 1er du mois UTC", () => {
      expect(
        isPromptEligibleToday({
          now: FIRST_OF_MONTH,
          promptCadence: "monthly",
          planCadence: "daily",
        }),
      ).toBe(true);
      expect(
        isPromptEligibleToday({
          now: MID_MONTH,
          promptCadence: "monthly",
          planCadence: "daily",
        }),
      ).toBe(false);
    });
  });

  describe("cadence='inherit'", () => {
    it("applique planCadence='daily' chaque jour", () => {
      expect(
        isPromptEligibleToday({ now: TUESDAY, promptCadence: "inherit", planCadence: "daily" }),
      ).toBe(true);
    });

    it("applique planCadence='weekly' uniquement le lundi", () => {
      expect(
        isPromptEligibleToday({ now: MONDAY, promptCadence: "inherit", planCadence: "weekly" }),
      ).toBe(true);
      expect(
        isPromptEligibleToday({ now: TUESDAY, promptCadence: "inherit", planCadence: "weekly" }),
      ).toBe(false);
    });
  });

  it("un prompt monthly sur un plan daily n'attend pas le plan", () => {
    // Cas concret : un plan Pro (daily) avec un prompt en monthly. Le
    // mardi mid-month → false (monthly l'emporte sur l'héritage daily).
    expect(
      isPromptEligibleToday({
        now: MID_MONTH,
        promptCadence: "monthly",
        planCadence: "daily",
      }),
    ).toBe(false);
  });
});

describe("cadenceLabel", () => {
  it("label explicite pour les cadences override", () => {
    expect(cadenceLabel("daily")).toBe("Quotidien");
    expect(cadenceLabel("weekly")).toBe("Hebdomadaire (lundis)");
    expect(cadenceLabel("monthly")).toBe("Mensuel (1er du mois)");
  });

  it("label inherit mentionne le plan si fourni", () => {
    expect(cadenceLabel("inherit", "daily")).toBe("Hérite du plan (quotidien)");
    expect(cadenceLabel("inherit", "weekly")).toBe("Hérite du plan (hebdomadaire)");
  });

  it("label inherit générique sans plan", () => {
    expect(cadenceLabel("inherit")).toBe("Hérite du plan");
  });
});
