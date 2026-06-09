// Contenu éditorial de la page /app/conseils — « Conseils GEO ».
//
// 10 leviers pour devenir une source citée par les IA, regroupés en
// 4 axes. Contenu evergreen, pas de data DB : il sert le drip
// d'éducation post-signup et donne du contexte stratégique au-dessus
// de l'audit technique (qui, lui, est automatique et par-URL).
//
// Chiffres attribués à l'étude Ahrefs sur les sources citées par les
// IA (formulés au conditionnel : la mécanique des LLMs n'est pas
// publique). Chaque levier pointe vers la feature Mamie GEO qui aide
// à l'actionner (`appHint`) quand c'est pertinent — l'idée est de
// relier le conseil au produit, pas d'en faire un article isolé.

export type GeoAxis = "google" | "marque" | "contenu" | "multi";
export type GeoImpact = "high" | "medium";

export interface GeoAxisMeta {
  id: GeoAxis;
  label: string;
  tone: "blue" | "purple" | "green" | "orange";
}

export const GEO_AXES: Record<GeoAxis, GeoAxisMeta> = {
  google: { id: "google", label: "Visibilité Google", tone: "blue" },
  marque: { id: "marque", label: "Marque & notoriété", tone: "purple" },
  contenu: { id: "contenu", label: "Contenu & structure", tone: "green" },
  multi: { id: "multi", label: "Présence multi-plateforme", tone: "orange" },
};

export interface GeoTip {
  n: number;
  slug: string;
  title: string;
  axis: GeoAxis;
  impact: GeoImpact;
  /**
   * `true` si ce levier est concrètement vérifiable par l'audit technique
   * (signaux on-page : socle SEO, structure HTML, title, E-E-A-T). Rendu
   * dans le bandeau « carte du dessous » qui linke vers /app/audits. Les
   * leviers off-page (branding, avis, YouTube…) restent à `false`.
   */
  auditable?: boolean;
  /** Phrase unique affichée dès le trigger (la « réponse immédiate »). */
  summary: string;
  /** Corps détaillé, 1 à 2 paragraphes. */
  body: string[];
  /** Liste à puces optionnelle (data, exemples, signaux). */
  bullets?: string[];
  /** Callout « À retenir ». */
  takeaway?: string;
  /** Lien vers la feature Mamie GEO qui aide à actionner ce levier. */
  appHint?: { label: string; href: string };
}

