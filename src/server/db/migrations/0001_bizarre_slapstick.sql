CREATE TABLE "launch_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"shipped_at" timestamp with time zone DEFAULT now() NOT NULL,
	"item_count" integer NOT NULL,
	"items" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "launch_runs" ADD CONSTRAINT "launch_runs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "launch_runs_user_id_idx" ON "launch_runs" USING btree ("user_id");