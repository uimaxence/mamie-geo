CREATE TABLE "audit_counters" (
	"workspace_id" uuid NOT NULL,
	"period_start" date NOT NULL,
	"audits_count" integer DEFAULT 0 NOT NULL,
	"competitor_audits_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "audit_counters_workspace_id_period_start_pk" PRIMARY KEY("workspace_id","period_start")
);
--> statement-breakpoint
CREATE TABLE "technical_audits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"brand_id" uuid,
	"url" text NOT NULL,
	"is_competitor" boolean DEFAULT false NOT NULL,
	"score_global" integer NOT NULL,
	"sub_scores" jsonb NOT NULL,
	"checks" jsonb NOT NULL,
	"html_size_kb" numeric(10, 2),
	"http_status" integer NOT NULL,
	"psi_unavailable" boolean DEFAULT false NOT NULL,
	"fetched_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "queue_jobs" DROP CONSTRAINT "queue_kind_check";--> statement-breakpoint
ALTER TABLE "audit_counters" ADD CONSTRAINT "audit_counters_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technical_audits" ADD CONSTRAINT "technical_audits_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technical_audits" ADD CONSTRAINT "technical_audits_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_technical_audits_workspace_created" ON "technical_audits" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_technical_audits_workspace_url" ON "technical_audits" USING btree ("workspace_id","url");--> statement-breakpoint
ALTER TABLE "queue_jobs" ADD CONSTRAINT "queue_kind_check" CHECK ("queue_jobs"."kind" IN ('execute_prompt','score_response','send_weekly_email','recompute_metrics','audit_workspace_url'));