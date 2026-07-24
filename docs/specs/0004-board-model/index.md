# 0004. Board model: many general boards, launch flavored

**Date**: 2026-07-24
**Status**: In Progress

## Summary

Turn module one from one launch board per user into **many named boards**. A board becomes a first class thing (a `boards` table; items and ships gain a `board_id`), an owner has many boards (the seam an account will use later), and there is a **current board** the widget shows as one tab among others. You and Claude switch boards by name, and you click tabs in the widget. The board becomes a **general checklist** (Claude reaches for it on any "give me a checklist for X"), while Tally's launch personality stays as the completion treatment: a readiness meter, and "ship / go for launch" to finish and archive a board. Every `launch_*` tool is renamed `board_*`. The existing board and its ships are migrated into a seeded default board, so nothing is lost.

## Requirements

**User stories**:
- As the builder, I want multiple named boards so different checklists do not bleed into one list across chats.
- As the builder, I want to switch boards by name (me or Claude) and by clicking tabs in the widget.
- As the builder, I want Claude to reach for a board on any checklist request, not only launches.
- As the builder, I want my existing board and its past ships preserved when this lands.

**Acceptance criteria**:
- **AC-1**: A `boards` table exists; a board has a `name` unique per owner; `board_items` and `board_runs` carry a `board_id`. The **current board** is the one with the latest `last_active_at` per owner.
- **AC-2**: `board_create(name)` makes a new board and makes it current; `board_list` returns the owner's boards with which one is current (plus each board's item count and readiness); `board_switch(name)` changes the current board.
- **AC-3**: The item, status, reset, and ship tools act on the **current board only**; items on other boards are untouched by them.
- **AC-4**: `board_rename(name)` renames the current board; `board_delete(name)` removes a board and its items (cascade), and if it was current the board that `resolveCurrentBoard()` would next select (greatest `last_active_at`) becomes current, the same one rule used everywhere. A deleted board's past **ships survive** (they keep the board's name via the `board_name` snapshot).
- **AC-5**: The migration preserves all existing data: the current `launch_items` and `launch_runs` move into a seeded default board named "Launch readiness", which becomes current; nothing is lost.
- **AC-6**: Every tool is renamed `launch_*` to `board_*`, the resource is `ui://board/app.html`, the prompt is renamed (`launch-board` to `board`), and the seeded `modules` registry row's `key` is `board`; no `launch` named surface remains. (The live connector is reconnected once.)
- **AC-7**: The widget shows a **tab per board**, highlights the current one, and clicking a tab switches the current board (calls `board_switch`); a "new board" affordance creates one.
- **AC-8**: Claude reaches for a board on a general checklist request ("give me a checklist for an apple pie" creates a board named "Apple pie" and adds the steps), because the tool descriptions are general. (Judgment, confirmed in Claude.)
- **AC-9**: The launch flavored completion stays: a board keeps the **readiness meter** and the **"ship / go for launch"** completion; `board_ship` archives and clears the **current** board (the board stays, now empty) and refuses unless every item is done.
- **AC-10**: Every `boards`, `board_items`, and `board_runs` query is scoped by `user_id` (the owner); the account seam holds and no query crosses owners.
- **AC-11**: The board management tools handle the bad cases predictably: `board_create` or `board_rename` to a name that already exists returns a clean "a board named X already exists" error (no duplicate row, no silent switch); `board_switch` or `board_delete` on a name that does not exist returns a clean "no board named X" error (never a silent create or a no op); and deleting your **last** board succeeds, after which a fresh default board is created and becomes current (`resolveCurrentBoard()` never returns nothing).

## Decision

**Chosen option**: Option 2, a strangler style reshape to a first class `boards` model, general and launch flavored, in one slice.

Introduce a `boards` table owned by `user_id` (the account seam), give `board_items` and `board_runs` a `board_id`, and track the current board by `last_active_at` (no circular foreign key). Rename `launch_*` to `board_*`, broaden the descriptions so Claude reaches for a board on any checklist, and keep the readiness meter and ship flow as Tally's completion treatment. The item, status, reset, and ship tools act on the current board; new `board_create` / `board_switch` / `board_list` / `board_rename` / `board_delete` tools manage boards; the widget grows tabs. A migration seeds a default board and moves the existing data into it. Auth and real accounts are deferred (`foundation.md` §10); only the ownership seam is built.

