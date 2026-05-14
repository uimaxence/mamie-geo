# 02 — Produit et roadmap

## Principes produit

1. **Time-to-value < 5 minutes** — un nouvel utilisateur doit voir un score de visibilité IA dans les 5 minutes après inscription
2. **Mobile-first dashboards** — les marketeurs FR consultent souvent sur mobile
3. **Pas de feature avant que le besoin soit prouvé** — pas de over-engineering V0
4. **Intégrations > nouvelles features** — connecter à GA4, Search Console, Stripe, HubSpot vaut mieux que 5 nouvelles features
5. **Onboarding scripté** — un wizard en 3 étapes (domaine → prompts auto-suggérés → premier rapport gratuit)

---

## V0 — MVP (semaines 1-8)

### Périmètre

Module **Tracker** uniquement. Rien d'autre. Pas d'optimization, pas de content, pas de marque blanche.

### Stories utilisateur core

#### En tant que freelance SEO, je veux…

- **S1** — Créer un compte et ajouter mon domaine en moins de 2 minutes
- **S2** — Voir 10 prompts auto-suggérés à partir de mon domaine et de ma description (générés par LLM)
- **S3** — Lancer le tracking sur ces prompts pour ChatGPT, Claude, Perplexity, Gemini et Le Chat
- **S4** — Recevoir un premier rapport partiel dans les 10 minutes après onboarding
- **S5** — Voir un score de visibilité global et par moteur, sur un dashboard simple
- **S6** — Voir, pour chaque prompt, si ma marque a été citée, dans quel ordre, et quels concurrents l'ont été
- **S7** — Recevoir un email hebdo avec l'évolution de mon score
- **S8** — Exporter mes données en CSV

#### En tant que client, je veux…

- **S9** — Mettre à niveau ou descendre de plan en libre-service
- **S10** — Annuler mon abonnement sans avoir à parler à quelqu'un (mais avec une dernière chance d'expliquer pourquoi)

### Fonctionnalités V0

| Feature                                                         | Priorité | Notes                                           |
| --------------------------------------------------------------- | -------- | ----------------------------------------------- |
| Inscription / login (email + magic link)                        | P0       | Better Auth (cf. doc 03)                        |
| Onboarding wizard (domaine → infos marque → prompts suggérés)   | P0       | Génération prompts via Claude API               |
| Configuration des marques et concurrents                        | P0       | Max 5 concurrents trackés en V0                 |
| Lancement / pause du tracking                                   | P0       |                                                 |
| Exécution périodique des prompts (1×/jour ou 1×/sem selon plan) | P0       | Postgres-based queue + Vercel Cron (cf. doc 03) |
| Stockage des réponses LLM brutes                                | P0       | Pour traçabilité + audit                        |
| Détection de mention de marque + concurrents                    | P0       | Regex + LLM scoring (Claude Haiku)              |
| Détection des sources citées (URLs)                             | P0       | Parser des réponses                             |
| Score de visibilité global + par LLM + par prompt               | P0       | Pourcentage de citation pondéré                 |
| Dashboard principal                                             | P0       | Cards + graphes recharts                        |
| Vue détaillée par prompt (réponses brutes consultables)         | P0       |                                                 |
| Vue concurrents (qui est cité, à quelle fréquence)              | P0       |                                                 |
| Évolution dans le temps (graph 30 jours)                        | P0       |                                                 |
| Email hebdo automatique                                         | P0       | Brevo                                           |
| Export CSV                                                      | P0       |                                                 |
| Page facturation Stripe Customer Portal                         | P0       |                                                 |
| Plans Starter / Pro avec limitations volumes                    | P0       | Pas Agence en V0                                |

### Hors périmètre V0 (explicite)

- ❌ Recommandations d'optimisation
- ❌ Audit du site (llms.txt, schema.org, etc.)
- ❌ Marque blanche / multi-workspaces
- ❌ API publique
- ❌ Intégrations GA4, Search Console
- ❌ SSO
- ❌ Mobile app (responsive web suffit)
- ❌ Notifications Slack
- ❌ Comparaison historique > 90 jours

### Critères de qualité V0

- 99% uptime sur le tracking (manquer 1 jour de tracking ruine la confiance)
- Latence dashboard < 2s
- Mails hebdomadaires sans bug pendant 4 semaines consécutives
- Onboarding réalisable en moins de 5 minutes en moyenne
- Aucune perte de données (backup quotidien)

### Métriques de succès V0

- 50 inscriptions en 30 jours après lancement
- 20% de conversion freemium → payant (10 clients payants)
- NPS > 30 après 60 jours
- Churn mensuel < 10%
- 1 retour produit par semaine analysé et logué

