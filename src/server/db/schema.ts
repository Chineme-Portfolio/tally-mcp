import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// The four task states (foundation.md §5, spec 0002). `done` counts toward
// readiness; the checkbox toggles done and todo, the status control sets
// active and blocked. (Renamed from launch_item_status in spec 0004.)
export const boardItemStatus = pgEnum("board_item_status", [
  "todo",
  "active",
  "blocked",
  "done",
]);

// An account (spec 0005). One row per signed in person; `user_id` on every
// other table scopes that person's data. The row is created on first sign in.
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // The identity provider's stable subject claim (Clerk's `sub`), or the
    // local sentinel when AUTH_MODE=none. This is the identity key: one
    // person is one subject is one row. Clerk's account linking means Google
    // and GitHub for the same person resolve to the same subject.
    authSubject: text("auth_subject").notNull(),
    // From the verified token claims, refreshed when it changes at the
    // provider. Nullable: a provider need not supply an email.
    email: text("email"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (t) => [unique("users_auth_subject_unique").on(t.authSubject)],
);

export type UserRow = typeof users.$inferSelect;

// The module registry seam (foundation.md §9). Thin in v1: one row, key "board".
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

// A board: one named checklist (spec 0004). An owner has many. The current
// board is the one with the greatest last_active_at (ties: created_at desc);
// board_create and board_switch bump last_active_at, item writes do not.
// Names are unique per owner so switch/delete by name are unambiguous.
export const boards = pgTable(
  "boards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("boards_user_name_unique").on(t.userId, t.name),
    index("boards_user_id_idx").on(t.userId),
  ],
);

export type BoardRow = typeof boards.$inferSelect;

// A board's items (spec 0004, renamed from launch_items). Scoped by user_id AND
// board_id. ON DELETE CASCADE, so deleting a board removes its items in one
// atomic statement (no explicit transaction).
export const boardItems = pgTable(
  "board_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    boardId: uuid("board_id")
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    status: boardItemStatus("status").notNull().default("todo"),
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
  (t) => [
    index("board_items_user_id_idx").on(t.userId),
    index("board_items_board_id_idx").on(t.boardId),
  ],
);

export type BoardItemRow = typeof boardItems.$inferSelect;

// A shipped board, archived (spec 0003 + 0004). Immutable: the app never
// updates or deletes a row. board_id is nullable with ON DELETE SET NULL and
// board_name is a snapshot, so a run survives its board being deleted.
export const boardRuns = pgTable(
  "board_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    boardId: uuid("board_id").references(() => boards.id, {
      onDelete: "set null",
    }),
    boardName: text("board_name").notNull(),
    shippedAt: timestamp("shipped_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    itemCount: integer("item_count").notNull(),
    items: jsonb("items")
      .notNull()
      .$type<
        Array<{
          title: string;
          status: "todo" | "active" | "blocked" | "done";
          position: number;
        }>
      >(),
  },
  (t) => [
    index("board_runs_user_id_idx").on(t.userId),
    index("board_runs_board_id_idx").on(t.boardId),
  ],
);

export type BoardRunRow = typeof boardRuns.$inferSelect;
