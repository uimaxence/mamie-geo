# 03 — Architecture technique

## Principes directeurs

1. **Mono-repo unique** — une seule app Next.js qui contient marketing, blog et app SaaS authentifiée. Pas de séparation prématurée.
2. **Stack alignée avec l'existant** — Next.js + TypeScript + Tailwind + Postgres + Stripe + Brevo (Max maîtrise déjà)
3. **Solo-friendly** — pas de microservices, pas de Kubernetes, pas de monorepo Turborepo
4. **Coûts variables maîtrisés** — les APIs LLM sont le poste de coût n°1, à instrumenter dès le jour 1
5. **EU-hosted par défaut** — Neon EU + Vercel EU edge
6. **Itération > perfection** — code lisible et testable plutôt que "scalable" prématurément

---

## Architecture en mono-repo

**Décision actée le 2026-05-05** : un seul repo `mamie-geo`, une seule app Next.js, un seul déploiement Vercel, un seul domaine `mamie-geo.fr`.

### Pourquoi mono-repo et pas séparation marketing / app

- Solo founder = un seul projet à maintenir
- Pas d'équipe à coordonner = pas besoin d'isolation par projet
- Stack unique = pas de duplication de design system
- Cohérence visuelle native (le marketing utilise les mêmes composants que l'app)
- Déploiement unique = simplicité opérationnelle

### Domaine et routes

| Zone          | URL                                      | Layout                              |
| ------------- | ---------------------------------------- | ----------------------------------- |
| Marketing     | `mamie-geo.fr/`                          | `(marketing)` route group           |
| Pricing       | `mamie-geo.fr/pricing`                   | `(marketing)`                       |
| À propos      | `mamie-geo.fr/about`                     | `(marketing)`                       |
| Outil gratuit | `mamie-geo.fr/outils/test-visibilite-ia` | `(marketing)`                       |
| Blog          | `mamie-geo.fr/blog` et `/blog/[slug]`    | `(blog)` route group                |
| Login         | `mamie-geo.fr/login`                     | layout dédié                        |
| App SaaS      | `mamie-geo.fr/app/*`                     | `(app)` route group avec auth check |
| API           | `mamie-geo.fr/api/*`                     | API routes                          |

Pas de subdomain `app.mamie-geo.fr` en V0 — un seul SSL, un seul cookie, simplicité maximale. Migration possible plus tard si besoin via middleware Next.js.

### Domaine mamie-seo.fr

`mamie-seo.fr` (pas de SEO ni trafic existant) est **redirigé en 301 vers `mamie-geo.fr`** dès le lancement. Un fichier `next.config.ts` gère ça côté code, ou directement dans Vercel/registrar. Le domaine reste loué 1-2 ans en sécurité avant de l'abandonner.

### Structure du repo

```
mamie-geo/
├── geo-project/                    # docs markdown (00 à 10)
├── CLAUDE.md                        # source de vérité Claude Code
├── README.md
├── package.json
├── next.config.ts
├── drizzle.config.ts
├── playwright.config.ts
├── vitest.config.ts
├── .env.example
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (marketing)/            # site public
│   │   │   ├── page.tsx            # /
│   │   │   ├── pricing/page.tsx
│   │   │   ├── about/page.tsx
│   │   │   ├── outils/test-visibilite-ia/page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (blog)/
│   │   │   ├── blog/page.tsx
│   │   │   ├── blog/[slug]/page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (app)/                  # SaaS authentifié
│   │   │   ├── app/dashboard/page.tsx
│   │   │   ├── app/prompts/page.tsx
│   │   │   ├── app/settings/page.tsx
│   │   │   └── layout.tsx          # auth check
│   │   │
│   │   ├── api/
│   │   │   ├── auth/[...all]/route.ts    # Better Auth
│   │   │   ├── webhooks/stripe/route.ts
│   │   │   └── cron/dispatch/route.ts
│   │   │
│   │   ├── login/page.tsx
│   │   └── layout.tsx              # root
│   │
│   ├── lib/                        # logique métier
│   │   ├── llm/                    # clients LLM par provider
│   │   ├── citation/               # détection + scoring
│   │   ├── auth/                   # Better Auth config
│   │   ├── stripe/
│   │   └── queue/                  # Postgres-based queue
│   │
│   ├── db/                         # Drizzle
│   │   ├── schema.ts
│   │   ├── client.ts
│   │   └── migrations/
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn customisé
│   │   ├── marketing/
│   │   ├── blog/
│   │   └── app/
│   │
│   ├── workers/                    # logique des jobs
│   │   ├── execute-prompt.ts
│   │   ├── score-response.ts
│   │   └── send-weekly-email.ts
│   │
│   └── content/                    # blog en MDX
│       ├── qu-est-ce-que-le-geo.mdx
│       └── ...
│
├── public/
└── tests/
    ├── e2e/                        # Playwright
    └── fixtures/                   # cassettes LLM
```

---

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                  Vercel Edge (EU) — un seul déploiement         │
│  ┌──────────────────┐    ┌──────────────────────────────────┐   │
│  │  Next.js 15      │    │   API Routes / Server Actions    │   │
│  │  - Marketing /   │    │   - Auth (Better Auth)           │   │
│  │  - Blog /blog    │◄──►│   - REST endpoints               │   │
│  │  - App /app      │    │   - Webhooks (Stripe, Brevo)     │   │
│  │  - Outil gratuit │    │   - Cron /api/cron/dispatch      │   │
│  └──────────────────┘    └────────────┬─────────────────────┘   │
└─────────────────────────────────────────┼───────────────────────┘
                                          │
                                          ▼
                    ┌─────────────────────────────────────┐
                    │     Postgres (Neon EU Frankfurt)    │
                    │  workspaces, brands, prompts, runs, │
                    │  citations, queue_jobs, ...         │
                    └─────────────────────────────────────┘
                                          ▲
                                          │
┌─────────────────────────────────────────┼───────────────────────┐
│           Vercel Cron toutes les 5 min → /api/cron/dispatch     │
│  ┌──────────────────────────────────────┴────────────────────┐  │
│  │  Workers (Postgres-based queue)                           │  │
│  │  - dispatch (claim N pending jobs, dispatch en parallèle) │  │
│  │  - execute-prompt (1 job = 1 prompt × 1 LLM)              │  │
│  │  - score-response (parsing + détection citations)         │  │
│  │  - send-weekly-email                                      │  │
│  └────────────┬──────────────────────────────────────────────┘  │
└───────────────┼──────────────────────────────────────────────────┘
                │
                ▼
   ┌───────────────────────────────────────────┐
   │      APIs externes (natives, pas OpenRouter)
   │  • OpenAI (ChatGPT + web_search)          │
   │  • Anthropic (Claude + web_search)        │
   │  • Mistral (Le Chat + tools web)          │
   │  • Perplexity (sonar online)              │
   │  • Google (Gemini + grounding)            │
   │  • Stripe + Stripe Tax                    │
   │  • Brevo (emails transactionnels)         │
   └───────────────────────────────────────────┘
```

---

## Stack V0 — Décisions verrouillées (cheap + scalable + testable)

**Critères de sélection** : (1) coût quasi-nul en V0 grâce aux free tiers, (2) chemin de mise à l'échelle clair sans réécrire, (3) testabilité native (pas de SDK lourd à mocker, pas d'API tierce inscrutable).

### Frontend

| Composant     | Choix                                                | Coût V0 | Justification                                                             |
| ------------- | ---------------------------------------------------- | ------- | ------------------------------------------------------------------------- |
| Framework     | **Next.js 15 (App Router)**                          | 0       | Connu, SSR, edge runtime EU, parfait pour Vercel                          |
| Langage       | **TypeScript strict**                                | 0       | Standard, type-safety pour tests                                          |
| Styling       | **Tailwind CSS v4**                                  | 0       | Rapide, peu de CSS custom                                                 |
| UI components | **shadcn/ui** customisé avec design tokens du doc 10 | 0       | On part de shadcn et on le customise pour ne pas avoir le look par défaut |
| Charts        | **Recharts**                                         | 0       | Suffit V0/V1, alternative Tremor si besoin de plus joli                   |
| Forms         | **React Hook Form + Zod**                            | 0       | Validation partagée front/back                                            |
| State serveur | **TanStack Query**                                   | 0       | Standard                                                                  |

### Backend

| Composant  | Choix                                   | Coût V0 | Justification                                                                                                                                                 |
| ---------- | --------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime    | **Node.js 22 LTS** sur Vercel           | inclus  | Standard                                                                                                                                                      |
| API        | **Next.js API Routes + Server Actions** | 0       | Pas de serveur Express                                                                                                                                        |
| ORM        | **Drizzle**                             | 0       | Plus léger que Prisma, edge-compatible, requêtes proches du SQL → tests plus simples, migrations versionnées en SQL pur                                       |
| Validation | **Zod**                                 | 0       | Cohérent avec le front, schémas réutilisables                                                                                                                 |
| Auth       | **Better Auth**                         | 0       | Open-source, free forever, pas de lock-in (vs Clerk $25/mo après 10K MAU). Stocke en Postgres → testable avec une DB de test, magic-link natif via Brevo SMTP |

### Base de données et stockage

| Composant          | Choix                             | Coût V0 | Justification                                                                                           |
| ------------------ | --------------------------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| Postgres           | **Neon EU (Frankfurt)** free tier | 0       | 0,5 GB inclus, branching natif (= une branche par PR pour tests E2E isolés), scale-to-zero, conforme EU |
| Cache / rate limit | **Upstash Redis** free tier       | 0       | 10K commandes/jour gratuites, suffit V0                                                                 |
| Storage fichiers   | **Cloudflare R2** free tier       | 0       | 10 GB/mois inclus, **zéro frais d'egress** (gros avantage vs S3), API S3-compatible                     |

### Workers et orchestration

| Composant         | Choix V0                                                            | Coût V0 | Migration scale                                     |
| ----------------- | ------------------------------------------------------------------- | ------- | --------------------------------------------------- |
| Queue             | **Postgres-based custom queue** + **Vercel Cron**                   | 0       | À migrer vers Inngest si > 100K runs/mois           |
| Cron              | **Vercel Cron** (un endpoint `/api/cron/dispatch` toutes les 5 min) | 0       | Idem                                                |
| Long-running jobs | Découpés en petits jobs idempotents (1 prompt × 1 LLM = 1 job)      | 0       | OK même sur Vercel Hobby (10s timeout) ou Pro (60s) |

> **Pourquoi Postgres-queue plutôt qu'Inngest en V0** : Inngest est super, mais son free tier est de 50K steps/mois et un Pro à 100 prompts × 5 LLMs × 30j = 15K runs ; à 10 clients on est déjà à 150K (+ retries) → on bascule vers le payant. Une queue Postgres custom (~150 lignes) est gratuite, parfaitement testable (on lit les rows directement dans les tests), et idempotente. Migration vers Inngest possible plus tard sans réécriture côté business logic.

### Observabilité et qualité

| Composant         | Choix                           | Coût V0 | Justification                                      |
| ----------------- | ------------------------------- | ------- | -------------------------------------------------- |
| Errors            | **Sentry** free tier            | 0       | 5K événements/mois inclus, suffit V0               |
| Analytics produit | **PostHog Cloud EU** free tier  | 0       | 1M événements/mois free, RGPD-friendly, EU         |
| Logs              | Postgres `events` + Vercel logs | 0       | On centralise les logs métier en BDD jusqu'à scale |
| Uptime            | **BetterStack** free tier       | 0       | 10 monitors gratuits                               |

### Email, paiement, comm

| Composant            | Choix          | Coût V0            | Justification                              |
| -------------------- | -------------- | ------------------ | ------------------------------------------ |
| Email transactionnel | **Brevo**      | 0                  | Déjà maîtrisé, 300 emails/jour free        |
| Email marketing      | **Brevo**      | 0                  | Mutualisation                              |
| Paiement             | **Stripe**     | variable seulement | Standard FR/EU, déjà maîtrisé              |
| TVA UE               | **Stripe Tax** | 0,5% du CA         | Indispensable pour vendre en UE proprement |

### LLMs (cf. discussion : pas d'OpenRouter pour le tracking)

| Usage                          | Choix                                                                         | Coût V0                 |
| ------------------------------ | ----------------------------------------------------------------------------- | ----------------------- |
| Tracking ChatGPT (avec search) | **OpenAI API** native, modèle `gpt-4o-mini` + `web_search` tool               | $0.15-0.60 / 1M tokens  |
| Tracking Claude (avec search)  | **Anthropic API** native, modèle `claude-haiku-4-5` + `web_search` tool       | $0.25-1.25 / 1M tokens  |
| Tracking Perplexity            | **Perplexity API** native, modèle `sonar` (search natif)                      | $1 / 1M tokens          |
| Tracking Gemini                | **Google AI Studio API** native, `gemini-2.5-flash` + grounding Google Search | $0.075-0.30 / 1M tokens |
| Tracking Le Chat               | **Mistral API** native, `mistral-large-latest` + tools web                    | €1.5-4.5 / 1M tokens    |
| Génération prompts onboarding  | **Anthropic Claude Haiku 4.5**                                                | inclus dans budget      |
| Scoring/parsing des réponses   | **Anthropic Claude Haiku 4.5**                                                | inclus dans budget      |

> **Pourquoi pas OpenRouter** : OpenRouter proxy les modèles mais n'expose pas fidèlement les capacités natives de recherche web (browse OpenAI, sonar Perplexity, grounding Google, tools Mistral). Or notre produit DOIT reproduire ce que l'utilisateur final voit dans l'app de chaque LLM. Fidélité = exigence non-négociable. En revanche, OpenRouter pourrait être utilisé plus tard pour le scoring si on veut multi-modèles à bas coût.

### Total coûts fixes infra V0

| Poste                                                       | Coût mensuel        |
| ----------------------------------------------------------- | ------------------- |
| Vercel **Pro** (commercial use, edge, bandwidth)            | $20                 |
| Neon free tier (passe en Pro à $19 quand on dépasse 0,5 GB) | 0 puis $19          |
| Upstash Redis free                                          | 0                   |
| Cloudflare R2 free                                          | 0                   |
| Sentry free                                                 | 0                   |
| PostHog free                                                | 0                   |
| BetterStack free                                            | 0                   |
| Brevo Lite (300 emails/jour)                                | €0 ou €19 si volume |
| Domaine + Google Workspace 1 user                           | $30                 |
| **Total V0**                                                | **~$50/mois**       |

À comparer aux $250-500/mois "estimés au doigt" du doc 04 d'origine. Le V0 réel est fortement free-tier.

### À l'échelle (mois 8-12, ~50 clients)

| Poste                       | Coût                               |
| --------------------------- | ---------------------------------- |
| Vercel Pro                  | $20                                |
| Neon Pro                    | $19-69                             |
| Inngest Pro (si migration)  | $20                                |
| Upstash Redis Pay-as-you-go | $5-15                              |
| R2 (croissance stockage)    | $5                                 |
| Sentry Team                 | $26                                |
| PostHog (au-delà du free)   | $0-50                              |
| BetterStack Pro             | $25                                |
| Brevo Business              | €69                                |
| **Total scale**             | **~$200-300/mois** + variables LLM |

---

## Schéma de base de données (V0)

### Vue d'ensemble

3 groupes de tables :

1. **Auth** (générées par Better Auth CLI) : `user`, `session`, `account`, `verification`
2. **Métier** : `workspaces`, `workspace_members`, `brands`, `competitors`, `prompts`, `runs`, `citation_metrics_daily`
3. **Plomberie** : `queue_jobs`, `events`, `subscription_events`, `usage_counters`, `prompt_cache`

### Tables Better Auth

Générées via `npx @better-auth/cli generate` puis importées dans
`src/db/schema.ts` (ne pas réécrire à la main, suivre la version officielle
Better Auth pour rester compatible avec les évolutions du package).

Tables attendues (V0, configuration magic-link uniquement) :

- **`user`** : `id`, `email UNIQUE`, `email_verified BOOLEAN`, `name`, `image`, `created_at`, `updated_at`
- **`session`** : `id`, `user_id FK→user`, `expires_at`, `token UNIQUE`, `ip_address`, `user_agent`, `created_at`, `updated_at`
- **`account`** : `id`, `user_id FK→user`, `provider_id`, `account_id`, `password` (non utilisé en magic-link), `created_at`, `updated_at`
- **`verification`** : `id`, `identifier`, `value`, `expires_at`, `created_at`, `updated_at`

> Note : on n'ajoute **pas** notre propre table `users` parallèle. Toutes les
> références applicatives (workspace_members, etc.) pointent sur `user.id`
> de Better Auth.

### Tables métier

```sql
-- ──────────────────────────────────────────────────────────────────────
-- Workspaces et membres
-- ──────────────────────────────────────────────────────────────────────

-- États possibles de workspaces.plan :
--   'trialing'   = trial 7j actif (pas de carte requise — pivot 2026-05-13)
--   'starter'    = abonnement Starter actif
--   'pro'        = abonnement Pro actif
--   'agency'     = abonnement Agence actif
--   'enterprise' = abonnement Enterprise actif
--   'past_due'   = paiement échoué, accès complet pendant 7j de relance Stripe
--   'expired'    = trial fini sans CB OU past_due > 7j → lecture seule, suppression à J+30
--   'canceled'   = annulé par l'utilisateur, accès jusqu'à fin de période payée
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'trialing'
    CHECK (plan IN ('trialing','starter','pro','agency','enterprise','past_due','expired','canceled')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,  -- aligné sur la facturation Stripe
  current_period_end   TIMESTAMPTZ,  -- idem
  hard_cap_hit_at TIMESTAMPTZ,       -- timestamp si quota 200% LLM atteint (block actif)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE workspace_members (
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,  -- FK vers Better Auth user.id
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('owner','admin','member','viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (workspace_id, user_id)
);

-- ──────────────────────────────────────────────────────────────────────
-- Marques trackées
-- ──────────────────────────────────────────────────────────────────────

CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  description TEXT,
  aliases TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_brands_workspace ON brands(workspace_id);

CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT,
  aliases TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_competitors_brand ON competitors(brand_id);

-- ──────────────────────────────────────────────────────────────────────
-- Prompts et runs
-- ──────────────────────────────────────────────────────────────────────

CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  category TEXT,  -- 'commercial', 'informational', 'comparison', ...
  language TEXT NOT NULL DEFAULT 'fr',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_prompts_brand_active ON prompts(brand_id) WHERE is_active = TRUE;

-- 1 run = 1 prompt × 1 LLM × 1 date planifiée
CREATE TABLE runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  llm TEXT NOT NULL
    CHECK (llm IN ('chatgpt','claude','perplexity','gemini','lechat')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','running','success','failed','skipped')),
  raw_response TEXT,
  parsed_citations JSONB,        -- [{ url, title, domain }]
  parsed_brands JSONB,           -- { target: {...}, competitors: [...] } cf. § "Algo détection"
  cost_usd DECIMAL(10, 6),
  duration_ms INTEGER,
  error TEXT,
  cache_hit BOOLEAN NOT NULL DEFAULT FALSE,  -- TRUE si servi depuis prompt_cache
  scheduled_at TIMESTAMPTZ NOT NULL,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_runs_prompt_executed ON runs(prompt_id, executed_at DESC);
CREATE INDEX idx_runs_scheduled_pending ON runs(scheduled_at) WHERE status = 'pending';

-- Vue matérialisée des dashboards (recalculée par worker journalier)
CREATE TABLE citation_metrics_daily (
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  llm TEXT NOT NULL,
  date DATE NOT NULL,
  total_runs INTEGER NOT NULL,
  brand_cited_count INTEGER NOT NULL,
  visibility_score DECIMAL(5, 2),  -- 0-100
  competitors_data JSONB,          -- { competitor_id: { citations, position_avg } }
  PRIMARY KEY (brand_id, llm, date)
);

-- ──────────────────────────────────────────────────────────────────────
-- Caching cross-clients (V0 optionnel, prévu mais peut-être désactivé)
-- ──────────────────────────────────────────────────────────────────────

-- Si deux workspaces trackent le même prompt textuellement identique sur
-- le même LLM, on ne paie qu'un seul appel par fenêtre de fraîcheur 24 h.
-- Économie estimée 20-40% sur Starter (cf. doc 03 § "Stratégies de réduction
-- des coûts"). Tableau ré-utilisé en lecture par le worker execute-prompt
-- avant tout nouvel appel LLM.
CREATE TABLE prompt_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_text_hash TEXT NOT NULL,   -- sha256(normalize(text))
  llm TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'fr',
  raw_response TEXT NOT NULL,
  parsed_citations JSONB,
  cost_usd DECIMAL(10, 6),
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,  -- = fetched_at + 24 h en V0
  UNIQUE (prompt_text_hash, llm, language)
);
CREATE INDEX idx_prompt_cache_lookup ON prompt_cache(prompt_text_hash, llm, language)
  WHERE expires_at > NOW();
```

### Tables plomberie

```sql
-- ──────────────────────────────────────────────────────────────────────
-- Queue Postgres-based (V0, ~150 lignes de code helpers)
-- ──────────────────────────────────────────────────────────────────────

CREATE TABLE queue_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL                        -- ex : 'execute_prompt', 'score_response', 'send_weekly_email'
    CHECK (kind IN ('execute_prompt','score_response','send_weekly_email','recompute_metrics')),
  payload JSONB NOT NULL,                   -- ex : { prompt_id, llm, run_id }
  idempotency_key TEXT NOT NULL UNIQUE,     -- ex : 'execute_prompt:{run_id}' ou 'execute_prompt:{prompt_id}:{llm}:{date}'
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','claimed','done','failed','dead')),
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  claimed_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_queue_jobs_claim
  ON queue_jobs(scheduled_at)
  WHERE status = 'pending';
CREATE INDEX idx_queue_jobs_dead
  ON queue_jobs(finished_at)
  WHERE status = 'dead';

-- ──────────────────────────────────────────────────────────────────────
-- Audit log applicatif (centralisation des événements métier en BDD)
-- ──────────────────────────────────────────────────────────────────────

-- Volontairement permissif sur le schéma (JSONB) : on logge tout ce qui a
-- une importance forensic ou produit. Purge à 90 jours (cron mensuel).
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  user_id TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  kind TEXT NOT NULL,                       -- ex : 'workspace.created', 'brand.added', 'run.completed', 'quota.warning_60', 'quota.hardcap_hit', 'plan.upgraded'
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_events_workspace_kind_created
  ON events(workspace_id, kind, created_at DESC);

-- ──────────────────────────────────────────────────────────────────────
-- Subscriptions
-- ──────────────────────────────────────────────────────────────────────

CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL
    CHECK (event_type IN ('trial_started','trial_extended','created','upgraded','downgraded','canceled','reactivated','past_due','expired')),
  from_plan TEXT,
  to_plan TEXT,
  stripe_event_id TEXT UNIQUE,              -- idempotence des webhooks Stripe
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_subscription_events_workspace ON subscription_events(workspace_id, created_at DESC);

-- ──────────────────────────────────────────────────────────────────────
-- Usage counters — fenêtre = mois de facturation Stripe
-- ──────────────────────────────────────────────────────────────────────

-- period_start est l'UTC date de début de la période courante de facturation
-- Stripe (= workspaces.current_period_start::DATE). Un nouveau cycle Stripe
-- (renouvellement, upgrade) crée une nouvelle ligne. Pas de période glissante.
-- Reset = INSERT sur webhook 'invoice.created' au début de chaque cycle.
CREATE TABLE usage_counters (
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  prompts_count INTEGER NOT NULL DEFAULT 0,
  runs_count INTEGER NOT NULL DEFAULT 0,
  llm_cost_usd DECIMAL(10, 4) NOT NULL DEFAULT 0,
  warned_at_60pct TIMESTAMPTZ,              -- alerte interne envoyée
  warned_at_100pct TIMESTAMPTZ,             -- email client envoyé
  hardcap_hit_at TIMESTAMPTZ,               -- block déclenché à 200%
  PRIMARY KEY (workspace_id, period_start)
);
```

### Idempotence des jobs LLM (formalisée)

Règle : **un job ne peut pas être enqueue deux fois pour la même clé logique**.
La colonne `idempotency_key TEXT UNIQUE NOT NULL` de `queue_jobs` matérialise
cette propriété. Format imposé par `kind` :

| `kind`              | format `idempotency_key`                                                                                  |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| `execute_prompt`    | `execute_prompt:{prompt_id}:{llm}:{scheduled_date_iso}` (ex : `execute_prompt:8fa1...:claude:2026-05-06`) |
| `score_response`    | `score_response:{run_id}`                                                                                 |
| `send_weekly_email` | `send_weekly_email:{workspace_id}:{iso_week}` (ex : `:2026-W18`)                                          |
| `recompute_metrics` | `recompute_metrics:{brand_id}:{date_iso}`                                                                 |

Algorithme `enqueue` :

```sql
INSERT INTO queue_jobs (kind, payload, idempotency_key, scheduled_at, max_attempts)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (idempotency_key) DO NOTHING
RETURNING id;
```

Si `RETURNING id` est vide, le job était déjà en BDD : pas d'erreur, juste un
no-op silencieux. Cron peut donc se redéclencher sans risque, et un dispatch
redémarré ne crée pas de doublon.

Algorithme `claim` (worker pull-based, `FOR UPDATE SKIP LOCKED` pour
parallélisme sûr) :

```sql
UPDATE queue_jobs
SET status = 'claimed', claimed_at = NOW(), attempts = attempts + 1
WHERE id IN (
  SELECT id FROM queue_jobs
  WHERE status = 'pending' AND scheduled_at <= NOW()
  ORDER BY scheduled_at
  LIMIT $batch_size
  FOR UPDATE SKIP LOCKED
)
RETURNING *;
```

Algorithme `complete` / `fail` :

- `complete` : `UPDATE ... SET status='done', finished_at=NOW()`
- `fail` (transient) : `UPDATE ... SET status='pending', last_error=$err, scheduled_at=NOW() + interval '1 hour'` si `attempts < max_attempts`, sinon `status='dead'`. Re-tentative h+1 puis h+6 (cf. doc 03 § "Fallback strategy").

### Algorithme du hard-cap LLM 200%

Implémenté dans `src/lib/llm/quota-guard.ts`, appelé **avant chaque appel LLM**
réel par le worker `execute-prompt`. Le hard-cap est 200% du quota théorique
mensuel calculé à partir du plan + nombre de prompts × LLMs × fréquence.

```ts
// pseudo-code, à implémenter Sprint 1
async function checkQuotaOrBlock(workspaceId: string): Promise<"ok" | "blocked"> {
  const ws = await db.workspaces.findById(workspaceId);
  if (ws.plan === "expired" || ws.plan === "canceled") return "blocked";
  if (ws.hard_cap_hit_at) return "blocked";

  const counter = await db.usageCounters.findCurrent(workspaceId);
  const theoreticalMaxRuns = computeTheoreticalRuns(ws.plan); // prompts × llms × jours du cycle
  const ratio = counter.runs_count / theoreticalMaxRuns;

  // Alerte interne à 60% (Slack/email Max), pas d'action client
  if (ratio >= 0.6 && !counter.warned_at_60pct) {
    await events.log({ workspaceId, kind: "quota.warning_60", payload: { ratio } });
    await db.usageCounters.update(workspaceId, { warned_at_60pct: now() });
    await alertInternal(`Workspace ${workspaceId} à ${(ratio * 100).toFixed(0)}%`);
  }

  // Alerte client à 100% du théorique, encore autorisé
  if (ratio >= 1.0 && !counter.warned_at_100pct) {
    await events.log({ workspaceId, kind: "quota.warning_100", payload: { ratio } });
    await db.usageCounters.update(workspaceId, { warned_at_100pct: now() });
    await sendEmail(ws, "quota_100pct");
  }

  // Hard-cap à 200% : block + email + alerte interne
  if (ratio >= 2.0) {
    await db.transaction(async (tx) => {
      await tx.usageCounters.update(workspaceId, { hardcap_hit_at: now() });
      await tx.workspaces.update(workspaceId, { hard_cap_hit_at: now() });
    });
    await events.log({ workspaceId, kind: "quota.hardcap_hit", payload: { ratio } });
    await sendEmail(ws, "quota_hardcap_blocked");
    await alertInternal(`HARD-CAP atteint sur ${workspaceId}, accès bloqué.`);
    return "blocked";
  }

  return "ok";
}
```

Le hard-cap est levé manuellement (admin UI ou requête SQL) après dialogue
client : pas de levée automatique. Reset du compteur uniquement au prochain
cycle de facturation Stripe (webhook `invoice.created`).

### Quotas par plan

| Plan             | Brands   | Concurrents | Prompts   | LLMs           | Fréquence | Historique |
| ---------------- | -------- | ----------- | --------- | -------------- | --------- | ---------- |
| Trial 7j (= Pro) | 3        | 10          | 100       | 5              | Quotidien | 90j        |
| Starter (49€)    | 1        | 5           | 25        | 5 dont Le Chat | Hebdo     | 90j        |
| Pro (149€)       | 3        | 10          | 100       | 5              | Quotidien | 1 an       |
| Agence (399€)    | 10       | 10/marque   | 300       | 5              | Quotidien | 1 an       |
| Enterprise       | illimité | illimité    | sur devis | 5+             | sur devis | illimité   |

---

## Stratégie LLM API — le cœur du modèle économique

### APIs ciblées

| LLM               | Modèle                           | Endpoint         | Web search ? | Coût input | Coût output |
| ----------------- | -------------------------------- | ---------------- | ------------ | ---------- | ----------- |
| ChatGPT           | gpt-4o-mini + `web_search` tool  | OpenAI API       | ✅           | $0.15/M    | $0.60/M     |
| Claude            | claude-haiku-4-5 + web_search    | Anthropic API    | ✅           | $0.25/M    | $1.25/M     |
| Perplexity        | sonar                            | Perplexity API   | ✅ natif     | $1/M       | $1/M        |
| Gemini            | gemini-2.5-flash + grounding     | Google AI Studio | ✅           | $0.075/M   | $0.30/M     |
| Le Chat (Mistral) | mistral-large-latest + web tools | Mistral API      | ✅           | €1.5/M     | €4.5/M      |

> **Important** : pour reproduire fidèlement ce qu'un utilisateur voit dans ChatGPT.com, il faut activer le browsing/search. Sinon on teste le modèle sans contexte web et on rate les vraies citations. C'est ce que font Profound et Peec.

### Estimation de coût par run

**Hypothèse théorique initiale** :

- 1 prompt envoyé → ~500 tokens input
- Réponse moyenne avec sources → ~1500 tokens output
- Coût moyen pondéré : ~$0.003 par appel LLM (ordre de grandeur)

**Mesure réelle au 2026-05-07** (cf. `09-decisions-journal.md` § 2026-05-07) :

| Modèle                         | Tokens in | Tokens out | Web search | Coût mesuré |
| ------------------------------ | --------- | ---------- | ---------- | ----------- |
| `claude-sonnet-4-6` + search 5 | 21 925    | 2 113      | 1          | ~$0,107     |

L'écart vient du tool serveur `web_search_20250305` qui injecte les
résultats de recherche (~5 ko/search) en input du modèle. L'estimation
$0.003 ignorait cet effet. **Conséquence Phase A** : le tracking V0
utilise `claude-haiku-4-5-20251001` ($1 in / $5 out) avec `max_uses=2`
et `max_tokens=4096` → coût mesuré attendu ~$0.02-0.04/run, soit ~5×
moins cher que Sonnet 4.6 et compatible avec la marge Starter.

La bascule Sonnet 4.6 (ou autre modèle plus cher) est replanifiée pour
Phase C (cf. `08-roadmap-execution.md`), avec arbitrage par plan
(Starter sur Haiku, Pro/Agency sur Sonnet) ou par feature flag par
workspace.

### Coût par client

| Plan          | Prompts × LLMs × jours | Runs/mois | Coût LLM/mois | Marge brute après LLM |
| ------------- | ---------------------- | --------- | ------------- | --------------------- |
| Starter (49€) | 25 × 5 × 4 (hebdo)     | 500       | ~$1.50        | ~96%                  |
| Pro (149€)    | 100 × 5 × 30           | 15 000    | ~$45          | ~70%                  |
| Agence (399€) | 300 × 5 × 30           | 45 000    | ~$135         | ~66%                  |

⚠️ **Le plan Pro est le moins margé.** À surveiller. Si les vrais coûts moyens sont 2x plus élevés (cas réels avec longues réponses), le Pro tombe à 40% de marge → renégocier le pricing ou réduire la fréquence par défaut.

### Stratégies de réduction des coûts

1. **Caching agressif** — si deux clients trackent le même prompt, on ne lance qu'une seule fois (avec un délai max de fraîcheur de 24h). Économie estimée : 20-40% côté Starter.
2. **Smart frequency** — détecter les prompts à faible variance (réponse stable depuis 7 jours) et passer en hebdo automatiquement même sur plan Pro
3. **Modèles moins chers pour le scoring** — utiliser Claude Haiku ou GPT-4o-mini pour analyser les réponses (pas pour les générer)
4. **Batch API** — quand disponible (Anthropic, OpenAI), 50% de réduction
5. **Retry intelligent** — pas de re-run sur erreur transitoire avant 1h
6. **Hard cap par client** — 200% du quota théorique max alors block et email
7. **Alerte interne** — si un client dépasse 60% de marge consommée, alerte slack/email

### Fallback strategy

Si un LLM est down ou hors quota, le run est marqué `failed` mais ne bloque pas les autres. Un retry est tenté à h+1 puis h+6. Au-delà, on skip le jour et on note dans le dashboard.

---

## Algorithme de détection des citations

### Approche en deux étapes

#### 1. Pre-screening regex (cheap)

- Recherche de la marque + aliases dans la réponse brute
- Recherche du domaine dans les URLs citées
- Si **aucun match**, pas la peine de payer un LLM pour scorer → skip

#### 2. LLM scoring (expensive mais précis)

Pour les réponses qui matchent au screening :

- Envoyer la réponse brute + nom de la marque + concurrents à Claude Haiku
- Demander en JSON :
  - La marque cible est-elle citée ? (oui / non)
  - Si oui, à quelle position dans la liste si liste il y a ? (1, 2, 3...)
  - Sentiment : positif, neutre, négatif
  - Concurrents cités : liste avec position

```typescript
const SCORING_PROMPT = `
Tu es un analyste d'IA. On t'envoie une réponse générée par un LLM à un prompt utilisateur.
Détermine si certaines marques y sont citées, leur position et le sentiment.

Marque cible : ${brand.name} (aliases : ${brand.aliases.join(", ")})
Concurrents : ${competitors.map((c) => c.name).join(", ")}

Réponse à analyser :
"""
${rawResponse}
"""

Retourne UNIQUEMENT un JSON valide de la forme :
{
  "target_cited": boolean,
  "target_position": number | null,
  "target_sentiment": "positive" | "neutral" | "negative" | null,
  "competitors": [
    { "name": string, "position": number | null }
  ],
  "sources_cited": [string]  // URLs ou domaines mentionnés
}
`;
```

### Edge cases à gérer

- Marques avec noms communs ("Boulanger" peut être un boulanger lambda) → confirmation par contexte LLM nécessaire
- Acronymes ("BNP" vs "BNP Paribas")
- Variations orthographiques
- Mentions sarcastiques ou négatives
- Sources sans URL claire (ex: "selon les experts du domaine")

---

## Sécurité et conformité RGPD

### Hébergement (choix verrouillés cf. doc 09)

- Postgres : **Neon EU (Frankfurt)**
- App : **Vercel EU** (région `cdg1` Paris pour les fonctions runtime)
- Stockage fichiers : **Cloudflare R2** (EU jurisdiction)
- Workers : **Postgres-based queue + Vercel Cron** (EU edge), migration Inngest EU à $20/mo prévue > 100K runs/mois

### Données personnelles

- Email + nom seulement (pas plus)
- Pas de données client final stockées (sauf si Agency)
- DPA standard mis à dispo des clients
- Politique RGPD sur le site dès J0
- Logs : 30 jours puis purge

### Authentification

- Magic link par défaut (pas de mot de passe à stocker = simpler + safer)
- 2FA optionnel via TOTP en V1
- SSO SAML en Enterprise (V2)

### Sécurité applicative

- Headers : CSP, HSTS, X-Frame-Options
- Rate limiting via Upstash sur les endpoints publics
- Secrets dans Vercel env vars ou Doppler
- Pas de service-side logging des prompts contenant données sensibles
- Audit trail des actions admin

### Conformité légale

- RGPD : registre des traitements, DPO si > 250 employés (pas le cas), DPIA si traitement à risque (pas le cas en V0)
- TVA : à collecter selon règles UE (Stripe Tax automatise)
- CGU + CGV + politique de confidentialité dès J0 (templates avocats SaaS FR)

---

## DevOps et déploiement

### Environnements

- **Local** : branche Neon dédiée par dev (`dev-{username}`), gratuite et instantanée. Pas de Docker Compose.
- **Preview** : auto sur chaque PR via Vercel + branche Neon dédiée par PR (gratuit)
- **Staging** : branche `staging` déployée sur `staging.mamie-geo.fr` (seed avec données fixtures)
- **Production** : branche `main` déployée sur `mamie-geo.fr` (path-based, pas de subdomain `app.`)

### CI/CD

- **GitHub Actions** : lint, type-check, tests unit, tests E2E, déploiement preview
- **Lint** : ESLint + Prettier + TypeScript strict mode
- **Tests bloquants** : aucun merge si tests rouges
- **Trunk-based** : pas de feature branches longues, PRs < 400 lignes

### Backups

- Postgres : point-in-time recovery natif Neon (7 jours sur free tier, plus sur Pro)
- Export hebdo automatique vers R2 (cron Vercel) pour worst-case
- Restore drill testé tous les 2 mois

### Monitoring

- Uptime BetterStack sur landing + API + endpoints critiques
- Sentry pour erreurs front + back
- PostHog pour funnels d'usage
- Dashboard interne (admin Mamie GEO) : MRR, runs/jour, coûts LLM/jour, churn, jobs en queue

---

## Stratégie de test (priorité projet solo)

Critère explicite : **un solo founder ne peut pas tester à la main 5 LLMs × 100 prompts à chaque déploiement**. La stack doit permettre une couverture de tests automatique sans payer cher en API LLM.

### Pyramide de tests

```
         ┌────────────────┐
         │  E2E Playwright│  5-10 scénarios critiques (signup, onboarding, payment, dashboard)
         └────────────────┘
       ┌────────────────────┐
       │ Integration Vitest │  20-40 tests : routes API, workers, queue, parsing
       └────────────────────┘
    ┌─────────────────────────┐
    │   Unit Vitest          │  100+ tests : fonctions pures, scoring, validation Zod
    └─────────────────────────┘
```

### Outils

- **Vitest** : unit + integration. Plus rapide que Jest, ESM natif, parfait avec TypeScript.
- **Playwright** : E2E sur les 5-10 flows business-critiques uniquement.
- **MSW (Mock Service Worker)** : intercepte les appels HTTP en test → on mock les LLMs.
- **Drizzle test mode** : utilise une vraie BDD test (branche Neon dédiée ou Postgres local) avec rollback transactionnel entre tests.
- **Faker.js / @faker-js/faker** : générer des fixtures réalistes en français.

### Stratégie LLM en test

Les appels LLM en test sont **interdits** (lents, chers, non-déterministes). Trois patterns :

1. **Cassettes (recordings)** : on enregistre une fois la vraie réponse de chaque LLM pour 20 prompts types, on sauvegarde en JSON, on rejoue en test. Outils : `nock` ou `MSW` avec des fixtures statiques.

2. **Faux clients LLM** : on définit une interface `LLMClient` et on a deux implémentations : `RealLLMClient` (prod) et `FakeLLMClient` (test). En test, le fake retourne des réponses configurées par scénario. Pattern Strategy / dependency injection.

3. **Snapshot tests sur le scoring** : on alimente le détecteur de citation avec une réponse LLM fixe et on vérifie que le scoring retourne le bon JSON. Pas d'appel LLM, juste regex + parsing.

### Données de test

- **Fixtures français réalistes** : marques fictives (`Boucherie du Centre`, `LeMagDigital`, etc.), prompts FR, concurrents.
- **Snapshot d'une journée type** : 1 workspace + 3 marques + 25 prompts + 5 LLMs × 7 jours = base de test "proche de la prod".
- **Seed scripts versionnés** : `pnpm db:seed:dev`, `pnpm db:seed:test`, `pnpm db:seed:demo` (pour démos clients).

### CI

Sur chaque PR :

1. Lint + type-check (~15 secondes)
2. Unit tests Vitest (~30 secondes)
3. Integration tests sur Postgres test (~1-2 minutes)
4. Playwright E2E sur preview Vercel + branche Neon dédiée (~3-5 minutes)
5. Total < 10 minutes pour merger

### Tests business-critiques en E2E (les seuls obligatoires)

1. Signup → onboarding → premier rapport visible
2. Upgrade Starter → Pro via Stripe
3. Cancel abonnement
4. Ajout d'une marque + prompts → 1 run de test → résultat affiché
5. Export CSV
6. Login magic link
7. Page facturation Stripe Customer Portal accessible

Tout le reste = tests unit/integration suffisent.

---

## Décisions techniques verrouillées

Après analyse coût × scalabilité × testabilité, voici les choix actés pour V0. À reporter dans 09-decisions-journal.md.

| Domaine                     | Choix                                                             | Pourquoi                                                                                               |
| --------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Framework**               | Next.js 15 App Router                                             | Connu, edge EU, ecosystem                                                                              |
| **Langage**                 | TypeScript strict                                                 | Type-safety pour tests                                                                                 |
| **Styling**                 | Tailwind v4 + shadcn customisé                                    | Cf. doc 10 design                                                                                      |
| **Auth**                    | Better Auth                                                       | Open source, free, testable, pas de lock-in                                                            |
| **ORM**                     | Drizzle                                                           | Léger, edge-compatible, SQL-first → tests simples                                                      |
| **Postgres**                | Neon EU free tier                                                 | Branching pour tests, scale-to-zero, EU                                                                |
| **Cache/rate limit**        | Upstash Redis free                                                | 10K cmd/jour gratuites                                                                                 |
| **Storage**                 | Cloudflare R2 free                                                | 0 frais d'egress, 10 GB free                                                                           |
| **Queue V0**                | Postgres-based custom + Vercel Cron                               | Gratuit, testable, idempotent                                                                          |
| **Queue scale**             | Inngest (migration > 100K runs/mois)                              | DX premium quand on peut payer                                                                         |
| **Hébergement (mono-repo)** | Vercel Pro $20/mo                                                 | Une seule app Next.js pour marketing + blog + app SaaS, edge EU, preview deployments, intégration Neon |
| **Errors**                  | Sentry free                                                       | Standard                                                                                               |
| **Analytics produit**       | PostHog Cloud EU free                                             | RGPD, 1M events free                                                                                   |
| **Uptime**                  | BetterStack free                                                  | 10 monitors gratuits                                                                                   |
| **Email transactionnel**    | Brevo                                                             | Déjà maîtrisé, EU                                                                                      |
| **Paiement**                | Stripe + Stripe Tax                                               | Standard, TVA UE auto                                                                                  |
| **LLMs tracking**           | APIs natives (OpenAI / Anthropic / Mistral / Perplexity / Google) | Fidélité aux réponses utilisateur                                                                      |
| **LLM scoring**             | Anthropic Claude Haiku 4.5                                        | Cheap + JSON mode fiable                                                                               |
| **Tests unit/integration**  | Vitest + MSW + Drizzle                                            | Rapide, déterministe                                                                                   |
| **Tests E2E**               | Playwright sur 7 flows critiques                                  | Couverture business                                                                                    |
| **CI**                      | GitHub Actions                                                    | Standard                                                                                               |

### Décisions restantes (à trancher en Sprint 0)

- [ ] **Naming définitif** + domaine : ☐ mamie-geo.fr ☐ autre
- [ ] **Direction artistique** : ☐ A (éditorial chaud) ☐ B (souverain) ☐ C (studio indie) — cf. doc 10
- [ ] **Stack marketing site** : ☐ Framer ☐ Astro ☐ Next.js + template — cf. doc 10
- [ ] **Statut juridique** : ☐ EI continue ☐ SAS dès lancement

---

## Roadmap technique par version

### V0 (semaines 1-8) — Livré 2026-05

- Stack de base + Auth Better Auth magic-link + Stripe billing complet
- Onboarding wizard 3 étapes + bouton skip (`quickSetup`) + suggestion IA prompts
- Worker `execute_prompt` (Phase A Haiku 4.5, Phase C ajoutera OpenAI / Mistral / Perplexity / Google)
- Détection citation (regex + scoring qualitatif Claude Haiku)
- Dashboard principal (Stat cards + AreaChart + BreakdownBars)
- Pages CRUD `/app/prompts`, `/app/competitors`, `/app/settings` (édition workspace + brand aliases)
- Email hebdo (`send_weekly_email` worker)
- Plans Solo / Starter / Pro avec quotas + cadence per-plan (`daily` ou `weekly`)
- **Hard-cap LLM 200 %** (`src/lib/hardcap/`) — bloque les workspaces qui dépassent + emails warning 60/100/200 %
- **SSE temps réel** `/api/runs/events` + `<RunActivityBar>` + toasts à chaque transition
- **One-shot run gratuit post-onboarding** (1 prompt × Claude ~$0,04 par signup)
- **Blog content-driven** `src/content/blog/*.mdx` + JSON-LD Article/FAQPage/BreadcrumbList + OG image dynamique + sitemap.ts + robots.ts
- **Outil audit technique site sans LLM** `/outils/audit-technique` (30+ checks, knowledge base recommandations rédigée main, PageSpeed Insights API)
- Lead magnet existant `/outils/test-visibilite-ia`
- Page interne `/styleguide` (noindex) — référence visuelle complète du design system

### V1 (mois 3-6)

- Crawler AI-readiness
- Score AI-readiness + recommandations
- Recrawl périodique
- Vue concurrents avancée
- Notifications Slack
- API basic (read-only)

### V2 (mois 6-12)

- Multi-workspaces
- Marque blanche
- Rapports PDF auto
- Intégrations GA4 + Search Console
- API write
- Webhooks

### V3 (mois 12-18)

- Prompt Library FR par secteur
- Sentiment analysis avancé
- AI Traffic Attribution
- Mobile app (si demandé)

---

→ Voir [04-pricing-business-model.md](./04-pricing-business-model.md) pour l'impact financier.
→ Voir [10-design-direction.md](./10-design-direction.md) pour les choix de design.
