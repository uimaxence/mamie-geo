ALTER TABLE "citation_metrics_daily" ADD COLUMN "retrieved_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "citation_metrics_daily" ADD COLUMN "retrievals_total" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "citation_metrics_daily" ADD COLUMN "citations_count" integer DEFAULT 0 NOT NULL;