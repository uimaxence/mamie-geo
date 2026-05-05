CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"id_token" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"domain" text NOT NULL,
	"description" text,
	"aliases" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "citation_metrics_daily" (
	"brand_id" uuid NOT NULL,
	"llm" text NOT NULL,
	"date" date NOT NULL,
	"total_runs" integer NOT NULL,
	"brand_cited_count" integer NOT NULL,
	"visibility_score" numeric(5, 2),
	"competitors_data" jsonb,
	CONSTRAINT "citation_metrics_daily_brand_id_llm_date_pk" PRIMARY KEY("brand_id","llm","date")
);
--> statement-breakpoint
CREATE TABLE "competitors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"name" text NOT NULL,
	"domain" text,
	"aliases" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid,
	"user_id" text,
	"kind" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prompt_text_hash" text NOT NULL,
	"llm" text NOT NULL,
	"language" text DEFAULT 'fr' NOT NULL,
	"raw_response" text NOT NULL,
	"parsed_citations" jsonb,
	"cost_usd" numeric(10, 6),
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "prompt_cache_unique" UNIQUE("prompt_text_hash","llm","language")
);
--> statement-breakpoint
CREATE TABLE "prompts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"text" text NOT NULL,
	"category" text,
	"language" text DEFAULT 'fr' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "queue_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"payload" jsonb NOT NULL,
	"idempotency_key" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"scheduled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"claimed_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "queue_jobs_idempotencyKey_unique" UNIQUE("idempotency_key"),
	CONSTRAINT "queue_kind_check" CHECK ("queue_jobs"."kind" IN ('execute_prompt','score_response','send_weekly_email','recompute_metrics')),
	CONSTRAINT "queue_status_check" CHECK ("queue_jobs"."status" IN ('pending','claimed','done','failed','dead'))
);
--> statement-breakpoint
CREATE TABLE "runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prompt_id" uuid NOT NULL,
	"llm" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"raw_response" text,
	"parsed_citations" jsonb,
	"parsed_brands" jsonb,
	"cost_usd" numeric(10, 6),
	"duration_ms" integer,
	"error" text,
	"cache_hit" boolean DEFAULT false NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"executed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "llm_check" CHECK ("runs"."llm" IN ('chatgpt','claude','perplexity','gemini','lechat')),
	CONSTRAINT "run_status_check" CHECK ("runs"."status" IN ('pending','running','success','failed','skipped'))
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "subscription_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"from_plan" text,
	"to_plan" text,
	"stripe_event_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_events_stripeEventId_unique" UNIQUE("stripe_event_id")
);
--> statement-breakpoint
CREATE TABLE "usage_counters" (
	"workspace_id" uuid NOT NULL,
	"period_start" date NOT NULL,
	"prompts_count" integer DEFAULT 0 NOT NULL,
	"runs_count" integer DEFAULT 0 NOT NULL,
	"llm_cost_usd" numeric(10, 4) DEFAULT '0' NOT NULL,
	"warned_at60pct" timestamp with time zone,
	"warned_at100pct" timestamp with time zone,
	"hardcap_hit_at" timestamp with time zone,
	CONSTRAINT "usage_counters_workspace_id_period_start_pk" PRIMARY KEY("workspace_id","period_start")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"name" text,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace_members" (
	"workspace_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workspace_members_workspace_id_user_id_pk" PRIMARY KEY("workspace_id","user_id"),
	CONSTRAINT "role_check" CHECK ("workspace_members"."role" IN ('owner','admin','member','viewer'))
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"plan" text DEFAULT 'trialing' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"trial_ends_at" timestamp with time zone,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"hard_cap_hit_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workspaces_slug_unique" UNIQUE("slug"),
	CONSTRAINT "workspaces_stripeCustomerId_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "workspaces_stripeSubscriptionId_unique" UNIQUE("stripe_subscription_id"),
	CONSTRAINT "plan_check" CHECK ("workspaces"."plan" IN ('trialing','starter','pro','agency','enterprise','past_due','expired','canceled'))
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "citation_metrics_daily" ADD CONSTRAINT "citation_metrics_daily_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitors" ADD CONSTRAINT "competitors_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runs" ADD CONSTRAINT "runs_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_counters" ADD CONSTRAINT "usage_counters_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_account_user" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_brands_workspace" ON "brands" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_competitors_brand" ON "competitors" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "idx_events_workspace_kind_created" ON "events" USING btree ("workspace_id","kind","created_at");--> statement-breakpoint
CREATE INDEX "idx_prompt_cache_lookup" ON "prompt_cache" USING btree ("prompt_text_hash","llm","language");--> statement-breakpoint
CREATE INDEX "idx_prompts_brand_active" ON "prompts" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "idx_queue_jobs_claim" ON "queue_jobs" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "idx_runs_prompt_executed" ON "runs" USING btree ("prompt_id","executed_at");--> statement-breakpoint
CREATE INDEX "idx_session_user" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_events_workspace" ON "subscription_events" USING btree ("workspace_id","created_at");