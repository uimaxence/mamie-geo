import * as cheerio from "cheerio";
import { z } from "zod";
import { extractLocalityFromHtml, fetchPageHtml } from "./location-detect";

// Profil d'un site prospect depuis sa home : marque + secteur + zone de
// chalandise. Permet aux scans publics de ne demander que site + email
// (2026-06-12, doc 09) — le reste est déduit du site, affiché au
// prospect et corrigeable en mode manuel.
//
// Pipeline : fetch home (best effort, au path saisi par le prospect —
// "taap.it/fr" → on lit /fr) → extraction déterministe (title,
// og:site_name, meta description, h1/h2, liens de navigation = gamme
// produit, paragraphes, footer, localité JSON-LD/code postal) → 1 appel
// Mistral Medium JSON (~0,001 €) qui formule d'abord la PROPOSITION de
// l'entreprise (ce qu'elle vend, à qui) puis en déduit la catégorie de
// marché — l'ordre force le raisonnement avant la réponse. Medium et
// pas Small : Small invente des catégories (« outils de lien unique »)
// ou sur-généralise (« outils de marketing digital ») là où Medium
// nomme la catégorie de marché établie, de façon stable (testé 3 runs,
// 2026-06-12, doc 09). La zone de
// chalandise vient du CONTENU (« intervention dans tout le
// Maine-et-Loire ») et pas seulement de l'adresse — mais on demande une
// ville/agglomération utilisable dans une recherche (« meilleur
// menuisier à {zone} »), pas un département abstrait.

const MISTRAL_ENDPOINT = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_MODEL = "mistral-medium-latest";
const MAX_TOKENS = 300;
const MAX_CONTEXT_CHARS = 3500;

export interface SiteProfile {
  brandName: string;
  sector: string;
  /** Zone de chalandise pour les recherches (ville/agglo) — null si nationale. */
  zone: string | null;
  /** Ce que vend l'entreprise, en une phrase (raisonnement LLM) — pour le debug qualité. */
  proposition?: string;
}

// Au-delà, c'est une énumération de fonctionnalités (« outil de gestion
// de liens et qr codes ») : la recherche « meilleur {secteur} » devient
// inutilisable — on préfère basculer en saisie manuelle (constaté sur
// taap.it, 2026-06-12).
const MAX_SECTOR_WORDS = 5;

const profileSchema = z.object({
  // Champ de raisonnement : formuler l'offre avant de la catégoriser
  // améliore nettement le secteur sur les produits multi-features.
  proposition: z.string().max(300).catch(""),
  marque: z.string().min(1).max(80),
  secteur: z
    .string()
    .min(3)
    .max(80)
    .refine((s) => s.trim().split(/\s+/).length <= MAX_SECTOR_WORDS),
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
  navLinks: string[];
  bodyExcerpt: string;
  footerExcerpt: string;
  localityHint: string | null;
}

// Liens de nav sans signal sur l'offre : légal, contenu, auth, social.
const NAV_LINK_EXCLUDE_REGEX =
  /(blog|actualit|cgu|cgv|mention|legal|privacy|confidentialit|cookie|dpa|rgpd|login|connexion|inscription|signup|sign.?up|sign.?in|register|essai|trial|demo|contact|support|aide|help|faq|doc|api|status|presse|press|carri|career|recrutement|partenaire|affili|sitemap|discord|twitter|linkedin|facebook|instagram|youtube)/i;

/** Textes des liens de navigation — ils nomment la gamme produit réelle. */
function extractNavLinks($: cheerio.CheerioAPI): string[] {
  const scoped = $("nav a[href], header a[href]");
  const anchors = scoped.length > 0 ? scoped : $("a[href]");
  const seen = new Set<string>();
  const links: string[] = [];
  for (const el of anchors.toArray()) {
    const href = $(el).attr("href") ?? "";
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text.length < 2 || text.length > 60) continue;
    if (NAV_LINK_EXCLUDE_REGEX.test(href) || NAV_LINK_EXCLUDE_REGEX.test(text)) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    links.push(text);
    if (links.length >= 12) break;
  }
  return links;
}

