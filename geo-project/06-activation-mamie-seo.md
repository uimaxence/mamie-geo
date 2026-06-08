# 06 — Stratégie de contenu et SEO/GEO

## Pourquoi ce document existe

L'audience mamie-seo.fr étant aujourd'hui **inexistante** (0 trafic, 0 backlinks valorisables), il n'y a rien à "préserver". Le projet repart d'une page blanche en termes d'audience, ce qui est en réalité **une opportunité** : on bâtit dès J1 avec le bon positionnement (GEO-first, FR-first), sans dette éditoriale ni redirections complexes à gérer.

Ce document définit la stratégie de contenu, SEO et GEO pour `mamie-geo.fr` — qui héberge en mono-repo le marketing, le blog, et l'app SaaS (cf. doc 03).

---

## Décision domaine

- ✅ **`mamie-geo.fr`** : domaine principal, hébergement mono-repo unique
- ✅ **`mamie-seo.fr`** : redirigé en 301 vers `mamie-geo.fr` dès J1 (configuration côté Vercel ou registrar). Domaine gardé loué 1-2 ans en sécurité, puis abandonné.
- ❌ Pas de subdomain `app.mamie-geo.fr` en V0 — l'app vit sur `mamie-geo.fr/app/*`

### Pourquoi rediriger plutôt que garder mamie-seo

- 0 trafic à perdre = pas d'argument de préservation
- Une seule marque, un seul site, un seul effort SEO concentré
- Naming "Mamie GEO" plus aligné avec le projet
- Évite la confusion "deux mamies" pour les prospects

---

## Baseline et objectifs 12 mois

Métriques cibles à 12 mois sur `mamie-geo.fr` :

| Métrique                  | M3  | M6    | M12   |
| ------------------------- | --- | ----- | ----- |
| Visiteurs uniques / mois  | 500 | 2 500 | 8 000 |
| Articles publiés (cumul)  | 12  | 25    | 40    |
| Mots-clés top 10          | 5   | 25    | 80    |
| Backlinks DR > 30         | 2   | 10    | 30    |
| Newsletter abonnés        | 200 | 1 000 | 3 000 |
| Audits gratuits / mois    | 50  | 300   | 1 500 |
| Conversion audit → trial  | 5%  | 7%    | 10%   |
| Conversion trial → payant | 15% | 18%   | 22%   |

→ **Action immédiate Sprint 0** : Search Console + GA4 configurés sur `mamie-geo.fr` dès le déploiement, pour avoir le baseline propre dès J1.

---

## Calendrier de lancement contenu

### Sprint 0 (avant déploiement)

- 5 articles category-defining déjà rédigés en MDX, prêts à publier
- 1 article de lancement officiel
- Newsletter setup + form d'inscription
- llms.txt + robots.txt + sitemap configurés

### Mois 1-2

- Cadence : 2 articles GEO / semaine = 16 articles publiés
- Focus 100% catégorie GEO
- Premier outil gratuit "Test ma visibilité IA" déployé

### Mois 3-6

- Cadence maintenue 2/semaine
- Mix : category-defining (40%), tactiques (30%), benchmarks (20%), tooling (10%)
- Première étude exclusive publiée (top 100 sources Le Chat)

### Mois 6-12

- Cadence ajustable selon ce qui marche
- Premier rapport annuel "État du GEO en France"

---

## Plan de contenu — 30 articles GEO premium en 6 mois

### Articles "category-defining" (P0, à publier dans les 60 premiers jours)

Objectif : devenir LA source FR sur le GEO. Métaphysiquement, ces articles seront cités par les LLM et amèneront ainsi des prospects.

1. ✅ "Qu'est-ce que le GEO (Generative Engine Optimization) ? Guide 2026"
2. ✅ "GEO vs SEO : la différence en 2026"
3. ✅ "AEO, GEO, AIO : comprendre les acronymes du référencement IA"
4. ✅ "Comment être cité par ChatGPT : les 10 règles"
5. ✅ "Comment être cité par Le Chat de Mistral : guide francophone exclusif"
6. ✅ "Comment être cité par Perplexity"
7. ✅ "Comment être cité par Claude (Anthropic)"
8. ✅ "Comment être cité par Gemini (Google)"
9. ✅ "Le futur du SEO en 2026 : devenir une source citable par l'IA"
10. ✅ "llms.txt : tout savoir sur le robots.txt des IA"

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
27. ✅ "Mamie GEO vs Profound : lequel choisir ?" (livré 2026-05-16, `src/content/blog/mamie-geo-vs-profound.mdx`)
28. "Test gratuit : votre marque est-elle citée par ChatGPT ?"
29. "Comment configurer un dashboard de visibilité IA"
30. "Notre roadmap GEO : ce qu'on construit cette année"