export const GEO_TIPS: GeoTip[] = [
  {
    n: 1,
    slug: "influence-google",
    title: "L'influence de Google",
    axis: "google",
    impact: "high",
    auditable: true,
    summary: "~88 % des réponses IA s'appuient sur des résultats issus de la recherche Google.",
    body: [
      "Une étude Ahrefs sur les sources citées par les IA montre que la grande majorité des réponses s'appuie sur des pages déjà bien classées dans la recherche. Concrètement : si ton SEO Google n'est pas solide, tes chances d'être cité par ChatGPT, Perplexity ou Gemini restent faibles.",
    ],
    bullets: [
      "search (recherche) — 88 %",
      "news (actualités) — 12 %",
      "reddit — 2 %",
      "youtube — 0,5 %",
      "académique — 0,4 %",
    ],
    takeaway:
      "Le GEO ne remplace pas le SEO, il s'appuie dessus. Un bon référencement Google reste le socle.",
  },
  {
    n: 2,
    slug: "branding",
    title: "Le branding",
    axis: "marque",
    impact: "high",
    summary: "Une marque répétée sur le web devient plus « mémorisable » pour les modèles.",
    body: [
      "Plus ta marque est citée à travers le web, plus les IA la reconnaissent et la ressortent. Les marques souvent mentionnées sont présentes sur YouTube, dans les médias, sur Reddit, les plateformes d'avis, les comparatifs et les discussions d'experts.",
      "Même sans backlink, une simple mention de marque (liée ou non) semble jouer un rôle énorme.",
    ],
    takeaway:
      "Les recommandations artificielles dans des listes ne créent pas une vraie notoriété. L'objectif : être mentionné naturellement.",
    appHint: { label: "Suis tes mentions face aux concurrents", href: "/app/citations" },
  },
  {
    n: 3,
    slug: "seo-youtube",
    title: "Le SEO YouTube",
    axis: "multi",
    impact: "medium",
    summary: "YouTube nourrit massivement les réponses IA : vidéos, transcripts, démos.",
    body: [
      "Un créateur visible sur YouTube augmente sa présence globale, ses mentions et son autorité perçue. YouTube est gorgé de contenus pédagogiques déjà bien structurés, massivement utilisés par les modèles pour « apprendre ».",
      "Les IA semblent énormément exploiter les vidéos, transcripts, interviews, démonstrations et contenus experts.",
    ],
    takeaway:
      "Le SEO IA ne se joue pas uniquement sur les blogs. Un format vidéo bien titré élargit ta surface de citation.",
  },
  {
    n: 4,
    slug: "plateformes-avis",
    title: "Les plateformes d'avis",
    axis: "marque",
    impact: "medium",
    summary: "Reddit, Trustpilot, Google My Business… les avis sont des signaux de crédibilité.",
    body: [
      "Reddit, forums, comparateurs, Google My Business, Trustpilot : ces plateformes concentrent des retours d'expérience, des opinions multiples et des signaux de confiance humains.",
      "Pour une IA, ces avis deviennent des signaux de crédibilité — elle se base sur ce que plusieurs humains valident collectivement.",
    ],
    appHint: { label: "Repère les sources qui te citent", href: "/app/citations?tab=sources" },
  },
  {
    n: 5,
    slug: "comparatifs",
    title: "Les comparatifs",
    axis: "contenu",
    impact: "high",
    summary: "Environ la moitié des citations ChatGPT viennent de contenus type « best of ».",
    body: [
      "« Meilleurs outils », comparatifs, tops, sélections, listes… environ la moitié des citations de ChatGPT proviennent de ce type de contenu.",
      "Ils performent parce qu'ils répondent vite, synthétisent l'information, comparent plusieurs options et aident à prendre une décision.",
    ],
    takeaway:
      "Attention à ne pas spammer du top 10. Les IA aiment les contenus qui simplifient une décision, pas le remplissage.",
  },
  {
    n: 6,
    slug: "structure-contenu",
    title: "La structure du contenu",
    axis: "contenu",
    impact: "high",
    auditable: true,
    summary: "Une idée enfouie au 12ᵉ paragraphe a ~2,5× moins de chances d'être citée.",
    body: [
      "Selon l'étude Ahrefs, si l'idée principale est enfouie au 12ᵉ paragraphe d'un article de 20, ChatGPT a environ 2,5 fois moins de chances de la citer que si elle figurait dès l'introduction.",
      "Les modèles privilégient les contenus scannables, les réponses immédiates, les idées visibles rapidement et les affirmations explicites.",
    ],
    takeaway:
      "La structure idéale : réponse immédiate → résumé clair → détails → nuances → preuves.",
  },
  {
    n: 7,
    slug: "intention-recherche",
    title: "L'intention de recherche",
    axis: "contenu",
    impact: "high",
    auditable: true,
    summary:
      "Un titre aligné sur l'intention de recherche augmente nettement les chances d'être cité.",
    body: [
      "Les contenus qui répondent exactement à l'intention de recherche sont largement avantagés : les IA cherchent des réponses précises. Un titre qui clarifie immédiatement le sujet aide au matching de requête et améliore aussi le SEO Google.",
    ],
    bullets: [
      "❌ « Réflexions autour des outils marketing »",
      "✅ « Les meilleurs outils marketing IA en 2026 »",
    ],
    takeaway:
      "Un titre parfaitement aligné sur la question posée peut suffire à faire la différence.",
  },
  {
    n: 8,
    slug: "eeat",
    title: "L'E-E-A-T",
    axis: "marque",
    impact: "high",
    auditable: true,
    summary: "L'E-E-A-T, c'est une accumulation de signaux de confiance, pas une note sur 100.",
    body: [
      "Les IA semblent détecter des patterns et des signaux récurrents plutôt qu'un score de crédibilité figé. En gros : quelqu'un qui sait réellement de quoi il parle, plutôt qu'un article SEO générique.",
      "Voici les signaux à garder en tête :",
    ],
    bullets: [
      "pages auteurs détaillées",
      "expertise identifiable",
      "citations et preuves",
      "expériences personnelles",
      "backlinks",
      "avis",
      "réputation globale",
      "cohérence de marque",
    ],
  },
  {
    n: 9,
    slug: "fin-du-generique",
    title: "La fin du générique",
    axis: "contenu",
    impact: "medium",
    summary:
      "Les contenus trop lisses perdent en puissance. L'expérience réelle devient un avantage.",
    body: [
      "Les contenus génériques (trop lisses, réécrits) perdent du terrain. L'expérience réelle devient un avantage concurrentiel. Les contenus les plus repris donnent un avis, assument une position, montrent des tests, apportent du vécu et ajoutent des preuves concrètes.",
    ],
    takeaway:
      "Donner son avis, faire des études de cas, partager des retours terrain : ça devient stratégique.",
  },
  {
    n: 10,
    slug: "fraicheur-contenu",
    title: "La fraîcheur du contenu",
    axis: "contenu",
    impact: "medium",
    summary: "Le récent aide, mais le vrai critère c'est : la requête exige-t-elle du frais ?",
    body: [
      "Le contenu récent aide à être cité, mais ce n'est pas qu'une question de date. Le modèle évalue surtout si la requête nécessite des informations fraîches (« meilleurs », « aujourd'hui »…).",
      "Les contenus les plus solides restent visibles longtemps parce qu'ils sont utiles, cités, et accumulent de l'autorité.",
    ],
    takeaway: "Le vrai objectif n'est pas d'être récent, c'est de rester pertinent.",
  },
];

// Leviers regroupés par axe, dans l'ordre des axes (google → marque →
// contenu → multi). Utilisé par la page Conseils pour rendre 4 blocs
// thématiques en grille plutôt qu'une pile verticale unique.
export const GEO_TIPS_BY_AXIS: Array<{ axis: GeoAxisMeta; tips: GeoTip[] }> = (
  Object.values(GEO_AXES) as GeoAxisMeta[]
)
  .map((axis) => ({ axis, tips: GEO_TIPS.filter((t) => t.axis === axis.id) }))
  .filter((group) => group.tips.length > 0);

// Synthèse finale : les ingrédients que combinent les contenus les
// plus cités (reprend la conclusion du post, reformulée).
export const GEO_CONCLUSION = {
  intro:
    "Le SEO IA ressemble de plus en plus à un mélange SEO + branding + réputation. Pour être cité, il faut devenir une source crédible et de confiance.",
  ingredients: [
    "Visibilité Google",
    "Marque identifiable",
    "Expertise réelle",
    "Structure claire",
    "Présence multi-plateforme",
    "Avis et consensus",
    "Contenus utiles et explicites",
  ],
};
