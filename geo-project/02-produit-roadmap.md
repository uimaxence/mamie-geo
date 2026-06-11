# 02 — Produit et roadmap

## Principes produit

1. **Time-to-value < 5 minutes** — un nouvel utilisateur doit voir un score de visibilité IA dans les 5 minutes après inscription
2. **Mobile-first dashboards** — les marketeurs FR consultent souvent sur mobile
3. **Pas de feature avant que le besoin soit prouvé** — pas de over-engineering V0
4. **Intégrations > nouvelles features** — connecter à GA4, Search Console, Stripe, HubSpot vaut mieux que 5 nouvelles features
5. **Onboarding scripté** — wizard 3 étapes (domaine → prompts auto-suggérés → premier rapport gratuit)

---

## V0 — MVP (semaines 1-8)

> **Statut 2026-06 : V0 intégralement livré** (Phases A/B/C, cf. doc 09 et CLAUDE.md § État du projet).

### Périmètre

Module **Tracker** uniquement. Pas d'optimization, pas de content, pas de marque blanche.

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

Toutes P0, toutes livrées :

| Feature | Notes |
|---|---|
| Inscription / login (email + magic link) | Better Auth (cf. doc 03) |
| Onboarding wizard (domaine → infos marque → prompts suggérés) | Génération prompts via Claude API |
| Configuration des marques et concurrents | Max 5 concurrents trackés en V0 |
| Lancement / pause du tracking | |
| Exécution périodique des prompts (1×/jour ou 1×/sem selon plan) | Postgres-based queue + Vercel Cron (cf. doc 03) |
| Stockage des réponses LLM brutes | Traçabilité + audit |
| Détection de mention de marque + concurrents | Regex + LLM scoring (Claude Haiku) |
| Détection des sources citées (URLs) | Parser des réponses |
| Score de visibilité global + par LLM + par prompt | Pourcentage de citation pondéré |
| Dashboard principal | Cards + graphes recharts |
| Vue détaillée par prompt (réponses brutes consultables) | |
| Vue concurrents (qui est cité, à quelle fréquence) | |
| Évolution dans le temps (graph 30 jours) | |
| Email hebdo automatique | Brevo |
| Export CSV | ✅ 2026-06-08 — `/api/export/runs.csv` + `/api/export/metrics.csv`, section `/app/settings` |
| Page facturation Stripe Customer Portal | ✅ 2026-05-14 |
| Plans Solo / Starter / Pro avec limitations volumes | Solo 9,99 € ajouté 2026-05-14, Agency retiré UI public |
| Hard-cap LLM 200 % du quota théorique mensuel | ✅ 2026-05-16 (`src/lib/hardcap/`) |
| Outil audit technique site (lead magnet, sans LLM) | `/outils/audit-technique`, ✅ 2026-05-16 |
| SSE temps réel des runs + bannière + toasts | `/api/runs/events`, ✅ 2026-05-16 |
| One-shot run gratuit post-onboarding (~$0,04) | ✅ 2026-05-16 |
| Onboarding skippable (« configurer plus tard ») | `quickSetup`, ✅ 2026-05-16 |
| Blog content-driven MDX + JSON-LD FAQPage GEO | ✅ 2026-05-16 (`src/content/blog/*.mdx`) |

### Hors périmètre V0 (explicite)

