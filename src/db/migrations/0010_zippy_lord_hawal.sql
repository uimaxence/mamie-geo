CREATE TABLE "llm_credit_topups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"amount_usd" numeric(10, 2) NOT NULL,
	"topped_up_at" timestamp with time zone NOT NULL,
	"note" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "llm_credit_provider_check" CHECK ("llm_credit_topups"."provider" IN ('chatgpt','claude','perplexity','gemini','lechat'))
);
--> statement-breakpoint
CREATE INDEX "idx_llm_credit_topups_provider" ON "llm_credit_topups" USING btree ("provider","topped_up_at");