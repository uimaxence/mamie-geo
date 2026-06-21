import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// ──────────────────────────────────────────────────────────────────────
// Tables Better Auth
// Générées par `pnpm auth:generate` (CLI Better Auth) puis ré-importées
// ici. On les redéfinit en Drizzle pour garder la source de vérité du
// schéma au même endroit. Si le CLI Better Auth modifie une colonne,
// regenerer puis ajuster.
// cf. geo-project/03-architecture-technique.md § Tables Better Auth
// ──────────────────────────────────────────────────────────────────────

export const user = pgTable("user", {
  id: text().primaryKey(),
  email: text().notNull().unique(),
  emailVerified: boolean().notNull().default(false),
  name: text(),
  image: text(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable(
  "session",
  {
    id: text().primaryKey(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    token: text().notNull().unique(),
    ipAddress: text(),
    userAgent: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_session_user").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text().primaryKey(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accountId: text().notNull(),
    providerId: text().notNull(),
    accessToken: text(),
    refreshToken: text(),
    accessTokenExpiresAt: timestamp({ withTimezone: true }),
    refreshTokenExpiresAt: timestamp({ withTimezone: true }),
    scope: text(),
    idToken: text(),
    password: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_account_user").on(t.userId)],
);

export const verification = pgTable("verification", {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

// ──────────────────────────────────────────────────────────────────────
// Workspaces et membres
// cf. geo-project/03-architecture-technique.md § Tables métier
// ──────────────────────────────────────────────────────────────────────

export const PLAN_VALUES = [
  "trialing",
  "beta", // accès gratuit offert (beta-testeurs), octroi manuel admin, jamais facturé Stripe
  "solo",
  "starter",
  "pro",
  "agency",
  "enterprise",
  "past_due",
  "expired",
  "canceled",
] as const;

export const ROLE_VALUES = ["owner", "admin", "member", "viewer"] as const;

export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    slug: text().notNull().unique(),
    plan: text().notNull().default("trialing"),
    stripeCustomerId: text().unique(),
    stripeSubscriptionId: text().unique(),
    trialEndsAt: timestamp({ withTimezone: true }),
    currentPeriodStart: timestamp({ withTimezone: true }),
    currentPeriodEnd: timestamp({ withTimezone: true }),
    hardCapHitAt: timestamp({ withTimezone: true }),
    // Fin de l'accès gratuit offert (plan "beta"). NULL pour les plans payants.
    // Le cron expire-comp repasse le workspace en "expired" passé cette date.
    compExpiresAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check(
      "plan_check",
      sql`${t.plan} IN ('trialing','beta','solo','starter','pro','agency','enterprise','past_due','expired','canceled')`,
    ),
  ],
);

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    workspaceId: uuid()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text().notNull().default("member"),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.workspaceId, t.userId] }),
    check("role_check", sql`${t.role} IN ('owner','admin','member','viewer')`),
  ],
);

// ──────────────────────────────────────────────────────────────────────
// Brands, competitors, prompts
// ──────────────────────────────────────────────────────────────────────

export const brands = pgTable(
  "brands",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: uuid()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text().notNull(),
    domain: text().notNull(),
    description: text(),
    aliases: text()
      .array()
      .notNull()
      .default(sql`'{}'`),
    // V0+ pause/resume — quand non null, le scheduler skipe cette brand
    // (cf. doc 02 § V0+). Resume = SET NULL.
    pausedAt: timestamp({ withTimezone: true }),
    // V1 — clé publique du pixel d'attribution trafic IA (cf. doc 09 §
    // 2026-06-15). Null tant que le pixel n'est pas activé. Format
    // `mgpx_<24 [a-z0-9]>` (préfixe public, volontairement distinct de
    // `sk_` Stripe — cf. `src/lib/ai-traffic/keys.ts`). Sert d'identifiant
    // dans l'URL du snippet et de lookup à l'ingestion. `.unique()` crée
    // l'index du lookup.
    aiPixelKey: text("ai_pixel_key").unique(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_brands_workspace").on(t.workspaceId),
    // Partial index documenté doc 03 § brands : accélère le scheduler
    // qui filtre `isNull(pausedAt)` à chaque cron.
    index("idx_brands_active")
      .on(t.workspaceId)
      .where(sql`paused_at IS NULL`),
  ],
);

