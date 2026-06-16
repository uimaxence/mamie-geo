CREATE TABLE "ai_pixel_throttle" (
	"bucket_key" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"window_start" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_traffic_daily" (
	"brand_id" uuid NOT NULL,
	"source" text NOT NULL,
	"date" date NOT NULL,
	"visits" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "ai_traffic_daily_brand_id_source_date_pk" PRIMARY KEY("brand_id","source","date"),
	CONSTRAINT "ai_traffic_source_check" CHECK ("ai_traffic_daily"."source" IN ('chatgpt','claude','perplexity','gemini','lechat'))
);
--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "ai_pixel_key" text;--> statement-breakpoint
ALTER TABLE "ai_traffic_daily" ADD CONSTRAINT "ai_traffic_daily_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ai_pixel_throttle_window" ON "ai_pixel_throttle" USING btree ("window_start");--> statement-breakpoint
CREATE INDEX "idx_ai_traffic_daily_date" ON "ai_traffic_daily" USING btree ("date");--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_ai_pixel_key_unique" UNIQUE("ai_pixel_key");