- ❌ Recommandations d'optimisation IA dans l'app (l'audit technique couvre ce besoin via /outils/audit-technique)
- ❌ Marque blanche / multi-workspaces (réintroduit en V2 via plan Agency sur devis)
- ❌ API publique
- ❌ Intégrations GA4, Search Console
- ❌ SSO
- ❌ Mobile app (responsive web suffit)
- ❌ Notifications Slack
- ❌ Comparaison historique > 90 jours
- ~~❌ Multi-providers LLM~~ — finalement livré en Phase C le 2026-05-18 (5 providers : Claude, Le Chat, ChatGPT, Gemini, Perplexity)

### Critères de qualité V0

- 99% uptime sur le tracking (manquer 1 jour de tracking ruine la confiance)
- Latence dashboard < 2s
- Mails hebdomadaires sans bug pendant 4 semaines consécutives
- Onboarding réalisable en moins de 5 minutes en moyenne
- Aucune perte de données (backup quotidien)

### Métriques de succès V0

- 50 inscriptions en 30 jours après lancement
- 20 % de conversion signup → payant (10 clients payants)
- NPS > 30 après 60 jours
- Churn mensuel < 10 %
- 1 retour produit par semaine analysé et logué

> Note 2026-05-14 : pas de freemium permanent. Conversion mesurée depuis
> le signup direct, l'outil audit one-shot, ou le pricing direct.
> Depuis 2026-06-08 : trial 14 j **avec carte requise** (cf. doc 09).

---

## Glossaire vocabulaire (officiel, V0)

> Mise à jour 2026-05-13 (cf. doc 09 § 2026-05-13). Ces termes s'emploient
> tels quels dans le produit (UI, emails, exports CSV), le marketing et la
> doc commerciale. **Ne pas mixer** avec les variations anglaises.

### Score de visibilité IA

- **Définition** : note 0–100 par LLM, par marque, par jour. À quel point la marque est citée et bien positionnée dans les réponses générées.
- **Formule V0** (cf. `src/lib/metrics/visibility.ts`) : `positionWeight × sentimentWeight × 100`, agrégée sur tous les runs success du jour (brand, llm, date).
  - `positionWeight` : first_paragraph = 1.0 / middle = 0.5 / end = 0.25 / absent = 0
  - `sentimentWeight` : positive = 1.0 / neutral = 0.5 / negative = 0 / absent = 0
- **Intervalle** : `[0, 100]`, 1 décimale affichée.
- **Quand utiliser** : suivre la performance d'une marque dans un LLM donné dans le temps (dashboard sparkline, recap hebdo, KPI).

### Part de voix

- **Définition** : pourcentage de citations qui vont à ta marque vs. tes concurrents sur un prompt donné (ou une catégorie de prompts).
- **Formule V0** : `citations_ta_marque / (citations_ta_marque + Σ citations_concurrents) × 100`. Calculée sur tous les runs success de la fenêtre (jour / 7 j / 30 j).
- **Intervalle** : `[0, 100]` %.
- **Quand utiliser** : comparatif concurrentiel sur un prompt ou un cluster de prompts. Pas pour suivre l'évolution d'une marque seule — utiliser Score de visibilité IA pour ça.

### Sentiment

- **Définition** : qualitatif sur **comment** ta marque est citée, pas combien de fois.
- **Valeurs (enum)** : `positive` (flatteur, recommandation explicite) / `neutral` (mentionnée sans qualification) / `negative` (critique, comparée défavorablement) / `absent` (pas citée).
- **Calcul** : produit par Claude Haiku 4.5 en mode `tool_use` forcé (cf. `src/lib/citation/score.ts`), schéma `report_scoring`.
- **Quand utiliser** : alerter sur un sentiment qui se dégrade, prioriser les prompts à fort impact négatif, segmenter le Score (un 70 majoritairement négatif est pire qu'un 60 positif).

### Funnel sources (adopté, livré 2026-06-08)

Vocabulaire en miroir du standard marché (popularisé par Peec AI). Évite les « Used % > 100 % » qui prêtaient à confusion.

- **Apparition** — *% de réponses où la source apparaît dans le set de retrieval (avant filtrage par le LLM)*. EN : *Retrieved*.
- **Fréquence** — *nombre moyen d'apparitions par réponse* (1 source peut être citée plusieurs fois dans la même réponse). EN : *Retrieval Rate*.
- **Citation** — *% des apparitions qui deviennent une citation explicite dans la réponse finale*. EN : *Citation Rate*.

Funnel : `Apparition → Fréquence → Citation`. En prod : colonnes `retrieved_count`, `retrievals_total`, `citations_count` sur `citation_metrics_daily` (cf. doc 03), section dédiée dashboard + colonnes CSV `metrics.csv`.

### Source

- **Définition** — *page web (URL/domaine) qu'une IA est allée consulter pendant qu'elle répondait à un prompt de ton marché*. Extraite de `runs.parsed_citations`. Y être présent (ou être soi-même ce site) augmente la probabilité d'être cité — levier GEO concret derrière l'onglet Sources de `/app/citations`.
- **Pourquoi c'est utile** — connaître les sources de ton segment dit *où aller te faire mentionner*. Première question : « ton domaine apparaît-il parmi les sources ? ». Sinon, c'est ton principal gap.
- **Type de source** — ta marque (`Vous`), un concurrent (`Concurrent`), une référence (Wikipedia), de l'UGC (Reddit), de l'éditorial (presse) ou autre. Le tag `Vous`/`Concurrent` est exact (domaines en base) ; le reste est heuristique en attendant le classifier LLM V1 (cf. § Domain Types classification).

### Termes à NE PAS utiliser (équivalents anglais)

- ❌ « AI Visibility Score » → ✅ **Score de visibilité IA**
- ❌ « Share of Voice » / « SOV » → ✅ **Part de voix**
- ❌ « Brand Sentiment » → ✅ **Sentiment**
- ❌ « Mentions » seul (ambigu) → ✅ **Citations**
- ❌ « Retrieved / Retrieval Rate / Citation Rate » → ✅ **Apparition / Fréquence / Citation**

---

## V0+ — Optimisation et différenciation (60 jours post-lancement)

> Ajouté 2026-05-17, issu de la veille concurrence 2026-05-11 (Profound,
> Peec AI, Goodie, Otterly, Rankscale, AthenaHQ). **Statut 2026-06-09 :
> toutes les features V0+ sont livrées.**

### Vision

Le V0 a livré la promesse de base (tracker + dashboard + audit gratuit + billing). Le V0+ comble les trous fonctionnels identifiés en veille et active les leviers de rétention (drill-down sources, regen prompts) et d'acquisition (comparison pages, crawlabilité bots IA dans l'audit).

### Features V0+

| Feature | Pourquoi | Où ça vit |
|---|---|---|
| **Funnel sources 3 métriques (Apparition/Fréquence/Citation)** ✅ livré 2026-06-08 | Standard marché (Peec). | `citation_metrics_daily` étendu (`retrieved_count`, `retrievals_total`, `citations_count`) + `aggregateSourcesFunnel` (worker recompute) + 3 stats dashboard + colonnes CSV `metrics.csv`. Email hebdo : reporté (avec drip post-signup). |
| **Per-prompt cadence (`daily \| weekly \| monthly`)** ✅ livré 2026-06-08 | Économie de runs sur prompts à faible variance, vente facile Pro/Agency. | Champ `prompts.cadence` (cf. doc 03) + UI `/app/prompts/[id]` + filtre scheduler |
| **URL drill-down `/app/sources/[id]`** ✅ livré 2026-06-08 | Passe d'un produit « tableau » à un produit « investigation ». Rétention forte. | Route dédiée + vues SQL (retrievals over time, citation rate, prompts qui retrouvent, marques voisines, runs réels) |
| **Crawlabilité bots IA dans rapport `/outils/audit-technique`** ✅ livré 2026-06-08 | Pas un outil séparé (dilue le slug autorité existant). Section dédiée du rapport : table bots ChatGPT/Claude/Perplexity/Gemini — autorisé/bloqué. | `src/lib/audit/` étendu + parse `/robots.txt` cible + table de bots connus |
| **Régénérer prompts depuis le profil** ✅ livré 2026-06-08 | Un bouton qui re-suggère 10 prompts à partir de la description + concurrents. | `/app/onboarding` + `/app/prompts` (server action) |
| **Comparison pages industrialisées** ✅ livré 2026-06-08 | Sales enablement + SEO. | 3 articles MDX (`/blog/mamie-geo-vs-{peec-ai,otterly,rankscale}`). Slug `/comparatifs/[slug]` reporté V1 si traction. |
| **Multi-select brand filter (Your brand / Competitors)** ✅ livré 2026-06-08 | UX évidente une fois vue. Filtre groupé sur dashboard + vues détaillées. | Composant `BrandMultiSelect` dans `src/components/app/` |
| **Save-as-PNG sur charts** ✅ livré 2026-06-08 | Drop direct dans Slack/deck client. Effet « felt » côté agence = partage = bouche-à-oreille. | Wrapper sur Recharts (LineChart, BarChart, AreaChart) |
| **CSV export** ✅ livré 2026-06-08 | Gap V0 (listé P0 mais code absent). | `/api/export/runs.csv`, `/api/export/metrics.csv`. UTF-8 BOM, RFC 4180, scope workspace, plage 90 j défaut, `?from/to/brandId`. Bouton `/app/settings`. |
| **Pause/Resume projects** ✅ livré 2026-06-08 | Agence saisonnière / audit one-shot : pause sans perdre le setup ni consommer de crédits. | `brands.paused_at TIMESTAMPTZ NULL` + index partiel `idx_brands_active` + skip scheduler + toggle UI `/app/settings`. |
| **Page « Conseils GEO » (10 leviers)** ✅ livré 2026-06-09 | Éducation produit evergreen + amorce du drip post-signup. Off-page (branding, avis, YouTube…) que l'audit par-URL ne couvre pas. Cf. doc 09 § 2026-06-09 et 2026-06-10 (refonte plan d'action priorisé). | Route `(with-nav)/conseils` + contenu `src/lib/geo-advice.ts` (10 leviers, 4 axes, `GEO_TIPS_BY_PRIORITY`) + cross-links audit/citations + entrée sidebar (Lightbulb). |