export const competitors = pgTable(
  "competitors",
  {
    id: uuid().primaryKey().defaultRandom(),
    brandId: uuid()
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    name: text().notNull(),
    domain: text(),
    aliases: text()
      .array()
      .notNull()
      .default(sql`'{}'`),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_competitors_brand").on(t.brandId)],
);

export const prompts = pgTable(
  "prompts",
  {
    id: uuid().primaryKey().defaultRandom(),
    brandId: uuid()
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    text: text().notNull(),
    category: text(),
    language: text().notNull().default("fr"),
    isActive: boolean().notNull().default(true),
    // V0+ per-prompt cadence (cf. doc 02 § V0+). `inherit` = suit la
    // cadence du plan (default), daily/weekly/monthly overrident.
    // Scheduler logic dans src/lib/scheduler/cadence-eligibility.ts.
    cadence: text().notNull().default("inherit"),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_prompts_brand_active").on(t.brandId),
    check("prompt_cadence_check", sql`${t.cadence} IN ('inherit','daily','weekly','monthly')`),
  ],
);

export const PROMPT_CADENCES = ["inherit", "daily", "weekly", "monthly"] as const;
export type PromptCadence = (typeof PROMPT_CADENCES)[number];

// ──────────────────────────────────────────────────────────────────────
// Runs (1 prompt × 1 LLM × 1 date planifiée)
// ──────────────────────────────────────────────────────────────────────

export const LLM_VALUES = ["chatgpt", "claude", "perplexity", "gemini", "lechat"] as const;
export const RUN_STATUS = ["pending", "running", "success", "failed", "skipped"] as const;

export const runs = pgTable(
  "runs",
  {
    id: uuid().primaryKey().defaultRandom(),
    promptId: uuid()
      .notNull()
      .references(() => prompts.id, { onDelete: "cascade" }),
    llm: text().notNull(),
    status: text().notNull().default("pending"),
    rawResponse: text(),
    parsedCitations: jsonb(),
    parsedBrands: jsonb(),
    costUsd: decimal({ precision: 10, scale: 6 }),
    durationMs: integer(),
    error: text(),
    cacheHit: boolean().notNull().default(false),
    scheduledAt: timestamp({ withTimezone: true }).notNull(),
    executedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_runs_prompt_executed").on(t.promptId, t.executedAt),
    check("llm_check", sql`${t.llm} IN ('chatgpt','claude','perplexity','gemini','lechat')`),
    check(
      "run_status_check",
      sql`${t.status} IN ('pending','running','success','failed','skipped')`,
    ),
  ],
);

// ──────────────────────────────────────────────────────────────────────
// Métriques quotidiennes (pré-aggrégées par worker recompute_metrics)
// ──────────────────────────────────────────────────────────────────────

export const citationMetricsDaily = pgTable(
  "citation_metrics_daily",
  {
    brandId: uuid()
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    llm: text().notNull(),
    date: date().notNull(),
    totalRuns: integer().notNull(),
    brandCitedCount: integer().notNull(),
    visibilityScore: decimal({ precision: 5, scale: 2 }),
    competitorsData: jsonb(),
    // V0+ funnel sources (cf. doc 02 § Glossaire + doc 03 § citation_metrics_daily).
    // Calculé par worker recompute à partir de runs.parsedCitations.
    //   Apparition = retrievedCount / totalRuns
    //   Fréquence  = retrievalsTotal / retrievedCount  (si retrievedCount > 0)
    //   Citation   = citationsCount / retrievalsTotal  (si retrievalsTotal > 0)
    retrievedCount: integer().notNull().default(0),
    retrievalsTotal: integer().notNull().default(0),
    citationsCount: integer().notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.brandId, t.llm, t.date] })],
);

