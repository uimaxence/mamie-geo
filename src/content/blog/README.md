# Blog `src/content/blog/`

Chaque article est un fichier `.mdx` autonome avec un frontmatter YAML. Le pipeline scanne automatiquement ce dossier, génère les meta tags, OG images, JSON-LD et sitemap. **Pas besoin de toucher au code TS pour ajouter ou modifier un article.**

## Workflow : ajouter un article

1. Crée `src/content/blog/{slug}.mdx` (le slug devient l'URL `/blog/{slug}`)
2. Colle ton frontmatter YAML + le contenu Markdown
3. `pnpm dev` → l'article apparaît sur `/blog`, sa page détail existe, l'OG image est générée, le sitemap est mis à jour

## Frontmatter — schéma complet

```yaml
---
title: "Titre de l'article" # requis, 1-200 chars
description: "Description meta de l'article." # requis, 20-300 chars
date: 2026-05-16 # requis, format YYYY-MM-DD
category: Méthodo # requis : Tutoriel | Étude | Méthodo | Comparatif | Actualité
author: Maxence Cailleau # défaut "Mamie GEO"
readingTimeMin: 8 # requis, entier 1-60
keywords: [GEO, SEO IA, ChatGPT] # défaut []
cta: starter # défaut "audit-gratuit" : solo | starter | pro | audit-gratuit
draft: false # défaut false ; true = exclu du listing + sitemap
---
```

La validation Zod du frontmatter ([src/lib/blog/schemas.ts](../../lib/blog/schemas.ts)) fait crasher le build si un article est mal formé.

## Markdown supporté (via `remark-gfm` + `rehype-slug` + `rehype-autolink-headings`)

- Tables, strikethrough, autolinks `[email]`/`[url]`
- Headings auto avec ancres `#` cliquables au hover (id slugifié depuis le texte)
- Code inline + blocs ` ``` `
- Listes ordonnées / non ordonnées, blockquotes, `<hr>`

## Composants spéciaux disponibles dans MDX

### `<BlogFAQ items={…}/>` — bloc FAQ + JSON-LD GEO

Idéal en fin d'article pour booster l'apparition dans les LLM / Google. Le JSON-LD `FAQPage` est auto-injecté ; pas besoin d'écrire du `<script>`.

```mdx
<BlogFAQ
  items={[
    { q: "Question 1 ?", a: "Réponse 1." },
    { q: "Question 2 ?", a: "Réponse 2." },
  ]}
/>
```

## Choisir la `category`

| Catégorie  | Quand utiliser                     | Couleur badge |
| ---------- | ---------------------------------- | ------------- |
| Tutoriel   | guide pas-à-pas, hands-on          | bleu          |
| Étude      | données chiffrées, sources citées  | violet        |
| Méthodo    | définition d'un concept, framework | vert          |
| Comparatif | outil A vs outil B                 | orange        |
| Actualité  | news produit / écosystème          | rose          |

## Choisir le `cta`

Le CTA produit en fin d'article est injecté automatiquement. Le `cta` du frontmatter détermine la variante :

- `solo` : article qui parle de découverte, audience freelance / petit budget
- `starter` : article qui parle de tracking quotidien, audience freelance SEO
- `pro` : article B2B / équipes marketing
- `audit-gratuit` : article éducatif (Méthodo, Étude) où on veut convertir vers le lead magnet

## Auto-liens internes ?

Pas de magie automatique en V0 (cf. doc 09 § 2026-05-16). À la place :

- Le composant `<RelatedArticles>` en fin d'article propose 3 articles liés (matching catégorie + keywords overlap). Maillage interne couvert.
- Pour les liens manuels vers un autre article, écris simplement : `[texte du lien](/blog/autre-slug)` dans le markdown.

## Test E2E du workflow

Une fois ton article créé :

1. `pnpm dev` → ouvre `http://localhost:3000/blog/{slug}` → ton article s'affiche
2. `view-source:…` → vérifie qu'il y a bien `<script type="application/ld+json">` avec ton Article + FAQPage si applicable
3. `http://localhost:3000/blog/{slug}/opengraph-image` → vérifie l'OG image générée
4. `http://localhost:3000/sitemap.xml` → ton article est listé

Avant de push en prod, valide aussi le score PageSpeed après deploy sur https://pagespeed.web.dev/ (cible ≥ 98 Perf + SEO).
