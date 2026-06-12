import * as cheerio from "cheerio";
import { z } from "zod";
import { extractLocalityFromHtml, fetchHomeHtml } from "./location-detect";

// Profil d'un site prospect depuis sa home : marque + secteur + zone de
// chalandise. Permet aux scans publics de ne demander que site + email
// (2026-06-12, doc 09) — le reste est déduit du site, affiché au
// prospect et corrigeable en mode manuel.
//
// Pipeline : fetch home (best effort) → extraction déterministe
// (title, og:site_name, meta description, h1/h2, footer, localité
// JSON-LD/code postal) → 1 appel Mistral Small JSON (~0,0002 €) qui
// synthétise. La zone de chalandise vient du CONTENU (« intervention
// dans tout le Maine-et-Loire ») et pas seulement de l'adresse — mais
// on demande une ville/agglomération utilisable dans une recherche
// (« meilleur menuisier à {zone} »), pas un département abstrait.

const MISTRAL_ENDPOINT = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_MODEL = "mistral-small-latest";
const MAX_TOKENS = 300;
const MAX_CONTEXT_CHARS = 3500;

export interface SiteProfile {
  brandName: string;
  sector: string;
  /** Zone de chalandise pour les recherches (ville/agglo) — null si nationale. */
  zone: string | null;
}

const profileSchema = z.object({
  marque: z.string().min(1).max(80),
  secteur: z.string().min(3).max(80),
  zone: z.string().max(80).nullable().catch(null),
});

// Le LLM renvoie parfois « France » au lieu de null pour une activité
// nationale (constaté sur mamie-geo.fr) — « meilleur X à France » n'a
// aucun sens, on neutralise ces zones-là.
const NATIONAL_ZONE_REGEX =
  /^(france|toute la france|france enti|national|en ligne|internet|europe|monde|partout)/i;

function cleanZone(zone: string | null | undefined): string | null {
  const trimmed = zone?.trim();
  if (!trimmed || NATIONAL_ZONE_REGEX.test(trimmed)) return null;
  return trimmed;
}

interface SiteContext {
  domain: string;
  title: string;
  ogSiteName: string;
  metaDescription: string;
  headings: string[];
  footerExcerpt: string;
  localityHint: string | null;
}

/** Extrait les signaux utiles de la home (déterministe, sans LLM). */
export function extractSiteContext(domain: string, html: string): SiteContext {
  const $ = cheerio.load(html);
  return {
    domain,
    title: $("title").first().text().trim().slice(0, 200),
    ogSiteName: ($('meta[property="og:site_name"]').attr("content") ?? "").trim().slice(0, 100),
    metaDescription: ($('meta[name="description"]').attr("content") ?? "").trim().slice(0, 300),
    headings: $("h1, h2")
      .toArray()
      .map((el) => $(el).text().replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .slice(0, 8),
    footerExcerpt: $("footer").text().replace(/\s+/g, " ").trim().slice(0, 400),
    localityHint: extractLocalityFromHtml($),
  };
}

function buildPrompt(ctx: SiteContext): string {
  const parts = [
    `Domaine : ${ctx.domain}`,
    ctx.ogSiteName && `Nom du site (og:site_name) : ${ctx.ogSiteName}`,
    ctx.title && `Title : ${ctx.title}`,
    ctx.metaDescription && `Meta description : ${ctx.metaDescription}`,
    ctx.headings.length > 0 && `Titres de la page :\n${ctx.headings.map((h) => `- ${h}`).join("\n")}`,
    ctx.footerExcerpt && `Footer : ${ctx.footerExcerpt}`,
    ctx.localityHint && `Localité détectée dans l'adresse : ${ctx.localityHint}`,
  ].filter(Boolean);

  return `Voici les informations extraites de la page d'accueil du site d'une entreprise française.

${parts.join("\n\n").slice(0, MAX_CONTEXT_CHARS)}

Déduis :
1. "marque" : le nom commercial de l'entreprise (pas le slogan, pas le domaine brut sauf si c'est le nom).
2. "secteur" : son secteur d'activité en 2 à 5 mots simples, comme un client le chercherait (ex : "menuiserie", "agence seo", "logiciel de caisse pour restaurant").
3. "zone" : sa zone de chalandise déduite du CONTENU (zone d'intervention annoncée, pas seulement l'adresse). Renvoie une ville ou agglomération utilisable dans une recherche locale (si la zone est un département ou une région, renvoie sa ville principale). Renvoie null si l'entreprise vend dans toute la France ou en ligne sans ancrage local.

Réponds uniquement en JSON : {"marque": "...", "secteur": "...", "zone": "..." | null}`;
}

interface MistralChatResponse {
  choices?: { message?: { content?: string } }[];
}

export interface DetectSiteProfileOptions {
  domain: string;
  apiKey: string;
  fetch?: typeof fetch;
}

/**
 * Détecte marque + secteur + zone depuis la home du domaine.
 * Best effort : null si le site est inaccessible ou si le LLM échoue —
 * l'appelant bascule alors en saisie manuelle.
 */
export async function detectSiteProfile(
  options: DetectSiteProfileOptions,
): Promise<SiteProfile | null> {
  const fetchImpl = options.fetch ?? fetch;
  const html = await fetchHomeHtml(options.domain, fetchImpl);
  if (!html) return null;
  const ctx = extractSiteContext(options.domain, html);

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
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: buildPrompt(ctx) }],
      }),
    });
    if (!response.ok) throw new Error(`Mistral profile: HTTP ${response.status}`);
    const data = (await response.json()) as MistralChatResponse;
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Mistral profile: réponse vide");

    const parsed = profileSchema.parse(JSON.parse(content));
    return {
      brandName: parsed.marque.trim(),
      sector: parsed.secteur.trim().toLowerCase(),
      zone: cleanZone(parsed.zone),
    };
  } catch {
    return null;
  }
}
