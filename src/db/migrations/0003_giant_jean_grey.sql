ALTER TABLE "brands" ADD COLUMN "paused_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "idx_brands_active" ON "brands" USING btree ("workspace_id") WHERE paused_at IS NULL;