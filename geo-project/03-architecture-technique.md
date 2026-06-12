# 03 — Architecture technique

> Doc de référence technique : stack, schéma BDD, coûts LLM, stratégie de
> test. Statut au 2026-06-11 : Phases A/B/C livrées, V0+ pré-lancement.

## Principes directeurs

1. **Mono-repo unique** — une seule app Next.js (marketing + blog + SaaS)
2. **Stack alignée avec l'existant** — Next.js + TS + Tailwind + Postgres + Stripe + Brevo (Max maîtrise déjà)
3. **Solo-friendly** — pas de microservices, pas de Kubernetes, pas de Turborepo
4. **Coûts variables maîtrisés** — APIs LLM = poste de coût n°1, instrumenté dès J1
5. **EU-hosted par défaut** — Neon EU + Vercel EU edge
6. **Itération > perfection** — lisible et testable plutôt que "scalable" prématuré

---

## Architecture en mono-repo

**Décision actée le 2026-05-05** : un seul repo `mamie-geo`, une seule app
Next.js, un seul déploiement Vercel, un seul domaine `mamie-geo.fr`.

### Pourquoi mono-repo et pas séparation marketing / app

Solo founder : un seul projet, un seul design system, un seul déploiement,
cohérence visuelle native (le marketing utilise les composants de l'app).

### Domaine et routes

État réel des routes (vérifié code 2026-06-11) :

| Zone               | URL                                                | Layout / notes |
| ------------------ | -------------------------------------------------- | -------------- |
| Marketing          | `/`, `/pricing`, `/demo`, `/legal/*`               | `(marketing)` |
| Outils gratuits    | `/outils/test-visibilite-ia`, `/outils/audit-technique` | `(marketing)` — audit inclut section « Crawlabilité bots IA » (V0+ livré) |
| Comparatif vs Profound | `/vs/profound`                                 | `(marketing)` |
| Comparatifs V0+    | publiés comme articles `/blog/*` (vs Peec AI / Otterly / Rankscale, 2026-06-08) | route dédiée `/comparatifs/[slug]` reportée V1 si traction (cf. doc 06) |
| Blog               | `/blog`, `/blog/[slug]`                            | `(blog)` |
| Login              | `/login`                                           | layout dédié |
| App SaaS           | `/app/dashboard`, `/app/prompts(+/[id])`, `/app/citations` (`?tab=ranking`), `/app/audits(+/new,/[id],/compare)`, `/app/conseils`, `/app/runs/[id]`, `/app/settings`, `/app/onboarding` | `(app)` route group, auth check |
| URL drill-down     | `/app/citations/sources/[id]`                      | livré 2026-06-08 (planifié `/app/sources/[id]`, rangé sous citations) |
| Admin              | `/app/admin/visuals`                               | guard email Max, visuels LinkedIn 1080×1350 |
| API                | `/api/auth/*`, `/api/checkout`, `/api/portal`, `/api/webhooks/{stripe,brevo}`, `/api/cron/*`, `/api/runs/events` (SSE), `/api/blog/notify-publish` | API routes |
| CSV exports        | `/api/export/{runs,metrics}.csv`                   | auth + scope workspace, livré 2026-06-08 |

Pas de subdomain `app.mamie-geo.fr` en V0 — un seul SSL, un seul cookie.
Migration possible plus tard via middleware Next.js. Pas de page `/about`
(prévue à l'origine, jamais construite).

### Domaine mamie-seo.fr

301 vers `mamie-geo.fr` (géré dans `next.config.ts`). Domaine loué 1-2 ans
en sécurité avant abandon.

### Structure du repo

```
mamie-geo/
├── geo-project/                    # docs markdown (00 à 10)
├── CLAUDE.md                       # source de vérité Claude Code
├── next.config.ts / drizzle.config.ts / playwright.config.ts / vitest.config.ts
├── .env.example
│
├── src/
│   ├── app/
│   │   ├── (marketing)/            # site public (+ _sections, outils, legal, vs)
│   │   ├── (blog)/                 # /blog, /blog/[slug]
│   │   ├── (app)/                  # SaaS authentifié : app/(with-nav)/* + onboarding + admin
│   │   ├── api/                    # auth, checkout, portal, webhooks, cron, export
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   │
│   ├── lib/                        # logique métier : llm/, citation/, auth/,
│   │                               # stripe/, queue/, audit/, plans/, hardcap/,
│   │                               # email/, metrics/, competitors/, csv/, ...
│   ├── db/                         # schema.ts, client.ts, migrations/
│   ├── components/                 # ui/ (shadcn customisé), marketing/, blog/, app/
│   ├── workers/                    # execute-prompt, score-response, send-weekly-email, ...
│   └── content/blog/               # articles MDX
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
│  │  - Marketing /   │◄──►│   - Auth (Better Auth)           │   │
│  │  - Blog /blog    │    │   - Webhooks (Stripe, Brevo)     │   │
│  │  - App /app      │    │   - Cron /api/cron/*             │   │
│  └──────────────────┘    └────────────┬─────────────────────┘   │
└─────────────────────────────────────────┼───────────────────────┘
                                          ▼
                    ┌─────────────────────────────────────┐
                    │     Postgres (Neon EU Frankfurt)    │
                    │  workspaces, brands, prompts, runs, │
                    │  citation_metrics_daily, queue_jobs │
                    └─────────────────────────────────────┘
                                          ▲
┌─────────────────────────────────────────┼───────────────────────┐
│  Vercel Cron 5 min → /api/cron/dispatch (queue Postgres)        │
│  Workers : execute-prompt (1 prompt × 1 LLM = 1 job),           │
│  score-response, recompute_metrics, send-weekly-email,          │
│  audit_workspace_url                                            │
└───────────────┼──────────────────────────────────────────────────┘
                ▼
   APIs externes natives (pas OpenRouter) : OpenAI (web_search),
   Anthropic (web_search), Mistral, Perplexity (sonar), Google
   (grounding), Stripe + Stripe Tax, Brevo
```

---

## Stack V0 — Décisions verrouillées (cheap + scalable + testable)

Critères : (1) coût quasi-nul via free tiers, (2) chemin de scale sans
réécriture, (3) testabilité native. Détail des justifications : doc 09 §
2026-05-05.

### Frontend

| Composant     | Choix                                  | Coût V0 |
| ------------- | -------------------------------------- | ------- |
| Framework     | **Next.js 15 (App Router)**            | 0 |
| Langage       | **TypeScript strict**                  | 0 |
| Styling       | **Tailwind CSS v4**                    | 0 |
| UI components | **shadcn/ui** customisé (tokens doc 10) | 0 |
| Charts        | **Recharts**                           | 0 |
| Forms         | **React Hook Form + Zod**              | 0 |
| State serveur | **TanStack Query**                     | 0 |

### Backend

| Composant  | Choix                                   | Coût V0 | Note |
| ---------- | --------------------------------------- | ------- | ---- |
| Runtime    | **Node.js 22 LTS** sur Vercel           | inclus  | |
| API        | **Next.js API Routes + Server Actions** | 0       | pas de serveur Express |
| ORM        | **Drizzle**                             | 0       | edge-compatible, SQL-first, migrations SQL versionnées |
| Validation | **Zod**                                 | 0       | schémas partagés front/back |
| Auth       | **Better Auth**                         | 0       | free forever, pas de lock-in (vs Clerk $25/mo après 10K MAU), stocke en Postgres, magic-link via Brevo |

### Base de données et stockage

| Composant          | Choix                             | Coût V0 | Note |
| ------------------ | --------------------------------- | ------- | ---- |
| Postgres           | **Neon EU (Frankfurt)** free tier | 0       | 0,5 GB inclus, branching natif (1 branche/PR pour tests), scale-to-zero |
| Cache / rate limit | **Upstash Redis** free tier       | 0       | 10K commandes/jour |
| Storage fichiers   | **Cloudflare R2** free tier       | 0       | 10 GB/mois, zéro egress, API S3-compatible |

### Workers et orchestration

| Composant         | Choix V0                                          | Migration scale |
| ----------------- | ------------------------------------------------- | --------------- |
| Queue             | **Postgres-based custom** (~150 lignes helpers)   | Inngest si > 100K runs/mois |
| Cron              | **Vercel Cron** (dispatch toutes les 5 min)       | idem |
| Long-running jobs | découpés en jobs idempotents (1 prompt × 1 LLM = 1 job) | OK timeouts Vercel (Hobby 10s / Pro 60s) |

> Pourquoi pas Inngest en V0 : free tier 50K steps/mois ; 1 Pro = 15K
> runs/mois, 10 clients = 150K (+ retries) → payant immédiat. La queue
> Postgres est gratuite, testable (lecture directe des rows en test),
> idempotente. Migration Inngest possible sans réécrire la business logic.

### Observabilité et qualité

| Composant         | Choix                           | Note |
| ----------------- | ------------------------------- | ---- |
| Errors            | **Sentry** free                 | 5K événements/mois |
| Analytics produit | **PostHog Cloud EU** free       | 1M événements/mois, RGPD |
| Logs              | Postgres `events` + Vercel logs | logs métier en BDD jusqu'à scale |
| Uptime            | **BetterStack** free            | 10 monitors |

### Email, paiement, comm

| Composant            | Choix          | Coût V0 |
| -------------------- | -------------- | ------- |
| Email transac + marketing | **Brevo** | 0 (300 emails/jour free) |
| Paiement             | **Stripe**     | variable |
| TVA UE               | **Stripe Tax** | 0,5% du CA |

### LLMs (cf. discussion : pas d'OpenRouter pour le tracking)

Les 5 providers tracking sont **livrés** (Phase C, 2026-05-18). Perplexity :
code prêt, en attente d'achat crédit ($50 min) + `PERPLEXITY_API_KEY`.
Activation automatique via `getConfiguredLLMs()` (`src/lib/llm/index.ts`) :
provider actif si env var présente **et** `IMPLEMENTED_LLMS[llm] === true`.

| Usage                          | Choix                                                            | Tarif API |
| ------------------------------ | ----------------------------------------------------------------- | --------- |
| Tracking ChatGPT               | OpenAI native, `gpt-4o-mini` + `web_search` (Responses API)       | $0.15-0.60 / 1M tokens |
| Tracking Claude                | Anthropic native, `claude-haiku-4-5-20251001` + `web_search_20250305` | $0.25-1.25 / 1M tokens (note : tarif réel Haiku 4.5 = $1 in / $5 out, cf. § coût par run) |
| Tracking Perplexity            | Perplexity native, `sonar` (search natif)                         | $1 / 1M tokens |
| Tracking Gemini                | Google AI Studio, `gemini-2.5-flash` + grounding Search           | $0.075-0.30 / 1M tokens |
| Tracking Le Chat               | Mistral native, `mistral-large-latest` + tools web                | €1.5-4.5 / 1M tokens |
| Génération prompts onboarding  | Claude Haiku 4.5 (`suggestPrompts`)                               | inclus budget |
| Scoring/parsing des réponses   | Claude Haiku 4.5 (tool_use forcé)                                 | ~$0,003/scoring |

> **Pourquoi pas OpenRouter** : il n'expose pas fidèlement les capacités
> natives de recherche web (browse OpenAI, sonar, grounding Google, tools
> Mistral) or le produit DOIT reproduire ce que voit l'utilisateur final
> dans chaque app LLM. Fidélité non-négociable (idem Profound / Peec).
> OpenRouter envisageable plus tard pour le scoring multi-modèles à bas coût.

### Total coûts fixes infra V0

| Poste                                                       | Coût mensuel |
| ----------------------------------------------------------- | ------------ |
| Vercel **Pro** (commercial use, edge, bandwidth)            | $20 |
| Neon free (→ Pro $19 au-delà de 0,5 GB)                     | 0 puis $19 |
| Upstash / R2 / Sentry / PostHog / BetterStack free          | 0 |
| Brevo Lite                                                  | €0 ou €19 si volume |
| Domaine + Google Workspace 1 user                           | $30 |
| **Total V0**                                                | **~$50/mois** |

(Versus les $250-500/mois estimés au doigt dans le doc 04 d'origine.)

### À l'échelle (mois 8-12, ~50 clients)

| Poste | Coût |
| ----- | ---- |
| Vercel Pro $20 + Neon Pro $19-69 + Inngest Pro $20 (si migration) | ~$60-110 |
| Upstash $5-15 + R2 $5 + Sentry Team $26 + PostHog $0-50 + BetterStack $25 | ~$60-120 |
| Brevo Business | €69 |
| **Total scale** | **~$200-300/mois** + variables LLM |

---

## Schéma de base de données (V0)

### Vue d'ensemble

19 tables dans `src/db/schema.ts`, 3 groupes :

1. **Auth** (Better Auth CLI) : `user`, `session`, `account`, `verification`
2. **Métier** : `workspaces`, `workspace_members`, `brands`, `competitors`, `prompts`, `runs`, `citation_metrics_daily`, `prompt_cache`, `technical_audits`, `audit_counters`, `comparator_scans`
3. **Plomberie** : `queue_jobs`, `events`, `subscription_events`, `usage_counters`

Migrations versionnées : `0000_many_human_torch` (schéma initial),
`0001_thick_husk` (enum plan + `solo`, 2026-05-14), `0002_classy_joshua_kane`
(`technical_audits` + `audit_counters` + kind `audit_workspace_url`,
2026-05-17), `0003_giant_jean_grey` (`brands.paused_at`, 2026-06-08),
`0004_salty_molten_man` (funnel sources, 2026-06-08),
`0005_per_prompt_cadence` (`prompts.cadence`, 2026-06-08),
`0006_slimy_xorn` (`comparator_scans`, 2026-06-12), `0007_calm_nomad`
(`comparator_scans.location`, 2026-06-12).

### Tables Better Auth

Générées via `npx @better-auth/cli generate`, importées dans
`src/db/schema.ts` (ne pas réécrire à la main). Config magic-link uniquement :

- **`user`** : `id`, `email UNIQUE`, `email_verified`, `name`, `image`, timestamps
- **`session`** : `id`, `user_id FK`, `expires_at`, `token UNIQUE`, `ip_address`, `user_agent`, timestamps
- **`account`** : `id`, `user_id FK`, `provider_id`, `account_id`, `password` (inutilisé), timestamps
- **`verification`** : `id`, `identifier`, `value`, `expires_at`, timestamps

Pas de table `users` applicative parallèle : tout référence `user.id` Better Auth.

### Tables métier

```sql
-- États de workspaces.plan (enum complet depuis migration 0001) :
--   'trialing'   = compte sans subscription active. Quotas 0 → aucun run.
--                  Depuis 2026-06-08 : trial Stripe 14 j AVEC carte requise
--                  (subscription.status='trialing', trial_ends_at rempli) —
--                  remplace « pas de trial auto » (2026-05-14), cf. doc 09.
--   'solo' | 'starter' | 'pro' | 'agency' | 'enterprise' = abonnement actif
--   'past_due'   = paiement échoué, accès complet 7 j de relance Stripe
--   'expired'    = past_due > 7 j ou trial annulé → lecture seule, suppression J+30
--   'canceled'   = annulé, accès jusqu'à fin de période payée
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'trialing'
    CHECK (plan IN ('trialing','solo','starter','pro','agency','enterprise','past_due','expired','canceled')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,  -- aligné facturation Stripe
  current_period_end   TIMESTAMPTZ,
  hard_cap_hit_at TIMESTAMPTZ,       -- posé si quota 200% LLM atteint (block actif)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE workspace_members (
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('owner','admin','member','viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (workspace_id, user_id)
);

CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  description TEXT,
  aliases TEXT[] NOT NULL DEFAULT '{}',
  paused_at TIMESTAMPTZ,  -- migration 0003 : si non NULL, scheduler skip (Pause/Resume sans perte de setup)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_brands_workspace ON brands(workspace_id);
CREATE INDEX idx_brands_active ON brands(workspace_id) WHERE paused_at IS NULL;

CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT,
  aliases TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_competitors_brand ON competitors(brand_id);

CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  category TEXT,  -- 'commercial', 'informational', 'comparison', ...
  language TEXT NOT NULL DEFAULT 'fr',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  cadence TEXT NOT NULL DEFAULT 'inherit'
    CHECK (cadence IN ('inherit','daily','weekly','monthly')),
    -- migration 0005 : override per-prompt de la cadence per-plan.
    -- Cadence effective scheduler = cadence != 'inherit' ? cadence : plan.cadence
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

-- Agrégat dashboards, recalculé par worker recompute_metrics.
-- competitors_data historise les mentions concurrents par jour × LLM depuis
-- la Phase A — c'est la source du leaderboard « Classement » (2026-06-10).
CREATE TABLE citation_metrics_daily (
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  llm TEXT NOT NULL,
  date DATE NOT NULL,
  total_runs INTEGER NOT NULL,
  brand_cited_count INTEGER NOT NULL,
  visibility_score DECIMAL(5, 2),  -- 0-100
  competitors_data JSONB,          -- { competitor_id: { citations, position_avg } }
  -- Funnel sources (migration 0004, calculé depuis runs.parsed_citations,
  -- helper src/lib/citation/source-match.ts ; pas de backfill rétro —
  -- les anciens runs restent à 0) :
  retrieved_count   INTEGER NOT NULL DEFAULT 0,  -- nb runs où ≥1 source de la marque apparaît
  retrievals_total  INTEGER NOT NULL DEFAULT 0,  -- somme des apparitions
  citations_count   INTEGER NOT NULL DEFAULT 0,  -- retrievals convertis en citation explicite
  -- Ratios dérivés à la lecture : Apparition = retrieved/total_runs ;
  -- Fréquence = retrievals_total/retrieved_count ; Citation = citations/retrievals_total
  PRIMARY KEY (brand_id, llm, date)
);

-- Caching cross-clients : si 2 workspaces trackent le même prompt sur le
-- même LLM, 1 seul appel par fenêtre 24 h. Économie estimée 20-40% Starter.
-- ⚠️ État 2026-06-11 : table définie dans le schéma mais NON branchée
-- (le worker execute-prompt n'y lit/écrit pas encore).
CREATE TABLE prompt_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_text_hash TEXT NOT NULL,   -- sha256(normalize(text))
  llm TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'fr',
  raw_response TEXT NOT NULL,
  parsed_citations JSONB,
  cost_usd DECIMAL(10, 6),
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,  -- = fetched_at + 24 h
  UNIQUE (prompt_text_hash, llm, language)
);
CREATE INDEX idx_prompt_cache_lookup ON prompt_cache(prompt_text_hash, llm, language)
  WHERE expires_at > NOW();

-- Audits techniques app (migration 0002, Sprint 6 PR B — cf. doc 09 § 2026-05-17).
-- Historise les audits lancés depuis l'app (le lead magnet public ne persiste rien).
CREATE TABLE technical_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,  -- NULL pour audits concurrents
  url TEXT NOT NULL,                 -- URL réellement auditée
  is_competitor BOOLEAN NOT NULL DEFAULT FALSE,  -- filtre compare + pas d'alerte concurrent
  score_global INTEGER NOT NULL,     -- 0-100 pondéré (computeGlobalScore)
  sub_scores JSONB NOT NULL,         -- SEO/GEO/A11y/Perf
  checks JSONB NOT NULL,             -- liste complète pour replay du rapport
  html_size_kb DECIMAL(10,2),
  http_status INTEGER NOT NULL,
  psi_unavailable BOOLEAN NOT NULL DEFAULT FALSE,
  fetched_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_technical_audits_workspace_created ON technical_audits(workspace_id, created_at);
CREATE INDEX idx_technical_audits_workspace_url ON technical_audits(workspace_id, url);

-- Quota audits par mois calendaire UTC (period_start = YYYY-MM-01)
CREATE TABLE audit_counters (
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  audits_count INTEGER NOT NULL DEFAULT 0,             -- audits "owned"
  competitor_audits_count INTEGER NOT NULL DEFAULT 0,  -- quota séparé concurrents
  PRIMARY KEY (workspace_id, period_start)
);

-- Leads + données du free tool /outils/comparateurs (doc 06 § n°1ter).
-- Pas de FK : table publique pré-signup. checks = ComparatorCheck[]
-- (domaine, origine étude/recherche, présence, URL trouvée, type de
-- site + conseil d'inclusion Mistral). Alimente la typologie de
-- sources (V1) et l'intelligence par niche (agrégation par
-- sector_normalized).
CREATE TABLE comparator_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  sector TEXT NOT NULL,
  sector_normalized TEXT NOT NULL,
  location TEXT,                -- ville/zone si visibilité locale (PME)
  website_domain TEXT,
  present_count INTEGER NOT NULL,
  total_checked INTEGER NOT NULL,
  checks JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_comparator_scans_sector ON comparator_scans(sector_normalized);
CREATE INDEX idx_comparator_scans_created ON comparator_scans(created_at);
CREATE INDEX idx_comparator_scans_email ON comparator_scans(email);
```

### Tables plomberie

```sql
CREATE TABLE queue_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL
    CHECK (kind IN ('execute_prompt','score_response','send_weekly_email',
                    'recompute_metrics','audit_workspace_url')),
  payload JSONB NOT NULL,                   -- ex : { prompt_id, llm, run_id }
  idempotency_key TEXT NOT NULL UNIQUE,
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
CREATE INDEX idx_queue_jobs_claim ON queue_jobs(scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_queue_jobs_dead  ON queue_jobs(finished_at)  WHERE status = 'dead';

-- Audit log applicatif. JSONB permissif (forensic + produit). Purge 90 j.
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  user_id TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  kind TEXT NOT NULL,   -- 'workspace.created', 'run.completed', 'quota.hardcap_hit', 'trial_email_sent', ...
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_events_workspace_kind_created ON events(workspace_id, kind, created_at DESC);

CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL
    CHECK (event_type IN ('trial_started','trial_extended','created','upgraded',
                          'downgraded','canceled','reactivated','past_due','expired')),
  from_plan TEXT,
  to_plan TEXT,
  stripe_event_id TEXT UNIQUE,   -- idempotence des webhooks Stripe
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_subscription_events_workspace ON subscription_events(workspace_id, created_at DESC);

-- Fenêtre = mois de facturation Stripe (period_start = current_period_start::DATE).
-- Nouveau cycle (renouvellement, upgrade) = nouvelle ligne, pas de période
-- glissante. Reset = INSERT au webhook 'invoice.created'.
CREATE TABLE usage_counters (
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  prompts_count INTEGER NOT NULL DEFAULT 0,
  runs_count INTEGER NOT NULL DEFAULT 0,
  llm_cost_usd DECIMAL(10, 4) NOT NULL DEFAULT 0,
  warned_at_60pct TIMESTAMPTZ,    -- alerte interne envoyée
  warned_at_100pct TIMESTAMPTZ,   -- email client envoyé
  hardcap_hit_at TIMESTAMPTZ,     -- block déclenché à 200%
  PRIMARY KEY (workspace_id, period_start)
);
```

### Idempotence des jobs LLM (formalisée)

Règle : **un job ne peut pas être enqueue deux fois pour la même clé
logique** (`idempotency_key TEXT UNIQUE NOT NULL`). Formats par `kind` :

| `kind`                | format `idempotency_key` |
| --------------------- | ------------------------ |
| `execute_prompt`      | `execute_prompt:{prompt_id}:{llm}:{scheduled_date_iso}` (ex : `execute_prompt:8fa1...:claude:2026-05-06`) |
| `score_response`      | `score_response:{run_id}` |
| `send_weekly_email`   | `send_weekly_email:{workspace_id}:{iso_week}` (ex : `:2026-W18`) |
| `recompute_metrics`   | `recompute_metrics:{brand_id}:{date_iso}` |
| `audit_workspace_url` | `audit_workspace_url:{workspace_id}:{url}:{date_iso}` |

`enqueue` :

```sql
INSERT INTO queue_jobs (kind, payload, idempotency_key, scheduled_at, max_attempts)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (idempotency_key) DO NOTHING
RETURNING id;
```

`RETURNING id` vide = job déjà en BDD, no-op silencieux → cron re-déclenché
ou dispatch redémarré ne créent pas de doublon.

`claim` (pull-based, `FOR UPDATE SKIP LOCKED` pour parallélisme sûr) :

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

`complete` : `SET status='done', finished_at=NOW()`.
`fail` transient : `SET status='pending', last_error=$err, scheduled_at=NOW()
+ interval '1 hour'` si `attempts < max_attempts`, sinon `status='dead'`.
Re-tentative h+1 puis h+6 (cf. § "Fallback strategy").

### Algorithme du hard-cap LLM 200%

**Livré** (Sprint 4, 2026-05-16) dans `src/lib/hardcap/check.ts`
(`checkQuotaBeforeRun`), appelé avant chaque appel LLM réel par
`execute-prompt`. Ratio = `runs_count / théorique mensuel` (prompts × LLMs ×
jours du cycle, selon plan) :

- **≥ 60 %** (1ʳᵉ fois) : alerte interne (event `quota.warning_60` + email Max), `warned_at_60pct` posé
- **≥ 100 %** (1ʳᵉ fois) : email client, `warned_at_100pct` posé, runs encore autorisés
- **≥ 200 %** : block — `hardcap_hit_at` + `workspaces.hard_cap_hit_at` posés (transaction), event `quota.hardcap_hit`, email client + alerte interne
- Plans `expired` / `canceled` ou `hard_cap_hit_at` déjà posé : blocked d'office

Levée **manuelle uniquement** (SQL/admin) après dialogue client. Reset du
compteur au prochain cycle Stripe (webhook `invoice.created`).

### Quotas par plan

Source de vérité code : `src/lib/plans/quotas.ts` (`quotasFor()`). État
2026-06-11 :

| Plan            | Brands | Concurrents | Prompts | Cadence | Audits/mois | Compare (concurrents auditables) |
| --------------- | ------ | ----------- | ------- | ------- | ----------- | -------------------------------- |
| trialing / past_due / expired / canceled | 1 | 0 | 0 | aucun run | 0 | 0 |
| Solo (9,99 €)   | 1      | 3           | 5       | hebdo (lundi) | 5     | 0 (désactivé) |
| Starter (49 €)  | 1      | 5           | 25      | quotidien | 30        | 3 |
| Pro (149 €)     | 3      | 10          | 100     | quotidien | 100       | 10 |
| Agence (399 €, sur devis) | 10 | ∞        | 300     | quotidien | ∞         | ∞ |
| Enterprise      | ∞      | ∞           | sur devis | quotidien | ∞       | ∞ |

5 LLMs sur tous les plans payants (Le Chat dès Starter sans condition).
Historique data : Starter 90 j, Pro/Agence 1 an (non enforced en code à ce
jour). Trial 14 j avec carte = quotas du plan choisi au checkout.

---

## Stratégie LLM API — le cœur du modèle économique

### APIs ciblées

Cf. tableau § "LLMs" ci-dessus (5 providers livrés). Point clé : pour
reproduire fidèlement ce qu'un utilisateur voit dans ChatGPT.com et
consorts, le browsing/search natif est activé partout — sinon on teste le
modèle sans contexte web et on rate les vraies citations (c'est ce que font
Profound et Peec).

### Estimation de coût par run

**Hypothèse théorique initiale** : ~500 tokens in + ~1500 out ≈ $0.003/appel.

**Mesure réelle 2026-05-07** (cf. doc 09 § 2026-05-07) :

| Modèle                         | Tokens in | Tokens out | Web search | Coût mesuré |
| ------------------------------ | --------- | ---------- | ---------- | ----------- |
| `claude-sonnet-4-6` + search 5 | 21 925    | 2 113      | 1          | ~$0,107     |

L'écart vient du tool serveur `web_search_20250305` qui injecte ~5 ko/search
en input. D'où le choix Phase A : tracking sur `claude-haiku-4-5-20251001`
($1 in / $5 out) avec `max_uses=2` + `max_tokens=4096` → **~$0,02-0,04/run
mesuré** (~5× moins cher que Sonnet). Scoring : ~$0,003/run.

**Smoke tests Phase C (2026-05-18)** : Mistral ~$0,02 ; OpenAI ~$0,01 (16
sources) ; Gemini ~$0,035 (14 sources).

La bascule Sonnet 4.6 (prévue Phase C) **n'a pas été faite** — le tracking
reste sur Haiku 4.5. Arbitrage par plan (Starter Haiku, Pro/Agency Sonnet)
ou feature flag par workspace : toujours ouvert.

### Coût par client

Table d'origine (hypothèse $0,003/run), conservée pour trace :

| Plan          | Runs/mois (hypothèse d'époque) | Coût LLM/mois | Marge brute |
| ------------- | ------------------------------ | ------------- | ----------- |
| Starter (49€) | 25 × 5 × 4 (hebdo) = 500       | ~$1.50        | ~96%        |
| Pro (149€)    | 100 × 5 × 30 = 15 000          | ~$45          | ~70%        |
| Agence (399€) | 300 × 5 × 30 = 45 000          | ~$135         | ~66%        |

⚠️ **À recalculer avec les coûts mesurés** : (a) Starter est passé en
cadence quotidienne (3 750 runs/mois au quota plein, pas 500), (b) le coût
mesuré est ~$0,01-0,04/run selon provider, soit 3-13× l'hypothèse $0,003. Au
quota plein, Pro = $150-600/mois de LLM pour 149 € de MRR. Mitigations :
usage réel < quota, prompt_cache (non branché), smart frequency. Le
pre-screening regex ne skippe **plus** le scoring depuis 2026-06-11 (étape 4
ranking : +$0,003/run anciennement skippé, cf. doc 09). Marges à revalider
dans doc 04 avant scale.

### Stratégies de réduction des coûts

1. **Caching cross-clients** — même prompt × même LLM = 1 appel / 24 h. Économie estimée 20-40% Starter. (Table `prompt_cache` en schéma, pas encore branchée.)
2. **Smart frequency** — prompts à réponse stable depuis 7 j → bascule hebdo auto même sur Pro (non implémenté)
3. **Modèles cheap pour le scoring** — Haiku 4.5 (en place)
4. **Batch API** — Anthropic/OpenAI, -50% quand applicable
5. **Retry intelligent** — pas de re-run sur erreur transitoire avant 1 h (en place)
6. **Hard cap 200%** — block + email (en place)
7. **Alerte interne 60%** — email Max (en place)

### Fallback strategy

LLM down ou hors quota → run `failed`, ne bloque pas les autres. Retry h+1
puis h+6 ; au-delà, skip du jour, visible dashboard.

---

## Algorithme de détection des citations

### Approche en deux étapes

**1. Détection regex (cheap)** — `src/lib/citation/detect.ts` :
marque + aliases dans la réponse brute, domaine dans les URLs citées.
Persistée pour debug/baseline. Depuis 2026-06-11 (étape 4 ranking, doc 09)
elle ne **gate plus** l'appel scoring : le skip « aucun match → pas de
scoring » est levé, les anciens payloads `{skipped: true}` restent valides
en lecture.

**2. LLM scoring (précis, systématique)** — `src/lib/citation/score.ts` :
Claude Haiku 4.5 en **tool_use forcé** (`tool_choice` sur le tool
`report_scoring`, schéma validé par Anthropic — pas de prompt « retourne du
JSON »). Tourne sur **tous** les runs success (~$0,003/run). Sortie :

- `target_cited` (bool), position dans la liste le cas échéant, sentiment (positive / neutral / negative)
- concurrents cités : `{ name, sentiment, position }` — champ `position` requis depuis l'étape 3 ranking (2026-06-10), parsing lénient pour les anciens payloads. Le prompt demande **toutes** les marques citées, y compris hors liste trackée (découverte, étape 4)
- sources citées (URLs / domaines)

Résultat persisté dans `runs.parsed_brands` ; le score visibilité V0 =
positionWeight × sentimentWeight (0-100).

### Edge cases à gérer

- Noms communs ("Boulanger" boulangerie vs enseigne) → confirmation par contexte LLM
- Acronymes ("BNP" vs "BNP Paribas")
- Variations orthographiques
- Mentions sarcastiques ou négatives
- Sources sans URL claire ("selon les experts du domaine")

---

## Sécurité et conformité RGPD

### Hébergement (choix verrouillés cf. doc 09)

Neon EU Frankfurt (Postgres) · Vercel EU (`cdg1` Paris pour les fonctions)
· Cloudflare R2 (EU jurisdiction) · queue Postgres + Vercel Cron, migration
Inngest EU > 100K runs/mois.

### Données personnelles

Email + nom seulement. Pas de données client final (sauf Agency). DPA
standard dispo. Politique RGPD dès J0 (+ section « Analytics produit »
PostHog EU ajoutée 2026-06-08). Logs : 30 jours puis purge. Export JSON
article 20 + suppression de compte dans `/app/settings`.

### Authentification

Magic link par défaut (pas de mot de passe stocké). 2FA TOTP en V1. SSO
SAML Enterprise (V2).

### Sécurité applicative

CSP / HSTS / X-Frame-Options · rate limiting Upstash sur endpoints publics
· secrets en Vercel env vars · pas de logging serveur de prompts sensibles
· audit trail des actions admin (table `events`).

### Conformité légale

RGPD : registre des traitements ; pas de DPO ni DPIA requis en V0. TVA UE
via Stripe Tax. CGU + CGV + politique de confidentialité dès J0.

---

## DevOps et déploiement

### Environnements

- **Local** : branche Neon par dev (`dev-{username}`). Pas de Docker Compose.
- **Preview** : auto par PR (Vercel + branche Neon dédiée)
- **Staging** : branche `staging` → `staging.mamie-geo.fr` (seed fixtures)
- **Production** : `main` → `mamie-geo.fr` (path-based, pas de subdomain `app.`)

### CI/CD

GitHub Actions : lint (ESLint + Prettier + TS strict), type-check, tests
unit, E2E, preview. Tests bloquants (pas de merge si rouge). Trunk-based,
PRs < 400 lignes.

### Backups

Point-in-time recovery Neon (7 j free tier) + export hebdo auto vers R2
(cron Vercel). Restore drill tous les 2 mois.

### Monitoring

BetterStack (uptime landing + API + endpoints critiques), Sentry
(front + back), PostHog (funnels), dashboard interne admin (MRR, runs/jour,
coûts LLM/jour, churn, queue). Crons prod : `logCronEvent()` + endpoint
debug `GET /api/cron/dispatch?inspect=1` (état queue + env vars).

---

## Stratégie de test (priorité projet solo)

Contrainte : un solo founder ne peut pas tester à la main 5 LLMs × 100
prompts à chaque déploiement → couverture automatique sans payer d'API LLM.

### Pyramide de tests

- **E2E Playwright** : 5-10 scénarios business-critiques uniquement
- **Integration Vitest** : 20-40 tests (routes API, workers, queue, parsing)
- **Unit Vitest** : 100+ tests (fonctions pures, scoring, validation Zod)

### Outils

- **Vitest** (unit + integration, colocation `foo.test.ts`)
- **Playwright** (E2E flows critiques)
- **MSW** (interception HTTP → mock LLMs)
- **Drizzle test mode** : vraie BDD test (branche Neon dédiée), rollback transactionnel entre tests
- **@faker-js/faker** : fixtures réalistes FR

### Stratégie LLM en test

Appels LLM **interdits** en test (lents, chers, non-déterministes). Trois
patterns autorisés :

1. **Cassettes** : vraies réponses enregistrées une fois (20 prompts types), JSON dans `tests/fixtures/`, rejouées via MSW/nock
2. **`FakeLLMClient`** : interface `LLMClient` (`src/lib/llm/types.ts`) + DI, réponses configurées par scénario
3. **Snapshot tests scoring** : réponse LLM fixe → vérification du JSON de scoring (regex + parsing seuls)

### Données de test

Fixtures FR réalistes (marques fictives type `Boucherie du Centre`),
snapshot "journée type" (1 workspace + 3 marques + 25 prompts + 5 LLMs × 7
jours), seeds versionnés : `pnpm db:seed:dev`, `db:seed:test`, `db:seed:demo`.

### CI

Par PR : lint + type-check (~15 s) → unit (~30 s) → integration Postgres
(~1-2 min) → Playwright sur preview Vercel + branche Neon (~3-5 min).
Total < 10 min.

### Tests business-critiques en E2E (les seuls obligatoires)

1. Signup → onboarding → premier rapport visible
2. Upgrade Starter → Pro via Stripe
3. Cancel abonnement
4. Ajout d'une marque + prompts → 1 run de test → résultat affiché
5. Export CSV
6. Login magic link
7. Page facturation Stripe Customer Portal accessible

Tout le reste = unit/integration. État 2026-06-11 : 5 specs Playwright
livrées sur les flows **publics** (home, pricing, blog, lead-magnet, login —
13 tests) ; les flows authentifiés/Stripe de la liste restent à couvrir.

---

## Décisions techniques verrouillées

Synthèse stack : cf. tableaux § "Stack V0" ci-dessus et CLAUDE.md § 2
(tableau identique + anti-décisions). Justifications datées : doc 09.

### Décisions restantes (à trancher en Sprint 0)

Toutes tranchées depuis (cf. doc 09) :

- **Naming + domaine** : Mamie GEO sur `mamie-geo.fr` (301 depuis mamie-seo.fr)
- **Direction artistique** : pivot Airbnb-like minimaliste 2026-05-07 ; dual-DA 2026-06-05 (persona « Mamie » réservée aux visuels externes LinkedIn/OG)
- **Stack marketing** : Next.js mono-app (pas de Framer)
- **Statut juridique** : EI continue, bascule SAS/EURL mois 6-9

---

## Roadmap technique par version

### V0 (semaines 1-8) — Livré 2026-05

Stack de base, Better Auth magic-link, Stripe billing complet, onboarding
wizard 3 étapes (+ skip `quickSetup` + suggestion IA), worker
`execute_prompt` 5 LLMs, détection citations (regex + scoring Haiku),
dashboard (Stat cards + AreaChart + BreakdownBars), CRUD prompts /
concurrents / settings, email hebdo, plans Solo/Starter/Pro + cadence
per-plan, hard-cap LLM 200 % (`src/lib/hardcap/`), SSE `/api/runs/events` +
`<RunActivityBar>`, one-shot run gratuit post-onboarding (~$0,04/signup),
blog MDX content-driven (JSON-LD Article/FAQPage/Breadcrumb, OG dynamique,
sitemap/robots), lead magnets `/outils/test-visibilite-ia` et
`/outils/audit-technique` (30+ checks sans LLM, PSI API), `/styleguide`
interne (noindex).

### V0+ (60 jours post-lancement) — issu de la veille 2026-05-11

**Tout livré le 2026-06-08** (détail produit : doc 02 § V0+) :

| Item | Implémentation réelle |
| ---- | --------------------- |
| Funnel sources Apparition/Fréquence/Citation | migration 0004, 3 colonnes `citation_metrics_daily`, helper `src/lib/citation/source-match.ts` (12 tests), worker `aggregateSourcesFunnel` (6 tests). **Pas de backfill rétro** (le plan initial en prévoyait un — abandonné, anciens runs restent à 0) |
| `prompts.cadence` per-prompt | migration 0005, scheduler filtre par cadence effective |
| Pause/Resume (`brands.paused_at`) | migration 0003 + index partiel `idx_brands_active`, scheduler skip, actions `pauseBrand`/`resumeBrand`, toggle dans `/app/settings` |
| URL drill-down | `/app/citations/sources/[id]` (pas `/app/sources/[id]`), vues sur `runs.parsed_citations`, pas de nouvelle table |
| CSV exports | `/api/export/{runs,metrics}.csv`, helper RFC 4180 + BOM UTF-8 (`src/lib/csv/`), cap 50 k lignes + header `X-Export-Truncated`, plage 90 j par défaut |
| Crawlabilité bots IA | check `crawlability-ai-bots` dans `src/lib/audit/`, table de bots versionnée `src/lib/audit/ai-bots.ts` (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Bytespider, CCBot, Amazonbot, meta-externalagent, ...) |
| Régénérer prompts depuis profil | server action `suggestPrompts(brand)` (Haiku 4.5, cf. mémoire `feedback_aux_llm_cost`) |
| `BrandMultiSelect` | filtre multi-sélection dashboard/drill-down |
| Save-as-PNG charts | wrapper export autour des charts Recharts |
| Comparison pages | 3 articles MDX publiés dans `/blog/` (vs Peec AI / Otterly / Rankscale) — route dédiée `/comparatifs/[slug]` reportée V1 |

S'y ajoutent (2026-06-10) : onglet **Classement** `/app/citations?tab=ranking`
(`computeRanking()` dans `src/lib/competitors/ranking.ts`, lit
`competitors_data` — zéro migration) + `position` par concurrent dans le
tool schema scoring. Cf. doc 09 § 2026-06-10.

### V1 (mois 3-6)

- Crawler AI-readiness + score + recommandations + recrawl périodique
- Vue concurrents avancée
- Notifications Slack
- API basic (read-only)
- **Programme partenaire + annuaire public** (cf. doc 06) — tracking Stripe affiliate, commission lifetime 20-25 %
- **Query fan-out tracking** (tier Pro/Agence) — sub-queries internes ChatGPT & co, parsing sources/citations
- **MCP Server Mamie GEO (conditionnel)** — read-only, activé seulement si demande client claire (cible PME/freelance FR ≠ devs power-users)
- Route dédiée `/comparatifs/[slug]` si traction des comparatifs blog

### V2 (mois 6-12)

Multi-workspaces · marque blanche · rapports PDF auto · intégrations GA4 +
Search Console · API write · webhooks.

### V3 (mois 12-18)

Prompt Library FR par secteur · sentiment analysis avancé · AI Traffic
Attribution · mobile app (si demandé).

---

→ Voir [04-pricing-business-model.md](./04-pricing-business-model.md) pour l'impact financier.
→ Voir [10-design-direction.md](./10-design-direction.md) pour les choix de design.
