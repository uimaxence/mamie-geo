import { describe, expect, it, vi } from "vitest";
import { detectSiteLocation } from "./location-detect";

function fakeFetch(html: string, status = 200): typeof fetch {
  return vi.fn(
    async () =>
      new Response(html, { status, headers: { "content-type": "text/html" } }),
  ) as unknown as typeof fetch;
}

describe("detectSiteLocation", () => {
  it("lit addressLocality dans le JSON-LD LocalBusiness", async () => {
    const html = `<html><head><script type="application/ld+json">
      {"@type":"LocalBusiness","name":"Acme","address":{"@type":"PostalAddress","streetAddress":"1 rue X","postalCode":"37000","addressLocality":"Tours"}}
    </script></head><body></body></html>`;
    expect(await detectSiteLocation("acme.fr", fakeFetch(html))).toBe("Tours");
  });

  it("traverse un @graph et des tableaux", async () => {
    const html = `<html><head><script type="application/ld+json">
      {"@graph":[{"@type":"Organization"},{"@type":"LocalBusiness","address":[{"addressLocality":"Saint-Pierre-des-Corps"}]}]}
    </script></head><body></body></html>`;
    expect(await detectSiteLocation("acme.fr", fakeFetch(html))).toBe("Saint-Pierre-des-Corps");
  });

  it("fallback code postal + ville dans le footer, et strip Cedex", async () => {
    const html = `<html><body>
      <main>Du contenu sans adresse.</main>
      <footer>Acme SARL — 12 avenue de Grammont, 37000 Tours Cedex 2 — 02 47 00 00 00</footer>
    </body></html>`;
    expect(await detectSiteLocation("acme.fr", fakeFetch(html))).toBe("Tours");
  });

  it("retourne null sans signal de localisation", async () => {
    const html = `<html><body><footer>© 2026 Acme — mentions légales</footer></body></html>`;
    expect(await detectSiteLocation("acme.fr", fakeFetch(html))).toBeNull();
  });

  it("retourne null sur erreur HTTP ou fetch qui throw", async () => {
    expect(await detectSiteLocation("acme.fr", fakeFetch("", 500))).toBeNull();
    const throwing = (async () => {
      throw new Error("boom");
    }) as unknown as typeof fetch;
    expect(await detectSiteLocation("acme.fr", throwing)).toBeNull();
  });

  it("ignore un JSON-LD malformé et continue", async () => {
    const html = `<html><head><script type="application/ld+json">{pas du json</script></head>
      <body><footer>69001 Lyon</footer></body></html>`;
    expect(await detectSiteLocation("acme.fr", fakeFetch(html))).toBe("Lyon");
  });
});