## Feature design

**Data model sketch** (confirmed with the engineer):

- **`boards`** (new): `id` uuid PK · `user_id` uuid FK to `users` (the owner, the account seam) · `name` text not null (1 to 100 chars) · `created_at` / `updated_at` timestamptz · `last_active_at` timestamptz not null default now. Unique `(user_id, name)`. The **current board** for an owner is the board with the greatest `last_active_at` (ties broken by `created_at` desc).
- **`board_items`** (renamed from `launch_items`, gains a board): `id` uuid PK · `user_id` uuid FK, indexed · **`board_id` uuid FK to `boards`, indexed, `ON DELETE CASCADE`** (so `board_delete` removes a board's items in one atomic statement, no explicit transaction needed) · `title` text not null (1 to 500) · `status` enum `todo`/`active`/`blocked`/`done` (default `todo`) · `position` integer not null · `created_at` · `updated_at` (bumped on every write). Items belong to a board. The `status` pgEnum is renamed `launchItemStatus` to `boardItemStatus`.
- **`board_runs`** (renamed from `launch_runs`, gains a board): `id` uuid PK · `user_id` uuid FK · **`board_id` uuid FK to `boards`, nullable, `ON DELETE SET NULL`** · **`board_name` text not null (a snapshot)** · `shipped_at` timestamptz · `item_count` integer · `items` jsonb. A shipped launch keeps its board's name even if that board is later deleted, so history survives.
- **Relationships**: `users` 1 to N `boards`; `boards` 1 to N `board_items`; `boards` 1 to N `board_runs` (nullable). `user_id` stays denormalized on items and runs so the scoping invariant (every query filters by `user_id`) is unchanged.

**State transitions**: a board is `created (current) ↔ switched ↔ renamed → deleted`. An item's `status` still moves freely among todo/active/blocked/done. `board_ship` archives and clears the current board's items (the board stays, empty). Deleting a board removes it and its items; its runs survive with `board_id` set null and the `board_name` snapshot kept.

**API surface** (MCP tools; the item, status, reset, and ship tools act on the current board, no board argument):

| Tool | Inputs | Outputs | Visibility |
|---|---|---|---|
| `board_show` | none | renders the `ui://board/app.html` widget | model + app |
| `board_status` | none | `{ board: {id,name}, boards: [ {id,name,current,itemCount,readiness} ], items, readiness }` (the widget's mount fetch: the tabs + the current board) | model + app |
| `board_list` | none | `{ boards: [ {id,name,current,itemCount,readiness} ] }` (text + structured, for Claude) | model + app |
| `board_create` | `{ name }` | the new (now current) board + its empty state | model + app |
| `board_switch` | `{ name }` | the now current board's state | model + app |
| `board_rename` | `{ name }` | renames the current board | model + app |
| `board_delete` | `{ name }` | deletes that board; returns the new current board | model + app |
| `board_item_add` / `_edit` / `_set_status` / `_delete` / `_move` | as today, on the current board | `{ item?, items, readiness }` | model + app |
| `board_item_reorder` | `{ orderedIds }` | `{ items, readiness }` | **app** only |
| `board_reset` | none | `{ items, readiness }` | model + app |
| `board_ship` | none | `{ run, items: [], readiness: 0 }` (archives + clears the current board) | **app** only |
| `board_history` | `{ limit }` optional | `{ runs: [ {id, boardName, shippedAt, itemCount, titles} ] }` across all the owner's boards | model + app |

Plus the `launch-board` prompt is renamed to a `board` prompt ("show my board"). Descriptions are general ("Add an item to the current board", "Show my checklist board"), so Claude reaches for a board on any checklist request.

**Error conditions** (board management, spelled out so the build does not leave them to chance):
- `board_create` / `board_rename` to a name that already exists for the owner: a clean error "a board named X already exists" (the unique `(user_id, name)` constraint, caught and surfaced as a tool error, never a raw Postgres violation, never a silent switch).
- `board_switch` / `board_delete` on a name that does not exist: a clean error "no board named X" (never a silent auto create, never a silent no op).
- `board_delete` of the owner's last board: succeeds, then `resolveCurrentBoard()` recreates a default board (see the zero board rule below), so the surface is never board less.
- The item, status, and ship tools keep 0002 / 0003's error conditions (item not found, invalid title, ship refuses an empty or not all done board), now also scoped to the current board.

**Key invariants**:
- **Current board is resolved in one place** (`resolveCurrentBoard()`): the owner's board with the greatest `last_active_at` (ties broken by `created_at` desc); if the owner has **none**, create a default board named "Launch readiness" and return it. This creation is idempotent and race safe (insert the default with `ON CONFLICT (user_id, name) DO NOTHING`, then read it back), so two near simultaneous calls (the widget mount fetch racing a Claude tool call) cannot create two defaults. This one function is the only definition of "current"; nothing else re derives it.
- `board_create` and `board_switch` set `last_active_at = now()` on the target board (making it current). Item and status writes do **not** bump `last_active_at` (they act on the already current board), so ordinary editing never silently changes which board is current.
- The item, status, reset, and ship tools filter by `user_id` **and** the current `board_id`. An item op never touches another board.
- **`board_delete` is a single atomic cascade delete** (the `ON DELETE CASCADE` foreign key removes the items); it does not need ship's read check write transaction, and must not copy that ceremony.
- **Tab counts never go stale from item edits.** An item mutation only changes the current board's own count and readiness, which the widget already receives in the `{ items, readiness }` payload and applies to the current tab in place. Other boards' tab figures change only on `board_create` / `board_delete` / `board_switch`, each of which returns (or triggers a refetch of) the full board list. So no fat "all boards" payload is added to every item write.
- Every `boards` / `board_items` / `board_runs` query filters by `user_id` from `resolveUserId()` (foundation §7 #6). The owner is the account seam.
- `board_ship` still refuses unless the current board has at least one item and all are `done`, checked inside the ship transaction (spec 0003), and archives + deletes only that board's snapshotted items in one transaction, now additionally scoped by `board_id` (the `board_id` filter must not reintroduce a blanket delete: delete by the snapshotted ids, exactly as 0003 does).
- Names are unique per owner, so `board_switch(name)` and `board_delete(name)` are unambiguous.
- `visibility` stays explicit; only `board_item_reorder` and `board_ship` are app only.

**Security model**: unchanged in kind. Single owner (one `users` row) today; `user_id` from `resolveUserId()` scopes everything, and `boards.user_id` is the seam a real account slots into later (`foundation.md` §10). No auth, no new secrets, no new external calls. Low sensitivity personal checklists.

**Configuration required**: none new (`DATABASE_URL`, `DEFAULT_USER_ID` as today).

**Critical test scenarios** (each maps to an acceptance criterion):
- Create + switch: `board_create("Apple pie")` makes it current; `board_create("Website")` then `board_switch("Apple pie")` makes Apple pie current again; `board_list` marks the current one. Verifies **AC-2**.
- Isolation: add items to two boards; each board's `board_status` shows only its own items; a reset or ship on one leaves the other untouched. Verifies **AC-3**.
- Rename + delete: rename the current board; delete a board and its items go, but a prior ship of it still appears in `board_history` with its name. Verifies **AC-4**.
- Migration: after the migration, the old items and ships are all under a "Launch readiness" board which is current; counts match the pre migration counts. Verifies **AC-5**.
- Rename of tools: `tools/list` shows only `board_*`, no `launch_*`; the resource is `ui://board/app.html`. Verifies **AC-6**.
- Widget tabs (in Claude): tabs render, the current is highlighted, clicking another switches it, "new board" creates one. Verifies **AC-7**.
- General grab (in Claude): "give me a checklist for an apple pie" makes an Apple pie board with the steps. Verifies **AC-8**.
- Completion: a fully done board still shows the meter full and ships (archives + clears, board stays); refuses when not all done. Verifies **AC-9**.
- Scoping: code review that every repo query filters by `user_id` (and the item ops also by the current `board_id`). Verifies **AC-10**.
- Error paths: `board_create("Apple pie")` a second time returns a "already exists" error, not a duplicate; `board_switch("Nope")` and `board_delete("Nope")` return a "no board named" error, not a silent create or no op; deleting the owner's **last** board then calling `board_status` returns a fresh default board as current (not an empty error). Verifies **AC-11**.

## Migration plan

**Strategy**: a right sized migration done in **three ordered SQL steps** (rename + add nullable, then seed + backfill, then constrain), not a single blind `drizzle-kit` diff. The multi deploy production sequence (dual write across releases) is not warranted (one owner, a handful of rows, one client briefly offline). But "one migration" must **not** be read as "one auto generated diff": auto generation has two traps that would destroy the very data this migration exists to preserve, so the mechanics below are part of the plan, not an implementation detail.

**Why not one auto generated diff (the two traps)**:
- **Rename detection is interactive.** `drizzle-kit generate` sees `launch_items` disappear and `board_items` appear and, unless its interactive prompt is answered "rename", emits `DROP TABLE launch_items` + `CREATE TABLE board_items` (and the same for `launch_runs` and the `launch_item_status` enum), which drops every existing row and every past ship. The generated SQL must be **read before it is applied** and must contain `ALTER TABLE ... RENAME TO` and `ALTER TYPE ... RENAME TO`, never `DROP`/`CREATE`, for the renamed objects.
- **You cannot go straight to `NOT NULL`.** If `schema.ts` declares `board_id` as `.notNull()` from the start, a single generated migration tries to add a `NOT NULL` column with no static default to already populated tables, which Postgres rejects (and there is no sensible static default, since the value must point at a board that does not exist until the seed runs). So `board_id` must be added **nullable**, backfilled, then constrained in a **separate** generated pass after `schema.ts` is switched to `.notNull()`.

**Phases** (each generated migration's SQL is read and confirmed before it is applied):
1. **Rename + add nullable (generated pass 1).** Write `schema.ts` with the tables renamed (`board_items`, `board_runs`, enum `board_item_status`), `board_id` **nullable** on both, `board_name` added to `board_runs`, and the new `boards` table. Generate; confirm the SQL renames (not drops) the two tables and the enum, creates `boards`, and adds the nullable columns. Apply.
2. **Seed + backfill (hand written data step, not schema generated).** In one SQL script or transaction: insert one board named "Launch readiness" for the existing owner with `last_active_at = now()`; set `board_id` on every `board_items` and `board_runs` row to that board; set `board_name` on every `board_runs` row to "Launch readiness"; and update the seeded `modules` registry row from `key = 'launch'` to `key = 'board'` (so the registry is not a rename dangle). Confirm every old row now has a `board_id` and the counts match the pre migration counts.
3. **Constrain (generated pass 2).** Switch `board_id` to `.notNull()` on `board_items` in `schema.ts`; generate; confirm the SQL is only the `ALTER COLUMN ... SET NOT NULL` (plus the `board_id` index and the `boards` foreign keys / `ON DELETE` rules if not already present). Apply.
4. **Code cutover.** Deploy the `board_*` tools and the tabbed widget (the module and resource rename `launch` to `board`). Reconnect the connector in Claude Desktop once, since the tool names and the resource uri changed.

**Rollback**: it is a single owner dev database; **before phase 1, dump the two tables** (`pg_dump` of `launch_items` + `launch_runs`, or a captured `INSERT` list) so any misstep restores in seconds. Each generated pass has a Drizzle down path; the data step is reversible by nulling `board_id` and deleting the seeded board. If phase 4 misbehaves, revert the code commit; the renamed tables still hold the data.

**Risks**: the two auto generation traps above (mitigated by reading the SQL before applying and by the nullable then constrain split). The live connector breaks the moment the tools are renamed, expected and fixed by the one time reconnect (bundle a note). The seed must exist before the backfill, and the backfill must complete before the `NOT NULL` pass. A board deleted after shipping must not orphan its run (handled by `board_runs.board_id ON DELETE SET NULL` + the `board_name` snapshot); a board deleted with live items removes them by `board_items.board_id ON DELETE CASCADE`.

## Build plan

Tracer Bullet: the migration and data first, then the board aware server, then the tabbed widget, then verify.

1. **Migration** (three ordered steps, per the Migration plan, reading each generated SQL before applying). Step 1 generated pass: `boards` table + rename the two tables and the enum + add nullable `board_id` and `board_name`, confirm the SQL says `RENAME` not `DROP`/`CREATE`. Step 2 hand written data: `pg_dump` the two tables first, then seed the "Launch readiness" board, backfill `board_id`/`board_name` on every row, and update the `modules` row `key` to `board`. Step 3 generated pass: switch `board_id` to `.notNull()`, add its index and the `boards` foreign keys / `ON DELETE` rules (`board_items` cascade, `board_runs` set null). Confirm the existing data moved and counts match. Satisfies **AC-1**, **AC-5**.
2. **Schema + shared.** Drizzle schema for `boards`, `board_items`, `board_runs`; rename `src/shared/launch.ts` to `src/shared/board.ts` and add the board management and tab schemas (`BoardSummary`, `board_list`/`create`/`switch`/`rename`/`delete` IO, the `board_status` shape with tabs). Satisfies **AC-1**.
3. **Repo.** Rename `src/server/modules/launch` to `src/server/modules/board`; add `resolveCurrentBoard()` (greatest `last_active_at`, create a default if none); scope every item/status/reset/ship query by `user_id` and the current `board_id`; board CRUD (create/switch/list/rename/delete, updating `last_active_at`); ship and history become board aware (a run stores `board_id` + `board_name`; history spans boards). Satisfies **AC-2**, **AC-3**, **AC-4**, **AC-9**, **AC-10**.
4. **Tools.** Register the `board_*` tools (renamed + the new board management ones), broaden the descriptions to general checklist language, keep visibility (`board_item_reorder` and `board_ship` app only), rename the resource to `ui://board/app.html` and the prompt. Satisfies **AC-6**, **AC-8**, **AC-9**.
5. **Widget.** Rename `src/widget/launch` to `src/widget/board`; add a **board switcher row** fed by `board_status`'s board list. `HTabs` is **already built and in use** in the widget (the All/Open/Done filter row), so this **reuses** it, it is not a port from scratch, and it must be given **distinct visual weight** from the item filter (the board switcher is the top level "which board" control with the board name and its readiness; the All/Open/Done filter is the secondary within board control), so two pill rows do not read as one. Clicking a board tab calls `board_switch`; a "+ new board" affordance calls `board_create` with an inline name input (surface the "already exists" error inline). Update the current board's tab count and readiness in place from each item mutation's `{ items, readiness }` payload (no stale tab). Keep the meter, the item list, and the ship footer, all now for the current board. Satisfies **AC-7**.
6. **Verify.** Typecheck, build, run against Postgres (migration data moved; create/switch/list/rename/delete; item isolation across boards; ship + history board aware; scoping code review), then the in Claude checks (tabs, switching by name, the general checklist grab).

## Consequences

**Positive**:
- Multiple named boards, so checklists stop bleeding into one list across chats.
- General purpose (Claude reaches for a board on any checklist) while keeping Tally's identity, design system, and ship flow (launch flavored completion).
- The account seam is now real: boards have an owner, so accounts slot in later with no reshape.
- History is durable across board deletion (the `board_name` snapshot).

**Negative / tradeoffs**:
- A real migration and a broad rename: the connector must reconnect once (tool names and the resource uri change), and specs 0002 / 0003 now describe the historical `launch_*` naming.
- The current board is implicit state (greatest `last_active_at`), a little hidden magic, mitigated by the widget always showing the tabs and the current highlight.
- More surface: five board management tools and a tabbed widget, on top of the existing set.
- `foundation.md` needs a substantial update (§5 core model, §6 tools, §1/§2 framing, a new §7 decision), so this is a v6 of the authority.

**Neutral**:
- Still a single owner; real accounts and auth remain a separate future epic (`foundation.md` §10), only the seam is built.
- The launch theme becomes a flavor applied to any board rather than the whole product's subject.

## Follow-up

- [ ] On acceptance, update `foundation.md` to v6: §5 core model (a board is a first class, general checklist; an owner has many), §6 the `board_*` tool surface, §1/§2 framing (Tally is a general command surface, checklists are module one), and a new §7 decision recording the many general boards choice. This is the biggest foundation update yet.
- [ ] Flip the `Tabs` row in `ui-registry.md` to built: `HTabs` is already implemented and in use (the item filter row), so the registry is stale; build task 5 reuses it for the board switcher.
- [ ] Cache bust the `ui://` resource (a version on the uri) so the connector re fetches the widget after a redeploy (the resource uri already changes here, which forces one refresh, but a durable scheme is still wanted for future deploys).
- [ ] Restore a shipped board as a template for a new board (deferred from spec 0003; now natural with named boards).
- [ ] Accounts and auth: the next epic, on the `boards.user_id` seam (`foundation.md` §10).
- [ ] Specs 0002 and 0003 keep their `launch_*` names as the historical record; add a one line pointer in each to spec 0004 for the rename.

## Rationale

Reasoning, the options, and references live in `rationale.md`.