---

## Glossaire vocabulaire (officiel, V0)

> Mise à jour 2026-05-13 — refresh home inspiré Semrush AI SEO (cf. doc 09 § 2026-05-13).
> Ces 3 termes doivent être employés tels quels dans le produit (UI, emails, exports CSV), le marketing (home, pricing, blog) et la doc commerciale. **Ne pas mixer** avec des variations anglaises (« share of voice », « visibility score »).

### Score de visibilité IA

- **Définition** : note 0–100 par LLM, par marque, par jour. Vue globale d'à quel point ta marque est citée et bien positionnée dans les réponses générées.
- **Formule V0** (cf. `src/lib/metrics/visibility.ts`) : `positionWeight × sentimentWeight × 100`, agrégée sur tous les runs success du jour (brand, llm, date).
  - `positionWeight` : first_paragraph = 1.0 / middle = 0.5 / end = 0.25 / absent = 0
  - `sentimentWeight` : positive = 1.0 / neutral = 0.5 / negative = 0 / absent = 0
- **Intervalle** : `[0, 100]`, 1 décimale affichée.
- **Quand utiliser** : suivre la performance d'une marque dans un LLM donné dans le temps (dashboard sparkline, recap hebdo, KPI).

### Part de voix

- **Définition** : pourcentage de citations qui vont à ta marque vs. tes concurrents sur un prompt donné (ou une catégorie de prompts).
- **Formule V0** : `citations_ta_marque / (citations_ta_marque + Σ citations_concurrents) × 100`. Calculée sur tous les runs success de la fenêtre (jour / 7 j / 30 j).
- **Intervalle** : `[0, 100]` %.
- **Quand utiliser** : comparatif concurrentiel sur un prompt précis ou un cluster de prompts (vertical, intent). Pas pour suivre l'évolution d'une marque seule — utiliser Score de visibilité IA pour ça.

### Sentiment

