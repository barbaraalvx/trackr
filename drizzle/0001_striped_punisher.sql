ALTER TYPE "public"."period_type" ADD VALUE 'custom';--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "text_color" text;--> statement-breakpoint
ALTER TABLE "contexts" ADD COLUMN "text_color" text;