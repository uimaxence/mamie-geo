ALTER TABLE "workspaces" DROP CONSTRAINT "plan_check";--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "comp_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "plan_check" CHECK ("workspaces"."plan" IN ('trialing','beta','solo','starter','pro','agency','enterprise','past_due','expired','canceled'));