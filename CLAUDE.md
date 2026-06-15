# CLAUDE.md — Brief opérationnel Mamie GEO

> Source de vérité courte pour Claude Code. À lire en 3 minutes au début
> de chaque session avant de toucher au code. La connaissance détaillée
> vit dans `geo-project/00` à `10`. Ce fichier ne duplique pas, il pointe.

---

## 1. Pitch

Mamie GEO est le **premier SaaS francophone de Generative Engine
Optimization** : il mesure quotidiennement la visibilité d'une marque
dans **ChatGPT, Claude, Perplexity, Gemini et Le Chat (Mistral)**, et
livre des recommandations actionnables. Cible cœur : freelances SEO,
PME marketing, agences SEO/marketing FR.

Pricing public : **Solo 9,99 € / Starter 49 € / Pro 149 €**. Plan Agency
(300 prompts) retiré de la grille publique 2026-05-14, reste sur devis.
Enterprise sur devis. Trial 14 jours **avec carte requise** (acté
2026-06-08) + garantie remboursement 14 jours.

Détail : `geo-project/00-vision-strategie.md` et `01-marche-concurrence.md`.

---

## 2. Stack verrouillée (V0)

Décisions actées le 2026-05-05 dans `geo-project/09-decisions-journal.md`.
**Ne pas changer sans nouvelle entrée dans 09 + accord Max.**

| Domaine            | Choix                                                                            | Pourquoi (résumé)                                  |
| ------------------ | -------------------------------------------------------------------------------- | -------------------------------------------------- |
| Framework          | **Next.js 15 App Router**                                                        | Edge EU, SSR, écosystème                           |
| Langage            | **TypeScript strict**                                                            | Pas de `any` non justifié                          |
| Styling            | **Tailwind v4 + shadcn customisé**                                               | Tokens du doc 10                                   |
| Auth               | **Better Auth**                                                                  | Free, open source, Postgres, magic-link            |
| ORM                | **Drizzle**                                                                      | SQL-first, edge-compatible, migrations versionnées |
| DB                 | **Neon EU Frankfurt**                                                            | Free tier + branching pour tests E2E               |
| Cache / rate-limit | **Upstash Redis free**                                                           | 10K cmd/jour                                       |
| Storage            | **Cloudflare R2 free**                                                           | 0 frais d'egress                                   |
| Queue V0           | **Postgres-based custom + Vercel Cron** (~150 lignes)                            | Gratuit, idempotent, testable                      |
| Queue scale        | Inngest (migration > 100K runs/mois)                                             | DX premium quand on peut payer                     |
| Observabilité      | **Sentry free + PostHog Cloud EU free + BetterStack free**                       | RGPD, tous EU                                      |
| Hébergement        | **Vercel Pro $20/mo** (mono-app)                                                 | Edge EU, preview deployments                       |
| Email              | **Brevo** (transac + marketing)                                                  | Maîtrisé, EU                                       |
| Paiement           | **Stripe + Stripe Tax**                                                          | TVA UE auto                                        |
| LLMs tracking      | **APIs natives** OpenAI / Anthropic / Mistral / Perplexity / Google              | Fidélité au browse/search natif (pas OpenRouter)   |
| Modèle tracking V0 | **Anthropic Claude Haiku 4.5** (`claude-haiku-4-5-20251001`)                     | Phase A — cheap, bascule Sonnet 4.6 en Phase C     |
| LLM scoring        | **Anthropic Claude Haiku 4.5**                                                   | JSON mode + cheap                                  |
| Tests              | **Vitest** unit/integration + **Playwright** E2E (7 flows) + **MSW** + cassettes | Pas d'appel LLM réel en test                       |
| CI                 | **GitHub Actions**                                                               | Standard                                           |

Architecture détaillée : `geo-project/03-architecture-technique.md`.

### Anti-décisions (déjà refusées, ne pas re-proposer)

