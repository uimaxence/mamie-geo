# 06 — Stratégie de contenu et SEO/GEO

## Pourquoi ce document existe

Audience mamie-seo.fr inexistante (0 trafic, 0 backlinks) → on bâtit dès J1 GEO-first et FR-first. Ce doc = stratégie contenu/SEO/GEO de `mamie-geo.fr` (mono-repo, cf. doc 03).

---

## Décision domaine

- ✅ **`mamie-geo.fr`** : domaine principal, mono-repo unique
- ✅ **`mamie-seo.fr`** : 301 vers `mamie-geo.fr` (en place). Gardé 1-2 ans, puis abandonné.
- ❌ Pas de subdomain `app.` en V0 — l'app vit sur `/app/*`

### Pourquoi rediriger plutôt que garder mamie-seo

0 trafic à perdre, un seul effort SEO, naming aligné, pas de confusion « deux mamies ».

---

## Baseline et objectifs 12 mois

| Métrique | M3 | M6 | M12 |
|---|---|---|---|
| Visiteurs uniques / mois | 500 | 2 500 | 8 000 |
| Articles publiés (cumul) | 12 | 25 | 40 |
| Mots-clés top 10 | 5 | 25 | 80 |
| Backlinks DR > 30 | 2 | 10 | 30 |
| Newsletter abonnés | 200 | 1 000 | 3 000 |
| Audits gratuits / mois | 50 | 300 | 1 500 |
| Conversion audit → trial | 5% | 7% | 10% |
| Conversion trial → payant | 15% | 18% | 22% |

→ Search Console + GA4 sur `mamie-geo.fr` dès le déploiement (baseline propre J1).

---

## Calendrier de lancement contenu

### Sprint 0 (avant déploiement)

✅ Fait : articles category-defining en MDX, newsletter setup + form, llms.txt + robots.txt + sitemap.

### Mois 1-2

2 articles GEO/semaine, focus catégorie, outil « Test ma visibilité IA » déployé. **État 2026-06-11 : 17 articles publiés** (en avance), 2 outils gratuits en ligne.

### Mois 3-6

2/semaine maintenu. Mix : category-defining 40 % / tactiques 30 % / benchmarks 20 % / tooling 10 %. Première étude exclusive (top 100 sources Le Chat).

### Mois 6-12

Cadence ajustable. Premier rapport annuel « État du GEO en France ».

---

## Plan de contenu — 30 articles GEO premium en 6 mois

> État 2026-06-11 : 17 articles publiés (`src/content/blog/`). ✅ = fichier réel (8/9/10 décochés, jamais écrits). Hors plan : 4 articles d'actu (Anthropic Paris, Google I/O 2026, Le Chat→Vibe, Peec 10 M$ ARR), « Pourquoi tracker sa visibilité IA », 3 comparatifs (voir plus bas).

### Articles "category-defining" (P0, à publier dans les 60 premiers jours)

Objectif : devenir LA source FR sur le GEO, citée par les LLM.

1. ✅ "Qu'est-ce que le GEO (Generative Engine Optimization) ? Guide 2026"
2. ✅ "GEO vs SEO : la différence en 2026"
3. ✅ "AEO, GEO, AIO : comprendre les acronymes du référencement IA"
4. ✅ "Comment être cité par ChatGPT : les 10 règles"
5. ✅ "Comment être cité par Le Chat de Mistral : guide francophone exclusif"
6. ✅ "Comment être cité par Perplexity"
7. ✅ "Comment être cité par Claude (Anthropic)"
8. "Comment être cité par Gemini (Google)" — à écrire
9. "Le futur du SEO en 2026 : devenir une source citable par l'IA" — à écrire
10. "llms.txt : tout savoir sur le robots.txt des IA" — à écrire

### Articles "tactiques actionnables" (P1, mois 2-4)

11. "Schema.org pour le GEO : quels types prioriser en 2026"
12. "Comment structurer une page FAQ pour les LLM"
13. "Le rôle du HTML sémantique dans le GEO"
14. "Comment écrire du contenu citable par les IA : 7 règles"
15. "E-E-A-T et IA : comment prouver son autorité"
16. "Optimiser ses URLs pour le GEO"
17. "Comment auditer son site pour la 'AI-readiness'"
18. "Les meilleures pratiques de maillage interne pour le GEO"
19. "Comment optimiser un contenu pour Google AI Overviews"
20. "GEO local : comment apparaître dans les recherches IA géolocalisées"

