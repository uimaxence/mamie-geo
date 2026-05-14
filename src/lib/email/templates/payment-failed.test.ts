import { describe, expect, it } from "vitest";
import { renderPaymentFailed } from "./payment-failed";

describe("renderPaymentFailed", () => {
  const baseData = {
    workspaceName: "ACME Co.",
    portalUrl: "https://app.example.com/app/settings#billing",
  };

  it("renvoie un subject + html + text", () => {
    const out = renderPaymentFailed(baseData);
    expect(out.subject).toContain("Paiement");
    expect(out.text).toContain("ACME Co.");
    expect(out.html).toContain('href="https://app.example.com/app/settings#billing"');
  });

  it("mentionne le délai de 7 jours pour mise à jour de la carte", () => {
    const out = renderPaymentFailed(baseData);
    expect(out.text).toContain("7 jours");
    expect(out.html).toContain("7 jours");
  });
});