// ──────────────────────────────────────────────────────────────────────
// Attribution du trafic IA — V1 (cf. doc 09 § 2026-06-15)
// Le pixel first-party (cookieless) posé sur le site du client ne remonte
// QUE les visites d'origine IA (referrers chatgpt.com/perplexity.ai/…, UTM
// utm_source=chatgpt.com). On agrège directement en quotidien : pas de
// table d'événements bruts (cookieless + agrégat = surface RGPD minimale).
// `source` réutilise LLM_VALUES (Copilot fusionné sur "chatgpt") pour pouvoir
// superposer ce trafic au score de visibilité Mamie au dashboard.
// ──────────────────────────────────────────────────────────────────────

export const aiTrafficDaily = pgTable(
  "ai_traffic_daily",
  {
    brandId: uuid()
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    source: text().notNull(), // clé LLM_VALUES
    date: date().notNull(),
    visits: integer().notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.brandId, t.source, t.date] }),
    check(
      "ai_traffic_source_check",
      sql`${t.source} IN ('chatgpt','claude','perplexity','gemini','lechat')`,
    ),
    // Fenêtres cross-brand (purge, agrégats par date) — la PK couvre déjà
    // les lectures par brand.
    index("idx_ai_traffic_daily_date").on(t.date),
  ],
);

// Trafic TOTAL du site (toutes origines), agrégé en quotidien par le même
// pixel cookieless. Le snippet beacon désormais à CHAQUE pageview en
// transmettant la source IA détectée (ou null) : `ai_traffic_daily` garde la
// ventilation par IA, et cette table compte le total → on dérive le ratio
// « % du trafic venu des IA ». Reste cookieless, IP jamais stockée (cf. doc 09
// § 2026-06-21). 1 ligne / jour / marque. On compte des PAGES VUES (pas des
// visiteurs uniques : sans cookie, pas de session fiable), disclaimer UI.
export const siteTrafficDaily = pgTable(
  "site_traffic_daily",
  {
    brandId: uuid()
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    date: date().notNull(),
    visits: integer().notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.brandId, t.date] }),
    index("idx_site_traffic_daily_date").on(t.date),
  ],
);