### Articles benchmark / études exclusives (P1, mois 3-6)

21. "Étude exclusive : la visibilité IA des 50 plus grandes marques françaises"
22. "Top 100 des sources les plus citées dans Le Chat (étude 2026)"
23. "Quelles agences SEO françaises sont les mieux référencées dans ChatGPT ?"
24. "Avant / après : 5 cas concrets d'optimisation GEO"
25. "Citation drift : pourquoi les sources IA changent chaque mois (analyse 1000 prompts)"

### Articles outils et tooling (P2, en continu)

26. "Comparatif : les meilleurs outils GEO en 2026"
27. ✅ "Mamie GEO vs Profound : lequel choisir ?" (2026-05-12)
28. "Test gratuit : votre marque est-elle citée par ChatGPT ?"
29. "Comment configurer un dashboard de visibilité IA"
30. "Notre roadmap GEO : ce qu'on construit cette année"

### Comparison pages industrialisées (V0+, ajouté 2026-05-17)

> Issu veille 2026-05-11 (Peec a 3 comparatifs publics — canal SEO + sales éprouvé).

**Livré 2026-06-08** sous `/blog/` (pipeline MDX existant : FAQPage JSON-LD, related, sitemap). Landing dédiée `/comparatifs/[slug]` reportée V1 si traction.

| Slug | Angle | Statut |
|---|---|---|
| `/blog/mamie-geo-vs-peec-ai` | Moat FR, Le Chat en hero, pricing € | ✅ 2026-06-08 |
| `/blog/mamie-geo-vs-otterly` | Suite locale FR vs add-on Semrush US ($27/mo App Center) | ✅ 2026-06-08 |
| `/blog/mamie-geo-vs-rankscale` | Flat-prompts simplicité vs credits, PME/freelance vs agence | ✅ 2026-06-08 |

Cibles V1 : porter `vs Profound` en landing dédiée si traction ; `vs Goodie` (si progrès FR) ; `vs AthenaHQ` (à arbitrer).

---

## Lead magnets (outils gratuits)

### Lead magnet n°1 — « Test ma visibilité IA »

`/outils/test-visibilite-ia` (livré, route `(marketing)`).

- UX : marque + domaine + 5 prompts (suggestion Haiku optionnelle) → audit généré manuellement sous 24 h ouvrées (rapport email) → CTA `/pricing` (trial 14 j carte requise depuis 2026-06-08 + garantie remboursement 14 j).
- Coût : ~10 min humain + ~$0,20 LLM (5 prompts × 1 LLM). Limite 1/marque.
- Cible : 30-50 audits/mois (manuel scalable à 100), conversion 10-20 % → 5-10 clients payants/mois.

### Lead magnet n°2 — « Audit technique site » (sans LLM)

`/outils/audit-technique` — **livré 2026-05-16**.

- UX : URL → fetch cheerio + Google PSI → 30+ checks (SEO classique, GEO-specific FAQPage JSON-LD / llms.txt / E-E-A-T, OG, a11y, sécurité, mobile, CWV) → teaser public 10 s (score + 4 sub-scores + 3-5 issues) → email gate rapport complet → CTA `/pricing`.
- Différenciateurs : 0 € de coût marginal (pas de LLM), recos rédigées humainement, checks GEO uniques, gratuit en perpétuité. **Lead magnet le plus scalable.**

