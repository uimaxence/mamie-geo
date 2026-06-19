# 01 — Marché et concurrence

## Sizing du marché

### Marché mondial GEO Services

| Année | Taille marché                    | Source                           |
| ----- | -------------------------------- | -------------------------------- |
| 2026  | 1,48 Md$                         | Intel Market Research, fév. 2026 |
| 2028  | 3,09 Md$ (projection CAGR 45,5%) | Idem                             |
| 2034  | 17,02 Md$                        | Idem                             |

CAGR 45,5% — hypercroissance comparable au SaaS 2010-2015.

### Estimation France (calcul interne)

France ≈ 4-5% du marché mondial logiciel B2B → 60-75 M€ en 2026. Marché sous-pénétré vs US (les SMB FR n'ont pas commencé) → réservoir de croissance > marché actuel. **Hypothèse de travail** : adressable FR 2026 ≈ 30-40 M€, doublement annuel 3-4 ans.

### TAM / SAM / SOM cibles

| Niveau                | Définition                                                                     | Volume FR            |
| --------------------- | ------------------------------------------------------------------------------ | -------------------- |
| **TAM**               | Toutes entreprises FR avec >1 employé marketing/communication                  | ~250 000 entreprises |
| **SAM**               | PME, agences, freelances avec budget marketing > 500€/mois                     | ~80 000              |
| **SOM** réaliste an 1 | SMB et agences early adopters touchables via SEO + LinkedIn + bouche-à-oreille | 100-300 clients      |
| **SOM** réaliste an 3 | Idem + grands comptes FR + expansion francophone                               | 1000-2000 clients    |

### Métriques clés du comportement utilisateur

- 44% des Français en âge de travailler utilisent ChatGPT, Mistral ou Gemini (francenum.gouv.fr, fév. 2026)
- 65% des recherches 2026 = zéro-clic, 83% quand l'IA fournit la réponse
- Trafic LLM convertit 23x plus que l'organique traditionnel
- Citation drift 40-60%/mois sur les domaines cités par les LLM majeurs
- 87% des enterprise marketing teams ont une initiative GEO en 2026 ; majorité des SMB n'ont pas commencé → fenêtre

---

## Cartographie de la concurrence

### Acteurs majeurs (international)

#### Profound — leader enterprise US

- NY, USA. VC-backed, croissance forte. Cible Fortune 1000 + agences enterprise
- Pricing : $99 (ChatGPT only) → $399 Growth → $499+ Enterprise
- Forces : 8+ LLMs, SOC 2 Type II, HIPAA, intégrations AWS/Cloudflare/Akamai, Prompt Volumes (400M+ conversations), MCP, Personas
- Faiblesses : cher, anglais-first, pas de Le Chat, pas de marque blanche en entry tier

#### Peec AI — challenger mid-market EU

- Berlin (début 2025). Cible SMB B2B + agences mid-market. **Concurrent direct le plus dangereux**
- Pricing : €89 Starter → Pro → €499 Enterprise
- Forces : UI clean, support Slack direct, croissance fulgurante (€650K ARR en 4 mois, levée $29M en 8 mois)
- Faiblesses : 3 LLMs par défaut (ChatGPT, Perplexity, Google AI), pas de SOC 2, pas de Le Chat, contenu/UI anglais

#### Goodie AI — premium positioning

- NY (2023). Dès $495/mois. GEO-first, vision intégrée monitoring + optimization + attribution + content intelligence. Pas de Le Chat, pas adapté SMB

#### AthenaHQ — enterprise analytics

- USA, pricing enterprise custom. Exec dashboards + competitive intelligence cross-modèles. Trop lourd SMB, prix opaque

### Acteurs entry-level

- **Otterly.ai** : $29 Lite / $189 Standard. GEO Audit apprécié, simple. Peu de LLMs (pas Claude/DeepSeek/Grok/Meta AI), pas d'API export
- **Rankscale.ai** : €20 entry → $780 Enterprise. Très bas prix, peu connu, écosystème limité
- **Promptmonitor** : $29/mois. 8+ engines en entry, mais monitoring brut sans content/optimization

### Acteurs SEO traditionnels avec module GEO

#### Semrush

- $139-499/mois, modules GEO inclus. Déjà installé chez la plupart des SEO FR. AI Content Generator + Content Audit GEO-friendly
- Faiblesses : ergonomie ajoutée, pas natif GEO, lourd pour solo. **Risque élevé qu'ils intensifient le module GEO en 2026-2027**

##### Snapshot AI SEO Overview (analyse 2026-05-13)

Page `semrush.com/ai-seo/overview/` au 2026-05-13 — référence pour le refresh home (cf. doc 09 § 2026-05-13).

**12 features nommées** (verbatim) :

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

**Vocabulaire métrique** : `AI Visibility Score`, `Share of Voice`, `Sentiment`, `Mentions` vs `Citations` (distinction explicite).

**Claims chiffrés marketing** (publics, réutilisables dans notre home — section « Pourquoi maintenant ? ») : ×6 trafic AI search (jan-mai 2025 vs 2024) · ×4,4 conversion AI search vs Google trad · 60% zero-click post AI Overviews · 700 M users hebdo ChatGPT · 44,3% des pages top 10 Google citées dans ≥ 1 réponse IA.

**Funnel** : 6 tiers (Free → $99 → $199 → $549 → Enterprise custom), CTAs Sign Up + demo, pas de lead magnet one-shot. **Tone** : impersonnel B2B EN, traductions FR machine probable.

**Positionnement différenciateur Mamie GEO** (en regard) :

| Axe                        | Semrush                             | Mamie GEO (différenciation)                                  |
| -------------------------- | ----------------------------------- | ------------------------------------------------------------ |
| Tonalité                   | Impersonnel B2B EN                  | **Tu/direct/honest** FR — Semrush ne peut pas pivoter dessus |
| Le Chat de Mistral         | Tracké (mention vague « 20+ LLMs ») | **Inclus dès Starter explicitement** — différenciateur n°1   |
| Hébergement                | US (HQ Boston)                      | **EU (Vercel Paris, Neon Frankfurt), RGPD natif**            |
| Pricing                    | 6 tiers + demo gate                 | **3 plans transparents + trial 14 j (carte requise)**        |
| Persona                    | Enterprise / mid-market             | **SMB FR (freelance, PME, agence) — 9,99-149 €/mois**        |
| Lead magnet                | Aucun                               | **`/outils/test-visibilite-ia`** (audit gratuit one-shot)    |
| Humanisation               | « Success stories » corporate       | **3 personas humains** (Sophie, Thomas, Aline)               |
| Honest competitor mentions | Compare sans agressivité            | **Section explicite « n'est PAS Profound »** dans la home    |

**Conclusion** : Semrush gagne sur catalogue (12 features) et scale (261M prompts) ; on gagne sur **focus FR + Le Chat + transparence + tone humain**.

#### Ahrefs

- ~€129+/mois. Brand Radar + AI citations dans les rapports, base SEO solide ; module GEO encore jeune

#### SE Ranking

- €129/mois, AI search add-on $89/mois. Tout-en-un, francophone disponible ; mid-tier généraliste, pas focus GEO
- **SE Visible** (standalone GEO, observé 2026-06) : $189/mois (450 prompts) → $355 → $519. Ne tracke que ChatGPT + Google AI Mode (Perplexity, Gemini, Claude « coming soon »), pas de Le Chat, anglais-first. Hors segment SMB FR

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

⚠️ **Mis à jour 2026-06-12** : le trou n'est plus vide. Des SaaS GEO francophones ont émergé entre mai et juin 2026 (cf. doc 09 § Snapshot Juin 2026) :

- **Qwairy** (qwairy.co) — 59 €/mois Starter → 199 € Pro. Présenté comme la suite GEO de référence FR dans plusieurs comparatifs. **Concurrent FR direct n°1.**
- **Botrank.ai** — 75 €/mois Starter (89 € mensuel) → Business (prix non public). Support FR, tracke 5 moteurs (ChatGPT, Perplexity, Gemini, **Mistral**, Google AI Overviews) **par scraping UI** mais **seulement 3 modèles au choix sur Starter**, **pas de Claude ni Grok**. Audit GEO technique (jugé léger), module sentiment avec verbatims, agent IA « Bob », essai 7 j. Avis Nicolas Pérot (alambic.org, 4/5, « outil FR préféré ») → cf. doc 09 § 2026-06-18 pour le plan de contre-positionnement.
- **Meteoria** — scraping UI (réponses fidèles à ce que voit l'utilisateur) plutôt qu'APIs natives.
- **Are You Mention** — tracking mentions LLM, gratuit pour l'instant.

**Le différenciateur n'est donc plus « seul outil GEO FR »** mais : entrée à **9,99 €** (vs 59 € Qwairy, 75 € Botrank, soit 6× moins cher), **API natives** (vs scraping UI fragile), Le Chat dès Starter, RGPD/EU natif, tone humain FR, marque blanche en cœur d'offre. La fenêtre se referme plus vite que les 12-18 mois estimés → distribution = urgence.

### Quasi-acteurs (à surveiller)

- **Agences SEO FR** vendant de l'audit GEO manuel : Eskimoz, Natural-Net, OnCrawl Consulting, Agence WAM, Resoneo → **prospects marque blanche, pas concurrents**
- **Outils internes de grosses agences** : possible, pas industrialisé ni vendu en SaaS
- **Initiatives universitaires / France Num** : sensibilisation, pas de produit
- **Mistral lui-même** : analytics marques dans Le Chat peu probable horizon 2 ans

### Ce qui pourrait apparaître

- Localisation FR sérieuse de Peec AI (probabilité haute, 6-12 mois)
- Module Semrush dédié FR (probabilité moyenne, 12-18 mois)
- Spinoff d'une grosse agence SEO FR (probabilité moyenne)

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
| Qwairy (FR)   | €59           | Plusieurs          | ?       | ✅        | ?                   | SMB / scale-ups FR               |
| Botrank (FR)  | €75           | 5 (scraping)       | ✅      | ✅        | ?                   | SMB FR                           |
| **Mamie GEO** | **€9,99-149** | **5 dont Le Chat** | **✅**  | **✅**    | **Cœur de produit** | **Freelance + SMB + agences FR** |

---

## Analyse de gaps — où on gagne et où on perd

### Gaps en notre faveur (avantage concurrentiel)

1. **Le Chat (Mistral) couverture native** — aucun concurrent ; canal de découverte B2B FR, comptes IT/banques/public sensibles à la souveraineté
2. **Vocabulaire et UI 100% français** — lexique SEO FR (référencement, balise titre, ancre…) mal traduit par les outils US
3. **Hébergement EU + RGPD natif** — fort sur tous les comptes FR B2B avec DPO
4. **Pricing entry agressif** (Solo 9,99 € / Starter 49 € vs €89 Peec, $99 Profound) — démocratise le GEO freelances/TPE
5. **Marque blanche en cœur d'offre** — Profound la met en premium tier, Peec partiellement ; on en fait notre spécialité
6. **Support client FR pendant heures FR** — banal mais discriminant
7. **Audience pré-existante mamie-seo.fr** — capital marketing à coût zéro
8. **Connaissance terrain FR** — pricing, cycles de décision, salons (SEO Camp, We Love SEO, Salon E-Marketing)

### Gaps contre nous (risques)

1. **Pas de SOC 2 / SSO entreprise** au début — RFP grands comptes perdus
2. **Pas de levée** = vitesse de feature catch-up limitée
3. **Pas de notoriété** vs Profound (classements G2)
4. **Couverture LLM moindre** (5 vs 8+) — partiellement compensé par Le Chat
5. **Pas de Prompt Volumes dataset** type Profound (400M+ conversations) — lourd à reproduire
6. **Marché FR plus petit** = course de vitesse vers le seuil de viabilité

---

## Tendances marché à surveiller

### Tendances qui nous favorisent

- AI Overviews Google déployés en France (annoncé 2026)
- Le Chat en expansion B2B (revenus 1 Md€ annoncés fin 2026 par Mensch à Davos)
- Loi EU souveraineté numérique pousse comptes publics / ETI vers solutions EU
- Saturation des outils SEO classiques → recherche d'alternatives spécialisées

### Tendances neutres ou ambiguës

- Consolidation (Ignite Visibility a acquis AI Hack en 2025) — opportunité de sortie ?
- Moteur d'exploration propre ChatGPT → indexation native, moins dépendant des liens
- Citation drift croissant → demande de monitoring continu

### Tendances contre nous

- Semrush, Ahrefs, SE Ranking accélèrent leurs modules GEO
- Peec AI lève fortement, localisation FR probable
- Convergence GEO + Content Generation (Scalenut, ContentMonk) — risque préférence combo
- Standardisation (llms.txt) → commoditisation partielle du monitoring

---

## Sources et veille

### Sources de veille à mettre en place

- Newsletters : Search Engine Land, Aleyda Solis, Lily Ray
- Communautés FR : SEO Camp, WebRankInfo, French Tech, Slack/Discord SEO FR
- Anglo : r/SEO, r/SaaS, Indie Hackers, X (fondateurs Profound, Peec, Otterly)
- Automatisé : ChangeTower ou Distill.io sur les pages pricing des 8 concurrents principaux
- Mistral / IA FR : annonces officielles Mistral, Le Chat, Hugging Face FR

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

- Alertes Google : "Profound AI", "Peec AI", "GEO Mistral"
- Snapshot prix concurrents mensuel → doc 09 (§ Snapshots veille concurrentielle)
- Veille Reddit r/SEO et r/SEMrush sur la perception des outils GEO

---

## Conclusion stratégique du chapitre

Marché en hypercroissance, concurrents internationaux structurellement mal placés sur le SMB francophone (trop chers, anglo-saxons, pas Mistral). **Mise à jour 2026-06 : le trou FR n'est plus vide** — Qwairy (59 €), Botrank (75 €), Meteoria et Are You Mention ont émergé. La fenêtre se referme plus vite que les 12-18 mois estimés. **L'enjeu n'est plus d'arriver le premier (raté de peu) mais d'être le moins cher (9,99 €), le plus EU/RGPD-natif et le plus humain — et surtout d'exécuter la distribution maintenant, avant que Qwairy ne consolide la catégorie FR.**

→ Voir [02-produit-roadmap.md](./02-produit-roadmap.md). Note : 3 articles comparatifs publiés sur le blog (vs Peec, vs Otterly, vs Rankscale — 2026-06-08, cf. doc 06 § Comparison pages).
