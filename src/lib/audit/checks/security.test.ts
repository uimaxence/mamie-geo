import { describe, expect, it } from "vitest";
import { runSecurityChecks } from "./security";

describe("runSecurityChecks", () => {
  it("fail si pas HTTPS", () => {
    const results = runSecurityChecks({}, "http://test.fr");
    expect(results.some((r) => r.id === "security.https-missing" && r.status === "fail")).toBe(
      true,
    );
  });

  it("pass si HTTPS", () => {
    const results = runSecurityChecks({}, "https://test.fr");
    expect(results.some((r) => r.id === "security.https-present" && r.status === "pass")).toBe(
      true,
    );
  });

  it("fail si HSTS manquant", () => {
    const results = runSecurityChecks({}, "https://test.fr");
    expect(results.some((r) => r.id === "security.hsts-missing" && r.status === "fail")).toBe(true);
  });

  it("pass si tous les headers de sécu posés", () => {
    const results = runSecurityChecks(
      {
        "strict-transport-security": "max-age=63072000",
        "x-content-type-options": "nosniff",
        "referrer-policy": "strict-origin-when-cross-origin",
        "content-security-policy": "default-src 'self'",
      },
      "https://test.fr",
    );
    expect(results.some((r) => r.id === "security.hsts-present" && r.status === "pass")).toBe(true);
    expect(
      results.some(
        (r) => r.id === "security.x-content-type-options-present" && r.status === "pass",
      ),
    ).toBe(true);
    expect(
      results.some((r) => r.id === "security.referrer-policy-present" && r.status === "pass"),
    ).toBe(true);
  });
});
