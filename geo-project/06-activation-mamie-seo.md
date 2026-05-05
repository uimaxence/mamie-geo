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
27. "Mamie GEO vs Profound vs Peec AI : lequel choisir ?"
28. "Test gratuit : votre marque est-elle citée par ChatGPT ?"
29. "Comment configurer un dashboard de visibilité IA"
30. "Notre roadmap GEO : ce qu'on construit cette année"

---

## Lead magnets (outils gratuits)

### Lead magnet n°1 — "Test ma visibilité IA"
URL : audit-geo.fr ou intégré sur mamie-seo.fr/test-ia

#### Comment ça marche (UX)
1. L'utilisateur entre son nom de marque + son domaine
2. Il choisit 5 prompts (suggérés ou custom)
3. L'outil lance un appel ChatGPT (1 LLM seulement, sinon trop coûteux pour gratuit)
4. Résultat affiché en 60 secondes : score sur 5, position, concurrents
5. CTA : "Voulez-vous le faire sur les 5 LLMs et le suivre dans le temps ?" → trial Mamie GEO

#### Coût unitaire
- 5 prompts × 1 LLM × ~$0.003 = **$0.015 par audit gratuit**
- Cap à 100 audits gratuits/jour pour budget contrôlé
- Limite 1 par email pour éviter abuse

#### Conversion attendue
- 100 audits/jour × 30 = 3000 audits/mois
- Conversion en trial 5-10% = 150-300 trials/mois
- Conversion trial → payant 15-25% = 22-75 clients/mois

> Cet outil est probablement le levier d'acquisition le plus puissant à activer.

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