### Hors périmètre V0+

- ❌ **MCP Server Mamie GEO** — cible PME/freelance FR ≠ devs power-users. À reconsidérer V1 sur demande client claire.
- ❌ **Looker Studio connector** — après CSV export validé, à reconsidérer V1.
- ❌ **Crawlability comme outil séparé `/crawlability`** — dilue le slug autorité de `/outils/audit-technique`. Intégré comme section au rapport existant.

---

## V1 — Module Audit (mois 3-6)

### Vision

Une fois que le Tracker tourne et que les clients comprennent leur position, ils demandent **"comment je m'améliore ?"**. C'est le rôle de l'Audit.

> Note : une partie du périmètre est déjà couverte par `/app/audits`
> (Sprint 6 PR B, 2026-05-17 : scan ~30 checks, score 4 axes, quotas par
> plan, comparaison Starter+, recrawl hebdo). Le V1 formalise le reste.

### Stories ajoutées

- **S11** — Recevoir une analyse technique de mon site pour mesurer son "AI-readiness"
- **S12** — Voir les améliorations prioritaires (top 10) pour devenir plus citable
- **S13** — Suivre la progression de mon score AI-readiness dans le temps
- **S14** — Comparer mon AI-readiness vs concurrents

### Features V1

| Feature | Description |
|---|---|
| **AI-readiness scan** | Crawl du site, analyse de la structure (H1-H6), schema.org, FAQ pages, llms.txt, robots.txt pour AI crawlers |
| **Score AI-readiness** | 0-100 sur 5 axes : Structure, Données structurées, Crawlabilité IA, Q&A density, Autorité externe |
| **Recommandations actionnables** | Liste priorisée de 10-30 actions concrètes (ex: "ajouter une FAQPage schema sur /pricing") |
| **Audit concurrents** | Même scan sur les 3-5 concurrents trackés, comparaison côte à côte |
| **Suivi des recommandations** | Checklist persistante : ce qui a été fait, ce qui reste |
| **Recrawl hebdomadaire** | Re-mesure automatique du score |

