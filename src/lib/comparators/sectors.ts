// Mapping secteur → comparateurs curatés, issu de l'étude 50 marques
// (doc 11 § 3.2 : top sources réellement citées par les IA) complété
// par les comparateurs/annuaires FR de référence des secteurs PME
// (cible : freelances, petites agences, PME). Le scan fusionne ce
// mapping avec une découverte live (recherche web "meilleur {secteur}"),
// donc un secteur absent d'ici fonctionne quand même.

import type { ComparatorCheck } from "./types";

export interface CuratedComparator {
  domain: string;
  label: string;
}

interface CuratedSector {
  /** Match par inclusion sur le secteur normalisé (minuscules, sans accents). */
  keywords: string[];
  comparators: CuratedComparator[];
}

const CURATED_SECTORS: CuratedSector[] = [
  {
    keywords: ["banque", "neobanque", "compte pro", "compte courant"],
    comparators: [
      { domain: "comparabanques.fr", label: "ComparaBanques" },
      { domain: "moneyvox.fr", label: "MoneyVox" },
      { domain: "selectra.info", label: "Selectra" },
      { domain: "pricebank.fr", label: "Pricebank" },
    ],
  },
  {
    keywords: ["assurance", "mutuelle", "prevoyance"],
    comparators: [
      { domain: "lelynx.fr", label: "LeLynx" },
      { domain: "lesfurets.com", label: "LesFurets" },
      { domain: "assurland.com", label: "Assurland" },
      { domain: "magnolia.fr", label: "Magnolia" },
    ],
  },
  {
    keywords: ["energie", "electricite", "gaz", "fournisseur"],
    comparators: [
      { domain: "selectra.info", label: "Selectra" },
      { domain: "kelwatt.fr", label: "Kelwatt" },
      { domain: "hellowatt.fr", label: "Hello Watt" },
      { domain: "fournisseurs-electricite.com", label: "Fournisseurs-Électricité" },
    ],
  },
  {
    keywords: ["credit", "pret", "emprunt", "rachat", "hypothecaire"],
    comparators: [
      { domain: "meilleurtaux.com", label: "Meilleurtaux" },
      { domain: "empruntis.com", label: "Empruntis" },
      { domain: "pretto.fr", label: "Pretto" },
    ],
  },
  {
    keywords: ["telecom", "internet", "box", "mobile", "forfait", "fibre"],
    comparators: [
      { domain: "ariase.com", label: "Ariase" },
      { domain: "degrouptest.com", label: "DegroupTest" },
      { domain: "echosdunet.net", label: "Échos du Net" },
      { domain: "zoneadsl.com", label: "ZoneADSL" },
    ],
  },
  {
    keywords: ["logiciel", "saas", "crm", "erp", "outil", "application", "app "],
    comparators: [
      { domain: "appvizer.fr", label: "Appvizer" },
      { domain: "capterra.fr", label: "Capterra" },
      { domain: "getapp.fr", label: "GetApp" },
      { domain: "tool-advisor.fr", label: "Tool Advisor" },
      { domain: "independant.io", label: "Independant.io" },
    ],
  },
  {
    keywords: ["agence", "freelance", "consultant", "prestataire"],
    comparators: [
      { domain: "sortlist.fr", label: "Sortlist" },
      { domain: "codeur.com", label: "Codeur" },
      { domain: "malt.fr", label: "Malt" },
      { domain: "fr.trustpilot.com", label: "Trustpilot" },
    ],
  },
  {
    keywords: ["travaux", "artisan", "plombier", "electricien", "renovation", "btp", "chauffagiste", "menuisier", "maçon", "macon"],
    comparators: [
      { domain: "travaux.com", label: "Travaux.com" },
      { domain: "habitatpresto.com", label: "HabitatPresto" },
      { domain: "houzz.fr", label: "Houzz" },
      { domain: "pagesjaunes.fr", label: "PagesJaunes" },
    ],
  },
  {
    keywords: ["immobilier", "agence immo", "estimation"],
    comparators: [
      { domain: "meilleursagents.com", label: "MeilleursAgents" },
      { domain: "seloger.com", label: "SeLoger" },
      { domain: "pagesjaunes.fr", label: "PagesJaunes" },
    ],
  },
  {
    keywords: ["formation", "ecole", "cours en ligne", "bootcamp"],
    comparators: [
      { domain: "diplomeo.com", label: "Diplomeo" },
      { domain: "topformation.fr", label: "Topformation" },
      { domain: "fr.trustpilot.com", label: "Trustpilot" },
    ],
  },
  {
    keywords: ["restaurant", "restauration", "traiteur"],
    comparators: [
      { domain: "thefork.fr", label: "TheFork" },
      { domain: "tripadvisor.fr", label: "Tripadvisor" },
      { domain: "pagesjaunes.fr", label: "PagesJaunes" },
    ],
  },
  {
    keywords: ["hotel", "voyage", "tourisme", "camping", "gite"],
    comparators: [
      { domain: "tripadvisor.fr", label: "Tripadvisor" },
      { domain: "booking.com", label: "Booking" },
      { domain: "kayak.fr", label: "Kayak" },
    ],
  },
  {
    keywords: ["high-tech", "smartphone", "ordinateur", "electromenager", "tech"],
    comparators: [
      { domain: "lesnumeriques.com", label: "Les Numériques" },
      { domain: "01net.com", label: "01net" },
      { domain: "clubic.com", label: "Clubic" },
      { domain: "idealo.fr", label: "Idealo" },
    ],
  },
];

