// Liste centralisée des pages comparatives /vs/<slug>. Source unique
// partagée par le hub /vs (cartes) et le footer marketing (colonne
// Comparatifs). Ajouter une entrée ici quand on livre une nouvelle page
// /vs/<slug> : elle apparaît automatiquement dans le hub et le footer.
//
// Ordre = priorité d'affichage : concurrents FR directs d'abord (cible
// la plus chaude), puis internationaux.
//
// Accroches vérifiées sur les sites concurrents le 2026-06-18.

export interface ComparisonEntry {
  slug: string;
  /** nom concurrent affiché, ex: "Qwairy" */
  competitor: string;
  /** label de lien court, ex: "vs Qwairy" */
  navLabel: string;
  /** accroche carte hub */
  tagline: string;
  /** comparaison de prix d'entrée affichée sur la carte hub */
  priceHook: string;
}

export const COMPARISONS: ComparisonEntry[] = [
  {
    slug: "qwairy",
    competitor: "Qwairy",
    navLabel: "vs Qwairy",
    tagline: "Suite FR la plus complète, EU comme nous, mais 6× plus chère à l'entrée.",
    priceHook: "9,99 € vs 59 €/mois",
  },
  {
    slug: "meteoria",
    competitor: "Meteoria",
    navLabel: "vs Meteoria",
    tagline: "Outil FR holistique (GA, Looker), 3 moteurs au choix et pas de Le Chat.",
    priceHook: "9,99 € vs 75 €/mois",
  },
  {
    slug: "botrank",
    competitor: "Botrank",
    navLabel: "vs Botrank",
    tagline: "Agent « Bob » et scraping, mais 3 moteurs seulement à l'entrée.",
    priceHook: "9,99 € vs 75 €/mois",
  },
  {
    slug: "peec-ai",
    competitor: "Peec AI",
    navLabel: "vs Peec AI",
    tagline: "Le leader européen pour scale-ups, en anglais, dès 85 €/mois.",
    priceHook: "9,99 € vs 85 €/mois",
  },
  {
    slug: "profound",
    competitor: "Profound",
    navLabel: "vs Profound",
    tagline: "L'outil US pour Fortune 1000, à 1/10ᵉ du prix chez nous.",
    priceHook: "9,99 € vs 500 $/mois",
  },
  {
    slug: "otterly",
    competitor: "Otterly",
    navLabel: "vs Otterly",
    tagline: "Outil US standalone, Claude/Gemini en add-on et pas de Le Chat.",
    priceHook: "9,99 € vs 29 $/mois",
  },
  {
    slug: "rankscale",
    competitor: "Rankscale",
    navLabel: "vs Rankscale",
    tagline: "Crédits modulables en dollars pour agences vs flat-prompts en euros.",
    priceHook: "9,99 € vs 20 $/mois",
  },
];