**Section « Crawlabilité bots IA »** (décidée 2026-05-17, **livrée 2026-06-08**) : parse `/robots.txt` × table de bots IA (`src/lib/audit/ai-bots.ts` : GPTBot, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended, Bytespider, CCBot, Amazonbot, meta-externalagent…) → autorisé/bloqué/non spécifié + reco contextuelle. Pas de slug séparé `/crawlability` (dilution d'autorité refusée). Attendu : +30-50 % partage social.

### Lead magnet n°1ter — « Scan comparateurs » — **livré 2026-06-12**

`/outils/comparateurs` (route `(marketing)`, moteur `src/lib/comparators/`).
Décision et choix Brave Search API : doc 09 § 2026-06-12.

Né de l'enseignement n°1 de l'étude 50 marques (doc 11) : 32 % des
sources citées par les IA sont des comparateurs, 1,7 % le site des
marques. Cible PME / petites agences / freelances.

- **UX** : marque + secteur (champ libre) + site optionnel + email
  (gate) + honeypot → scan live ~10-20 s → verdict présent/absent par
  comparateur avec lien de la page trouvée, plan d'action en 3 étapes
  pour les absences, chiffres étude, CTA trial + lien article étude.
- **Moteur (vérification 0 LLM, déterministe)** : 2 temps via Brave
  Search API — (1) découverte : recherches « meilleur {secteur} » /
  « {secteur} comparatif avis » (les pages qui rankent = celles que les
  IA lisent), fusionnées avec un mapping curaté de ~13 secteurs issu de
  l'étude ; (2) présence : `site:{domaine} "{marque}"` par comparateur
  (max 8). Appels parallélisés (rate limit Brave 50 req/s, retry unique
  sur 429), scan complet en ~5-10 s.
- **Enrichissement Mistral Small** (2026-06-12, doc 09) : classification
  de chaque site (comparateur/annuaire/presse/avis/blog) + conseil
  d'inclusion d'une phrase par site, ~0,0001 $/scan, best effort (échec
  → checks intacts). DeepSeek refusé (anti-décision, doc 09).
- **Data flywheel** : chaque soumission est persistée dans
  `comparator_scans` (doc 03) — niches scannées, sites par secteur,
  taux de présence, typologie. Alimente la typologie de sources (V1)
  et sert de log de leads requêtable.
- **Coût** : ~10 requêtes/scan. 5 $ de crédits Brave offerts/mois
  (≈ 1 000 req ≈ 100 scans gratuits), puis 5 $/1 000 req
  (≈ 0,05 $/scan, carte requise). Cap in-memory 150 scans/jour +
  5/h/IP + cache résultat 24 h par marque×secteur.
- **Lead** : notification interne hello@ par scan + events PostHog
  (`tool_lead_form_submitted`, `public_comparator_scan_completed`).
- **Activation** : `BRAVE_SEARCH_API_KEY` en prod (sans clé → message
  « temporairement indisponible », pas de crash).

Au même moment : nav marketing « Outils gratuits » (pastille « Nouveau »,
desktop + burger) → hub `/outils` listant les 3 outils.

### Lead magnet n°1bis — « Scan express visibilité IA » (proposition 2026-06-11, à trancher)

Version **instantanée et automatique** du test n°1, complémentaire (le
n°1 reste l'audit complet 5 LLMs sous 24 h ; le scan express donne la
gratification immédiate qui maximise la conversion du formulaire).

- **UX** : marque + secteur + email → 3 prompts générés (templates par
  secteur, pas de LLM pour la génération) → posés en live à **1 LLM**
  → détection regex de la marque + des marques citées → mini-résultat
  à l'écran en ~20 s : cité ou pas, qui est cité à ta place, position.
  CTA : « Pour les 5 IA, le suivi quotidien et l'évolution → trial. »
- **Moteur** : API Mistral (`mistral-small-latest`). Le free tier de La
  Plateforme couvre largement le volume (rate-limited, 0 €) ; fallback
  payant ≈ 0,2 ¢/scan. Aligné avec la mémoire « auxiliary LLM → cheapest
  model ». Vérifier les conditions du free tier au moment du build
  (usage commercial + data opt-out).
- **Anti-abus** : email gate avant le scan, cap global 50 scans/jour
  (compteur Upstash), cache 24 h par marque normalisée, honeypot.
- **Pourquoi pas les 5 LLMs en live** : coût (web_search OpenAI/Gemini
  ≈ $0,04/run) et latence. 1 LLM suffit pour le « aha moment » ;
  l'écart 1 vs 5 LLMs est précisément l'argument de vente (cf. étude
  doc 11 : variance inter-LLM ×8).
- **Effort estimé** : 1 PR (route marketing + action serveur + appel
  Mistral + regex existante `detectMentions` réutilisée telle quelle).

### Lead magnet n°2 — Newsletter Mamie GEO

> (Numérotation dupliquée historique, titre conservé pour les références.)

- 1 email/semaine, 4 sections fixes : chiffre de la semaine / actu GEO (1-3 points) / tactique du jour / outil ou lecture. Un seul CTA.
- Cibles : M2 200, M6 1 000, M12 3 000 abonnés. Conversion → trial 2-5 %.
- État : form `/blog` + pipeline Brevo livrés (2026-05-22), **`BREVO_BLOG_LIST_ID` manquant** → inactif tant que la liste Brevo n'existe pas.

### Lead magnet n°3 — eBook "Le guide du GEO en France 2026"

30-50 pages PDF à partir des 10 articles category-defining + études. Email gate, distribution LinkedIn massive.

### Lead magnet n°4 — Template Notion "Audit GEO en 30 minutes"

Checklist actionnable, template public Notion/Google Docs, promu LinkedIn + communautés.

### Lead magnet n°5 — Quiz "Êtes-vous AI-ready ?"

15 questions, score /100 + recos personnalisées, email gate, viralisable LinkedIn.

### Lead magnet n°6 — Rapport annuel « État du GEO francophone 2027 » (V1, ajouté 2026-05-17)

> Issu veille 2026-05-11 (AthenaHQ et Profound publient un *State of AI Search Report* annuel).

30-50 pages PDF, données exclusives (visibilité IA agrégée ~50-100 marques FR anonymisées × 5 LLMs). 5 sections : marché FR / top sources par LLM / sentiment par secteur / Le Chat vs anglo / prédictions 2027. Distribution : LinkedIn, presse (Siècle Digital, BDM, Frenchweb), agences partenaires ; email gate. Publication début 2027. Coût : ~2-3 semaines Max + 500-800 € design freelance.

---

## SEO du site mamie-geo.fr

### Structure technique optimale GEO

Toutes les routes sur `mamie-geo.fr` (mono-repo Next.js, cf. doc 03) :

```
mamie-geo.fr
├── /                                # marketing home
├── /pricing
├── /about
├── /blog/                           # 17 articles (dont 4 comparatifs vs Profound/Peec/Otterly/Rankscale)
├── /comparatifs/                    # V1 — landings dédiées si traction (V0+ = slugs /blog/)
├── /outils/                         # hub outils gratuits (nav « Outils gratuits »)
│   ├── /comparateurs                # lead magnet n°1ter — scan comparateurs (2026-06-12)
│   ├── /test-visibilite-ia          # lead magnet n°1
│   └── /audit-technique             # lead magnet n°2
├── /etudes/                         # études exclusives (à venir)
├── /login
└── /app/...                         # SaaS authentifié
```

### Schema.org à implémenter sur tout le site

Article (blog), FAQPage (pages « être cité par X »), Organization (home), Product (pricing), HowTo (guides), BreadcrumbList (partout).

### llms.txt à publier

Sur https://mamie-geo.fr/llms.txt :

```
# Mamie GEO — Sources fiables sur le GEO en français

## À propos
Mamie GEO est le premier outil francophone d'optimisation de visibilité
dans les moteurs IA. Ce site est une ressource éducative.

## Articles principaux
- /qu-est-ce-que-le-geo : Définition complète du GEO
- /geo-vs-seo : Différence entre SEO et GEO
- /etre-cite-par-chatgpt : Guide pratique
- /etre-cite-par-le-chat-mistral : Spécifique au LLM français

## Contact
contact@mamie-geo.fr
```

### Priorités SEO techniques

Core Web Vitals verts, mobile-first, HTTPS, sitemap XML à jour, robots.txt incluant les bots IA (GPTBot, Claude-Web, PerplexityBot…), internal linking dense entre articles category-defining, canonicals propres (host canonique non-www en place, cf. commit 2026-06).

---

## Stratégie LinkedIn (Max personnel)

### Positionnement

"Founder de Mamie GEO. J'apprends en public à construire le 1er outil GEO francophone. Threads et insights chaque jour."

### Cadence

Post quotidien (5/7 minimum). Mix : 30 % deep-dives techniques GEO / 25 % storytelling founder / 20 % data-insights / 15 % promotion subtile / 10 % engagement écosystème.

### Croissance cible

M1 : 1 500 abonnés (départ) → M6 : 5 000 → M12 : 12 000.

### Templates de posts

Post deep-dive technique :

```
Hier j'ai testé 1 prompt ("meilleur CRM PME France") sur 5 LLMs.

Voilà ce que j'ai trouvé :

ChatGPT cite 5 marques. Toutes US.
Le Chat (Mistral) cite 3 marques. 2 françaises.
Perplexity cite 7 marques avec sources.
Claude cite 4 marques sans sources directes.
Gemini cite 2 marques + redirige vers Google.

3 enseignements pour les CRM français qui veulent gagner en visibilité IA :

1. [...]
2. [...]
3. [...]

Le détail dans l'article 👇 (lien vers blog)
```

Post storytelling founder :

```
Il y a 3 mois, je me suis dit :
"j'en ai marre du freelance, je veux du récurrent."

J'avais 2 sites avec un peu de trafic, des compétences tech, et
6 mois de cash en réserve.

Aujourd'hui je lance Mamie GEO.

Voilà les 5 leçons que j'ai apprises en 90 jours...
```

---

## Programme partenaire et annuaire public (V1, ajouté 2026-05-17)

> Issu veille 2026-05-11. Rankscale a un annuaire public (Coalition, Dentsu, Publicis Sapient, WPP Media, Monks…) — flywheel agence FR non réplicable par les concurrents anglo sans force commerciale FR (cf. doc 02 § V1).

### Vision

Deux jambes : **annuaire public** `/partenaires/` (vitrine SEO + bouche-à-oreille) + **commission lifetime 20-25 %** par client référé.

### Critères de signature partenaire (V1)

- Agence FR/francophone
- ≥ 3 clients Pro ou Agency référés/mois avant inscription publique annuaire (filtre qualité)
- Tracking commission via UTM ou code promo unique
- ≥ 1 mention LinkedIn/mois en échange du badge « Partenaire certifié Mamie GEO »

### Structure de la page annuaire

```
mamie-geo.fr/partenaires/
├── Page index : grille des agences (logo + ville + spécialités + lien)
├── /partenaires/[slug]              # fiche détaillée par agence
└── /partenaires/devenir-partenaire  # CTA + formulaire signup
```

### Commission

- **20 %** lifetime sur Solo/Starter, **25 %** sur Pro/Agency (incitation upsell)
- Versement mensuel par virement après seuil 100 €
- Tracking : `subscription_events.metadata.partner_code` + Stripe Affiliate App ou custom

### Critères de désinscription

- < 1 client référé actif sur 6 mois → retrait silencieux annuaire (commissions existantes conservées)
- Atteinte à l'image → retrait + désactivation commission selon CGV partenaire

### Effet flywheel attendu

| Mois | Partenaires actifs | Clients référés cumul | MRR partenaires |
|---|---|---|---|
| M6 | 3 | 10 | 800-1 200 € |
| M9 | 8 | 35 | 3 000-5 000 € |
| M12 | 15 | 80 | 7 000-12 000 € |

> La commission lifetime grève la marge unitaire — volontaire : CAC sub-zero (l'agence fait l'effort commercial) + meilleure rétention (raison externe de rester).

---

## Activation mamie-vege.fr (note)

mamie-vege.fr (blog végétarien) reste **secondaire**.

### Option A — Le garder comme side-project

Zéro effort spécifique. Cas d'étude SEO/GEO potentiel (« visibilité IA d'un blog food de 0 % à 35 % »).