// Rate-limit / dédup de l'endpoint public d'ingestion du pixel, en Postgres
// (pas d'Upstash Redis en V1 — cf. doc 09 § 2026-06-15, à revisiter selon
// volume). `bucketKey` = compteur d'une fenêtre : `global:{date}` (cap
// quotidien anti-abus) ou `ip:{ipHash}:{source}:{date}` (cap par visiteur
// hashé). L'IP n'est jamais stockée en clair : seul son hash salé du jour
// entre dans la clé. Purge des lignes périmées (> 2 j) opportuniste.
export const aiPixelThrottle = pgTable(
  "ai_pixel_throttle",
  {
    bucketKey: text("bucket_key").primaryKey(),
    count: integer().notNull().default(0),
    windowStart: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_ai_pixel_throttle_window").on(t.windowStart)],
);

// ──────────────────────────────────────────────────────────────────────
// Caching cross-clients
// cf. geo-project/03-architecture-technique.md § prompt_cache
// ──────────────────────────────────────────────────────────────────────

export const promptCache = pgTable(
  "prompt_cache",
  {
    id: uuid().primaryKey().defaultRandom(),
    promptTextHash: text().notNull(),
    llm: text().notNull(),
    language: text().notNull().default("fr"),
    rawResponse: text().notNull(),
    parsedCitations: jsonb(),
    costUsd: decimal({ precision: 10, scale: 6 }),
    fetchedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
  },
  (t) => [
    unique("prompt_cache_unique").on(t.promptTextHash, t.llm, t.language),
    index("idx_prompt_cache_lookup").on(t.promptTextHash, t.llm, t.language),
  ],
);

// ──────────────────────────────────────────────────────────────────────
// Queue Postgres-based
// cf. geo-project/03-architecture-technique.md § Queue + Idempotence
// ──────────────────────────────────────────────────────────────────────

export const QUEUE_KIND = [
  "execute_prompt",
  "score_response",
  "send_weekly_email",
  "recompute_metrics",
  // Audit technique : exécute `runAudit(url)` pour un workspace donné.
  // Utilisé par (a) le batch concurrents lancé depuis /app/audits/new
  // et (b) le cron hebdo /api/cron/schedule-audits (lundi 5h UTC).
  // Audit on-demand single = server action synchrone (pas via queue).
  "audit_workspace_url",
] as const;
export const QUEUE_STATUS = ["pending", "claimed", "done", "failed", "dead"] as const;

export const queueJobs = pgTable(
  "queue_jobs",
  {
    id: uuid().primaryKey().defaultRandom(),
    kind: text().notNull(),
    payload: jsonb().notNull(),
    idempotencyKey: text().notNull().unique(),
    status: text().notNull().default("pending"),
    scheduledAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    claimedAt: timestamp({ withTimezone: true }),
    finishedAt: timestamp({ withTimezone: true }),
    attempts: integer().notNull().default(0),
    maxAttempts: integer().notNull().default(3),
    lastError: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_queue_jobs_claim").on(t.scheduledAt),
    check(
      "queue_kind_check",
      sql`${t.kind} IN ('execute_prompt','score_response','send_weekly_email','recompute_metrics','audit_workspace_url')`,
    ),
    check("queue_status_check", sql`${t.status} IN ('pending','claimed','done','failed','dead')`),
  ],
);

// ──────────────────────────────────────────────────────────────────────
// Audit log applicatif (purgé à 90 jours via cron)
// ──────────────────────────────────────────────────────────────────────

export const events = pgTable(
  "events",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: uuid().references(() => workspaces.id, { onDelete: "set null" }),
    userId: text().references(() => user.id, { onDelete: "set null" }),
    kind: text().notNull(),
    payload: jsonb()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_events_workspace_kind_created").on(t.workspaceId, t.kind, t.createdAt)],
);

// ──────────────────────────────────────────────────────────────────────
// Subscriptions (idempotents via stripe_event_id UNIQUE)
// ──────────────────────────────────────────────────────────────────────

export const subscriptionEvents = pgTable(
  "subscription_events",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: uuid()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    eventType: text().notNull(),
    fromPlan: text(),
    toPlan: text(),
    stripeEventId: text().unique(),
    metadata: jsonb()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_subscription_events_workspace").on(t.workspaceId, t.createdAt)],
);

// ──────────────────────────────────────────────────────────────────────
// Idempotence webhooks Stripe (cf. doc 09 § 2026-06-17)
// Stripe livre at-least-once : un même event peut arriver plusieurs fois
// (retry, replay). On « claim » l'event AVANT d'exécuter le handler :
// l'insert atomique sur `eventId` (PK) échoue/no-op si déjà vu → on skip
// les effets de bord (emails, events PostHog) au lieu de les rejouer.
// `subscription_events` ne suffisait pas : il était écrit APRÈS le handler.
// ──────────────────────────────────────────────────────────────────────

export const stripeProcessedEvents = pgTable("stripe_processed_events", {
  eventId: text("event_id").primaryKey(),
  eventType: text("event_type").notNull(),
  processedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

// ──────────────────────────────────────────────────────────────────────
// Usage counters — fenêtre = mois de facturation Stripe
// ──────────────────────────────────────────────────────────────────────

export const usageCounters = pgTable(
  "usage_counters",
  {
    workspaceId: uuid()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    periodStart: date().notNull(),
    promptsCount: integer().notNull().default(0),
    runsCount: integer().notNull().default(0),
    llmCostUsd: decimal({ precision: 10, scale: 4 }).notNull().default("0"),
    warnedAt60pct: timestamp({ withTimezone: true }),
    warnedAt100pct: timestamp({ withTimezone: true }),
    hardcapHitAt: timestamp({ withTimezone: true }),
  },
  (t) => [primaryKey({ columns: [t.workspaceId, t.periodStart] })],
);

// ──────────────────────────────────────────────────────────────────────
// Soldes de crédits LLM saisis à la main (admin) — cf. doc 09 § 2026-06-15
// Les API LLM n'exposent pas le solde prépayé restant. Chaque ligne = un
// solde constaté (`amount_usd`) à une date (`topped_up_at`). Le panneau
// admin prend le plus récent et soustrait la dépense depuis (SUM
// runs.cost_usd par provider) → solde estimé. `provider` = clé LLM_VALUES
// (claude=Anthropic, chatgpt=OpenAI, lechat=Mistral...).
// ──────────────────────────────────────────────────────────────────────

export const llmCreditTopups = pgTable(
  "llm_credit_topups",
  {
    id: uuid().primaryKey().defaultRandom(),
    provider: text().notNull(),
    amountUsd: decimal({ precision: 10, scale: 2 }).notNull(),
    toppedUpAt: timestamp({ withTimezone: true }).notNull(),
    note: text(),
    createdBy: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_llm_credit_topups_provider").on(t.provider, t.toppedUpAt),
    check(
      "llm_credit_provider_check",
      sql`${t.provider} IN ('chatgpt','claude','perplexity','gemini','lechat')`,
    ),
  ],
);

// ──────────────────────────────────────────────────────────────────────
// Technical audits — Sprint 6 PR B (cf. doc 09 § 2026-05-17)
// Historise les audits techniques lancés depuis l'app (vs lead magnet
// public `/outils/audit-technique` qui ne persiste rien).
// ──────────────────────────────────────────────────────────────────────

export const technicalAudits = pgTable(
  "technical_audits",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: uuid()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    /** brandId nullable : null pour les audits de concurrents qui ne sont
     *  pas dans la table `brands`. Pour les audits de la marque principale,
     *  pointe vers le `brand.id`. */
    brandId: uuid().references(() => brands.id, { onDelete: "set null" }),
    /** URL réellement auditée (peut différer du domaine brand si page interne). */
    url: text().notNull(),
    /** Marque l'audit comme étant celui d'un concurrent — utilisé par la
     *  page compare et pour filtrer les alertes (pas d'alerte sur concurrent). */
    isCompetitor: boolean().notNull().default(false),
    /** Score global pondéré 0-100 (computeGlobalScore). */
    scoreGlobal: integer().notNull(),
    /** Sub-scores SEO/GEO/A11y/Perf sérialisés. */
    subScores: jsonb().notNull(),
    /** Liste complète des checks (pour replay du rapport). */
    checks: jsonb().notNull(),
    htmlSizeKb: decimal({ precision: 10, scale: 2 }),
    httpStatus: integer().notNull(),
    psiUnavailable: boolean().notNull().default(false),
    /** Date à laquelle le HTML a été fetché. */
    fetchedAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_technical_audits_workspace_created").on(t.workspaceId, t.createdAt),
    index("idx_technical_audits_workspace_url").on(t.workspaceId, t.url),
  ],
);

// ──────────────────────────────────────────────────────────────────────
// Audit counters — fenêtre = mois calendaire UTC, quota par plan
// ──────────────────────────────────────────────────────────────────────

export const auditCounters = pgTable(
  "audit_counters",
  {
    workspaceId: uuid()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    /** Premier jour du mois UTC en YYYY-MM-01. */
    periodStart: date().notNull(),
    /** Compte les audits "owned" (brand + URLs internes) hors concurrents. */
    auditsCount: integer().notNull().default(0),
    /** Compte les audits concurrents (quota séparé moins strict). */
    competitorAuditsCount: integer().notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.workspaceId, t.periodStart] })],
);

