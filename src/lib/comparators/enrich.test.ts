import { describe, expect, it, vi } from "vitest";
import { enrichChecks } from "./enrich";
import type { ComparatorCheck } from "./types";

const CHECKS: ComparatorCheck[] = [
  { domain: "lelynx.fr", label: "LeLynx", origin: "etude", present: true },
  { domain: "hyperassur.com", label: "Hyperassur", origin: "recherche", present: false },
];

function mistralResponse(content: unknown): unknown {
  return {
    choices: [
      { message: { content: typeof content === "string" ? content : JSON.stringify(content) } },
    ],
  };
}

function fakeFetch(body: unknown, status = 200): typeof fetch {
  return vi.fn(
    async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
      }),
  ) as unknown as typeof fetch;
}

describe("enrichChecks", () => {
  it("fusionne type + conseil par domaine (case-insensitive)", async () => {
    const enriched = await enrichChecks({
      apiKey: "test-key",
      sector: "assurance",
      checks: CHECKS,
      fetch: fakeFetch(
        mistralResponse({
          sites: [
            { domain: "LeLynx.fr", type: "comparateur", conseil: "Revendique ta fiche." },
            { domain: "hyperassur.com", type: "comparateur", conseil: "Formulaire partenaire." },
          ],
        }),
      ),
    });
    expect(enriched[0]?.siteType).toBe("comparateur");
    expect(enriched[0]?.inclusionHint).toBe("Revendique ta fiche.");
    expect(enriched[1]?.inclusionHint).toBe("Formulaire partenaire.");
    // Les champs d'origine sont préservés.
    expect(enriched[0]?.present).toBe(true);
    expect(enriched[1]?.origin).toBe("recherche");
  });

  it("ignore les domaines inconnus et tolère un type hors enum", async () => {
    const enriched = await enrichChecks({
      apiKey: "test-key",
      sector: "assurance",
      checks: CHECKS,
      fetch: fakeFetch(
        mistralResponse({
          sites: [
            { domain: "site-invente.fr", type: "comparateur", conseil: "..." },
            { domain: "lelynx.fr", type: "marketplace", conseil: "Optimise ta fiche." },
          ],
        }),
      ),
    });
    expect(enriched[0]?.siteType).toBe("autre"); // type inconnu → catch "autre"
    expect(enriched[1]?.siteType).toBeUndefined(); // domaine non couvert → intact
  });

  it("retourne les checks intacts sur erreur HTTP", async () => {
    const enriched = await enrichChecks({
      apiKey: "test-key",
      sector: "assurance",
      checks: CHECKS,
      fetch: fakeFetch({}, 500),
    });
    expect(enriched).toEqual(CHECKS);
  });

  it("retourne les checks intacts sur JSON invalide", async () => {
    const enriched = await enrichChecks({
      apiKey: "test-key",
      sector: "assurance",
      checks: CHECKS,
      fetch: fakeFetch(mistralResponse("pas du json {")),
    });
    expect(enriched).toEqual(CHECKS);
  });
});
