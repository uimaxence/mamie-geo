# 01 — Marché et concurrence

## Sizing du marché

### Marché mondial GEO Services

| Année | Taille marché                    | Source                           |
| ----- | -------------------------------- | -------------------------------- |
| 2026  | 1,48 Md$                         | Intel Market Research, fév. 2026 |
| 2028  | 3,09 Md$ (projection CAGR 45,5%) | Idem                             |
| 2034  | 17,02 Md$                        | Idem                             |

**CAGR 45,5%.** Hypercroissance comparable au SaaS de 2010-2015.

### Estimation France (calcul interne)

Méthode : France ≈ 4-5% du marché mondial logiciel B2B → 60-75 M€ en 2026, croissance similaire. Mais marché GEO en France est sous-pénétré vs US (les SMB françaises n'ont pas commencé), donc **réservoir de croissance > marché actuel**.

**Hypothèse de travail** : marché adressable français 2026 ≈ 30-40 M€ (acteurs early adopters), avec doublement annuel pour 3-4 ans.

### TAM / SAM / SOM cibles

| Niveau                | Définition                                                                     | Volume FR            |
| --------------------- | ------------------------------------------------------------------------------ | -------------------- |
| **TAM**               | Toutes entreprises FR avec >1 employé marketing/communication                  | ~250 000 entreprises |
| **SAM**               | PME, agences, freelances avec budget marketing > 500€/mois                     | ~80 000              |
| **SOM** réaliste an 1 | SMB et agences early adopters touchables via SEO + LinkedIn + bouche-à-oreille | 100-300 clients      |
| **SOM** réaliste an 3 | Idem + grands comptes FR + expansion francophone                               | 1000-2000 clients    |

### Métriques clés du comportement utilisateur

- 44% des Français en âge de travailler utilisent ChatGPT, Mistral ou Gemini (francenum.gouv.fr, fév. 2026)
- 65% des recherches en 2026 = zéro-clic, 83% quand l'IA fournit la réponse
- Le trafic provenant des LLM convertit 23x plus que le trafic de recherche organique traditionnel
- Citation drift de 40-60% par mois sur les domaines cités par les LLM majeurs
- 87% d'enterprise marketing teams ont une initiative GEO en 2026 ; majorité des SMB n'ont pas commencé → fenêtre

---

## Cartographie de la concurrence

### Acteurs majeurs (international)

#### Profound — leader enterprise US

- **Origine** : New York, USA
- **Pricing** : $99 (ChatGPT only) → $399 Growth → $499+ Enterprise
- **Forces** : 8+ LLMs trackés, SOC 2 Type II, HIPAA, intégrations AWS/Cloudflare/Akamai, Prompt Volumes (400M+ conversations dataset), MCP integration, Personas
- **Faiblesses** : prix élevé, anglais-first, pas de Le Chat, pas de marque blanche dans entry tier
- **Cible** : Fortune 1000, agences enterprise
- **Levée** : VC-backed, croissance forte

#### Peec AI — challenger mid-market EU

- **Origine** : Berlin, Allemagne (lancé début 2025)
- **Pricing** : €89 (Starter) → Pro → €499 Enterprise
- **Forces** : UI clean, support direct (Slack), pricing accessible, croissance fulgurante (€650K ARR en 4 mois), levée de $29M en 8 mois
- **Faiblesses** : couverture LLM limitée à 3 par défaut (ChatGPT, Perplexity, Google AI), pas de SOC 2, pas de Le Chat, contenu/UI principalement en anglais
- **Cible** : SMB B2B et agences mid-market
- **Le concurrent direct le plus dangereux pour nous**

#### Goodie AI — premium positioning

- **Origine** : NY, USA (2023)
- **Pricing** : à partir de $495/mois
- **Forces** : produit GEO-first dès le départ, vision intégrée monitoring + optimization + attribution + content intelligence
- **Faiblesses** : prix haut, pas de Le Chat, pas adapté SMB
- **Cible** : enterprises sérieuses

#### AthenaHQ — enterprise analytics

- **Origine** : USA
- **Pricing** : Enterprise (custom)
- **Forces** : exec-level dashboards, competitive intelligence cross-modèles
- **Faiblesses** : trop lourd pour SMB, prix opaque

### Acteurs entry-level

#### Otterly.ai

- **Pricing** : $29/mois Lite, $189 Standard
- **Forces** : pas cher, GEO Audit tool apprécié, simple
- **Faiblesses** : peu de LLMs (pas Claude, DeepSeek, Grok, Meta AI), pas d'API export, intégrations limitées

#### Rankscale.ai

- **Pricing** : €20/mois entry, jusqu'à $780 Enterprise
- **Forces** : pricing très bas
- **Faiblesses** : peu connu, écosystème limité

#### Promptmonitor

- **Pricing** : $29/mois
- **Forces** : couverture 8+ engines en entry tier
- **Faiblesses** : pas de content/optimization, monitoring brut

### Acteurs SEO traditionnels avec module GEO

#### Semrush

- **Pricing** : $139-499/mois, modules GEO inclus
- **Forces** : déjà installé chez la plupart des SEO français, AI Content Generator + Content Audit GEO-friendly
- **Faiblesses** : ergonomie ajoutée, pas natif GEO, lourd pour solo
- **Le risque qu'ils intensifient leur module GEO en 2026-2027 est élevé**

##### Snapshot AI SEO Overview (analyse 2026-05-13)

Analyse de la page produit `https://www.semrush.com/ai-seo/overview/` au 2026-05-13. Sert de référence pour le refresh home Mamie GEO (cf. doc 09 § 2026-05-13).

**12 features nommées exposées par Semrush** (verbatim) :

| Feature                            | Cœur de ce que ça fait                                    | LLMs trackés                              |
| ---------------------------------- | --------------------------------------------------------- | ----------------------------------------- |
| **Visibility Overview**            | Vue globale citations + mentions par plateforme IA        | ChatGPT, Gemini, Google AI Mode + AIO     |
| **Brand Performance**              | Share of Voice + sentiment, mise à jour hebdo             | ChatGPT, Perplexity, Gemini, AIO, AI Mode |
| **Competitor Research**            | Comparatif jusqu'à 4 concurrents en simultané             | Toutes les majeures                       |
| **Prompt Research**                | Base 261M+ prompts, recherche d'opportunités              | Toutes                                    |
| **Position Tracking**              | Rankings quotidien SEO + AI                               | ChatGPT, AI Mode, Google Search, AIO      |
| **Domain Overview**                | AI Visibility Score + métriques SEO classiques unifiées   | Général                                   |
| **Organic Rankings**               | Quels mots-clés SEO déclenchent les AI Overviews          | Google AIO uniquement                     |
| **AI Traffic Dashboard**           | Estimation trafic AI vs concurrents (clickstream-based)   | ChatGPT, Gemini                           |
| **My Reports**                     | Dashboards drag-and-drop AI + SEO                         | Sources intégrées                         |
| **AI-Readiness Site Audit**        | Détection des AI crawlers bloqués techniquement           | 7 crawlers IA listés                      |
| **Content Toolkit AI Search Opt.** | Analyse drafts contre facteurs de probabilité de citation | Toutes                                    |
| **Semrush Enterprise AIO**         | Plateforme custom multi-marché / multi-brand à scale      | Toutes + custom                           |

**Vocabulaire métrique Semrush** : `AI Visibility Score`, `Share of Voice`, `Sentiment` (positive/neutral/négatif), `Mentions` vs `Citations` (distinction explicite).

**Claims chiffrés marketing** (sources Semrush blog) :

- **×6** trafic AI search (jan-mai 2025 vs 2024)
- **×4,4** conversion AI search vs Google trad
- **60 %** zero-click (post AI Overviews)
- **700 M** utilisateurs hebdo ChatGPT
- **44,3 %** des pages top 10 Google citées dans au moins une réponse IA

**Funnel Semrush** : 6 tiers de pricing (Free → $99 → $199 → $549 → Enterprise custom), CTAs « Sign Up » + « Request live demo », **pas** de lead magnet one-shot, freemium gate côté SEO classique (Domain Overview, Site Audit).

**Tone Semrush** : impersonnel B2B (« Your brand can… »), pas de tutoiement, pas d'humour, data-driven. Anglais natif, traductions FR machine probable.

**Positionnement différenciateur Mamie GEO** (en regard) :

| Axe                        | Semrush                             | Mamie GEO (différenciation)                                  |
| -------------------------- | ----------------------------------- | ------------------------------------------------------------ |
| Tonalité                   | Impersonnel B2B EN                  | **Tu/direct/honest** FR — Semrush ne peut pas pivoter dessus |
| Le Chat de Mistral         | Tracké (mention vague « 20+ LLMs ») | **Inclus dès Starter explicitement** — différenciateur n°1   |
| Hébergement                | US (Semrush HQ Boston)              | **EU (Vercel Paris, Neon Frankfurt), RGPD natif**            |
| Pricing                    | 6 tiers + demo gate                 | **3 plans transparents + trial 7j sans CB**                  |
| Persona                    | Enterprise / mid-market             | **SMB FR (freelance, PME, agence) — pricing 49-399 €/mois**  |
| Lead magnet                | Aucun                               | **`/outils/test-visibilite-ia`** (audit gratuit one-shot)    |
| Humanisation               | « Success stories » corporate       | **3 personas humains** (Sophie, Thomas, Aline)               |
| Honest competitor mentions | Compare sans agressivité            | **Section explicite « n'est PAS Profound »** dans la home    |

**Conclusion stratégique** : Semrush a la profondeur de catalogue (12 features) et le scale (261M prompts), mais reste **anglo-saxon et impersonnel**. Mamie GEO ne peut pas concurrencer sur le catalogue — on doit gagner sur **focus FR + Le Chat + transparence + tone humain**. Les chiffres marketing (×6, ×4,4, 60 %) sont **publics et réutilisables** dans notre home — c'est ce qu'on fait dans la section « Pourquoi maintenant ? ».

#### Ahrefs

- **Pricing** : ~€129+/mois
- **Forces** : Brand Radar + AI citations dans les rapports, base SEO solide
- **Faiblesses** : module GEO encore jeune

#### SE Ranking

- **Pricing** : €129/mois, AI search add-on +$71
- **Forces** : tout-en-un, francophone disponible
- **Faiblesses** : mid-tier généraliste, pas focus GEO

### Niches verticales

- **Cairrot** ($99) : agences B2B, 5 LLMs incluant Claude et Gemini, free API
- **Surfer AI Tracker** : surcouche de Surfer SEO
- **Scalenut** : exécution-first (création contenu + GEO)
- **GetCito (AI Monitor)** : keyword-level AI Overview tracking, $299
- **Bluefish AI** : enterprise GEO
- **Evertune** : analyse à grande échelle (millions de prompts)
- **Gauge** : agences, $99-599
- **ContentMonk** : Google rank tracking + AI visibility
- **WorkDuo** : agencies / in-house

---

## Acteurs francophones (état 2026)

### Vrais concurrents directs en France

**Aucun.**

À ce jour, il n'existe pas d'outil SaaS francophone GEO-first conçu pour le marché FR. C'est le trou stratégique.

### Quasi-acteurs (à surveiller)

- **Agences SEO françaises** vendant du "audit GEO" en service manuel : Eskimoz, Natural-Net, OnCrawl Consulting, Agence WAM, Resoneo. **Ce sont des prospects pour le canal agence en marque blanche, pas des concurrents**.
- **Outils internes développés par grandes agences** : possible mais pas industrialisé, pas vendu en SaaS
- **Initiatives universitaires / France Num** : sensibilisation, pas de produit
- **Mistral lui-même** : pourrait ajouter des analytics pour les marques mentionnées dans Le Chat (peu probable horizon 2 ans)

### Ce qui pourrait apparaître

- Localisation française sérieuse de Peec AI (probabilité : haute, horizon 6-12 mois)
- Module Semrush dédié FR (probabilité : moyenne, horizon 12-18 mois)
- Spinoff d'une grosse agence SEO française (probabilité : moyenne)

---

## Matrice comparative compacte

| Outil         | Prix entrée   | LLMs trackés       | Le Chat | UI FR     | Marque blanche      | Cible                            |
| ------------- | ------------- | ------------------ | ------- | --------- | ------------------- | -------------------------------- |
| Profound      | $99-499       | 8+                 | ❌      | ❌        | Premium tier        | Enterprise                       |
| Peec AI       | €89           | 3-5                | ❌      | Partielle | Limitée             | Mid-market                       |
| Goodie AI     | $495          | 6                  | ❌      | ❌        | Premium             | Enterprise                       |
| Otterly       | $29           | 5                  | ❌      | ❌        | Standard tier       | TPE                              |
| Rankscale     | €20           | 4                  | ❌      | ❌        | Limitée             | Solo                             |
| Cairrot       | $99           | 5                  | ❌      | ❌        | Standard            | Agences B2B                      |
| Semrush AI    | inclus        | Plusieurs          | ❌      | ✅        | Non                 | SEO teams                        |
| **Mamie GEO** | **€9,99-149** | **5 dont Le Chat** | **✅**  | **✅**    | **Cœur de produit** | **Freelance + SMB + agences FR** |

---

## Analyse de gaps — où on gagne et où on perd

### Gaps en notre faveur (avantage concurrentiel)

1. **Le Chat (Mistral) couverture native** — aucun concurrent ne le fait, et Mistral devient un canal de découverte en B2B FR, surtout pour comptes IT/banques/secteur public sensibles à la souveraineté
2. **Vocabulaire et UI 100% français** — le SEO français a son propre lexique (référencement, balise titre, ancre, autorité de domaine) que les outils US traduisent mal
3. **Hébergement EU + RGPD natif** — différentiateur fort sur tous les comptes français B2B avec DPO
4. **Pricing entry agressif** (€49 vs €89 Peec, $99 Profound) — démocratise le GEO pour les freelances et TPE
5. **Marque blanche en cœur d'offre dès le tier Pro/Agence** — Profound la met en premium tier, Peec partiellement, on en fait notre spécialité
6. **Support client en français pendant heures FR** — banal mais discriminant
7. **Audience pré-existante via mamie-seo.fr** — capital marketing à zéro coût
8. **Connaissance terrain du marché FR** — pricing, cycles de décision, salons (SEO Camp, We Love SEO, Salon E-Marketing)

### Gaps contre nous (risques)

1. **Pas de SOC 2 / pas de SSO entreprise** au début — on perdra les RFP grands comptes
2. **Pas de levée de fonds** = vitesse de feature catch-up limitée
3. **Pas de notoriété établie** vs Profound (qui apparaît dans les classements G2)
4. **Couverture LLM moindre** que Profound (5 vs 8+) — partiellement compensé par Le Chat
5. **Pas de Prompt Volumes dataset** comme Profound (qui a 400M+ conversations indexées) — feature lourde à reproduire
6. **Marché FR plus petit** = course de vitesse pour atteindre seuil de viabilité

---

## Tendances marché à surveiller

### Tendances qui nous favorisent

- AI Overviews Google déployés en France (annoncé pour 2026)
- Mistral Le Chat continue son expansion B2B (annoncé revenus 1 Md€ pour fin 2026 par Mensch à Davos)
- Loi européenne sur la souveraineté numérique pousse les comptes publics et grandes ETI vers des solutions EU
- Saturation des outils SEO classiques (Semrush, Ahrefs) → recherche d'alternatives spécialisées

### Tendances neutres ou ambiguës

- Consolidation à venir (Ignite Visibility a acquis AI Hack en 2025) — opportunité de sortie ?
- ChatGPT introduit son propre moteur d'exploration → indexation native → moins dépendant des liens
- Citations drift croissant → demande de monitoring continu

### Tendances contre nous

- Semrush, Ahrefs, SE Ranking accélèrent leurs modules GEO
- Peec AI lève fortement et probablement va se localiser FR
- Convergence GEO + Content Generation (Scalenut, ContentMonk) — risque que les acheteurs préfèrent un combo
- Standardisation des protocoles (llms.txt) → certaines features de monitoring deviennent commoditisées

---

## Sources et veille

### Sources de veille à mettre en place

- **Newsletter** : Search Engine Land, Aleyda Solis, Lily Ray
- **Communautés FR** : SEO Camp, WebRankInfo, French Tech, Slack/Discord SEO français
- **Anglo** : r/SEO, r/SaaS, Indie Hackers, X (suivre fondateurs Profound, Peec, Otterly)
- **Veille concurrentielle automatisée** : ChangeTower ou Distill.io sur les pages pricing des 8 concurrents principaux
- **Mistral / IA française** : suivre les annonces officielles Mistral, Le Chat, Hugging Face FR

### Sources marché et études citées dans ce doc

- Intel Market Research — GEO Services Market Outlook 2026-2034 (fév. 2026)
- NoGood blog — Top GEO Tools 2026 (mars 2026)
- Cairrot — Peec AI Review (mai 2026)
- DiscoveredLabs — Profound vs Peec vs Otterly (déc. 2025)
- ContentMonk — Best Peec AI Alternatives (mai 2026)
- francenum.gouv.fr — guide GEO PME (fév. 2026)
- Natural-Net — Le Chat Mistral GEO guide (jan. 2026)
- Mistral AI — Le Chat product page (mai 2026)
- Enrich Labs — GEO Complete 2026 Guide (fév. 2026)

### Veille à automatiser dès le mois 1

- Alerte Google "Profound AI", "Peec AI", "GEO Mistral"
- Suivi des prix concurrents tous les mois (snapshot dans 09-decisions-journal.md)
- Veille Reddit r/SEO et r/SEMrush sur la perception des outils GEO

---

## Conclusion stratégique du chapitre

Le marché existe, est en hypercroissance, et a un trou français évident. Les concurrents internationaux sont structurellement mal placés pour servir le segment SMB francophone : trop chers, trop anglo-saxons, et pas équipés pour Mistral.

La fenêtre est de 12-18 mois avant que Peec ou Semrush ne ferment ce gap. **L'enjeu n'est pas de faire mieux que Profound — c'est d'arriver vite, bien, et de capturer le marché francophone avant que les anglo-saxons localisent**.

→ Voir [02-produit-roadmap.md](./02-produit-roadmap.md) pour la traduction en spec produit.
