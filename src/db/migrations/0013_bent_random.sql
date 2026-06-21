CREATE TABLE "site_traffic_daily" (
	"brand_id" uuid NOT NULL,
	"date" date NOT NULL,
	"visits" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "site_traffic_daily_brand_id_date_pk" PRIMARY KEY("brand_id","date")
);
--> statement-breakpoint
CREATE TABLE "weekly_action_states" (
	"brand_id" uuid NOT NULL,
	"action_slug" text NOT NULL,
	"iso_week" text NOT NULL,
	"status" text NOT NULL,
	"snooze_until" timestamp with time zone,
	"scope" text DEFAULT 'week' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "weekly_action_states_brand_id_action_slug_iso_week_pk" PRIMARY KEY("brand_id","action_slug","iso_week"),
	CONSTRAINT "weekly_action_status_check" CHECK ("weekly_action_states"."status" IN ('done','dismissed','snoozed')),
	CONSTRAINT "weekly_action_scope_check" CHECK ("weekly_action_states"."scope" IN ('week','permanent'))
);
--> statement-breakpoint
ALTER TABLE "site_traffic_daily" ADD CONSTRAINT "site_traffic_daily_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_action_states" ADD CONSTRAINT "weekly_action_states_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_site_traffic_daily_date" ON "site_traffic_daily" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_weekly_action_states_brand_week" ON "weekly_action_states" USING btree ("brand_id","iso_week");