// ──────────────────────────────────────────────────────────────────────
// Comparator scans — leads + données du free tool /outils/comparateurs
// Chaque scan persiste les sites découverts par secteur et la présence
// de la marque : matière première de la typologie de sources (V1) et
// de l'intelligence par niche. cf. doc 09 § 2026-06-12 (enrichissement)
// ──────────────────────────────────────────────────────────────────────

export const comparatorScans = pgTable(
  "comparator_scans",
  {
    id: uuid().primaryKey().defaultRandom(),
    /** Email du prospect (lead, pas de FK : table publique pré-signup). */
    email: text().notNull(),
    brandName: text().notNull(),
    /** Secteur tel que saisi par le prospect. */
    sector: text().notNull(),
    /** Secteur normalisé (minuscules, sans accents) — clé d'agrégation par niche. */
    sectorNormalized: text().notNull(),
    /** Ville/zone si le prospect vise une visibilité locale (2026-06-12). */
    location: text(),
    websiteDomain: text(),
    presentCount: integer().notNull(),
    totalChecked: integer().notNull(),
    /** ComparatorCheck[] complet (domaine, origine, présence, URL trouvée,
     *  type de site + conseil d'inclusion Mistral). */
    checks: jsonb().notNull(),
    /** CompetitorSpotted[] — sites d'entreprise (concurrents probables)
     *  qui rankent sur les mêmes recherches (2026-06-12). */
    competitorsSpotted: jsonb(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_comparator_scans_sector").on(t.sectorNormalized),
    index("idx_comparator_scans_created").on(t.createdAt),
    index("idx_comparator_scans_email").on(t.email),
  ],
);

// ──────────────────────────────────────────────────────────────────────
// Actions de la semaine : décisions utilisateur (cf. doc 09 § 2026-06-21)
// Le dashboard génère 1-2 actions priorisées À LA VOLÉE depuis les métriques
// (src/lib/weekly-actions) : zéro texte persisté ici. Cette table stocke
// UNIQUEMENT ce que l'utilisateur a décidé d'une action (fait / reporté /
// ignoré), par semaine ISO. Absence de ligne = action active. Une action
// done/dismissed cette semaine ne réapparaît pas ; `scope = permanent` masque
// pour toujours les gestes one-shot (1er prompt, 1er audit).
// ──────────────────────────────────────────────────────────────────────

export const WEEKLY_ACTION_STATUS = ["done", "dismissed", "snoozed"] as const;
export const WEEKLY_ACTION_SCOPE = ["week", "permanent"] as const;

export const weeklyActionStates = pgTable(
  "weekly_action_states",
  {
    brandId: uuid()
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    /** Slug du catalogue (src/lib/weekly-actions/catalog.ts), clé éditoriale stable. */
    actionSlug: text("action_slug").notNull(),
    /** Semaine ISO 8601 `YYYY-Www` de la décision (isoWeekFromDate). */
    isoWeek: text("iso_week").notNull(),
    status: text().notNull(),
    /** Si snoozed : tant que now < snoozeUntil, l'action reste masquée. */
    snoozeUntil: timestamp({ withTimezone: true }),
    scope: text().notNull().default("week"),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Idempotence : 1 décision par (marque, action, semaine). L'upsert
    // ON CONFLICT met à jour le statut.
    primaryKey({ columns: [t.brandId, t.actionSlug, t.isoWeek] }),
    // Lecture dashboard : tous les statuts d'une marque pour la semaine.
    index("idx_weekly_action_states_brand_week").on(t.brandId, t.isoWeek),
    check("weekly_action_status_check", sql`${t.status} IN ('done','dismissed','snoozed')`),
    check("weekly_action_scope_check", sql`${t.scope} IN ('week','permanent')`),
  ],
);

// Ré-exporter les tables Better Auth dans le schéma drizzle pour le client
export const authTables = { user, session, account, verification };