### Comparison pages industrialisées (V0+, ajouté 2026-05-17)

> Issu de la veille concurrence 2026-05-11 (cf. doc 02 § V0+). Peec a 3 comparatifs publics (« vs Profound », « vs Semrush », « vs Ahrefs Brand Radar ») — c'est un canal SEO + sales enablement éprouvé. On dispose déjà de l'article vs Profound, on industrialise.

Cibles V0+ (3 nouvelles pages, livraison 60 j post-lancement) :

| Slug                                  | Cible                                                                | Angle                                                              | Statut       |
| ------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------ |
| `/blog/mamie-geo-vs-peec-ai`          | Comparatifs SEO recherchés par early adopters EU                     | Moat FR, Le Chat en hero, pricing €, garantie 14 j refund vs trial | ✅ 2026-06-08 |
| `/blog/mamie-geo-vs-otterly`          | Otterly est distribué via Semrush App Center à $27/mo                | Suite locale FR vs add-on Semrush US                               | ✅ 2026-06-08 |
| `/blog/mamie-geo-vs-rankscale`        | Rankscale credit-based + partner directory                           | Flat-prompts simplicité vs credits, cible PME/freelance vs agence  | ✅ 2026-06-08 |

> 2026-06-08 — V0+ a opté pour le slug `/blog/...` plutôt que `/comparatifs/...` (cf. roadmap V1). Permet de réutiliser le pipeline blog content-driven existant (MDX, FAQPage JSON-LD, related articles, sitemap auto) sans monter une nouvelle route dédiée. La bascule vers une route landing comparatif `/comparatifs/[slug]` reste planifiée en V1 si la traction le justifie.

Cibles V1 :