### Stack additionnelle V1

- Crawler léger (Playwright headless)
- Parser HTML pour extraction schema (cheerio)
- LLM scoring pour évaluer la "citabilité" du contenu (Claude Haiku par appel)

### Ajouts V1 issus de la veille concurrence 2026-05-11

| Feature | Pourquoi | Notes |
|---|---|---|
| **Programme partenaire + annuaire public** | Canal accélérateur agence FR (cf. doc 06). Lifetime commission 20-25 % sur l'abonnement référé. Flywheel local non réplicable par les concurrents anglo. | Annuaire CMS-style + tracking Stripe affiliate. Cf. doc 06 § Programme partenaire. |
| **Query fan-out tracking** | Traque les « sub-queries » que ChatGPT/consorts fan-out en interne. Vraie valeur démo agence. | Mode « advanced view » réservé tier Pro/Agence. |
| **« État du GEO francophone 2027 » report annuel** | Lead magnet + autorité de catégorie + relais presse FR. Basé sur la data V0/V0+. | Cf. doc 06 § Lead magnets. Publication début 2027. |
| **Tier credit-based « Power » (optionnel)** | Doc 09 a tranché flat-prompts en V0. À reconsidérer V1 si demande agence claire. | Validation après 6 mois de data des plans flat actuels. |