- **Définition** : qualitatif sur **comment** ta marque est citée, pas combien de fois.
- **Valeurs (enum)** : `positive` (flatteur, recommandation explicite) / `neutral` (mentionnée sans qualification) / `negative` (critique, comparée défavorablement) / `absent` (pas citée).
- **Calcul** : produit par Claude Haiku 4.5 en mode `tool_use` forcé (cf. `src/lib/citation/score.ts`), schéma `report_scoring`.
- **Quand utiliser** : alerter sur un sentiment qui se dégrade, prioriser les prompts à fort impact négatif, segmenter le Score (un score 70 avec sentiment majoritairement négatif est pire qu'un 60 positif).

### Termes à NE PAS utiliser (équivalents anglais)

- ❌ « AI Visibility Score » → ✅ **Score de visibilité IA**
- ❌ « Share of Voice » / « SOV » → ✅ **Part de voix**
- ❌ « Brand Sentiment » → ✅ **Sentiment** (suffisamment précis en contexte)
- ❌ « Mentions » seul (ambigu) → ✅ **Citations** (notre vocabulaire standard)

---

## V1 — Module Audit (mois 3-6)

### Vision

Une fois que le Tracker tourne et que les clients comprennent leur position, ils demandent **"comment je m'améliore ?"**. C'est le rôle de l'Audit.

### Stories ajoutées

- **S11** — Recevoir une analyse technique de mon site pour mesurer son "AI-readiness"
- **S12** — Voir les améliorations prioritaires (top 10) pour devenir plus citable
- **S13** — Suivre la progression de mon score AI-readiness dans le temps
- **S14** — Comparer mon AI-readiness vs concurrents

### Features V1

| Feature                          | Description                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **AI-readiness scan**            | Crawl du site, analyse de la structure (H1-H6), schema.org, FAQ pages, llms.txt, robots.txt pour AI crawlers |
| **Score AI-readiness**           | 0-100 sur 5 axes : Structure, Données structurées, Crawlabilité IA, Q&A density, Autorité externe            |
| **Recommandations actionnables** | Liste priorisée de 10-30 actions concrètes (ex: "ajouter une FAQPage schema sur /pricing")                   |
| **Audit concurrents**            | Même scan sur les 3-5 concurrents trackés, comparaison côte à côte                                           |
| **Suivi des recommandations**    | Checklist persistante : ce qui a été fait, ce qui reste                                                      |
| **Recrawl hebdomadaire**         | Re-mesure automatique du score                                                                               |

### Stack additionnelle V1

- Crawler léger (Playwright headless)
- Parser HTML pour extraction schema (cheerio)
- LLM scoring pour évaluer la "citabilité" du contenu (Claude Haiku par appel)

---

## V2 — Marque blanche agence + intégrations (mois 6-12)

### Vision

Activer le canal agence à pleine puissance avec un module pensé pour eux.

### Stories ajoutées

- **S15** — En tant qu'agence, configurer un workspace par client avec leur logo et couleurs
- **S16** — Inviter mon client à voir un dashboard limité avec MA marque (pas la vôtre)
- **S17** — Exporter un rapport PDF mensuel personnalisé à envoyer au client
- **S18** — Centraliser ma facturation pour tous mes clients sur une seule facture
- **S19** — Avoir une vue agence avec mes 10 clients dans un tableau de bord unique

### Features V2

| Feature                        | Description                                                           |
| ------------------------------ | --------------------------------------------------------------------- |
| **Multi-workspaces**           | Un par client agence, isolés                                          |
| **Marque blanche**             | Logo client, couleurs, sous-domaine personnalisable (geo.agence-x.fr) |
| **Rapports PDF auto**          | Génération mensuelle automatique avec contenu personnalisable         |
| **Dashboard agence (méta)**    | Vue agrégée des clients, alertes, score moyen                         |
| **Facturation centralisée**    | Une seule facture pour l'agence, pas par client                       |
| **Permissions granulaires**    | Lecture seule pour clients, admin pour l'agence                       |
| **Intégration GA4**            | Corrélation traffic IA + visibilité (V2.5)                            |
| **Intégration Search Console** | Idem (V2.5)                                                           |
| **Webhooks / API**             | Pour intégrations custom (V2.5)                                       |

---

## V3 et au-delà — Idées pour 12-24 mois

À ne PAS développer avant validation PMF, mais à logger pour ne pas oublier :

- **Prompt Library FR** — bibliothèque de 1000+ prompts types par secteur (e-commerce, SaaS B2B, professions libérales, etc.) que les utilisateurs peuvent importer en un clic
- **Sentiment analysis** — pas seulement "cité" mais "cité positivement / négativement"
- **AI Traffic Attribution** — corréler citation IA et trafic effectif (via UTM custom + GA4)
- **AI SERP simulator** — donner à l'utilisateur la possibilité de tester un prompt one-shot sans abonnement
- **Mobile app** — pour managers qui veulent un score quotidien
- **Fine-tuning détection** — détecter si une marque entre dans les datasets d'entraînement ouverts (Common Crawl etc.)
- **Reverse-prompting** — proposer "voici 10 questions que tes clients pourraient poser à ChatGPT, et voilà comment tu apparais"
- **Public benchmark anonyme** — montrer la moyenne de visibilité dans son secteur

---

## Personas détaillés

### Persona 1 — Sophie, freelance SEO indépendante

- 32 ans, vit à Lyon
- Travaille seule, 8-15 clients PME
- 60-90 K€ CA/an
- Utilise Semrush ou Ahrefs (60-100€/mois)
- A entendu parler du GEO sur LinkedIn et au SEO Camp 2025
- Pain : ses clients commencent à demander "et pour ChatGPT, on fait quoi ?"
- Veut pouvoir répondre avec des données et facturer un audit GEO
- Plan visé : Pro à 149€/mois (puis upsell agence si elle grandit)

### Persona 2 — Thomas, head of marketing PME industrielle

- 38 ans, basé en Vendée
- Marque B2B avec ~30 employés, CA ~5 M€
- Budget marketing 80-150 K€/an
- A déjà investi en SEO (40 K€) avec une agence externe
- Pain : pas mesurable si ses investissements en contenu se traduisent en visibilité IA, et sa direction lui demande
- Plan visé : Pro à 149€/mois

### Persona 3 — Aline, dirigeante agence SEO indépendante

- 41 ans, agence à Nantes, 5 personnes
- 30-50 clients en portefeuille
- CA 600 K€-1 M€
- Utilise Semrush + outils internes
- Pain : différenciation face à concurrents agence, veut ajouter un service GEO mais pas internaliser le dev
- Plan visé : Agence à 399€/mois → revend chaque audit GEO à ses clients 100-200€/mois ou 500€ one-shot

### Persona 4 — Marc, CMO grande ETI souveraineté

- 48 ans, ETI 800 personnes secteur défense ou banque
- Budget marketing > 1 M€/an
- A des contraintes RGPD/souveraineté fortes
- Pain : ne peut pas utiliser Profound (US, données chez AWS US)
- Plan visé : Enterprise sur devis (1500-3000€/mois)

---

## Métriques produit à tracker

### Métriques d'acquisition

- Visiteurs unique mamie-seo.fr / mois
- Conversion landing → signup
- Conversion signup → onboarding complet
- Conversion freemium → payant

### Métriques d'usage

- DAU / MAU ratio
- Nombre de prompts trackés par utilisateur
- Fréquence de connexion au dashboard
- Taux d'ouverture email hebdo

### Métriques de rétention

- Churn mensuel par tier
- NRR (Net Revenue Retention)
- Temps moyen entre signup et premier upgrade

### Métriques business

- MRR
- ARPU par tier
- CAC blended et par canal
- LTV / CAC ratio (cible > 3)
- Gross margin (cible > 70% après coûts LLM)

### Métriques produit qualitatives

- NPS trimestriel
- Top 3 demandes feature dans le mois (revue manuelle)
- Top 3 raisons de churn (exit survey obligatoire)

---

## Wireframes textuels (V0)

### Page d'accueil dashboard

```
┌───────────────────────────────────────────────────────────────┐
│  Mamie GEO        [marque1 ▼]    [Notifications]    [Profil]  │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  Score de visibilité IA                                        │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │   42 / 100        ▲ +5 vs semaine dernière              │  │
│  │   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  Score par moteur                                              │
│  ChatGPT    ████████░░  58%      Le Chat   ███░░░░░░░  28%    │
│  Perplexity ███████░░░  44%      Gemini    █████░░░░░  35%    │
│  Claude     ██████░░░░  41%                                    │
│                                                                │
│  ────────────────────────────────────────────────────────────  │
│                                                                │
│  Top concurrents cités                                         │
│  1. concurrent-a.fr   84%  (vs vous : 42%)                     │
│  2. concurrent-b.com  61%  (vs vous : 42%)                     │
│  3. concurrent-c.fr   38%  (vs vous : 42%)  ▲ Vous dépassez    │
│                                                                │
│  ────────────────────────────────────────────────────────────  │
│                                                                │
│  Évolution 30 jours [graph linéaire]                           │
│                                                                │
│  ────────────────────────────────────────────────────────────  │
│                                                                │
│  Vos prompts trackés (25/100)        [+ Ajouter un prompt]    │
│  • "meilleur logiciel CRM PME France"     58%  ▲              │
│  • "agence SEO Lyon"                      12%  ▼              │
│  • "comment optimiser pour ChatGPT"       72%  ▲              │
│  ...                                                           │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

### Vue détaillée d'un prompt

```
┌───────────────────────────────────────────────────────────────┐
│  ← Retour                                                      │
│                                                                │
│  Prompt : "meilleur logiciel CRM PME France"                  │
│  Trackée depuis 7 jours · Mise à jour : il y a 6h             │
│                                                                │
│  Score de visibilité : 58%                                     │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ ChatGPT    ✓ Cité (position 2/5)                         │ │
│  │ Claude     ✓ Cité (position 3/4)                         │ │
│  │ Perplexity ✗ Non cité                                    │ │
│  │ Gemini     ✓ Cité (position 1/3)                         │ │
│  │ Le Chat    ✗ Non cité                                    │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Concurrents cités sur ce prompt                              │
│  • concurrent-a.fr (5/5 moteurs)                              │
│  • concurrent-b.com (4/5 moteurs)                             │
│                                                                │
│  Réponses brutes [Voir ChatGPT] [Voir Claude] [Voir Gemini]   │
│                                                                │
│  ────────────────────────────────────────────────────────────  │
│  Pourquoi je ne suis pas cité dans Perplexity et Le Chat ?    │
│  → Voir les recommandations [V1]                              │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

---

## Backlog initial — Sprint 0 (avant le code)

À faire la 1ère semaine, avant tout dev :

1. ✅ Valider la stack (voir 03-architecture-technique.md)
2. ✅ Acheter le domaine (mamie-geo.fr ou alternative)
3. ✅ Créer le repo Git + setup Next.js + Tailwind
4. ✅ Setup Postgres (Neon)
5. ✅ Comptes API : OpenAI, Anthropic, Mistral, Perplexity, Google AI
6. ✅ Compte Stripe (mode test)
7. ✅ Compte Brevo (déjà existant ?)
8. ✅ Wireframes Figma (1 jour max — pas de bikeshedding design)
9. ✅ Schéma BDD validé (voir 03)
10. ✅ Liste des 100 prompts de test pour valider la qualité du parsing

→ Voir [08-roadmap-execution.md](./08-roadmap-execution.md) pour la timeline détaillée.