- `/comparatifs/profound-vs-mamie-geo` (porter l'article blog actuel en landing comparatif dédiée si traction)
- `/comparatifs/goodie-vs-mamie-geo` (si Goodie progresse en FR)
- `/comparatifs/athena-hq-vs-mamie-geo` (à arbitrer selon traction)

---

## Lead magnets (outils gratuits)

### Lead magnet n°1 — « Test ma visibilité IA »

URL : `mamie-geo.fr/outils/test-visibilite-ia` (route `(marketing)` du mono-repo, cf. doc 03).

#### Comment ça marche (UX)

1. L'utilisateur entre son nom de marque + son domaine + 5 prompts custom (suggérés via Claude Haiku optionnel)
2. L'équipe ops génère l'audit manuellement sous 24 h ouvrées (rapport personnalisé email)
3. CTA : « Voulez-vous le faire sur les 5 LLMs et le suivre dans le temps ? » → souscription Mamie GEO (Solo 9,99 € dès l'entrée)

> Note 2026-05-14 : pas de trial automatique. Le CTA pointe vers la grille `/pricing` avec garantie remboursement 14 jours.

#### Coût unitaire

- Génération manuelle : ~10 min de travail humain (Max ou ops) + ~$0,20 LLM pour 5 prompts × 1 LLM
- Limite 1 par marque pour éviter abuse + qualité éditoriale

#### Conversion attendue

- 30-50 audits/mois en V0 (génération manuelle scalable jusqu'à 100)
- Conversion audit → souscription 10-20 %
- Cible : 5-10 clients payants/mois via ce canal

### Lead magnet n°2 — « Audit technique site » (sans LLM)

URL : `mamie-geo.fr/outils/audit-technique` — **livré 2026-05-16**, complète l'outil ci-dessus.

#### Comment ça marche (UX)

1. L'utilisateur entre une URL
2. L'outil fetche la page (cheerio) + appelle Google PageSpeed Insights API
3. 30+ checks codés humainement (SEO classique, GEO-specific FAQPage JSON-LD / llms.txt / E-E-A-T, Open Graph, a11y, sécurité, mobile, Core Web Vitals)
4. **Teaser public** : score global + 4 sub-scores + 3-5 issues prioritaires affichés en 10 s
5. **Email gate** pour le rapport complet (30+ checks + recommandations détaillées par issue, rédigées à la main, lien doc externe)
6. CTA produit en fin : « Tu veux qu'on tracke ta visibilité IA en continu ? » → `/pricing`

#### Différenciateur

- Sans LLM = 0 € de coût marginal par audit (vs ~$0,20 si on passait par Haiku)
- Knowledge base recommandations rédigée humainement = qualité supérieure à un outil SEO LLM-générique
- Checks GEO-specific (FAQPage, llms.txt, E-E-A-T) que personne d'autre ne fait
- 100 % gratuit en perpétuité (mode teaser), lead capture sur l'email rapport

> **Probablement notre lead magnet le plus scalable** car aucun coût marginal LLM. Multiplie sans contrainte de budget.

#### Renforcement V0+ — Section « Crawlabilité bots IA »

> Ajouté 2026-05-17 — issu veille concurrence 2026-05-11 (Peec a lancé son outil Crawlability le 2026-04-27 et en a fait un aimant SEO massif). Décision : on n'ouvre **pas** un slug séparé `/crawlability` (dilue l'autorité du slug `audit-technique` existant). On intègre une section dédiée au rapport audit actuel.

Nouvelle section du rapport (livraison V0+, cf. doc 03 § V0+) :

- Parse `/robots.txt` de l'URL cible
- Croise avec une table de bots IA connus maintenue dans `src/lib/audit/ai-bots.ts` : `GPTBot`, `ClaudeBot`, `Claude-Web`, `PerplexityBot`, `Google-Extended`, `Bytespider`, `CCBot`, `Amazonbot`, `meta-externalagent`, etc.
- Affiche une table « Bot → autorisé / bloqué / non spécifié » avec explication par bot
- Recommandation contextuelle : « Tu bloques GPTBot mais autorises Google-Extended — voici les conséquences sur ta visibilité ChatGPT »

Effet attendu : maintien du slug `audit-technique` en autorité SEO/GEO unique, +30-50 % de partage social attendu (sujet polarisant en débat dans la communauté SEO FR).

### Lead magnet n°2 — Newsletter Mamie GEO

#### Format

- 1 email/semaine
- 4 sections fixes :
  1. **Le chiffre de la semaine** (ex: "47% des Français utilisent maintenant ChatGPT au moins une fois par mois")
  2. **L'actu GEO** (1-3 points)
  3. **La tactique du jour** (1 conseil actionnable)
  4. **L'outil ou la lecture du jour**
- Toujours un seul CTA en fin

#### Croissance cible

- Mois 2 : 200 abonnés
- Mois 6 : 1 000 abonnés
- Mois 12 : 3 000 abonnés
- Conversion newsletter → trial : 2-5%

### Lead magnet n°3 — eBook "Le guide du GEO en France 2026"

- 30-50 pages PDF
- Fait à partir des 10 articles category-defining + études
- Téléchargeable contre email
- Distribué massivement sur LinkedIn

### Lead magnet n°4 — Template Notion "Audit GEO en 30 minutes"

- Checklist actionnable
- Template public Notion / Google Docs
- Promu sur LinkedIn + communautés

### Lead magnet n°5 — Quiz "Êtes-vous AI-ready ?"

- 15 questions
- Score sur 100 + recommandations personnalisées
- Email collecté pour envoyer le rapport
- Utile en virailisation LinkedIn

### Lead magnet n°6 — Rapport annuel « État du GEO francophone 2027 » (V1, ajouté 2026-05-17)

> Issu veille concurrence 2026-05-11 (AthenaHQ et Profound publient un *State of AI Search Report* annuel — lead magnet + autorité de catégorie + relais presse). Adapté à notre cible : version FR-first basée sur la data collectée en V0/V0+ par notre propre tracking.

- 30-50 pages PDF, design éditorial soigné
- Données exclusives : visibilité IA agrégée sur ~50-100 marques FR trackées (anonymisées) × 5 LLMs
- 5 sections : marché global FR / top sources citées par LLM / sentiment moyen par secteur / Le Chat vs concurrents anglo / prédictions 2027
- Distribution : LinkedIn massif, presse spécialisée (Le Siècle Digital, BDM, Frenchweb), relais agences partenaires
- Capture email avant téléchargement
- Publication début 2027 (12 mois post-lancement, après accumulation de data propre)
- Coût production : ~2-3 semaines Max + ~500-800 € design freelance

---

## SEO du site mamie-geo.fr

### Structure technique optimale GEO

Toutes les routes sont sur `mamie-geo.fr` (mono-repo Next.js, cf. doc 03) :

```
mamie-geo.fr
├── /                                         # marketing home
├── /pricing
├── /about
├── /comparatifs/
│   ├── /profound-vs-mamie-geo
│   ├── /peec-ai-vs-mamie-geo
│   └── /...
├── /outils/
│   └── /test-visibilite-ia                   # outil gratuit (lead magnet)
├── /blog/
│   ├── /qu-est-ce-que-le-geo
│   ├── /geo-vs-seo
│   ├── /etre-cite-par-chatgpt
│   ├── /etre-cite-par-le-chat-mistral
│   ├── /etre-cite-par-perplexity
│   ├── /etre-cite-par-claude
│   ├── /etre-cite-par-gemini
│   ├── /llms-txt
│   └── /schema-org-geo
├── /etudes/                                  # études exclusives
│   └── /visibilite-ia-50-marques-francaises-2026
├── /login
└── /app/...                                  # SaaS authentifié
```

### Schema.org à implémenter sur tout le site

- Article schema sur chaque article de blog
- FAQPage sur les pages "comment être cité par X"
- Organization sur la home
- Product sur la page pricing
- HowTo sur les guides étapes par étapes
- BreadcrumbList sur toutes les pages

### llms.txt à publier

Exemple à mettre sur https://mamie-geo.fr/llms.txt :

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

- Core Web Vitals tous verts
- Mobile-first design
- HTTPS partout
- Sitemap XML à jour
- Robots.txt incluant les bots IA spécifiques (GPTBot, Claude-Web, PerplexityBot, etc.)
- Internal linking dense entre articles category-defining
- Canonical bien gérée

---

## Stratégie LinkedIn (Max personnel)

### Positionnement

"Founder de Mamie GEO. J'apprends en public à construire le 1er outil GEO francophone. Threads et insights chaque jour."

### Cadence

- Post quotidien (5/7 minimum)
- Mix de formats :
  - 30% deep-dives techniques sur GEO
  - 25% storytelling founder (montée du SaaS, choix, doutes)
  - 20% data / insights ("Voilà ce que j'ai appris en analysant 1000 réponses ChatGPT")
  - 15% promotion subtile (lancement features, nouveaux articles)
  - 10% engagement (commentaires sur posts d'autres dans l'écosystème)

### Croissance cible

- Mois 1 : 1 500 abonnés (départ)
- Mois 6 : 5 000 abonnés
- Mois 12 : 12 000 abonnés

### Templates de posts

#### Post deep-dive technique

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

#### Post storytelling founder

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

> Issu veille concurrence 2026-05-11. Rankscale a un annuaire public listant Coalition, Dentsu, Publicis Sapient, WPP Media, Monks, etc. — c'est le canal accélérateur agence FR identifié comme **flywheel local que les concurrents anglo levés ne peuvent pas répliquer sans une force commerciale FR** (cf. doc 02 § V1).

### Vision

Activer le canal agence FR à pleine puissance via un programme partenaire avec deux jambes :

1. **Annuaire public** sur `mamie-geo.fr/partenaires/` — vitrine SEO + bouche-à-oreille agences
2. **Commission lifetime 20-25 %** sur l'abonnement de chaque client référé — incitation économique forte

### Critères de signature partenaire (V1)

- Agence FR ou francophone
- ≥ 3 clients sur plan Pro ou Agency référés / mois avant inscription publique annuaire (filtre qualité)
- Commission Stripe Affiliate trackée via UTM ou code promo unique partenaire
- Engagement éditorial : au moins 1 mention LinkedIn / mois en échange du badge « Partenaire certifié Mamie GEO »

### Structure de la page annuaire

```
mamie-geo.fr/partenaires/
├── Page index : grille des agences (logo + ville + spécialités + lien)
├── /partenaires/[slug]              # fiche détaillée par agence
└── /partenaires/devenir-partenaire  # CTA + formulaire signup
```

### Commission

- **20 %** lifetime sur l'abonnement Solo / Starter
- **25 %** lifetime sur l'abonnement Pro / Agency (incitation à upseller)
- Versement mensuel par virement après seuil 100 € atteint
- Tracking : `subscription_events.metadata.partner_code` + Stripe Affiliate App ou implémentation custom

### Critères de désinscription

- < 1 client référé actif sur 6 mois → retrait silencieux annuaire (pas de retrait commission existante)
- Atteinte à l'image (cas extrême) → retrait + désactivation commission selon CGV partenaire

### Effet flywheel attendu

| Mois | Partenaires actifs | Clients référés cumul | MRR partenaires |
| ---- | ------------------ | --------------------- | --------------- |
| M6   | 3                  | 10                    | 800-1 200 €     |
| M9   | 8                  | 35                    | 3 000-5 000 €   |
| M12  | 15                 | 80                    | 7 000-12 000 €  |

> À surveiller : la commission lifetime grève la marge unitaire sur le payback. C'est volontaire — le CAC est sub-zero (l'agence fait l'effort commercial), et la rétention est meilleure (le client a une raison externe de rester via son agence).

---

## Activation mamie-vege.fr (note)

mamie-vege.fr (le blog vegetarien) reste **secondaire** pour le projet GEO. Deux options :

### Option A — Le garder comme side-project

- Continue à fonctionner pour son audience
- Pas d'effort spécifique mais pas de pivot non plus
- Sert éventuellement de cas d'étude SEO/GEO ("voilà comment j'ai augmenté la visibilité IA d'un blog food de 0% à 35%")

### Option B — En faire un produit séparé

- Idée : SaaS pour blogs food français (schema recipe, calcul nutritionnel via CIQUAL déjà processée, génération substitutions IA)
- Cible : 5-15 K blogs food FR
- Hors scope du projet Mamie GEO mais possible en parallèle si bandwidth

> **Décision recommandée** : option A pendant 12 mois. On ne disperse pas l'énergie.

---

## Métriques d'activation à suivre

### Métriques mamie-seo (mensuel)

- Visiteurs uniques
- Pageviews
- Articles top 5 par traffic
- Top 5 sources
- Conversion vers /produit

### Métriques outils gratuits (hebdo)

- Audits gratuits réalisés / jour
- Conversion audit → trial Mamie GEO
- CAC implicite (coût LLM moyen × audits / signups)

### Métriques newsletter (mensuel)

- Abonnés
- Taux d'ouverture
- Taux de clic
- Conversion en trial

### Métriques programme partenaire (mensuel, V1)

- Nb d'agences signées (cumul + delta mois)
- Nb d'agences listées publiquement dans l'annuaire `/partenaires/`
- Clients référés actifs / partenaire (médiane + outliers)
- MRR généré via partenaires / MRR total (cible > 25 % à M12)
- CAC partenaire (commission lifetime cumulée / nb clients acquis via canal)
- Taux de rétention clients référés vs clients direct (cible : ≥ direct)

---

## Risques spécifiques activation

### Risque 1 — Cannibalisation du SEO existant

Si on bascule trop vite vers le GEO, on perd l'autorité historique sur les requêtes SEO classiques.
**Mitigation** : pivot graduel sur 6 mois, articles SEO maintenus, redirections soignées.

### Risque 2 — L'audience initiale n'est pas la cible Mamie GEO

Si l'audience mamie-seo est composée à 80% de débutants SEO sans budget, conversion zéro.
**Mitigation** : segmenter la newsletter, articles plus B2B, capturer prospect plus qualifiés via webinars.

### Risque 3 — Le contenu GEO devient daté vite

Le secteur évolue vite, des articles publiés en 2026 peuvent être obsolètes en 2027.
**Mitigation** : revue trimestrielle des articles, marqueur "mis à jour le X" pour l'autorité fraîcheur.

→ Voir [07-risques-mitigations.md](./07-risques-mitigations.md) pour la matrice complète.