/** Extrait les signaux utiles de la home (déterministe, sans LLM). */
export function extractSiteContext(domain: string, html: string): SiteContext {
  const $ = cheerio.load(html);
  return {
    domain,
    title: $("title").first().text().trim().slice(0, 200),
    ogSiteName: ($('meta[property="og:site_name"]').attr("content") ?? "").trim().slice(0, 100),
    metaDescription: (
      $('meta[name="description"]').attr("content") ??
      $('meta[property="og:description"]').attr("content") ??
      ""
    )
      .trim()
      .slice(0, 300),
    headings: $("h1, h2")
      .toArray()
      .map((el) => $(el).text().replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .slice(0, 8),
    navLinks: extractNavLinks($),
    // Premiers paragraphes visibles : les pages JS-rendered ont souvent
    // des headings vides mais du texte de pitch dans les <p>.
    bodyExcerpt: $("main p, article p, body p")
      .toArray()
      .map((el) => $(el).text().replace(/\s+/g, " ").trim())
      .filter((text) => text.length >= 40)
      .slice(0, 5)
      .join(" — ")
      .slice(0, 600),
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
    ctx.navLinks.length > 0 &&
      `Navigation du site (gamme de produits/services) : ${ctx.navLinks.join(" · ")}`,
    ctx.bodyExcerpt && `Texte de la page : ${ctx.bodyExcerpt}`,
    ctx.footerExcerpt && `Footer : ${ctx.footerExcerpt}`,
    ctx.localityHint && `Localité détectée dans l'adresse : ${ctx.localityHint}`,
  ].filter(Boolean);

  return `Voici les informations extraites de la page d'accueil du site d'une entreprise française.

${parts.join("\n\n").slice(0, MAX_CONTEXT_CHARS)}

Déduis, dans cet ordre :
1. "proposition" : en une phrase factuelle, ce que l'entreprise vend ou propose CONCRÈTEMENT — quel produit/service, à qui, pour quel usage (quel problème ça résout). Appuie-toi sur l'ensemble des signaux : la navigation révèle la gamme réelle, les titres et le texte décrivent l'usage ; le title est parfois un slogan réducteur.
2. "marque" : le nom commercial de l'entreprise (pas le slogan, pas le domaine brut sauf si c'est le nom).
3. "secteur" : la catégorie de marché qui correspond à cette proposition, en 1 à 4 mots — exactement ce qu'un client taperait dans ChatGPT ou Google pour trouver ce type d'offre (« meilleur {secteur} »). Une seule catégorie : jamais une liste de fonctionnalités, jamais plusieurs activités reliées par "et" ou des virgules. Si l'offre couvre plusieurs produits ou formats, NE choisis PAS la première feature listée : remonte à l'usage central que ta "proposition" décrit (ce que le client cherche à faire au fond) et nomme cette catégorie-là (ex : une offre « cartes de visite + flyers + affiches » → "imprimerie en ligne"). Le secteur doit être un terme de marché ÉTABLI, qu'on trouve réellement dans des comparatifs en ligne — n'invente jamais de catégorie ; si le terme exact n'existe pas, prends le terme consacré le plus proche, même s'il est en anglais (ex : "crm"). Niveau de précision : la catégorie où les produits sont directement substituables entre eux — "logiciel" ou "outil de marketing digital" sont TROP LARGES (on n'y compare pas des produits équivalents), une fonctionnalité isolée est trop étroite.
4. "zone" : sa zone de chalandise déduite du CONTENU (zone d'intervention annoncée, pas seulement l'adresse). Renvoie une ville ou agglomération utilisable dans une recherche locale (si la zone est un département ou une région, renvoie sa ville principale). Renvoie null si l'entreprise vend dans toute la France ou en ligne sans ancrage local. Un produit qui s'achète ou s'utilise en ligne (SaaS, application, site e-commerce) n'a PAS de zone : renvoie null même si une adresse de siège figure sur le site.

Réponds uniquement en JSON : {"proposition": "...", "marque": "...", "secteur": "...", "zone": "..." | null}`;
}

interface MistralChatResponse {
  choices?: { message?: { content?: string } }[];
}

export interface DetectSiteProfileOptions {
  domain: string;
  /** Path saisi par le prospect ("/fr") — la home localisée à analyser. */
  pagePath?: string;
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
  const html = await fetchPageHtml(`https://${options.domain}${options.pagePath || "/"}`, fetchImpl);
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
      proposition: parsed.proposition.trim() || undefined,
    };
  } catch {
    return null;
  }
}