// Domaines exclus de la découverte live : moteurs, réseaux sociaux,
// encyclopédies — jamais des "comparateurs où demander l'inclusion".
const BLOCKED_DOMAINS = [
  "google.com",
  "google.fr",
  "bing.com",
  "youtube.com",
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "twitter.com",
  "x.com",
  "tiktok.com",
  "pinterest.com",
  "pinterest.fr",
  "wikipedia.org",
  "reddit.com",
  "quora.com",
  "amazon.fr",
  "amazon.com",
];

/** Minuscules + accents retirés, pour le matching mots-clés et les clés de cache. */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function isBlockedDomain(domain: string): boolean {
  return BLOCKED_DOMAINS.some((blocked) => domain === blocked || domain.endsWith(`.${blocked}`));
}

/** Comparateurs curatés matchant le secteur (dédupliqués, ordre stable). */
export function findCuratedComparators(sector: string): CuratedComparator[] {
  const normalized = normalizeText(sector);
  const seen = new Set<string>();
  const matches: CuratedComparator[] = [];
  for (const entry of CURATED_SECTORS) {
    if (!entry.keywords.some((kw) => normalized.includes(kw))) continue;
    for (const comparator of entry.comparators) {
      if (seen.has(comparator.domain)) continue;
      seen.add(comparator.domain);
      matches.push(comparator);
    }
  }
  return matches;
}

// Une page de comparateur/annuaire/presse ranke avec un titre de
// "liste" (meilleur X, top 10, comparatif, annuaire…). Un site
// d'entreprise ranke avec son propre nom + service — il ne citera
// jamais la marque du prospect, on l'exclut des checks de présence
// (bug constaté 2026-06-12 : des concurrents listés comme
// « comparateurs où être inclus »).
const LISTICLE_TITLE_REGEX =
  /(meilleur|top\s?\d|comparatif|comparateur|classement|class[ée]|avis|guide|annuaire|s[ée]lection|que choisir|lequel|liste|trouver|trouvez|professionnels?|sp[ée]cialistes?|prestataires?|agences|entreprises de|devis)/i;

/** Le titre du résultat ressemble-t-il à une page de liste/comparatif ? */
export function looksLikeListicle(title: string): boolean {
  return LISTICLE_TITLE_REGEX.test(title);
}

// Plateformes/annuaires connus dont les pages locales ont des titres de
// site d'entreprise (« Menuisier à Seiches-sur-le-Loir - AlloVoisins »)
// — ils bypassent l'heuristique de titre (constaté 2026-06-12 :
// allovoisins et meilleur-artisan classés concurrents à tort).
const EXTRA_DIRECTORY_DOMAINS = [
  "allovoisins.com",
  "meilleur-artisan.com",
  "starofservice.com",
  "needhelp.com",
  "yelp.fr",
  "hellopro.fr",
  "europages.fr",
  "kompass.com",
  "societe.com",
  "mappy.com",
];

const KNOWN_DIRECTORY_DOMAINS = new Set([
  ...EXTRA_DIRECTORY_DOMAINS,
  ...CURATED_SECTORS.flatMap((entry) => entry.comparators.map((c) => c.domain)),
]);

/** Domaine de plateforme/annuaire connu — toujours un candidat de présence. */
export function isKnownDirectoryDomain(domain: string): boolean {
  return (
    KNOWN_DIRECTORY_DOMAINS.has(domain) ||
    [...KNOWN_DIRECTORY_DOMAINS].some((d) => domain.endsWith(`.${d}`))
  );
}

/** Label lisible pour un domaine découvert en live ("hello-watt.fr" → "Hello Watt"). */
export function labelFromDomain(domain: string): string {
  const base = domain.split(".")[0] ?? domain;
  return base
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Tri d'affichage : présents d'abord (preuves), puis absents (plan d'action). */
export function sortChecksForDisplay(checks: ComparatorCheck[]): ComparatorCheck[] {
  return [...checks].sort((a, b) => Number(b.present) - Number(a.present));
}
