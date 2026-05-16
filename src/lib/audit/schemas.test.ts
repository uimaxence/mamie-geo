import { describe, expect, it } from "vitest";
import { auditEmailSchema, auditUrlSchema } from "./schemas";

describe("auditUrlSchema", () => {
  it("accepte une URL HTTPS valide", () => {
    expect(auditUrlSchema.parse("https://mamie-geo.fr")).toBe("https://mamie-geo.fr");
  });

  it("ajoute https:// automatiquement si protocole manquant", () => {
    expect(auditUrlSchema.parse("mamie-geo.fr")).toBe("https://mamie-geo.fr");
  });

  it("rejette HTTP explicite", () => {
    expect(auditUrlSchema.safeParse("http://mamie-geo.fr").success).toBe(false);
  });

  it("rejette localhost", () => {
    expect(auditUrlSchema.safeParse("https://localhost").success).toBe(false);
    expect(auditUrlSchema.safeParse("https://127.0.0.1").success).toBe(false);
  });

  it("rejette IP privé", () => {
    expect(auditUrlSchema.safeParse("https://192.168.1.1").success).toBe(false);
    expect(auditUrlSchema.safeParse("https://10.0.0.1").success).toBe(false);
  });
});

describe("auditEmailSchema", () => {
  it("accepte un token UUID + email valide", () => {
    const r = auditEmailSchema.parse({
      token: "550e8400-e29b-41d4-a716-446655440000",
      email: "test@example.com",
    });
    expect(r.email).toBe("test@example.com");
  });

  it("rejette token non UUID", () => {
    expect(
      auditEmailSchema.safeParse({ token: "not-uuid", email: "test@example.com" }).success,
    ).toBe(false);
  });

  it("rejette email invalide", () => {
    expect(
      auditEmailSchema.safeParse({
        token: "550e8400-e29b-41d4-a716-446655440000",
        email: "pas-un-email",
      }).success,
    ).toBe(false);
  });
});
