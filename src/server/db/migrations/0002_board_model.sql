-- Spec 0004: board model. Safe rename (never drop/create), then seed + backfill,
-- then constrain. Hand written because drizzle-kit's rename prompt needs a TTY.
-- On a fresh deploy the data statements are no-ops (no users/rows yet); on the
-- existing dev DB they move the current data into a default board.

ALTER TYPE "public"."launch_item_status" RENAME TO "board_item_status";--> statement-breakpoint
ALTER TABLE "launch_items" RENAME TO "board_items";--> statement-breakpoint
ALTER TABLE "launch_runs" RENAME TO "board_runs";--> statement-breakpoint
ALTER INDEX "launch_items_user_id_idx" RENAME TO "board_items_user_id_idx";--> statement-breakpoint
ALTER INDEX "launch_runs_user_id_idx" RENAME TO "board_runs_user_id_idx";--> statement-breakpoint
ALTER TABLE "board_items" RENAME CONSTRAINT "launch_items_user_id_users_id_fk" TO "board_items_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "board_runs" RENAME CONSTRAINT "launch_runs_user_id_users_id_fk" TO "board_runs_user_id_users_id_fk";--> statement-breakpoint
CREATE TABLE "boards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_active_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "boards_user_name_unique" UNIQUE("user_id","name")
);
--> statement-breakpoint
ALTER TABLE "boards" ADD CONSTRAINT "boards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "boards_user_id_idx" ON "boards" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "board_items" ADD COLUMN "board_id" uuid;--> statement-breakpoint
ALTER TABLE "board_runs" ADD COLUMN "board_id" uuid;--> statement-breakpoint
ALTER TABLE "board_runs" ADD COLUMN "board_name" text;--> statement-breakpoint
INSERT INTO "boards" ("user_id", "name", "last_active_at") SELECT "id", 'Launch readiness', now() FROM "users";--> statement-breakpoint
UPDATE "modules" SET "key" = 'board' WHERE "key" = 'launch';--> statement-breakpoint
UPDATE "board_items" AS bi SET "board_id" = b."id" FROM "boards" b WHERE b."user_id" = bi."user_id";--> statement-breakpoint
UPDATE "board_runs" AS br SET "board_id" = b."id", "board_name" = b."name" FROM "boards" b WHERE b."user_id" = br."user_id";--> statement-breakpoint
ALTER TABLE "board_items" ALTER COLUMN "board_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "board_runs" ALTER COLUMN "board_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "board_items" ADD CONSTRAINT "board_items_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_runs" ADD CONSTRAINT "board_runs_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "board_items_board_id_idx" ON "board_items" USING btree ("board_id");--> statement-breakpoint
CREATE INDEX "board_runs_board_id_idx" ON "board_runs" USING btree ("board_id");--> statement-breakpoint
ALTER TABLE "board_items" RENAME CONSTRAINT "launch_items_pkey" TO "board_items_pkey";--> statement-breakpoint
ALTER TABLE "board_runs" RENAME CONSTRAINT "launch_runs_pkey" TO "board_runs_pkey";