### Ajouts V1 issus de la veille Peec docs 2026-06-08 (cf. doc 09)

| Feature | Pourquoi | Notes |
|---|---|---|
| **Performance Matrix configurable** | Matrice X × Y parmi {Topics, Models, Geographies, Competitors} × {Visibility, Sentiment, Position, Part de voix}. Repère les gaps modèle/topic. | Heatmap réutilisable, plein-écran via Dialog. Réservé Pro+. |
| **Domain Types classification** (Editorial / Corporate / UGC / Reference / Institutional) | Label automatique des domaines sources + ring chart « % par type ». Très visuel en démo. Data déjà loggée, manque label + viz. | 1 appel Haiku par nouveau domaine + cache permanent. Table « Domains » colonne Type + ring chart. |
| **Volume estimé par prompt** (Beta-style) | Search volume relatif (« very low » → « very high ») par prompt. Transforme la suggestion IA en argument SEO sérieux. | DataForSEO ou équivalent EU, ~30 €/mois pour ~100 prompts/mois. Barre colorée 5 niveaux, pas de chiffre absolu. |
| **Brand Visibility vs Source Visibility (Spot gaps)** | Croise « marque nommée » et « domaine cité comme source ». Domaine cité mais marque jamais nommée → opportunité branding éditorial. | Page `/app/sources/gaps` ou onglet sur sources. Pattern Peec « Spot gaps ». |
| **Strongest / Weakest model par marque** | Max/min `visibilityScore` par LLM sur 30 j, en pill sur la card brand. Utile en debrief commercial agence. | 2 champs sur `getDashboardData`. Pills dans `<AppTopBar>` ou sub-line stat Visibility. |
| **Rankings Table avec sélecteur de dimension** | « By AI Model / By Topic / By Tag » pivote la même table. Pattern Peec Brand Insights. | `<RankingsTable dimension={...}>`. Dépend de Topics + Tags. **→ Analyse ci-dessous (2026-06-10).** |

### Ranking concurrentiel — analyse de faisabilité (2026-06-10, demandé par Max)

Objectif : classement marque vs concurrents (« qui est le plus visible dans les IA sur tes prompts »), rang #1..N + évolution. Constat clé : **l'essentiel des données existe déjà** dans `runs.parsedBrands.scoring` (`brandMentioned` / `brandPosition` / `brandSentiment` + `competitorsMentioned[{name, sentiment}]`).

Plan par étapes, du gratuit vers le payant :

