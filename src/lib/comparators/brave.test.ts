import { describe, expect, it, vi } from "vitest";
import { createBraveSearch, extractDomain } from "./brave";

const SAMPLE_RESPONSE = {
  web: {
    results: [
      { title: "Comparatif assurance auto", url: "https://www.lelynx.fr/assurance-auto/" },
      { title: "Sans URL" },
      { title: "URL invalide", url: "pas-une-url" },
    ],
  },
};

function fakeFetch(body: unknown, status = 200): typeof fetch {
  return vi.fn(
    async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
      }),
  ) as unknown as typeof fetch;
}

describe("createBraveSearch", () => {
  it("parse les résultats et extrait le domaine sans www", async () => {
    const search = createBraveSearch({ apiKey: "test-key", fetch: fakeFetch(SAMPLE_RESPONSE) });
    const results = await search("meilleur assurance");
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      title: "Comparatif assurance auto",
      url: "https://www.lelynx.fr/assurance-auto/",
      domain: "lelynx.fr",
    });
  });

  it("envoie la clé API et les paramètres FR", async () => {
    const fetchMock = fakeFetch(SAMPLE_RESPONSE);
    const search = createBraveSearch({ apiKey: "test-key", fetch: fetchMock });
    await search("meilleur banque", 5);

    const [url, init] = (fetchMock as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(url).toContain("q=meilleur+banque");
    expect(url).toContain("count=5");
    expect(url).toContain("country=FR");
    expect((init.headers as Record<string, string>)["X-Subscription-Token"]).toBe("test-key");
  });

  it("retry une fois sur 429 puis réussit", async () => {
    vi.useFakeTimers();
    try {
      let call = 0;
      const fetchMock = vi.fn(async () => {
        call += 1;
        return new Response(JSON.stringify(call === 1 ? {} : SAMPLE_RESPONSE), {
          status: call === 1 ? 429 : 200,
          headers: { "content-type": "application/json" },
        });
      }) as unknown as typeof fetch;

      const search = createBraveSearch({ apiKey: "test-key", fetch: fetchMock });
      const promise = search("meilleur banque");
      await vi.runAllTimersAsync();
      const results = await promise;
      expect(results).toHaveLength(1);
      expect(call).toBe(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it("throw sur erreur HTTP non-429", async () => {
    const search = createBraveSearch({ apiKey: "test-key", fetch: fakeFetch({}, 500) });
    await expect(search("meilleur banque")).rejects.toThrow("HTTP 500");
  });
});

describe("extractDomain", () => {
  it("strip www et minuscule", () => {
    expect(extractDomain("https://WWW.LeLynx.fr/page")).toBe("lelynx.fr");
  });
  it("retourne null sur URL invalide", () => {
    expect(extractDomain("pas-une-url")).toBeNull();
  });
});
