# Mamie GEO — Documentation maîtresse

> **SaaS de Generative Engine Optimization pour le marché francophone.**
> Mesurer et optimiser la visibilité d'une marque dans les réponses des LLM (ChatGPT, Claude, Perplexity, Gemini, Mistral Le Chat).

---

## Statut du projet

| Champ | Valeur |
|---|---|
| Phase actuelle | Pré-décision (analyse) |
| Date de création | Mai 2026 |
| Décision GO / NO-GO prévue | Fin mai 2026 |
| Lancement V0 (si GO) | Juin 2026 |
| Cible MRR mois 6 | 8 000 € |
| Cible MRR mois 12 | 25 000 € |

---

## Index des documents

| # | Document | Contenu |
|---|---|---|
| 00 | [Vision et stratégie](./00-vision-strategie.md) | Thèse, positionnement, manifesto, ce qu'on n'est PAS |
| 01 | [Marché et concurrence](./01-marche-concurrence.md) | TAM/SAM/SOM, concurrents détaillés, gap analysis, timing |
| 02 | [Produit et roadmap](./02-produit-roadmap.md) | Spec V0/V1/V2, user stories, métriques produit |
| 03 | [Architecture technique](./03-architecture-technique.md) | Stack, BDD, APIs LLM, coûts variables, sécurité |
| 04 | [Pricing et business model](./04-pricing-business-model.md) | Tiers, unit economics, projections financières |
| 05 | [Go-to-market](./05-go-to-market.md) | Plan 90 jours, canaux, content, templates outreach |
| 06 | [Activation mamie-seo.fr](./06-activation-mamie-seo.md) | Pivot du site existant, lead magnets, contenu |
| 07 | [Risques et mitigations](./07-risques-mitigations.md) | Risques marché, techniques, perso ; contingences |
| 08 | [Roadmap d'exécution](./08-roadmap-execution.md) | Timeline mois par mois, sprints, KPIs, gates |
| 09 | [Décisions et journal](./09-decisions-journal.md) | Log des décisions importantes (à tenir à jour) |
| 10 | [Direction artistique et design](./10-design-direction.md) | Direction visuelle, anti-IA look, patterns obligatoires |

---

## Résumé exécutif (1 page)

### Le pari

Le marché GEO mondial passe de **1,48 Md$ en 2026 à 17 Md$ en 2034** (CAGR 45,5%). Tous les acteurs établis (Profound, Peec AI, Goodie, AthenaHQ) sont anglo-saxons, anglais-first, et ne tracent pas Mistral Le Chat. **Aucun outil n'est conçu pour le marché francophone**, alors que 44% des Français en âge de travailler utilisent déjà ChatGPT, Mistral ou Gemini.

### La proposition de valeur

> "Le premier outil de tracking et d'optimisation de visibilité IA conçu pour les marques francophones — couverture native de Le Chat (Mistral) + ChatGPT, Claude, Perplexity, Gemini. Hébergement EU, RGPD natif, pricing accessible aux PME et freelances."

### Le positionnement compétitif

| | Profound (US) | Peec AI (DE) | **Mamie GEO** |
|---|---|---|---|
| Cible | Enterprise | Mid-market EU | **Freelance + PME + agences FR** |
| Prix entrée | $99-499 | €89 | **€49** |
| Couverture LLM | 8 | 4-5 | **5 dont Le Chat** |
| UI / Support | EN | EN/multilingue | **FR-first** |
| Hébergement | US | DE | **France** |
| Marque blanche agence | Premium | Limité | **Cœur d'offre** |

### La stratégie

1. **Activer mamie-seo.fr** comme canal d'acquisition organique + média
2. Lancer un **module Tracker** seul en V0 (8 semaines de dev)
3. Pricing agressif : 49 € / 149 € / 399 € (Starter / Pro / Agence)
4. Acquisition par contenu + outil gratuit viral + canal agence en marque blanche
5. Décision GO-fullstop à 6 mois sur 3 critères (voir doc 08)

### Le risque principal

Fenêtre temporelle courte (12-18 mois) avant que Semrush/Ahrefs/Peec ne sortent leurs versions FR sérieuses. Vitesse d'exécution = avantage critique.

### La règle du go solo

- 50% du temps freelance les 3 premiers mois pour sécuriser les revenus
- 70% sur le SaaS à partir du mois 4 si MRR > 3K€
- 100% à partir du mois 6 si MRR > 8K€
- Sinon, pivot ou arrêt propre

---

## Glossaire rapide

| Terme | Définition |
|---|---|
| **GEO** | Generative Engine Optimization — optimiser le contenu pour être cité par les LLM |
| **AEO** | Answer Engine Optimization — synonyme largement utilisé de GEO |
| **LLM** | Large Language Model — ChatGPT, Claude, Mistral, etc. |
| **Citation** | Mention d'une marque ou source dans la réponse d'un LLM |
| **Citation drift** | Variabilité des sources citées par un LLM dans le temps (40-60%/mois) |
| **Prompt-monitoring** | Lancer périodiquement les mêmes prompts pour mesurer l'évolution des citations |
| **Share of voice IA** | Part des réponses IA qui mentionnent ta marque vs concurrents |
| **MRR** | Monthly Recurring Revenue |
| **ARR** | Annual Recurring Revenue (MRR × 12) |
| **CAC** | Customer Acquisition Cost |
| **LTV** | Lifetime Value |

---

## Comment utiliser cette documentation

1. **Lecture première fois** : 00 → 01 → 02 → 04 → 08 (vision → marché → produit → finance → exécution)
2. **Onboarding d'un futur collaborateur** : commencer par ce README puis suivre l'index
3. **Avant chaque sprint** : relire 02 et 08
4. **Mensuellement** : mettre à jour 09 (journal de décisions) et les KPIs dans 08
5. **Trimestriellement** : challenger 00 et 07 (vision + risques)

La documentation est **vivante**. Tout pivot ou décision majeure → entrée dans 09.