| Étape | Quoi | Coût LLM | Effort |
|---|---|---|---|
| **1. Leaderboard fenêtre** ✅ livré 2026-06-10 | Rank global + par LLM sur 30 j, tri par mentions, ligne marque highlightée + marques détectées non suivies (cap 5). Onglet « Classement » sur `/app/citations`. | **0 €** (pure agrégation) | 1 PR |
| **2. Historisation du rang** ✅ livré 2026-06-10 (delta J-7) + chart évolution ✅ 2026-06-11 | **Pas de nouvelle table** : `citation_metrics_daily.competitors_data` (jsonb) historisait déjà les mentions concurrents par jour × LLM depuis la Phase A. Delta de rang vs J-7 dans le leaderboard. Chart « Évolution de ton rang » (`RankLineChart`, axe Y inversé, 1 point/jour sur sous-fenêtre glissante 7 j via `computeRankHistory`, export PNG via `DownloadableChart`). | **0 €** | 1 PR, zéro migration |
| **3. Position par concurrent** ✅ livré 2026-06-10 | `position` (first_paragraph/middle/end) ajoutée aux `competitorsMentioned` du tool schema scoring + parsing lénient (anciens payloads valides). La donnée s'accumule → ranking de prééminence branchable plus tard. | **≈ 0** (même appel Haiku) | petite PR |
| **4. Scoring systématique** ✅ livré 2026-06-11 (doc 09) | Skip regex levé : le scoring Haiku tourne sur **tous** les runs success, et le prompt demande explicitement **toutes** les marques citées (trackées ou non) → découverte des marques recommandées « à ta place », ranking exhaustif même quand tu es invisible. Validé par l'étude 50 marques (doc 11) : l'omission est le signal n°1. | ~$0,003/run anciennement skippé : Solo ≈ +0,3 $/mois, Starter ≈ +7 $, Pro ≈ +22 $ worst case | PR livrée |

Mitigations étape 4 si les marges coincent (à activer si `llmCostUsd` scoring > 10 % du MRR) : gate Starter+ (Solo garde le ranking fenêtre), ou échantillonnage (scoring complet 1 jour/semaine).

Dépendance UX ✅ 2026-06-11 : le cas « ta marque n'est jamais citée » est rendu explicite par le bloc statut au-dessus du leaderboard (« le classement montre qui est recommandé à ta place ») au lieu de tirets muets.

### Gamification par le rang (2026-06-11, demandé par Max)

Parti pris : **le rang EST le jeu**. Dans un outil de mesure B2B, les
mécaniques de jeu artificielles (points, niveaux, streaks, badges
décoratifs cumulables, confettis) font gadget et abîment la crédibilité
data. La compétition réelle entre marques fournit déjà la boucle de
motivation — il suffit de la mettre en scène.

| Mécanique | Statut | Détail |
|---|---|---|
| **Statut compétitif** (leaderboard) | ✅ 2026-06-11 | Bloc au-dessus du classement : « Ta marque est n°2 sur 8 — à 3 citations de X (n°1) ». Trophée si n°1 + avance sur le n°2. Objectif concret, pas de métrique vanity. |
| **Chart évolution du rang + export PNG** | ✅ 2026-06-11 | La courbe qui monte = dopamine honnête. PNG partageable (rapport client, LinkedIn) = boucle virale gratuite. |
| **Rang dans le weekly email** | à faire (V0+) | Ligne « Classement : n°2 (↑1 vs semaine dernière) » dans le recap lundi — le moment de célébration hebdo. Réutiliser `computeRanking` dans `send-weekly-email.ts`. |
| **Badges de statut** (pas de collection) | à faire (V1) | Pill « N°1 » / « Top 3 » sur la card brand du dashboard et dans le BrandSwitcher. Statut courant, perdable — pas un trophée acquis à vie. |
| **Événements de rang** (notification) | V1 | « Tu viens de passer n°2 sur ChatGPT » in-app + email optionnel. Déclencheur : changement de rang détecté au recompute quotidien. |

Anti-décisions gamification : ❌ points/XP, ❌ streaks de connexion,
❌ badges décoratifs cumulables, ❌ confettis/animations de célébration
lourdes, ❌ leaderboard inter-clients (les données d'un workspace ne
sortent pas de son périmètre).

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

| Feature | Description |
|---|---|
| **Multi-workspaces** | Un par client agence, isolés |
| **Marque blanche** | Logo client, couleurs, sous-domaine personnalisable (geo.agence-x.fr) |
| **Rapports PDF auto** | Génération mensuelle automatique avec contenu personnalisable |
| **Dashboard agence (méta)** | Vue agrégée des clients, alertes, score moyen |
| **Facturation centralisée** | Une seule facture pour l'agence, pas par client |
| **Permissions granulaires** | Lecture seule pour clients, admin pour l'agence |
| **Intégration GA4** | Corrélation traffic IA + visibilité (V2.5) |
| **Intégration Search Console** | Idem (V2.5) |
| **Webhooks / API** | Pour intégrations custom (V2.5) |

