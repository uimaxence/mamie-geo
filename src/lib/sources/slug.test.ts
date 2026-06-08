import { describe, expect, it } from "vitest";
import { decodeSourceSlug, encodeSourceSlug } from "./slug";

describe("encodeSourceSlug / decodeSourceSlug", () => {
  it("encode et décode une URL simple", () => {
    const url = "https://example.com/path";
    const slug = encodeSourceSlug(url);
    expect(slug).not.toMatch(/[+/=]/); // pas de caractères base64 unsafe
    expect(decodeSourceSlug(slug)).toBe(url);
  });

  it("gère les query params et caractères spéciaux", () => {
    const url = "https://mamie-geo.fr/blog/qu-est-ce-que-le-geo?utm=test&ref=ai";
    expect(decodeSourceSlug(encodeSourceSlug(url))).toBe(url);
  });

  it("gère les caractères Unicode (accents)", () => {
    const url = "https://example.fr/recherche?q=générateur-prompts";
    expect(decodeSourceSlug(encodeSourceSlug(url))).toBe(url);
  });

  it("retourne null si le slug ne décode pas une URL http(s)", () => {
    const slug = encodeSourceSlug("ftp://nope");
    expect(decodeSourceSlug(slug)).toBeNull();
  });

  it("retourne null sur un slug invalide", () => {
    expect(decodeSourceSlug("***invalid***")).toBeNull();
  });

  it("supporte des slugs sans padding (base64url)", () => {
    const url = "https://x.fr";
    const slug = encodeSourceSlug(url);
    expect(slug.endsWith("=")).toBe(false);
    expect(decodeSourceSlug(slug)).toBe(url);
  });
});