- ❌ Turborepo / monorepo multi-apps
- ❌ Framer pour le marketing (V0)
- ❌ Subdomain `app.mamie-geo.fr` (V0 = path-based `/app/*`)
- ❌ Prisma (on a tranché Drizzle)
- ❌ Clerk / Supabase Auth (on a tranché Better Auth)
- ❌ Inngest en V0 (Postgres-queue jusqu'à 100K runs/mois)
- ❌ OpenRouter pour le tracking
- ❌ DeepSeek (même pour les free tools : données prospects hors EU =
  contradiction avec le positionnement RGPD, et Mistral Small est moins
  cher — cf. doc 09 § 2026-06-12)
- ❌ Plan freemium permanent dans le SaaS

---

## 3. Structure du repo

Mono-repo unique. Une seule app Next.js, un seul déploiement, un seul
domaine `mamie-geo.fr`. `mamie-seo.fr` redirige 301 vers `mamie-geo.fr`.

```
mamie-geo/
├── geo-project/                    # docs markdown 00-10 + README
├── CLAUDE.md                       # ce fichier
├── README.md
├── package.json
├── next.config.ts                  # 301 mamie-seo.fr → mamie-geo.fr
├── drizzle.config.ts
├── playwright.config.ts
├── vitest.config.ts
├── .env.example
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (marketing)/            # / /pricing /about /outils/...
│   │   ├── (blog)/                 # /blog /blog/[slug]
│   │   ├── (app)/                  # /app/dashboard /app/prompts ... (auth)
│   │   ├── api/                    # auth, webhooks Stripe, cron dispatch
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   │
│   ├── lib/                        # logique métier
│   │   ├── llm/                    # 1 fichier par provider (openai.ts, anthropic.ts...)
│   │   ├── citation/               # détection regex + scoring LLM
│   │   ├── auth/                   # config Better Auth
│   │   ├── stripe/
│   │   └── queue/                  # Postgres queue helpers
│   │
│   ├── db/
│   │   ├── schema.ts               # Drizzle schema unique
│   │   ├── client.ts
│   │   └── migrations/             # SQL versionné
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn customisé avec design tokens
│   │   ├── marketing/
│   │   ├── blog/
│   │   └── app/
│   │
│   ├── workers/                    # exécution des jobs (1 prompt × 1 LLM = 1 job)
│   │   ├── execute-prompt.ts
│   │   ├── score-response.ts
│   │   └── send-weekly-email.ts
│   │
│   └── content/                    # blog en MDX
│
├── public/
└── tests/
    ├── e2e/                        # Playwright
    └── fixtures/                   # cassettes JSON LLM
```

Source : `geo-project/03-architecture-technique.md` § Structure du repo.

---

## 4. Conventions de code

### Naming

- `camelCase` : variables, fonctions, méthodes, propriétés
- `PascalCase` : composants React, types, classes, enums
- `kebab-case` : noms de fichiers (`my-component.tsx`, `score-response.ts`)
- `SCREAMING_SNAKE_CASE` : constantes globales et env vars
- Routes Next.js : `kebab-case` côté URL (`/outils/test-visibilite-ia`)

### TypeScript

- `strict: true` partout, `noUncheckedIndexedAccess: true`
- **Jamais `any`** sans commentaire `// any: <raison>` à côté
- Erreurs explicites : `throw new Error("contexte précis: valeur=...")` ou Result types pour les flux où l'erreur est attendue
- `zod` schemas réutilisés front + back, exportés depuis `src/lib/<domaine>/schemas.ts`
- Pas de magic numbers : constantes nommées en haut de fichier ou dans `src/lib/constants.ts`

### Drizzle / DB

- **Migrations versionnées** uniquement (`drizzle-kit generate` puis revue manuelle du SQL)
- **Jamais `db push` en prod** — `db push` autorisé uniquement en local sur branche Neon dev
- Toute évolution de schéma → entrée dans `geo-project/03` (table modifiée) **et** dans `geo-project/09` (décision si non triviale)
- Index obligatoire sur tout FK et tout champ utilisé dans `WHERE`/`ORDER BY` côté workers
- `ON DELETE CASCADE` partout où la suppression cascade fait sens métier (workspace → brands → prompts → runs)

### Tests

- **Vitest** : `foo.ts` à côté de `foo.test.ts` (colocation), pas de dossier `__tests__/`
- **Playwright** : seulement sur les **7 flows business-critiques** listés dans `geo-project/03` § Stratégie de test
- **LLMs jamais appelés en test** — règle dure. Trois patterns autorisés :
  1. MSW + cassettes JSON dans `tests/fixtures/llm/{provider}/{prompt-id}.json` (script `pnpm test:record:llm` à créer en Sprint 1)
  2. `FakeLLMClient` injecté via DI (interface `LLMClient` dans `src/lib/llm/types.ts`)
  3. Snapshots de scoring sur réponses fixes
- Tests intégration Drizzle : branche Neon dédiée par PR, rollback transactionnel entre tests
- CI bloquante : pas de merge si rouge

### Dev local

- **Pas de Docker Compose.** Chaque dev pointe sur une branche Neon dédiée `dev-{username}`, gratuite et instantanée.
- `.env.local` contient la `DATABASE_URL` de la branche perso ; jamais commité.
- Migrations appliquées via `pnpm db:migrate` (Drizzle), `db push` interdit en dehors d'un test ponctuel sur sa propre branche.

### Queue Postgres — règle d'idempotence

- Toute insertion dans `queue_jobs` doit fournir une `idempotency_key TEXT UNIQUE NOT NULL`
- Format pour les jobs LLM : `{prompt_id}:{llm}:{scheduled_date_iso}` (ex: `8fa1...:claude:2026-05-06`)
- `INSERT ... ON CONFLICT (idempotency_key) DO NOTHING` côté `enqueue` — un dispatch redémarré ou un cron qui se déclenche deux fois ne crée pas de doublon

### Commits & PR

- **Conventional Commits** : `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `perf:`
- **Trunk-based** : pas de feature branches longues, PR < 400 lignes, merge daily
- **Toute modif qui invalide une info dans `geo-project/` met à jour le doc concerné dans le même PR** (cf. § 6 ci-dessous)
- Décisions techniques non triviales → nouvelle entrée dans `geo-project/09-decisions-journal.md`

### Style général

- Pas de commentaire qui paraphrase le code. Commentaires uniquement pour le **pourquoi non-évident** (workaround, invariant, contrainte cachée)
- JSDoc sur les fonctions exportées non-triviales (signature publique d'un module)
- Pas d'over-engineering : 3 lignes répétées valent mieux qu'une abstraction prématurée
- Pas de fallback / validation pour des cas qui ne peuvent pas arriver à l'intérieur du système. Validation aux frontières (input user, webhook, réponse LLM) uniquement

---

## 5. Où chercher quoi dans `geo-project/`

| Question                                               | Doc                               |
| ------------------------------------------------------ | --------------------------------- |
| « Pourquoi on fait ce projet ? Qui est la cible ? »    | `00-vision-strategie.md`          |
| « Qui sont les concurrents ? Quels gaps ? »            | `01-marche-concurrence.md`        |
| « Quelle feature pour quel V ? User stories ? »        | `02-produit-roadmap.md`           |
| « Quelle stack ? Quel schéma BDD ? Quels coûts LLM ? » | `03-architecture-technique.md` ⭐ |
| « Quel pricing ? Quelles marges ? Projections ? »      | `04-pricing-business-model.md`    |
| « Comment on acquiert ? Quels canaux ? Templates ? »   | `05-go-to-market.md`              |
| « Quelle stratégie contenu / SEO / lead magnets ? »    | `06-activation-mamie-seo.md`      |
| « Quels risques ? Quelles conditions d'arrêt ? »       | `07-risques-mitigations.md`       |
| « Timeline mois par mois ? Sprint 0 checklist ? »      | `08-roadmap-execution.md`         |
| « Pourquoi on a pris cette décision ? KPI mensuels ? » | `09-decisions-journal.md` ⭐      |
| « Direction artistique ? Patterns obligatoires ? »     | `10-design-direction.md`          |
| « Étude 50 marques × 5 IA ? Enseignements ? »          | `11-etude-50-marques.md`          |

---

## 6. Règles de maintenance documentaire (importante)

**La doc précède et survit au code.** Si on change un fait qui apparaît
dans un doc, on met à jour le doc dans le **même PR** que le code, sinon
la doc devient un cimetière.

| Modification                                 | Doc à updater                                     |
| -------------------------------------------- | ------------------------------------------------- |
| Schéma BDD modifié                           | `03` (section schéma) + `09` si non trivial       |
| Nouvelle décision tech / nouvelle dépendance | `09` (entrée datée + justification)               |
| Feature ajoutée / déplacée d'un V à un autre | `02` (roadmap)                                    |
| Coût ou tarif modifié                        | `04` (et éventuellement `03` § coûts)             |
| URL / endpoint / route changé                | `03` + `06` si SEO impactée                       |
| Risque qui se concrétise / s'estompe         | `07`                                              |
| Convention de code modifiée                  | **ce CLAUDE.md**                                  |
| Mise à jour KPI mensuel                      | `09` (section "Suivi KPI mensuel")                |
| Snapshot concurrence                         | `09` (section "Snapshots veille concurrentielle") |

**Format des entrées de décision** dans `09` (à respecter) :

```
### YYYY-MM-DD — Titre court
**Contexte** :
**Options considérées** : A / B / C
**Choix** :
**Justification** :
**Conséquences attendues** :
**À revisiter** : (date ou condition)
```

---

## 7. Communication avec Max

- Français, ton direct, pas de flagornerie
- Pas yes-man : si une demande paraît bancale, dire pourquoi avant d'implémenter
- Poser une question plutôt qu'assumer si quelque chose est flou
- Signaler explicitement quand une décision est prise faute de mieux (Max peut la rejeter)
- Résumé de fin de session : ce qui est fait / ce qui reste / questions ouvertes

---

## 8. Règles permanentes (rappel)

- Lire le doc concerné AVANT de coder un domaine
- Étendre un fichier existant plutôt que d'en créer un nouveau
- Ne pas ajouter de dépendance npm sans la justifier (entrée dans `09`)
- Pas de mock LLM "pour aller plus vite" sans plan de retour
- Pas de commit géant qui touche 30 fichiers
- Pas d'improvisation sur la stack — toute remise en cause passe par `09`
- Ne pas re-proposer Turborepo, Framer, subdomain `app.`, Prisma, Clerk, Inngest-V0, OpenRouter (cf. § 2 anti-décisions)

---

## 9. État du projet (snapshot — 2026-06-15)

> Ce snapshot décrit l'état **courant** uniquement. L'historique détaillé
> de chaque évolution (le « comment on en est arrivé là ») vit dans
> `geo-project/09-decisions-journal.md` — ne pas l'empiler ici : à chaque
> mise à jour, **remplacer** le contenu périmé.

### Phase actuelle

**Phases A, B et C livrées. Site EN PROD ET EN LIGNE (2026-06).
Phase courante = DISTRIBUTION / acquisition.**
Phasage acté 2026-05-07 (doc 09) : A = moteur Haiku cheap, B = design
system + UI + marketing + blog, C = multi-LLM + Stripe + weekly email.
Tous les items « V0+ veille concurrence » du doc 02 sont livrés
(2026-06-08). Stripe LIVE, DNS Brevo, Prices annuels et clé Brave : OK.
Seul ops résiduel : crédit Perplexity. Le produit est complet — le
goulot est désormais l'acquisition, pas le code.

### Livré — vue d'ensemble

**Moteur de tracking** : pipeline complet 1 prompt × 1 LLM = 1 job sur
queue Postgres + Vercel Cron (dispatch \*/5 min, scheduler 06:00 UTC,
cadence par plan et par prompt). 5 providers via `getConfiguredLLMs()`
(`src/lib/llm/index.ts`) : Claude Haiku 4.5, Mistral `mistral-large-latest`,
OpenAI `gpt-4o-mini` + web_search, Gemini `gemini-2.5-flash` + grounding,
Perplexity `sonar` (code prêt, clé manquante). Détection regex +
scoring Haiku tool_use (sentiment, position, concurrents + leur
`position` depuis 2026-06-10). Upsert `citation_metrics_daily` + funnel
sources (retrieved/retrievals/citations, 2026-06-08). Hard-cap 200 % du
quota. Coût mesuré ~$0,04/run + ~$0,003/scoring.

**App** (`/app/*`, Better Auth magic-link via Brevo REST, quotas par
plan dans `src/lib/plans/quotas.ts`) :

- `dashboard` — stats agrégées tous-LLMs + Part de voix, funnel sources,
  charts (AreaChart/BreakdownBars, save-as-PNG), batches dépliables
- `prompts` (+`[id]`) — CRUD, suggestion IA, régénération depuis profil,
  cadence per-prompt
- `citations` — table concurrents + onglet « Classement » (`?tab=ranking`,
  leaderboard 30 j, filtre LLM, delta J-7, hint fiabilité < 14 j de
  données, bouton « Suivre » sur marques détectées, statut compétitif
  « n°X — à Y citations de Z », chart évolution du rang + export PNG).
  Scoring **systématique** depuis 2026-06-11 (étape 4 : skip regex levé,
  prompt élargi à toutes les marques citées)
- `audits` (+`new`/`[id]`/`compare`) — quotas par plan, cron hebdo,
  rapport ScoreRing/SegmentBar/ScoreBar, checks groupés par sévérité,
  bulle notif sidebar
- `conseils` — plan d'action priorisé 01-10 (« Commence ici » / « Ensuite »)
- `runs/[id]`, `settings` (workspace, aliases, pause/resume brand,
  exports CSV, billing, danger zone RGPD), `onboarding` (wizard 3 étapes
  + PlanPickerModal), `admin/visuals` (visuels LinkedIn, guard email Max)

`<PageContainer>` sur 100 % des pages, tables responsive
(`hidden md:table-cell`), AppTopBar horizontale + BrandSwitcher.

**Marketing/blog** : home, pricing, 4 pages légales, 3 lead magnets
(`/outils/test-visibilite-ia` scan express live 2026-06-12 : 3 prompts
× Le Chat mistral-small ~0,002 €/scan, verdict regex OU jugement LLM
des variantes de nom, 4 autres IA verrouillées → CTA trial, upsell
accompagnement done-for-you (rareté centralisée
`src/lib/done-for-you.ts`) ; `/outils/audit-technique` 30+ checks
SEO/GEO + PSI, 0 € LLM, promu en home ;
`/outils/comparateurs` scan présence comparateurs 2026-06-12 :
vérification Brave Search API — `BRAVE_SEARCH_API_KEY` requise —,
enrichissement Mistral Small ~0,0001 $/scan, scans persistés dans
`comparator_scans`. Chaque scan envoie au prospect un email de
confirmation : essai 14 j + appel découverte ; l'audit manuel 24 h est
supprimé) + hub `/outils`
linké en nav « Outils gratuits » (pastille « Nouveau »). Blog MDX
content-driven (`src/content/blog/*.mdx`, FAQPage JSON-LD, OG dynamique,
related, TOC, sitemap auto) : 3 articles de fond + 3 comparatifs (Peec,
Otterly, Rankscale). Newsletter Brevo prête (`BREVO_BLOG_LIST_ID`
manquant). SEO : host canonique non-www, noindex `.vercel.app`,
canonicals auto-référentes, OG/Twitter cards site-wide (2026-06-12 :
image statique `src/app/opengraph-image.tsx`, og:title hérité du title
de chaque page via le root layout — le blog garde son OG dynamique).

**Offre accompagnement done-for-you** (2026-06-12, doc 04) : section
sur `/pricing` (3 créneaux/trimestre, constantes `SLOTS_LEFT`/
`SLOTS_PERIOD` à maintenir à la main) → `/contact` (Cal.com inline ;
lien = event support en attendant l'event dédié). Les 2 scans publics
ne demandent que **site + email** : marque, secteur et zone de
chalandise détectés depuis la home (`src/lib/site-profile.ts` :
scraping cheerio — title/meta/nav/paragraphes —, path saisi respecté,
**Mistral Medium** « proposition d'abord » — Small inventait des
catégories, cf. doc 09 § 2026-06-12 —, zones nationales/SaaS
neutralisées, mode manuel en fallback/correction) + `ScoreRing` +
events `tool_cta_clicked` / `tool_profile_autodetected` sur chaque
étape. Concurrents repérés filtrés par pertinence (enrichissement
Mistral Small : géants généralistes/médias écartés).

**Billing Stripe** : checkout + portal + webhooks idempotents + Stripe
Tax + cron expire-past-due. **Trial 14 j avec carte requise**
(2026-06-08) : PlanPickerModal post-onboarding (3 variants), sidebar
Subscribe card (4 variants), relances email J-4/J-1 + expired (cron
`trial-emails` 08:00 UTC). Prices annuels -20 % via
`STRIPE_PRICE_*_ANNUAL` (fallback mensuel gracieux).

**Analytics PostHog** (EU) : autocapture + pageviews + session replay
(masquage PII, convention `data-private`), ~75 events business, groups
workspace, helpers serveur (`captureServerEvent`...). Privacy policy à
jour (opt-in implicite ePrivacy, sans banner). **Client init dans
`src/instrumentation-client.ts`** (2026-06-15) — avant, `posthog-js`
n'était jamais `.init()` → zéro event navigateur.

**Sentry** (2026-06-15) : `@sentry/nextjs` initialisé via
`src/instrumentation.ts` (serveur/edge + `onRequestError`) et
`src/instrumentation-client.ts` (front + replay sur erreur). No-op sans
DSN. Source maps / `withSentryConfig` reportés.

**Feedback in-app** (2026-06-15) : `FeedbackDialog` (sidebar) → action
`submitFeedback` → email `hello@` + event `user_feedback_submitted`.

**Emails Brevo** : magic-link, welcome-paid, payment-failed, weekly
recap (lundi 09:00 UTC), trial reminders/expired, audit-score-drop,
newsletter blog, confirmation scans publics (récap + essai 14 j +
appel découverte ; l'auto-reply « audit 24 h » est supprimé).

**Crons Vercel** (GET + POST, `Bearer CRON_SECRET`) : dispatch \*/5 min,
schedule-runs 06:00, trial-emails 08:00, expire-past-due 03:00,
expire-comp 04:00 (fin d'accès beta → expired + email conversion),
schedule-audits lundi 05:00, schedule-weekly-emails lundi 09:00.

**DA duale** (cf. doc 10) : app + marketing = Airbnb-like minimaliste
(Inter unique, blanc + gris `#fafafa`, accent bleu brand `#329CFF`, CTA
noir plein, radius 4/6/8/12, boutons pill) ; carrousels LinkedIn +
visuels externes = persona « Mamie » chaude (Fraunces/Hanken
Grotesk/Caveat, crème + terracotta `#DD6B45`, brief
`geo-project/linkedindesign.md`), rendus dans `/app/admin/visuals`.

**Programme beta-testeurs** (2026-06-15, doc 09 + doc 04) : plan `beta`
gratuit (weekly, 15 prompts, tous LLMs, ~10 $/mois/testeur), octroi/
révocation manuels via `/app/admin/beta` (guard email partagé
`src/lib/admin/guard.ts`), colonne `workspaces.comp_expires_at`, cron
`expire-comp`. Jamais facturé Stripe ; conversion = checkout normal
(webhook lève `comp_expires_at`).

**Suivi crédits LLM** (2026-06-15) : `/app/admin/llm-credits`. Les API
LLM n'exposent pas le solde prépayé → saisie manuelle des recharges
(table `llm_credit_topups`), solde estimé = rechargé − dépensé depuis
(SUM `runs.cost_usd` par `llm`). Gemini = pay-as-you-go (pas de solde).
Scoring Anthropic non ventilé par run (disclosure dans l'UI).

**Tests** : Vitest colocation (100+ tests, dont quotas/hard-cap `beta`)
+ 13 E2E Playwright flows publics. DB Neon : 20 tables + migrations
0000-0010.

### Reste à faire (post-lancement — site EN PROD ET EN LIGNE depuis 2026-06)

> Brevo blog list, 3 Prices annuels Stripe et clé Brave Search : **faits**.
> Le site est public. **Seul l'ops technique résiduel** = crédit
> Perplexity. La priorité n'est plus le pré-lancement mais la
> **distribution** (cf. doc 05 + doc 11). Concurrents FR émergents
> (Qwairy, Botrank) → la fenêtre se referme, exécuter maintenant.

1. **Crédit Perplexity** ($50 min) + `PERPLEXITY_API_KEY` en prod →
   5e provider auto-activé, pas de redeploy. **Seul item ops restant.**
2. **DISTRIBUTION (priorité n°1)** : posts LinkedIn réguliers + étude 50
   marques (doc 11 § 3.4 : 3 posts restants, 2 articles, 1 carrousel DA
   Mamie) + outreach direct communautés FR (SEO Camp, Slack/Discord SEO
   FR, WebRankInfo). Les posts seuls ne convertissent pas : coupler aux
   lead magnets + DM. Benchmark réaliste : premiers payants mois 3-6
   post-lancement.
3. **Drip d'éducation post-signup**.
4. **Gamification suite** (doc 02 § Gamification) : rang dans le weekly
   email, badges de statut N°1/Top 3 (dashboard + BrandSwitcher),
   événements de rang (V1). Surveiller le coût scoring systématique
   (`usage_counters.llmCostUsd`) après 2 semaines de prod.
5. **Suivi conversion lead magnets** (~4 semaines post-lancement) :
   express vs ex-funnel manuel, scans comparateurs → trial (PostHog) ;
   retirer la pastille « Nouveau » de la nav.

### Décisions verrouillées (rappel)

- DA app/marketing : Airbnb-like, Inter unique, bleu brand `#329CFF`
  (pivot 2026-06-03, ex-terracotta), CTA noir, pas d'italique.
- Domaine `mamie-geo.fr` + 301 défensif depuis `mamie-seo.fr`.
- Magic-link Brevo **REST API** (SMTP bloqué par IP whitelist Free).
- **Trial 14 j avec carte requise** (2026-06-08, remplace « pas de
  trial » du 2026-05-14). Stripe Tax. Garantie remboursement 14 j.
- Le Chat dès Starter, sans condition.
- Statut juridique : EI, bascule SAS/EURL mois 6-9 (plafond micro
  ~77 700 €/an).
- Hard-cap LLM : 200 % du quota → block + email + alerte interne.

À mettre à jour à chaque évolution majeure (changement de phase, sprint
terminé, gate franchie) — en remplaçant, pas en empilant.
