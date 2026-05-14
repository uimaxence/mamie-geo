import { describe, expect, it } from "vitest";
import { isoWeekFromDate, parseSendWeeklyEmailPayload } from "./send-weekly-email-payload";

// Tests unitaires sur le parser de payload + helper isoWeekFromDate.
// Intégration full DB (workspace réel → email réel) viendra avec le
// setup branche-Neon-par-PR (cf. CLAUDE.md § Tests intégration Drizzle).

describe("parseSendWeeklyEmailPayload", () => {
  it("accepte un payload valide", () => {
    const parsed = parseSendWeeklyEmailPayload({
      workspaceId: "ws-uuid",
      isoWeek: "2026-W19",
    });
    expect(parsed).toEqual({ workspaceId: "ws-uuid", isoWeek: "2026-W19" });
  });

  it("rejette un payload null", () => {
    expect(() => parseSendWeeklyEmailPayload(null)).toThrow(/must be an object/);
  });

  it("rejette un payload sans workspaceId", () => {
    expect(() => parseSendWeeklyEmailPayload({ isoWeek: "2026-W19" })).toThrow(
      /workspaceId\/isoWeek/,
    );
  });

  it("rejette un format isoWeek invalide", () => {
    expect(() => parseSendWeeklyEmailPayload({ workspaceId: "ws", isoWeek: "2026-19" })).toThrow(
      /isoWeek invalide/,
    );
    expect(() => parseSendWeeklyEmailPayload({ workspaceId: "ws", isoWeek: "S19-2026" })).toThrow(
      /isoWeek invalide/,
    );
  });

  it("ignore les champs additionnels (forward-compat)", () => {
    const parsed = parseSendWeeklyEmailPayload({
      workspaceId: "ws",
      isoWeek: "2026-W19",
      experimental_metadata: { foo: "bar" },
    });
    expect(parsed.workspaceId).toBe("ws");
    expect(parsed.isoWeek).toBe("2026-W19");
  });
});

describe("isoWeekFromDate", () => {
  it("calcule la semaine ISO pour un jeudi (milieu de semaine)", () => {
    // Jeudi 7 mai 2026 → semaine 19 ISO
    expect(isoWeekFromDate(new Date(Date.UTC(2026, 4, 7)))).toBe("2026-W19");
  });

  it("calcule la semaine ISO pour un dimanche (fin de semaine)", () => {
    // Dimanche 10 mai 2026 → encore semaine 19 ISO
    expect(isoWeekFromDate(new Date(Date.UTC(2026, 4, 10)))).toBe("2026-W19");
  });

  it("calcule la semaine ISO pour un lundi (début de semaine)", () => {
    // Lundi 11 mai 2026 → semaine 20 ISO
    expect(isoWeekFromDate(new Date(Date.UTC(2026, 4, 11)))).toBe("2026-W20");
  });

  it("gère le passage d'année (semaine 1 de janvier suivant)", () => {
    // 1er janvier 2027 = vendredi → semaine 53 de 2026 (norme ISO 8601)
    expect(isoWeekFromDate(new Date(Date.UTC(2027, 0, 1)))).toBe("2026-W53");
  });

  it("pad la semaine sur 2 chiffres", () => {
    // 5 janvier 2026 = lundi → W02
    expect(isoWeekFromDate(new Date(Date.UTC(2026, 0, 5)))).toBe("2026-W02");
  });
});
