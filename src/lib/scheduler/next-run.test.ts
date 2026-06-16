import { describe, expect, it } from "vitest";
import { nextScheduledRunAt } from "./next-run";

describe("nextScheduledRunAt", () => {
  it("daily : aujourd'hui 06:00 UTC si on est avant 06:00", () => {
    const now = new Date("2026-06-16T03:00:00Z");
    expect(nextScheduledRunAt("daily", now).toISOString()).toBe("2026-06-16T06:00:00.000Z");
  });

  it("daily : demain 06:00 UTC si on est après 06:00", () => {
    const now = new Date("2026-06-16T09:00:00Z");
    expect(nextScheduledRunAt("daily", now).toISOString()).toBe("2026-06-17T06:00:00.000Z");
  });

  it("weekly : tombe toujours un lundi 06:00 UTC, dans le futur", () => {
    for (const iso of ["2026-06-16T09:00:00Z", "2026-06-19T23:00:00Z", "2026-06-21T05:00:00Z"]) {
      const now = new Date(iso);
      const next = nextScheduledRunAt("weekly", now);
      expect(next.getUTCDay(), iso).toBe(1); // lundi
      expect(next.getUTCHours(), iso).toBe(6);
      expect(next.getTime(), iso).toBeGreaterThan(now.getTime());
      expect(next.getTime() - now.getTime(), iso).toBeLessThanOrEqual(7 * 86_400_000);
    }
  });

  it("weekly : un lundi avant 06:00 → le même lundi", () => {
    // 2026-06-22 est un lundi.
    const now = new Date("2026-06-22T04:00:00Z");
    const next = nextScheduledRunAt("weekly", now);
    expect(next.toISOString()).toBe("2026-06-22T06:00:00.000Z");
  });

  it("weekly : un lundi après 06:00 → le lundi suivant", () => {
    const now = new Date("2026-06-22T10:00:00Z");
    const next = nextScheduledRunAt("weekly", now);
    expect(next.toISOString()).toBe("2026-06-29T06:00:00.000Z");
  });
});
