import { z } from "zod";
import { SITE_TYPES, type ComparatorCheck, type CompetitorSpotted } from "./types";

// Enrichissement LLM du scan comparateurs, en un seul appel Mistral
// Small (cf. doc 09 § 2026-06-12 : le moins cher des providers déjà
// intégrés, EU — DeepSeek refusé) ≈ 0,0001 $/scan :
//   A. classe chaque site vérifié (comparateur/annuaire/presse/avis/
//      blog/entreprise) + conseil d'inclusion d'une phrase ;
//   B. juge chaque « concurrent repéré » par la découverte — le bac à
//      restes des résultats non-listicle attrape des acteurs hors sujet
//      (constaté 2026-06-12 : Canva remonté en concurrent d'un outil
//      link in bio) ; seuls les concurrents directs sont conservés, avec
//      leur vrai nom commercial.
//
// Best effort strict : toute erreur (clé absente, HTTP, JSON invalide)
// retourne checks et concurrents inchangés — la vérification de
// présence reste la valeur du tool, l'enrichissement est un bonus.

const MISTRAL_ENDPOINT = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_MODEL = "mistral-small-latest";
const MAX_TOKENS = 1400;

const enrichmentSchema = z.object({
  sites: z.array(
    z.object({
      domain: z.string(),
      type: z.enum(SITE_TYPES).catch("autre"),
      conseil: z.string().max(300),
    }),
  ),
  // Absent quand aucun concurrent n'a été soumis au jugement.
  concurrents: z
    .array(
      z.object({
        domain: z.string(),
        concurrent: z.boolean().catch(true),
        nom: z.string().max(80).catch(""),
      }),
    )
    .catch([]),
});

function buildPrompt(
  sector: string,
  brand: string,
  checks: ComparatorCheck[],
  competitors: CompetitorSpotted[],
): string {
  const checkLines = checks
    .map((c) => `- ${c.domain} (marque ${c.present ? "déjà référencée" : "ABSENTE"})`)
    .join("\n");
  const competitorLines = competitors
    .map((c) => `- ${c.domain} (page qui ranke : « ${c.title} »)`)
    .join("\n");

  const sections = [
    `Tu aides une PME française du secteur « ${sector} » (marque « ${brand} ») à être citée par les IA (ChatGPT, Perplexity…), qui s'appuient sur les comparateurs et annuaires.

A. Pour chaque site à vérifier ci-dessous :
1. classe-le : "comparateur", "annuaire", "presse", "avis", "blog", "entreprise" (site vitrine d'une entreprise du secteur — un concurrent, pas un site qui référence des tiers) ou "autre" ;
2. donne un conseil d'inclusion d'UNE phrase, concret et spécifique au site (ex : formulaire d'ajout d'établissement, contact rédaction, programme partenaire, fiche à revendiquer). Si la marque est déjà référencée, le conseil porte sur l'optimisation de sa fiche.

Sites à vérifier :
${checkLines}`,
  ];

  if (competitors.length > 0) {
    sections.push(`B. Pour chaque entreprise repérée ci-dessous (elle ranke sur les mêmes recherches que les comparateurs du secteur), indique si c'est un CONCURRENT DIRECT probable de « ${brand} » : une entreprise dont l'offre principale appartient au secteur « ${sector} ». Réponds "concurrent": false pour un média, un blog, un comparateur, une entreprise d'un autre secteur, ou un acteur généraliste pour qui « ${sector} » n'est qu'une fonctionnalité annexe parmi beaucoup d'autres (ex : Canva pour le link in bio). Donne aussi "nom" : le nom commercial exact de l'entreprise (ex : "Lnk.Bio" pour lnk.bio).

Entreprises repérées :
${competitorLines}`);
  }

  sections.push(
    `Réponds uniquement en JSON : {"sites": [{"domain": "...", "type": "...", "conseil": "..."}]${
      competitors.length > 0
        ? `, "concurrents": [{"domain": "...", "concurrent": true | false, "nom": "..."}]`
        : ""
    }}`,
  );

  return sections.join("\n\n");
}

interface MistralChatResponse {
  choices?: { message?: { content?: string } }[];
}

export interface EnrichScanOptions {
  apiKey: string;
  sector: string;
  brand: string;
  checks: ComparatorCheck[];
  competitors: CompetitorSpotted[];
  fetch?: typeof fetch;
}

export interface EnrichedScan {
  checks: ComparatorCheck[];
  competitors: CompetitorSpotted[];
}

/**
 * Enrichit checks (type + conseil) et filtre/renomme les concurrents
 * repérés. En cas d'échec, retourne les entrées intactes.
 */
export async function enrichScanReport(options: EnrichScanOptions): Promise<EnrichedScan> {
  const fetchImpl = options.fetch ?? fetch;
  try {
    const response = await fetchImpl(MISTRAL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        max_tokens: MAX_TOKENS,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: buildPrompt(
              options.sector,
              options.brand,
              options.checks,
              options.competitors,
            ),
          },
        ],
      }),
    });
    if (!response.ok) {
      throw new Error(`Mistral enrich: HTTP ${response.status}`);
    }
    const data = (await response.json()) as MistralChatResponse;
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Mistral enrich: réponse vide");

    const parsed = enrichmentSchema.parse(JSON.parse(content));
    const byDomain = new Map(parsed.sites.map((s) => [s.domain.toLowerCase(), s]));

    const checks = options.checks.map((check) => {
      const enrichment = byDomain.get(check.domain.toLowerCase());
      if (!enrichment) return check;
      return {
        ...check,
        siteType: enrichment.type,
        inclusionHint: enrichment.conseil.trim() || undefined,
      };
    });

    // Un domaine sans jugement est conservé (conservateur) ; seul un
    // "concurrent": false explicite l'écarte. Le nom commercial du LLM
    // remplace le label dérivé du domaine.
    const judgments = new Map(parsed.concurrents.map((c) => [c.domain.toLowerCase(), c]));
    const competitors = options.competitors
      .filter((c) => judgments.get(c.domain.toLowerCase())?.concurrent !== false)
      .map((c) => {
        const nom = judgments.get(c.domain.toLowerCase())?.nom.trim();
        return nom ? { ...c, label: nom } : c;
      });

    return { checks, competitors };
  } catch {
    return { checks: options.checks, competitors: options.competitors };
  }
}
