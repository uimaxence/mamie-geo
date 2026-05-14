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
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check(
      "plan_check",
      sql`${t.plan} IN ('trialing','solo','starter','pro','agency','enterprise','past_due','expired','canceled')`,
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
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_brands_workspace").on(t.workspaceId)],
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
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_prompts_brand_active").on(t.brandId)],
);

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
  },
  (t) => [primaryKey({ columns: [t.brandId, t.llm, t.date] })],
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
      sql`${t.kind} IN ('execute_prompt','score_response','send_weekly_email','recompute_metrics')`,
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

// Ré-exporter les tables Better Auth dans le schéma drizzle pour le client
export const authTables = { user, session, account, verification };
