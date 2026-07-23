import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// The four task states (foundation.md §5, spec 0002). `done` counts toward
// readiness; the checkbox toggles done and todo, the status control sets
// active and blocked.
export const launchItemStatus = pgEnum("launch_item_status", [
  "todo",
  "active",
  "blocked",
  "done",
]);

// One row in v1 (the default user). user_id everywhere scopes to it.
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// The module registry seam (foundation.md §9). Thin in v1: one row, key "launch".
// Module two attaches here without a schema change.
export const modules = pgTable(
  "modules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("modules_user_key_unique").on(t.userId, t.key)],
);

// The launch module's own table (not a generic god table; foundation.md §9).
export const launchItems = pgTable(
  "launch_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    status: launchItemStatus("status").notNull().default("todo"),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    // Refreshed on every Drizzle update (edit, set status, reorder, reset).
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (t) => [index("launch_items_user_id_idx").on(t.userId)],
);

export type LaunchItemRow = typeof launchItems.$inferSelect;
