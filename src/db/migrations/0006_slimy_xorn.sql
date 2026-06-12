CREATE TABLE "comparator_scans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"brand_name" text NOT NULL,
	"sector" text NOT NULL,
	"sector_normalized" text NOT NULL,
	"website_domain" text,
	"present_count" integer NOT NULL,
	"total_checked" integer NOT NULL,
	"checks" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_comparator_scans_sector" ON "comparator_scans" USING btree ("sector_normalized");--> statement-breakpoint
CREATE INDEX "idx_comparator_scans_created" ON "comparator_scans" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_comparator_scans_email" ON "comparator_scans" USING btree ("email");