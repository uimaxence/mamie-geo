import { describe, expect, it, vi } from "vitest";
import { enrichScanReport } from "./enrich";
import type { ComparatorCheck, CompetitorSpotted } from "./types";

const CHECKS: ComparatorCheck[] = [
  { domain: "lelynx.fr", label: "LeLynx", origin: "etude", present: true },
  { domain: "hyperassur.com", label: "Hyperassur", origin: "recherche", present: false },
];

const COMPETITORS: CompetitorSpotted[] = [
  { domain: "lnk.bio", label: "Lnk", url: "https://lnk.bio/", title: "Lnk.Bio - Link in Bio" },
  { domain: "canva.com", label: "Canva", url: "https://canva.com/", title: "Link in bio gratuit" },
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

describe("enrichScanReport", () => {
  it("fusionne type + conseil par domaine (case-insensitive)", async () => {
    const { checks } = await enrichScanReport({
      apiKey: "test-key",
      sector: "assurance",
      brand: "Acme",
      checks: CHECKS,
      competitors: [],
      fetch: fakeFetch(
        mistralResponse({
          sites: [
            { domain: "LeLynx.fr", type: "comparateur", conseil: "Revendique ta fiche." },
            { domain: "hyperassur.com", type: "comparateur", conseil: "Formulaire partenaire." },
          ],
        }),
      ),
    });
    expect(checks[0]?.siteType).toBe("comparateur");
    expect(checks[0]?.inclusionHint).toBe("Revendique ta fiche.");
    expect(checks[1]?.inclusionHint).toBe("Formulaire partenaire.");
    // Les champs d'origine sont préservés.
    expect(checks[0]?.present).toBe(true);
    expect(checks[1]?.origin).toBe("recherche");
  });

  it("ignore les domaines inconnus et tolère un type hors enum", async () => {
    const { checks } = await enrichScanReport({
      apiKey: "test-key",
      sector: "assurance",
      brand: "Acme",
      checks: CHECKS,
      competitors: [],
      fetch: fakeFetch(
        mistralResponse({
          sites: [
            { domain: "site-invente.fr", type: "comparateur", conseil: "..." },
            { domain: "lelynx.fr", type: "marketplace", conseil: "Optimise ta fiche." },
          ],
        }),
      ),
    });
    expect(checks[0]?.siteType).toBe("autre"); // type inconnu → catch "autre"
    expect(checks[1]?.siteType).toBeUndefined(); // domaine non couvert → intact
  });

  it("écarte les concurrents jugés non pertinents et renomme les autres", async () => {
    const { competitors } = await enrichScanReport({
      apiKey: "test-key",
      sector: "link in bio",
      brand: "Taap",
      checks: CHECKS,
      competitors: COMPETITORS,
      fetch: fakeFetch(
        mistralResponse({
          sites: [],
          concurrents: [
            { domain: "lnk.bio", concurrent: true, nom: "Lnk.Bio" },
            { domain: "canva.com", concurrent: false, nom: "Canva" },
          ],
        }),
      ),
    });
    expect(competitors).toHaveLength(1);
    expect(competitors[0]?.domain).toBe("lnk.bio");
    expect(competitors[0]?.label).toBe("Lnk.Bio");
  });

  it("conserve un concurrent absent du jugement LLM", async () => {
    const { competitors } = await enrichScanReport({
      apiKey: "test-key",
      sector: "link in bio",
      brand: "Taap",
      checks: CHECKS,
      competitors: COMPETITORS,
      fetch: fakeFetch(
        mistralResponse({
          sites: [],
          concurrents: [{ domain: "canva.com", concurrent: false, nom: "Canva" }],
        }),
      ),
    });
    expect(competitors).toHaveLength(1);
    expect(competitors[0]?.domain).toBe("lnk.bio");
    expect(competitors[0]?.label).toBe("Lnk"); // pas de nom LLM → label d'origine
  });

  it("tolère une réponse sans clé concurrents", async () => {
    const { competitors } = await enrichScanReport({
      apiKey: "test-key",
      sector: "assurance",
      brand: "Acme",
      checks: CHECKS,
      competitors: COMPETITORS,
      fetch: fakeFetch(mistralResponse({ sites: [] })),
    });
    expect(competitors).toEqual(COMPETITORS);
  });

  it("retourne checks et concurrents intacts sur erreur HTTP", async () => {
    const result = await enrichScanReport({
      apiKey: "test-key",
      sector: "assurance",
      brand: "Acme",
      checks: CHECKS,
      competitors: COMPETITORS,
      fetch: fakeFetch({}, 500),
    });
    expect(result.checks).toEqual(CHECKS);
    expect(result.competitors).toEqual(COMPETITORS);
  });

  it("retourne checks et concurrents intacts sur JSON invalide", async () => {
    const result = await enrichScanReport({
      apiKey: "test-key",
      sector: "assurance",
      brand: "Acme",
      checks: CHECKS,
      competitors: COMPETITORS,
      fetch: fakeFetch(mistralResponse("pas du json {")),
    });
    expect(result.checks).toEqual(CHECKS);
    expect(result.competitors).toEqual(COMPETITORS);
  });
});
