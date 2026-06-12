import { describe, expect, it, vi } from "vitest";
import { extractBrandsCited } from "./extract";

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

const TEXTS = ["réponse 1", "réponse 2"];
const BASE = { apiKey: "test-key", targetBrand: "Acme", responseTexts: TEXTS };

describe("extractBrandsCited", () => {
  it("aligne marques + jugement cible sur l'ordre des réponses", async () => {
    const extraction = await extractBrandsCited({
      ...BASE,
      fetch: fakeFetch(
        mistralResponse({
          reponses: [
            { marques: ["Tryba", " Lapeyre "], cible_citee: true },
            { marques: [], cible_citee: false },
          ],
        }),
      ),
    });
    expect(extraction.brandsPerResponse).toEqual([["Tryba", "Lapeyre"], []]);
    expect(extraction.targetCitedPerResponse).toEqual([true, false]);
  });

  it("complète avec vide/false si le modèle rend moins d'entrées", async () => {
    const extraction = await extractBrandsCited({
      ...BASE,
      fetch: fakeFetch(mistralResponse({ reponses: [{ marques: ["Acme"], cible_citee: true }] })),
    });
    expect(extraction.brandsPerResponse).toEqual([["Acme"], []]);
    expect(extraction.targetCitedPerResponse).toEqual([true, false]);
  });

  it("tolère un cible_citee non booléen (catch false)", async () => {
    const extraction = await extractBrandsCited({
      ...BASE,
      fetch: fakeFetch(
        mistralResponse({
          reponses: [
            { marques: [], cible_citee: "oui" },
            { marques: [], cible_citee: false },
          ],
        }),
      ),
    });
    expect(extraction.targetCitedPerResponse).toEqual([false, false]);
  });

  it("retourne vide/false sur erreur HTTP ou JSON invalide", async () => {
    for (const fetchImpl of [fakeFetch({}, 500), fakeFetch(mistralResponse("pas du json {"))]) {
      const extraction = await extractBrandsCited({ ...BASE, fetch: fetchImpl });
      expect(extraction.brandsPerResponse).toEqual([[], []]);
      expect(extraction.targetCitedPerResponse).toEqual([false, false]);
    }
  });

  it("passe la marque cible dans le prompt", async () => {
    const fetchMock = fakeFetch(mistralResponse({ reponses: [] }));
    await extractBrandsCited({ ...BASE, fetch: fetchMock });
    const [, init] = (fetchMock as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(String(init.body)).toContain("Acme");
  });
});
