import { describe, expect, it } from "vitest";
import * as cheerio from "cheerio";
import { runGeoChecks } from "./geo";

const SIDE = { llmsTxtAccessible: false };

describe("runGeoChecks", () => {
  it("detect FAQPage JSON-LD comme passe", () => {
    const $ = cheerio.load(
      `<html><body>
        <script type="application/ld+json">${JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            { "@type": "Question", name: "Q?", acceptedAnswer: { "@type": "Answer", text: "A." } },
          ],
        })}</script>
      </body></html>`,
    );
    const results = runGeoChecks($, "https://test.fr", SIDE);
    expect(results.some((r) => r.id === "geo.faqpage-jsonld-present" && r.status === "pass")).toBe(
      true,
    );
  });

  it("fail si FAQPage manquant", () => {
    const $ = cheerio.load(`<html><body>aucun jsonld</body></html>`);
    const results = runGeoChecks($, "https://test.fr", SIDE);
    expect(results.some((r) => r.id === "geo.faqpage-jsonld-missing" && r.status === "fail")).toBe(
      true,
    );
  });

  it("detect Article JSON-LD", () => {
    const $ = cheerio.load(
      `<html><body>
        <script type="application/ld+json">${JSON.stringify({ "@type": "Article", headline: "Test" })}</script>
      </body></html>`,
    );
    const results = runGeoChecks($, "https://test.fr", SIDE);
    expect(results.some((r) => r.id === "geo.article-jsonld-present" && r.status === "pass")).toBe(
      true,
    );
  });

  it("detect BlogPosting comme Article (alias schema.org)", () => {
    const $ = cheerio.load(
      `<html><body>
        <script type="application/ld+json">${JSON.stringify({ "@type": "BlogPosting", headline: "X" })}</script>
      </body></html>`,
    );
    const results = runGeoChecks($, "https://test.fr", SIDE);
    expect(results.some((r) => r.id === "geo.article-jsonld-present" && r.status === "pass")).toBe(
      true,
    );
  });

  it("detect Organization", () => {
    const $ = cheerio.load(
      `<html><body>
        <script type="application/ld+json">${JSON.stringify({ "@type": "Organization", name: "X" })}</script>
      </body></html>`,
    );
    const results = runGeoChecks($, "https://test.fr", SIDE);
    expect(
      results.some((r) => r.id === "geo.organization-jsonld-present" && r.status === "pass"),
    ).toBe(true);
  });

  it("fail si llms.txt non accessible", () => {
    const $ = cheerio.load(`<html><body></body></html>`);
    const results = runGeoChecks($, "https://test.fr", { llmsTxtAccessible: false });
    expect(results.some((r) => r.id === "geo.llms-txt-missing" && r.status === "fail")).toBe(true);
  });

  it("pass si llms.txt accessible", () => {
    const $ = cheerio.load(`<html><body></body></html>`);
    const results = runGeoChecks($, "https://test.fr", { llmsTxtAccessible: true });
    expect(results.some((r) => r.id === "geo.llms-txt-present" && r.status === "pass")).toBe(true);
  });

  it("detect E-E-A-T signals (about + contact)", () => {
    const $ = cheerio.load(
      `<html><body>
        <a href="/a-propos">À propos</a>
        <a href="/contact">Contact</a>
      </body></html>`,
    );
    const results = runGeoChecks($, "https://test.fr", SIDE);
    expect(results.some((r) => r.id === "geo.eeat-signals-present" && r.status === "pass")).toBe(
      true,
    );
  });

  it("detect date publication via meta", () => {
    const $ = cheerio.load(
      `<html><head><meta property="article:published_time" content="2026-05-16"></head><body></body></html>`,
    );
    const results = runGeoChecks($, "https://test.fr", SIDE);
    expect(results.some((r) => r.id === "geo.date-present" && r.status === "pass")).toBe(true);
  });
});
