# 0002. Launch board (module one)

**Date**: 2026-07-23
**Status**: In Progress

## Summary

Build module one for real: a launch readiness board that renders as the designed widget inside Claude, backed by Postgres. You and Claude add tasks, move them through four states (todo, active, blocked, done), reorder them by drag, and reset the board; a readiness meter shows the percent done, and hitting 100 percent lights up the completion moment. This slice introduces the database, the full `launch_*` tool surface, the `launch-board` prompt, and the real widget ported from the design system, and it deletes the throwaway render spike. It also proves the module pattern end to end (own table plus registry row plus tool prefix plus widget), so module two is additive.

## Requirements

**User stories**:
- As the builder, I want a launch readiness board that I and Claude can fill with tasks, move through four states, reorder, and reset, rendered as a widget inside Claude, so I can see what is left before a launch and have Claude reason about it in conversation.
- As a developer who self hosts Tally, I want the board state to persist in Postgres so it survives reloads and restarts.

**Acceptance criteria**:
- **AC-1**: Invoking the board (the `launch-board` prompt, or `launch_board_show`) renders the designed board widget inline in Claude, showing every task and a readiness meter (percent done).
- **AC-2**: Adding a task (from the widget, or from Claude via `launch_item_add`) persists it to Postgres and it appears with status `todo`.
- **AC-3**: Setting a task's status (checkbox toggles done and todo; the status control sets active and blocked; or Claude via `launch_item_set_status`) persists and updates the readiness meter, where readiness equals count(done) / count(all).
- **AC-4**: Editing a task's title and deleting a task (widget or Claude) persist and reflect immediately.
- **AC-5**: Reordering tasks by drag in the widget persists the new order via the app only `launch_item_reorder`, and the order survives a reload.
- **AC-6**: Reset sets every task back to `todo` (keeping the tasks) and the meter to 0 percent.
- **AC-7**: All board state persists across a page reload and a server restart (it lives in Postgres, not process memory).
- **AC-8**: Every `launch_items` query is scoped by `user_id` from the single resolver; no query touches another user's rows.
- **AC-9**: `launch_item_reorder` is app only (not offered to the model); the other tools are model+app so Claude can operate the board in conversation.
- **AC-10**: The widget renders correctly in light and dark, uses the self hosted brand fonts, and respects `prefers-reduced-motion` (the springy check and complete motion collapses).
- **AC-11**: At 100 percent done, the meter and board show the completion glow and a "go for launch" footer state (visual only in v1).

## Options considered

Reasoning and the full options table live in `rationale.md`. In short: build the launch module as **one Tracer Bullet slice with its own `launch_items` table** (chosen), over splitting persistence and UI into two specs, or using a generic `items` god table with a module column (which foundation §4 and §9 reject).

## Decision

**Chosen option**: Option 1, the launch module as one slice with per module tables.

Build the launch readiness board as module one: a `users` table, a thin `modules` registry row, and the launch module's own `launch_items` table (four state status enum); the full `launch_*` tool surface (model+app, with `launch_item_reorder` app only); the `launch-board` prompt; and a React widget that ports the design system's board components and inlines the brand tokens and self hosted fonts. It replaces and deletes the render spike. Assembled as a Tracer Bullet: a thin database to tool to widget thread first, then thicken.

## Feature design

**Data model sketch** (confirmed with the engineer):

- **`users`**: `id` uuid PK · `created_at` timestamptz. One seeded row in v1 (the default user; `resolveUserId()` returns it).
- **`modules`** (registry seam): `id` uuid PK · `user_id` uuid FK to `users.id` · `key` text (`"launch"`) · `created_at` timestamptz · unique `(user_id, key)`. Thin in v1 (one row); the seam module two attaches to (foundation §9).
- **`launch_items`** (the launch module's own table): `id` uuid PK · `user_id` uuid FK to `users.id`, indexed · `title` text not null (1 to 500 chars) · `status` enum `todo` / `active` / `blocked` / `done` (default `todo`) · `position` integer not null (order within the user's board) · `created_at` timestamptz · `updated_at` timestamptz, **set on every write** (Drizzle `.$onUpdate` or set explicitly in each repo write).
- **Relationships**: `users` 1 to N `modules`; `users` 1 to N `launch_items`. Items belong to the launch module by living in `launch_items` (no polymorphic `module_id`; the per module table keystone, foundation §9).
- **Database client is a singleton.** The `postgres.js` client and the Drizzle instance are created **once at module load** in `src/server/db/client.ts`; repos import that singleton. They are never constructed inside the per request `createServer()` factory. The transport is stateless (a fresh MCP server per request, per spec 0001), so a per request client would open and leak a new connection pool on every call.

**State transitions**: a task's `status` moves freely among `todo` / `active` / `blocked` / `done`, set by the user or Claude. The checkbox toggles `done` and `todo`; the status control also sets `active` and `blocked`. The board reset sets every item to `todo`. `done` is the state that counts toward readiness.