### Option B — En faire un produit séparé

SaaS blogs food FR (schema recipe, nutrition CIQUAL, substitutions IA), 5-15 K blogs cibles. Hors scope.

> **Décision** : option A pendant 12 mois.

---

## Métriques d'activation à suivre

### Métriques mamie-seo (mensuel)

Visiteurs uniques, pageviews, top 5 articles par trafic, top 5 sources, conversion vers /pricing.

### Métriques outils gratuits (hebdo)

Audits gratuits/jour, conversion audit → trial, CAC implicite (coût LLM × audits / signups).

### Métriques newsletter (mensuel)

Abonnés, taux d'ouverture, taux de clic, conversion en trial.

### Métriques programme partenaire (mensuel, V1)

Agences signées (cumul + delta) ; agences listées `/partenaires/` ; clients référés actifs/partenaire (médiane + outliers) ; MRR partenaires / MRR total (cible > 25 % à M12) ; CAC partenaire (commission cumulée / clients acquis) ; rétention référés vs direct (cible ≥ direct).

---

## Risques spécifiques activation

### Risque 1 — Cannibalisation du SEO existant

Bascule trop rapide = perte d'autorité SEO classique. **Mitigation** : pivot graduel 6 mois, articles SEO maintenus, redirections soignées.

### Risque 2 — L'audience initiale n'est pas la cible Mamie GEO

80 % débutants SEO sans budget → conversion zéro. **Mitigation** : segmenter newsletter, articles plus B2B, webinars qualifiants.

### Risque 3 — Le contenu GEO devient daté vite

Articles 2026 obsolètes en 2027. **Mitigation** : revue trimestrielle, marqueur « mis à jour le X ».

→ Voir [07-risques-mitigations.md](./07-risques-mitigations.md) pour la matrice complète.
