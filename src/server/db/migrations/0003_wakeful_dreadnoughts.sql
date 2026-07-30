-- Spec 0005: accounts and authentication. Start clean (the engineer's explicit
-- choice): delete every existing row first, so `auth_subject` can be added NOT
-- NULL with no backfill. One delete on "users" cascades boards, board_items,
-- board_runs, and modules, since each references users with ON DELETE CASCADE.
-- Accounts are recreated on first sign in; the seed writes the local sentinel
-- user for AUTH_MODE=none.
DELETE FROM "users";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "auth_subject" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_auth_subject_unique" UNIQUE("auth_subject");