**API surface** (MCP tools over JSON-RPC; "error" is a tool error, MCP has no HTTP codes):

| Tool | Inputs | Outputs | Visibility | Error conditions |
|---|---|---|---|---|
| `launch_board_show` | none | the `ui://` widget resource (renders the board) | model + app | resource missing |
| `launch_status` | none | `{ items, readiness }` as structured content **plus** a short text summary | model + app | none |
| `launch_item_add` | `{ title }` | `{ item, items, readiness }` | model + app | invalid title |
| `launch_item_edit` | `{ id, title }` | `{ item, items, readiness }` | model + app | not found, invalid title |
| `launch_item_set_status` | `{ id, status }` | `{ item, items, readiness }` | model + app | not found, bad status |
| `launch_item_delete` | `{ id }` | `{ items, readiness }` | model + app | not found |
| `launch_board_reset` | none | `{ items, readiness }` | model + app | none |
| `launch_item_move` | `{ id, position }` | `{ items, readiness }` | model + app | not found; position clamped to range |
| `launch_item_reorder` | `{ orderedIds }` | `{ items, readiness }` | **app** only | applies the given order, appends any of the user's items not in the list at the end, ignores unknown ids |

> **Post-build change (2026-07-23):** `launch_item_move` (model+app, "move one item to a position") was added after real use showed Claude should be able to reorder in conversation. `launch_item_reorder` stays app only for the drag (it takes the whole new order); the two tools split cleanly by actor (`foundation.md` §7 #11, now v4).

Plus the **`launch-board`** MCP prompt (a canned "show my launch readiness board" that triggers `launch_board_show`).

**How the widget gets and updates its data** (the confirmed pull model from spec 0001): `launch_board_show` only renders the widget; on mount the widget calls **`launch_status`** via `callServerTool` and reads the structured `{ items, readiness }` (this mirrors `spike_state` in 0001, kept separate from the render tool on purpose). Every mutation tool returns the updated `{ items, readiness }`, so after a click the widget updates straight from the tool result with no extra fetch. `launch_status`'s text summary is what Claude reads to reason in conversation.

**Key invariants**:
- Every `launch_items` read and write filters by `user_id` from `resolveUserId()` (one place). An unscoped query is a bug (code-standards §5, foundation §7 #6).
- Readiness = `count(all) === 0 ? 0 : count(done) / count(all)` for the user (the empty board reads 0 percent, never NaN).
- `updated_at` is refreshed on every write (edit, set status, delete is a removal, reset, reorder).
- `launch_item_reorder` rewrites positions inside **one transaction** (all or nothing), so a mid loop failure never leaves a half ordered board.
- `visibility` is explicit on every tool; only `launch_item_reorder` is app only.
- The `ui://` resource is one self contained file: the token CSS, the brand font weights (base64 `@font-face`), and the widget JS all inlined by `vite-singlefile`. No external network.
- No secret ships in the widget bundle.

**Security model**: single tenant, no auth. `user_id` comes from `resolveUserId()`, which returns `DEFAULT_USER_ID`; the seed inserts the single `users` row using that same `DEFAULT_USER_ID`, so the env value and the seeded row's id are identical by construction. It never comes from tool arguments or the widget. Every query is scoped by it. No regulated data, so no compliance scope. `DATABASE_URL` lives server side only.

**Configuration required**:
- `DATABASE_URL`: the Postgres connection string (Railway Postgres).
- `DEFAULT_USER_ID`: the single user's id in v1. The seed step inserts that `users` row and its `modules` row (`key = "launch"`) using this id.

**Critical test scenarios** (each maps to an acceptance criterion):
- Happy path: add a task, set it done, the meter updates, reload, the state persists. Verifies **AC-1**, **AC-2**, **AC-3**, **AC-7**.
- Reorder: drag two tasks, reload, the new order holds. Verifies **AC-5**.
- Reset: reset a partly done board, every task returns to todo and the meter reads 0. Verifies **AC-6**.
- Claude operates the board: in conversation, Claude adds a task and sets a status; both persist. Verifies **AC-2**, **AC-3**, **AC-9**.
- Visibility: Claude cannot call `launch_item_reorder` (app only). Verifies **AC-9**.
- Theming and motion: the widget looks right in light and dark, brand fonts load, reduced motion collapses the springs. Verifies **AC-10**.
- Completion: a fully done board shows the glow and the "go for launch" footer. Verifies **AC-11**.
- Scoping (AC-8, not behaviorally testable with one user in v1): a code review step that greps every function in the `launch_items` repo and confirms each query filters by `resolveUserId()`; no raw unscoped query exists. Verifies **AC-8**.

## Build plan

Tracer Bullet: stand up a thin database to tool to widget thread first, then thicken, then delete the spike, then verify. The migration is task 1.

1. **Data layer.** Provision Railway Postgres and set `DATABASE_URL`; add the `postgres.js` client and Drizzle instance **as a module load singleton in `src/server/db/client.ts`** (never inside `createServer()`); define the schema (`users`, `modules`, `launch_items` with the status enum, indexes on `launch_items.user_id`); generate and run the `drizzle-kit` migration; confirm the tables are live (query the database, not just the file); add a seed that inserts the single user (id = `DEFAULT_USER_ID`) and its `modules` row. Satisfies the persistence half of **AC-7**; enables **AC-2** to **AC-8**.
2. **Repo + shared schemas.** A `launch_items` repo (list, add, edit, setStatus, delete, reorder in a transaction, reset), every query scoped by `resolveUserId()`, `updated_at` set on every write; Zod schemas in `src/shared/` for the item and each tool's input and output. Satisfies **AC-8**.
3. **Thin thread.** `launch_board_show` renders the widget; `launch_status` returns the real persisted `{ items, readiness }`; a minimal widget calls `launch_status` on mount and lists the items (no full design yet). Prove database to tool to widget renders real data end to end. Satisfies **AC-1** (thread), **AC-7**.
4. **Full tool surface.** `launch_item_add`, `launch_item_edit`, `launch_item_set_status`, `launch_item_delete`, `launch_board_reset` (model+app), `launch_item_reorder` (app only); each mutation returns the updated `{ items, readiness }`; log each call. Satisfies **AC-2**, **AC-3**, **AC-4**, **AC-6**, **AC-9**.
5. **The prompt.** Register the `launch-board` MCP prompt that triggers `launch_board_show`. Satisfies **AC-1** (discoverable trigger).
6. **The designed widget.** Port `ChecklistItem`, `ProgressBar`, `Status`, `Button`, `Checkbox`, `Input`, `Icon` (and needed primitives) from `design/` into `src/widget/launch/` **as `.tsx` files, copying the component JSX and the specific `helm-*` CSS**; do **not** load the compiled `_ds_bundle.js` or the `window.HelmDesignSystem_94b187` global (they cannot work in an isolated single file bundle, see `ui-registry.md`). Inline the token CSS; self host the used brand font weights as base64 `@font-face`; build the board (readiness meter + mono eyebrow, item rows with checkbox + status + drag handle + menu, add input, reset, the 100 percent completion moment); wire the app bridge to the `launch_*` tools; support light and dark and reduced motion. Reference `design/ui_kits/board/`. Satisfies **AC-1**, **AC-3**, **AC-5**, **AC-10**, **AC-11**.
7. **Delete the spike.** Remove `src/server/modules/spike/` and `src/widget/spike/`, drop the spike tools from the server wiring, confirm nothing references them, typecheck clean (spec 0001 follow up).
8. **Verify + deploy.** Typecheck and build; run against Claude Desktop through the tunnel to check AC-1, AC-3, AC-5, AC-9, AC-10, AC-11; then deploy to Railway, which also closes spec 0001 AC-5. In Claude checks are human in the loop.

## Consequences

**Positive**:
- Proves the module keystone end to end (own table + registry row + tool prefix + widget), so module two is four additive moves.
- Ships the product's centerpiece: a real, persisted launch board and the portfolio demo.
- Puts the design system to real use, validating the tokens and components inside the embed.

**Negative / tradeoffs**:
- The biggest slice so far; it introduces the database and its operational surface (a migration, a pooled connection, a seed).
- Self hosting the fonts grows the widget bundle (mitigated by bundling only the used weights).
- The four state model extends foundation's binary item, so foundation gets a small update this cycle (see Follow up).
- `position` as an integer reindexed on reorder rewrites positions on each reorder; fine at personal scale, not for huge lists.

**Neutral**:
- `DATABASE_URL` is a new server side secret.
- The render spike is deleted (its rendering proof is superseded by the real board).
- The completion "Ship it" is visual only in v1; a real ship or archive action is a later decision.

## Follow-up

- [ ] **This cycle (on acceptance):** update `foundation.md` §5 (item model: add the four state `status`) and §6 (tool surface: `toggle` becomes `set_status`, `launch_status` carries the structured mount data) and bump it to v3, so the authority does not contradict this accepted spec.
- [ ] Bundle only the font weights actually used (for example Space Grotesk 600/700, Hanken Grotesk 400/500/600, JetBrains Mono 500) to keep the base64 small; the Google fonts are OFL licensed and embeddable.
- [ ] Revisit `position` (a fractional index) only if lists ever grow large.
- [ ] A real "ship / launch" action (archive, snapshot, or reset with history) is deferred; decide when the command surface home or module two lands.
- [ ] After this ships, mark spec 0001 (render spike) done or superseded for the rendering concern.
- [ ] Confirm the real widget also renders in claude.ai (bonus, non gating).

## Rationale

Reasoning, the options table, and references live in `rationale.md`.
