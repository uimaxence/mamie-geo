import { describe, expect, it, vi } from "vitest";
import { detectSiteProfile, extractSiteContext } from "./site-profile";

const HOME_HTML = `<html><head>
  <title>Fenêtres sur Loir — Menuiserie PVC, alu et bois</title>
  <meta property="og:site_name" content="Fenêtres sur Loir" />
  <meta name="description" content="Pose de fenêtres et menuiseries, intervention dans tout le Maine-et-Loire." />
</head><body>
  <h1>Votre menuisier en Anjou</h1>
  <h2>Fenêtres, portes, volets</h2>
  <footer>Fenêtres sur Loir — 5 rue des Artisans, 49140 Seiches-sur-le-Loir</footer>
</body></html>`;

function mistralResponse(content: unknown): string {
  return JSON.stringify({
    choices: [
      { message: { content: typeof content === "string" ? content : JSON.stringify(content) } },
    ],
  });
}

// 1er appel = home HTML, 2e = Mistral.
function fakeFetchSequence(responses: Array<{ body: string; status?: number }>): typeof fetch {
  let call = 0;
  return vi.fn(async () => {
    const r = responses[Math.min(call, responses.length - 1)];
    call += 1;
    return new Response(r?.body ?? "", { status: r?.status ?? 200 });
  }) as unknown as typeof fetch;
}

describe("extractSiteContext", () => {
  it("extrait title, og:site_name, headings, footer et localité", () => {
    const ctx = extractSiteContext("fenetres-sur-loir.fr", HOME_HTML);
    expect(ctx.ogSiteName).toBe("Fenêtres sur Loir");
    expect(ctx.title).toContain("Menuiserie");
    expect(ctx.headings).toContain("Votre menuisier en Anjou");
    expect(ctx.footerExcerpt).toContain("Seiches-sur-le-Loir");
    expect(ctx.localityHint).toBe("Seiches-sur-le-Loir");
  });

  it("extrait les paragraphes substantiels en bodyExcerpt", () => {
    const html = `<html><body>
      <p>ok</p>
      <p>Notre plateforme centralise vos liens et simplifie le partage sur tous vos réseaux sociaux.</p>
    </body></html>`;
    const ctx = extractSiteContext("acme.fr", html);
    expect(ctx.bodyExcerpt).toContain("centralise vos liens");
    expect(ctx.bodyExcerpt).not.toContain("ok");
  });

  it("og:description en fallback de la meta description", () => {
    const html = `<html><head>
      <meta property="og:description" content="Pitch de secours pour les pages sans meta description." />
    </head><body></body></html>`;
    const ctx = extractSiteContext("acme.fr", html);
    expect(ctx.metaDescription).toBe("Pitch de secours pour les pages sans meta description.");
  });

  it("extrait les liens de nav (gamme produit) en excluant légal/auth/blog", () => {
    const html = `<html><body><nav>
      <a href="/conversion">Conversion Tracking</a>
      <a href="/linkinbio">Link in bio</a>
      <a href="/linkinbio">Link in bio</a>
      <a href="/pricing">Tarifs</a>
      <a href="/blog">Blog</a>
      <a href="/cgu">CGU</a>
      <a href="/login">Connexion</a>
    </nav></body></html>`;
    const ctx = extractSiteContext("taap.it", html);
    expect(ctx.navLinks).toEqual(["Conversion Tracking", "Link in bio", "Tarifs"]);
  });
});

describe("detectSiteProfile", () => {
  it("retourne le profil synthétisé par le LLM", async () => {
    const profile = await detectSiteProfile({
      domain: "fenetres-sur-loir.fr",
      apiKey: "test-key",
      fetch: fakeFetchSequence([
        { body: HOME_HTML },
        {
          body: mistralResponse({
            proposition: "Pose de fenêtres et menuiseries en Anjou.",
            marque: "Fenêtres sur Loir",
            secteur: "Menuiserie",
            zone: "Angers",
          }),
        },
      ]),
    });
    expect(profile).toEqual({
      brandName: "Fenêtres sur Loir",
      sector: "menuiserie",
      zone: "Angers",
      proposition: "Pose de fenêtres et menuiseries en Anjou.",
    });
  });

  it("analyse la page au path saisi (home localisée)", async () => {
    const fetchMock = fakeFetchSequence([
      { body: HOME_HTML },
      { body: mistralResponse({ marque: "Taap", secteur: "tracking de liens", zone: null }) },
    ]);
    await detectSiteProfile({
      domain: "taap.it",
      pagePath: "/fr",
      apiKey: "test-key",
      fetch: fetchMock,
    });
    expect(vi.mocked(fetchMock).mock.calls[0]?.[0]).toBe("https://taap.it/fr");
  });

  it("zone null pour une activité nationale", async () => {
    const profile = await detectSiteProfile({
      domain: "mamie-geo.fr",
      apiKey: "test-key",
      fetch: fakeFetchSequence([
        { body: "<html><title>Mamie GEO</title><body></body></html>" },
        { body: mistralResponse({ marque: "Mamie GEO", secteur: "logiciel seo", zone: null }) },
      ]),
    });
    expect(profile?.zone).toBeNull();
  });

  it("neutralise une zone nationale renvoyée à tort (« France », « en ligne »)", async () => {
    for (const zone of ["France", "Toute la France", "en ligne"]) {
      const profile = await detectSiteProfile({
        domain: "acme.fr",
        apiKey: "test-key",
        fetch: fakeFetchSequence([
          { body: HOME_HTML },
          { body: mistralResponse({ marque: "Acme", secteur: "logiciel", zone }) },
        ]),
      });
      expect(profile?.zone).toBeNull();
    }
  });

  it("null si la home est inaccessible", async () => {
    const profile = await detectSiteProfile({
      domain: "down.fr",
      apiKey: "test-key",
      fetch: fakeFetchSequence([{ body: "", status: 503 }]),
    });
    expect(profile).toBeNull();
  });

  it("null si le secteur est une énumération (bascule en saisie manuelle)", async () => {
    const profile = await detectSiteProfile({
      domain: "taap.it",
      apiKey: "test-key",
      fetch: fakeFetchSequence([
        { body: HOME_HTML },
        {
          body: mistralResponse({
            marque: "Taap",
            secteur: "outil de gestion de liens et qr codes",
            zone: null,
          }),
        },
      ]),
    });
    expect(profile).toBeNull();
  });

  it("null si le LLM répond du JSON invalide", async () => {
    const profile = await detectSiteProfile({
      domain: "acme.fr",
      apiKey: "test-key",
      fetch: fakeFetchSequence([{ body: HOME_HTML }, { body: mistralResponse("pas du json {") }]),
    });
    expect(profile).toBeNull();
  });
});
