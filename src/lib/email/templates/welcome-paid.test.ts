import { describe, expect, it } from "vitest";
import { renderWelcomePaid } from "./welcome-paid";

describe("renderWelcomePaid", () => {
  const baseData = {
    workspaceName: "ACME Co.",
    plan: "solo" as const,
    dashboardUrl: "https://app.example.com/app/dashboard",
    immediateRuns: 5,
  };

  it("renvoie un subject + html + text", () => {
    const out = renderWelcomePaid(baseData);
    expect(out.subject).toContain("Mamie GEO Solo");
    expect(out.text).toContain("ACME Co.");
    expect(out.html).toContain("ACME Co.");
    expect(out.html).toContain('href="https://app.example.com/app/dashboard"');
  });

  it("avec immediateRuns > 0 annonce 'premier run lancé'", () => {
    const out = renderWelcomePaid({ ...baseData, immediateRuns: 5 });
    expect(out.text).toContain("premier run");
    expect(out.html).toContain("premier run");
    expect(out.text).toContain("quelques minutes");
  });

  it("avec immediateRuns = 0 annonce la cadence du plan", () => {
    const out = renderWelcomePaid({ ...baseData, plan: "solo", immediateRuns: 0 });
    expect(out.text).toContain("chaque lundi");
    expect(out.text).not.toContain("premier run vient d'être lancé");
  });

  it("dit 'chaque lundi' pour solo et 'chaque matin' pour starter/pro", () => {
    expect(renderWelcomePaid({ ...baseData, plan: "solo" }).text).toContain("chaque lundi");
    expect(renderWelcomePaid({ ...baseData, plan: "starter" }).text).toContain("chaque matin");
    expect(renderWelcomePaid({ ...baseData, plan: "pro" }).text).toContain("chaque matin");
  });

  it("escape le workspaceName pour éviter l'injection HTML", () => {
    const out = renderWelcomePaid({
      ...baseData,
      workspaceName: "<script>alert(1)</script>",
    });
    expect(out.html).not.toContain("<script>alert(1)</script>");
    expect(out.html).toContain("&lt;script&gt;");
  });
});