---

## V3 et au-delà — Idées pour 12-24 mois

À ne PAS développer avant validation PMF, mais loguées pour mémoire :

- **Prompt Library FR** — 1000+ prompts types par secteur (e-commerce, SaaS B2B, professions libérales…) importables en un clic
- **Sentiment analysis** — pas seulement "cité" mais "cité positivement / négativement"
- **AI Traffic Attribution** — corréler citation IA et trafic effectif (UTM custom + GA4)
- **AI SERP simulator** — tester un prompt one-shot sans abonnement
- **Mobile app** — pour managers qui veulent un score quotidien
- **Fine-tuning détection** — détecter si une marque entre dans les datasets d'entraînement ouverts (Common Crawl etc.)
- **Reverse-prompting** — "voici 10 questions que tes clients pourraient poser à ChatGPT, et voilà comment tu apparais"
- **Public benchmark anonyme** — moyenne de visibilité dans son secteur

### Repoussés en V3+ après veille 2026-05-11 (à mentionner pour clore le débat)

- **MCP Server Mamie GEO** — read-only sur prompts/sources/tendances, accessible depuis Claude/Cursor/Windsurf. Cible PME/freelance FR ≠ devs power-users (Peec a lancé le sien le 2026-04-20). À reconsidérer V1 sur demande client.
- **ACE-like ML citation probability** — prédire la probabilité qu'une page soit citée (cf. AthenaHQ Citation Engine). V2 minimum, après 6+ mois de data apparitions/citations.
- **AEO Writer / agents Goodie-style** — générateur de contenu IA-optimisé. Hors scope durable (Tracker pur). Potentiellement tier Agence V2 si pression marché forte.
- **Verticalisation extrême (33 industries façon AthenaHQ)** — intenable en solo. Max 3-5 verticales si jamais : e-commerce FR, SaaS B2B FR, agence SEO, services pro, immobilier.

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
- Pain : pas mesurable si ses investissements contenu se traduisent en visibilité IA, et sa direction lui demande
- Plan visé : Pro à 149€/mois

### Persona 3 — Aline, dirigeante agence SEO indépendante

- 41 ans, agence à Nantes, 5 personnes
- 30-50 clients en portefeuille
- CA 600 K€-1 M€
- Utilise Semrush + outils internes
- Pain : différenciation face aux concurrents agence, veut un service GEO sans internaliser le dev
- Plan visé : Agence à 399€/mois → revend l'audit GEO à ses clients 100-200€/mois ou 500€ one-shot

### Persona 4 — Marc, CMO grande ETI souveraineté

- 48 ans, ETI 800 personnes secteur défense ou banque
- Budget marketing > 1 M€/an
- Contraintes RGPD/souveraineté fortes
- Pain : ne peut pas utiliser Profound (US, données chez AWS US)
- Plan visé : Enterprise sur devis (1500-3000€/mois)

---

## Métriques produit à tracker

### Métriques d'acquisition

- Visiteurs uniques mamie-geo.fr / mois
- Conversion landing → signup
- Conversion signup → onboarding complet
- Conversion trial → payant (trial 14 j carte requise depuis 2026-06-08)

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

> **Archivé 2026-06-11** — wireframes ASCII pré-code (dashboard + vue
> prompt) supprimés : l'UI réelle livrée les a remplacés (dashboard
> `/app/dashboard`, détail `/app/prompts/[id]`, batches dépliables —
> cf. doc 10 § Patterns dashboard et CLAUDE.md). Historique disponible
> dans git si besoin.

---

## Backlog initial — Sprint 0 (avant le code)

> ✅ Intégralement réalisé (10/10 items : stack validée, domaine
> mamie-geo.fr, repo Next.js + Tailwind, Neon, comptes API LLM, Stripe
> test, Brevo, wireframes Figma, schéma BDD, 100 prompts de test).
> Cf. [08-roadmap-execution.md](./08-roadmap-execution.md) pour la timeline.
