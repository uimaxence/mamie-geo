// Knowledge base — recommandation pour chaque check_id failed/warn.
// Édition humaine soignée, sans LLM. C'est le différenciateur qualitatif
// de Mamie GEO vs les outils SEO génériques : chaque reco explique
// pourquoi c'est important POUR LE GEO (visibilité dans les LLM), pas
// juste pour Google.
//
// Format markdown dans `howToFix` — rendu côté UI/email via un parser
// minimal (titre + paragraphes + code blocks).

export interface Recommendation {
  /** Pourquoi c'est important (focus GEO quand pertinent). */
  why: string;
  /** Markdown avec exemple HTML/header concret. */
  howToFix: string;
  /** Impact direct sur la visibilité IA. */
  geoImpact: "high" | "medium" | "low" | null;
  /** Effort estimé pour fixer. */
  estimatedEffort: "5min" | "15min" | "1h" | "1day";
  /** URL externe officielle pour creuser. */
  externalDoc?: string;
}

// Map check.id → Recommendation. Si un check n'a pas d'entry, on
// retourne une reco générique "améliore ce point selon les standards
// web". Tous les checks importants ont leur entry.

const RECOS: Record<string, Recommendation> = {
  // ── SEO classique ─────────────────────────────────────────────────
  "seo.title-missing": {
    why: "Sans `<title>`, Google et les LLM ne savent pas de quoi parle la page. C'est le signal sémantique #1 — l'omettre revient à publier anonymement.",
    howToFix:
      "Ajoute dans ton `<head>` :\n\n```html\n<title>Titre clair et descriptif de la page (30-60 caractères)</title>\n```\n\nLe titre doit décrire le contenu de cette page spécifiquement, pas juste répéter le nom de la marque.",
    geoImpact: "high",
    estimatedEffort: "5min",
    externalDoc: "https://developers.google.com/search/docs/appearance/title-link",
  },
  "seo.title-length": {
    why: "Un titre > 60 caractères est tronqué par Google et apparaît coupé dans les résultats. Les LLM le lisent quand même mais les utilisateurs voient un titre mutilé.",
    howToFix:
      "Vise 30-60 caractères. Mets le mot-clé important en premier, le nom de marque à la fin (si besoin de le caser).",
    geoImpact: "medium",
    estimatedEffort: "5min",
  },
  "seo.meta-description-missing": {
    why: "Sans meta description, Google génère un snippet automatique souvent incohérent. Pire : les LLM ne disposent pas du résumé court qu'ils utilisent pour décider si te citer dans une réponse.",
    howToFix:
      'Ajoute dans ton `<head>` :\n\n```html\n<meta name="description" content="Une phrase claire de 120-160 caractères qui résume la page et inclut tes mots-clés naturellement." />\n```\n\nAstuce : commence par le bénéfice utilisateur, pas par le nom de ta marque.',
    geoImpact: "medium",
    estimatedEffort: "5min",
    externalDoc: "https://developers.google.com/search/docs/appearance/snippet",
  },
  "seo.meta-description-length": {
    why: "Une description trop courte (< 120) sous-vend la page. Trop longue (> 160), elle est tronquée. Les LLM utilisent ce résumé comme contexte de citation.",
    howToFix: "Vise 120-160 caractères. Une phrase pleine qui dit quoi + pour qui + pourquoi.",
    geoImpact: "low",
    estimatedEffort: "5min",
  },
  "seo.canonical-missing": {
    why: 'Sans `<link rel="canonical">`, Google peut indexer des doublons (URL avec et sans `?utm=`, http vs https, /page vs /page/). Les LLM peuvent aussi voir plusieurs versions de la même page et diluer l\'autorité.',
    howToFix:
      'Ajoute dans ton `<head>` :\n\n```html\n<link rel="canonical" href="https://ton-site.fr/cette-page" />\n```\n\nL\'URL doit être absolue et pointer sur la version canonique (généralement la page actuelle elle-même).',
    geoImpact: "medium",
    estimatedEffort: "15min",
    externalDoc: "https://developers.google.com/search/docs/crawling-indexing/canonicalization",
  },
  "seo.h1-missing": {
    why: "Le `<h1>` est l'équivalent du titre dans la hiérarchie sémantique. Sans h1, ni Google ni les LLM ne savent quel est le sujet principal du contenu.",
    howToFix:
      "Ajoute UN `<h1>` par page, qui décrit le sujet principal. Différent du title (le title est pour les SERP, le h1 est pour le contenu).",
    geoImpact: "high",
    estimatedEffort: "5min",
  },
  "seo.h1-multiple": {
    why: "Plusieurs `<h1>` dilue le signal sémantique. Google + LLM ne savent plus quel sujet est principal.",
    howToFix:
      "Garde UN seul `<h1>` (le sujet de la page). Utilise `<h2>` pour les sections de premier niveau.",
    geoImpact: "medium",
    estimatedEffort: "15min",
  },
  "seo.heading-hierarchy": {
    why: "Sauter des niveaux (h1 → h3 sans h2) casse la structure logique. Les outils d'accessibilité et les LLM s'y perdent.",
    howToFix:
      "Respecte l'ordre : h1 → h2 → h3 → h4. Pas de saut. Si une section n'a pas de parent évident, c'est qu'il manque un h2.",
    geoImpact: "low",
    estimatedEffort: "1h",
  },
  "seo.meta-robots-noindex": {
    why: "Si tu vois ce warning par erreur, ta page n'apparaîtra PAS dans Google. C'est une mort SEO complète.",
    howToFix:
      'Retire le `<meta name="robots" content="noindex">` si tu veux indexer la page. Si tu veux la garder hors index volontairement, ignore ce warning.',
    geoImpact: "high",
    estimatedEffort: "5min",
  },
  "seo.html-lang-missing": {
    why: "L'attribut `lang` sur `<html>` indique aux moteurs et aux LLM la langue du contenu. Sans lui, Google peut mal classer ton site dans les résultats français.",
    howToFix:
      'Mets dans ta page :\n\n```html\n<html lang="fr">\n```\n\n(ou `en`, `es`, etc. selon la langue principale)',
    geoImpact: "medium",
    estimatedEffort: "5min",
  },

  // ── GEO-specific (différenciateur Mamie GEO) ──────────────────────
  "geo.article-jsonld-missing": {
    why: "Sans schéma Article JSON-LD, les LLM ne peuvent pas extraire proprement la date, l'auteur et le sujet — trois signaux qu'ils utilisent pour décider d'une citation. Avec le schéma, tu multiplies tes chances d'être cité par 2-3×.",
    howToFix:
      'Ajoute dans ton `<head>` (ou en fin de `<body>`) :\n\n```html\n<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Article",\n  "headline": "Titre de l\'article",\n  "datePublished": "2026-05-16",\n  "author": { "@type": "Person", "name": "Prénom Nom" },\n  "publisher": { "@type": "Organization", "name": "Ton site" }\n}\n</script>\n```',
    geoImpact: "high",
    estimatedEffort: "15min",
    externalDoc: "https://schema.org/Article",
  },
  "geo.faqpage-jsonld-missing": {
    why: "Le schéma FAQPage est LE BOOST GEO #1 : Google + ChatGPT + Claude + Perplexity citent en priorité les contenus avec FAQPage structurées. C'est le moyen le plus rapide d'apparaître dans les réponses LLM sur des questions précises.",
    howToFix:
      'Ajoute en fin de page :\n\n```html\n<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [\n    {\n      "@type": "Question",\n      "name": "Question fréquente 1 ?",\n      "acceptedAnswer": { "@type": "Answer", "text": "Réponse 1." }\n    },\n    {\n      "@type": "Question",\n      "name": "Question fréquente 2 ?",\n      "acceptedAnswer": { "@type": "Answer", "text": "Réponse 2." }\n    }\n  ]\n}\n</script>\n```\n\nÉcris 4-8 questions/réponses qui correspondent à des questions réelles de prospects.',
    geoImpact: "high",
    estimatedEffort: "1h",
    externalDoc: "https://developers.google.com/search/docs/appearance/structured-data/faqpage",
  },
  "geo.organization-jsonld-missing": {
    why: "Sans schéma Organization, les LLM ne savent pas quoi est ton entité (entreprise, asso, individu ?), ce qui complique leur capacité à te recommander correctement.",
    howToFix:
      'Ajoute dans ton `<head>` :\n\n```html\n<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Ton entreprise",\n  "url": "https://ton-site.fr",\n  "logo": "https://ton-site.fr/logo.png",\n  "description": "Brève description en 1 phrase"\n}\n</script>\n```',
    geoImpact: "medium",
    estimatedEffort: "15min",
    externalDoc: "https://schema.org/Organization",
  },
  "geo.author-missing": {
    why: "Les LLM (et Google E-E-A-T) regardent qui parle. Sans byline visible (« Par Prénom Nom »), le contenu est anonyme et donc moins citable.",
    howToFix:
      'Ajoute visuellement l\'auteur sous le titre. Idéalement avec lien vers une page auteur. Et complète avec schéma Person JSON-LD :\n\n```html\n<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Person",\n  "name": "Prénom Nom",\n  "jobTitle": "Fondateur",\n  "url": "https://ton-site.fr/a-propos"\n}\n</script>\n```',
    geoImpact: "high",
    estimatedEffort: "1h",
  },
  "geo.date-missing": {
    why: "Sans date de publication visible, les LLM ne savent pas si le contenu est récent. Or ils favorisent souvent le contenu daté < 24 mois.",
    howToFix:
      'Affiche la date de publication sous le titre ou en footer d\'article. Au format `<time datetime="2026-05-16">16 mai 2026</time>`.',
    geoImpact: "medium",
    estimatedEffort: "15min",
  },
  "geo.llms-txt-missing": {
    why: "`/llms.txt` est le nouveau standard pour donner aux LLM une carte structurée de ton site (titre, description, sections principales, contenu prioritaire). Très peu de sites l'ont — l'opportunité d'avance compétitive est immédiate.",
    howToFix:
      "Crée un fichier `llms.txt` à la racine de ton site avec ce contenu minimal :\n\n```\n# Nom de ton site\n\n> Une phrase qui décrit ce que tu fais.\n\n## Pages clés\n- [Accueil](https://ton-site.fr/) — quoi tu fais en 1 phrase\n- [Tarifs](https://ton-site.fr/pricing) — combien ça coûte\n- [À propos](https://ton-site.fr/a-propos) — qui tu es\n\n## Articles importants\n- [Titre de l'article 1](https://ton-site.fr/blog/article-1)\n```\n\nDoc : https://llmstxt.org/",
    geoImpact: "medium",
    estimatedEffort: "1h",
    externalDoc: "https://llmstxt.org/",
  },
  "geo.eeat-signals-missing": {
    why: 'Les LLM (et Google E-E-A-T) regardent si ton site a des pages "about", "contact", "author" — c\'est le signal le plus simple que tu es une vraie entité.',
    howToFix:
      "Crée ces 3 pages minimum, liées depuis ton header ou footer :\n\n- `/a-propos` : qui tu es, depuis quand, ta mission\n- `/contact` : email + formulaire\n- `/auteur/<slug>` : profil par auteur si plusieurs personnes écrivent\n\nLie-les explicitement depuis ton header ou footer (pas juste depuis le contenu).",
    geoImpact: "high",
    estimatedEffort: "1day",
  },

  // ── Open Graph + Twitter ──────────────────────────────────────────
  "og.og-title-missing": {
    why: "Sans og:title, le partage sur LinkedIn / Slack / Discord / Twitter affiche n'importe quoi. Frictionne le partage organique.",
    howToFix:
      'Ajoute dans ton `<head>` :\n\n```html\n<meta property="og:title" content="Titre de la page (peut être identique au <title>)" />\n<meta property="og:description" content="Description de la page (peut être identique au meta description)" />\n<meta property="og:image" content="https://ton-site.fr/og-image.png" />\n<meta property="og:url" content="https://ton-site.fr/cette-page" />\n<meta property="og:type" content="website" />\n```',
    geoImpact: "low",
    estimatedEffort: "15min",
    externalDoc: "https://ogp.me/",
  },
  "og.og-image-missing": {
    why: "Sans og:image, ton lien partagé est moche et invisible dans le flux. Tu perds des clics organiques (partages amis, communautés).",
    howToFix:
      'Crée une image 1200×630px et ajoute :\n\n```html\n<meta property="og:image" content="https://ton-site.fr/og-image.png" />\n<meta property="og:image:width" content="1200" />\n<meta property="og:image:height" content="630" />\n```',
    geoImpact: "low",
    estimatedEffort: "1h",
  },
  "og.twitter-card-missing": {
    why: "Twitter / X / LinkedIn récents utilisent les meta Twitter Card pour rendre les previews. Sans elles, ton lien apparaît sans image.",
    howToFix:
      'Ajoute :\n\n```html\n<meta name="twitter:card" content="summary_large_image" />\n<meta name="twitter:title" content="Titre" />\n<meta name="twitter:description" content="Description" />\n<meta name="twitter:image" content="https://ton-site.fr/og-image.png" />\n```',
    geoImpact: "low",
    estimatedEffort: "15min",
  },

  // ── Accessibilité ─────────────────────────────────────────────────
  "a11y.img-alt-missing": {
    why: "Les images sans `alt` sont invisibles pour les lecteurs d'écran. Aussi : les LLM analysent les `alt` pour comprendre le contenu visuel d'une page.",
    howToFix:
      'Ajoute un `alt` descriptif sur chaque image :\n\n```html\n<img src="..." alt="Description courte de ce que montre l\'image" />\n```\n\nPour les images purement décoratives, utilise `alt=""` explicitement.',
    geoImpact: "low",
    estimatedEffort: "1h",
  },
  "a11y.skip-link-missing": {
    why: "Un lien « Aller au contenu » (skip-to-content) au début du DOM permet aux utilisateurs clavier et lecteurs d'écran de bypasser le header.",
    howToFix:
      'Mets au début de ton `<body>` :\n\n```html\n<a href="#main" class="skip-link">Aller au contenu</a>\n```\n\nAvec un CSS qui le cache visuellement sauf au focus.',
    geoImpact: "low",
    estimatedEffort: "15min",
  },

  // ── Sécurité / headers ────────────────────────────────────────────
  "security.https-missing": {
    why: 'En 2026, un site HTTP est immédiatement marqué "non sécurisé" par les navigateurs et déclassé par Google. Aucun LLM moderne ne va citer un site HTTP.',
    howToFix:
      "Configure HTTPS via ton hébergeur (Vercel / Cloudflare le font automatiquement gratos) et force la redirection HTTP → HTTPS au niveau serveur.",
    geoImpact: "high",
    estimatedEffort: "1h",
  },
  "security.hsts-missing": {
    why: "Sans HSTS, un attaquant peut potentiellement downgrader la connexion HTTPS → HTTP. Signal sécurité visible dans les audits.",
    howToFix:
      "Ajoute le header HTTP (côté serveur) :\n\n```\nStrict-Transport-Security: max-age=63072000; includeSubDomains; preload\n```",
    geoImpact: "low",
    estimatedEffort: "15min",
    externalDoc: "https://developer.mozilla.org/docs/Web/HTTP/Headers/Strict-Transport-Security",
  },
  "security.x-content-type-options-missing": {
    why: 'Sans X-Content-Type-Options, les navigateurs peuvent "deviner" le type de fichier — vecteur d\'attaque MIME-sniffing.',
    howToFix: "Ajoute le header HTTP :\n\n```\nX-Content-Type-Options: nosniff\n```",
    geoImpact: "low",
    estimatedEffort: "15min",
  },
  "security.referrer-policy-missing": {
    why: "Sans Referrer-Policy, l'URL complète de tes pages fuit vers les sites externes que tes users visitent (avec query params parfois sensibles).",
    howToFix:
      "Ajoute le header HTTP :\n\n```\nReferrer-Policy: strict-origin-when-cross-origin\n```",
    geoImpact: "low",
    estimatedEffort: "15min",
  },

  // ── Mobile ────────────────────────────────────────────────────────
  "mobile.viewport-missing": {
    why: 'Sans viewport meta, le site est rendu en "desktop zoomé out" sur mobile. Google pénalise très fort, et 60-70 % de ton trafic mobile va bounce.',
    howToFix:
      'Mets dans ton `<head>` :\n\n```html\n<meta name="viewport" content="width=device-width, initial-scale=1" />\n```',
    geoImpact: "medium",
    estimatedEffort: "5min",
  },

  // ── Performance HTML ──────────────────────────────────────────────
  "perf.html-size-large": {
    why: "Un HTML > 150 KB ralentit le First Contentful Paint et fait fuir les visiteurs mobiles. Google pénalise les sites lents.",
    howToFix:
      "Inline le HTML strict du minimum nécessaire au LCP. Externalise les contenus longs (scripts, styles, contenu dynamique). Lazy-load les images below-the-fold.",
    geoImpact: "low",
    estimatedEffort: "1day",
  },
  "perf.scripts-many": {
    why: "Trop de scripts externes (> 15) bloquent le parsing HTML et explosent les Core Web Vitals. La page met du temps à être interactive.",
    howToFix:
      "Audite tes scripts (Analytics, Tag Manager, widgets, etc.) et supprime ceux non essentiels. Utilise `<script defer>` ou `async` pour les scripts non-critiques.",
    geoImpact: "low",
    estimatedEffort: "1day",
  },
  "perf.compression-missing": {
    why: "Sans compression gzip/brotli, ton HTML est servi 3-5× plus lourd. C'est la quick-win perf #1.",
    howToFix:
      "Active la compression au niveau serveur. Vercel le fait automatiquement (Brotli). Sinon, mets `Content-Encoding: gzip` ou `br` dans tes réponses.",
    geoImpact: "low",
    estimatedEffort: "15min",
  },

  // ── Core Web Vitals (PSI) ─────────────────────────────────────────
  "psi.lcp-poor": {
    why: "LCP > 4s = page perçue comme cassée par les utilisateurs. Google déclasse fortement. Les LLM ne pénalisent pas directement, mais un site cassé est rarement cité.",
    howToFix:
      'Identifie l\'élément LCP via Chrome DevTools (Performance tab). Si c\'est une image hero : ajoute `loading="eager"` + `fetchpriority="high"` + servir en AVIF/WebP optimisé. Si c\'est du texte : préload la police.',
    geoImpact: "low",
    estimatedEffort: "1day",
    externalDoc: "https://web.dev/articles/lcp",
  },
  "psi.cls-poor": {
    why: 'CLS > 0.25 = la page "saute" pendant le chargement. Les visiteurs cliquent sur le mauvais bouton. Google déclasse.',
    howToFix:
      "Réserve les dimensions des images (`width` + `height` sur `<img>`), des iframes, et des publicités. Évite d'insérer du contenu au-dessus du scroll actuel après le chargement.",
    geoImpact: "low",
    estimatedEffort: "1day",
    externalDoc: "https://web.dev/articles/cls",
  },
  "psi.inp-poor": {
    why: 'INP > 500ms = ta page est "laggy" à l\'usage. Tap, scroll, click prennent du temps à réagir.',
    howToFix:
      "Identifie les handlers d'événements lents via Chrome DevTools (Performance tab). Sors la logique lourde du main thread (Web Workers). Réduis le JS bundle.",
    geoImpact: "low",
    estimatedEffort: "1day",
    externalDoc: "https://web.dev/articles/inp",
  },

  // ── Sitemap + robots ──────────────────────────────────────────────
  "seo.sitemap-missing": {
    why: "Sans `sitemap.xml`, Google découvre tes pages plus lentement et les LLM crawlers (qui s'appuient souvent sur le sitemap pour structurer leur compréhension du site) sont à l'aveugle.",
    howToFix:
      "Génère un sitemap.xml à la racine de ton site qui liste toutes tes pages publiques. Si tu utilises Next.js, crée `app/sitemap.ts` qui retourne `MetadataRoute.Sitemap`.\n\nRéférence-le dans `robots.txt` :\n\n```\nSitemap: https://ton-site.fr/sitemap.xml\n```",
    geoImpact: "medium",
    estimatedEffort: "1h",
    externalDoc: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview",
  },
  "seo.robots-missing": {
    why: "Sans `robots.txt`, les crawlers (Google + LLM) doivent deviner ce qui est indexable. Souvent ils sur-crawl ou sous-crawl ton site.",
    howToFix:
      "Crée un `robots.txt` à la racine :\n\n```\nUser-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: https://ton-site.fr/sitemap.xml\n```",
    geoImpact: "low",
    estimatedEffort: "15min",
  },
};

const GENERIC_RECO: Recommendation = {
  why: "Ce check signale un point d'amélioration sur les standards web modernes.",
  howToFix: "Consulte la documentation Google Search Central ou web.dev pour les bonnes pratiques.",
  geoImpact: "low",
  estimatedEffort: "15min",
};

export function getRecommendation(checkId: string): Recommendation {
  return RECOS[checkId] ?? GENERIC_RECO;
}

/** Liste tous les check_ids documentés — utile pour tests. */
export function listDocumentedCheckIds(): string[] {
  return Object.keys(RECOS);
}
