import { describe, expect, it } from "vitest";
import * as cheerio from "cheerio";
import { runSeoChecks } from "./seo";

function load(html: string) {
  return cheerio.load(html);
}

describe("runSeoChecks", () => {
  it("fail si title manquant", () => {
    const $ = load(`<html><head></head><body><h1>X</h1></body></html>`);
    const results = runSeoChecks($, "https://test.fr");
    expect(results.some((r) => r.id === "seo.title-missing" && r.status === "fail")).toBe(true);
  });

  it("warn si title trop court / trop long", () => {
    const $ = load(
      `<html><head><title>Trop court</title><meta name="description" content="${"a".repeat(140)}"></head><body><h1>X</h1></body></html>`,
    );
    const results = runSeoChecks($, "https://test.fr");
    expect(results.some((r) => r.id === "seo.title-length")).toBe(true);
  });

  it("pass si title ET description ET h1 corrects", () => {
    const $ = load(
      `<html lang="fr"><head>
        <title>Un titre clair qui fait dans les 40 caractères</title>
        <meta name="description" content="${"a".repeat(140)}">
        <link rel="canonical" href="https://test.fr/">
      </head><body><h1>Mon h1 unique</h1></body></html>`,
    );
    const results = runSeoChecks($, "https://test.fr");
    expect(results.some((r) => r.id === "seo.title-present" && r.status === "pass")).toBe(true);
    expect(
      results.some((r) => r.id === "seo.meta-description-present" && r.status === "pass"),
    ).toBe(true);
    expect(results.some((r) => r.id === "seo.h1-present" && r.status === "pass")).toBe(true);
    expect(results.some((r) => r.id === "seo.canonical-present" && r.status === "pass")).toBe(true);
    expect(results.some((r) => r.id === "seo.html-lang-present" && r.status === "pass")).toBe(true);
  });

  it("warn si plusieurs h1", () => {
    const $ = load(
      `<html><head><title>OK title qui fait au moins 40 caractères ici</title></head><body><h1>Un</h1><h1>Deux</h1></body></html>`,
    );
    const results = runSeoChecks($, "https://test.fr");
    expect(results.some((r) => r.id === "seo.h1-multiple")).toBe(true);
  });

  it("warn si meta robots noindex", () => {
    const $ = load(
      `<html><head><title>Titre suffisamment long pour passer la validation</title><meta name="robots" content="noindex,nofollow"></head><body><h1>X</h1></body></html>`,
    );
    const results = runSeoChecks($, "https://test.fr");
    expect(results.some((r) => r.id === "seo.meta-robots-noindex")).toBe(true);
  });

  it("fail si html lang manquant", () => {
    const $ = load(
      `<html><head><title>Titre suffisamment long pour passer la validation</title></head><body><h1>X</h1></body></html>`,
    );
    const results = runSeoChecks($, "https://test.fr");
    expect(results.some((r) => r.id === "seo.html-lang-missing")).toBe(true);
  });

  it("warn si hierarchy sautée (h1 → h3 sans h2)", () => {
    const $ = load(
      `<html lang="fr"><head><title>Titre suffisamment long pour passer la validation</title></head><body><h1>One</h1><h3>Skipped h2</h3></body></html>`,
    );
    const results = runSeoChecks($, "https://test.fr");
    expect(results.some((r) => r.id === "seo.heading-hierarchy")).toBe(true);
  });
});
