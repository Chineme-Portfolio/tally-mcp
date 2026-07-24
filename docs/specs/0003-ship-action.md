# 0003. Ship action: archive the launch and tell Claude

**Date**: 2026-07-23
**Status**: Proposed

## Summary

When the launch board reaches 100 percent, a "Go for launch" badge appears next to an active "Ship it" button. Below 100 percent there is no button at all, which removes today's dead control (it currently lights up and does nothing). Clicking "Ship it" asks to confirm in place, then archives the finished board as one launch record, empties the board for the next launch, briefly confirms in the widget, and posts a short message to Claude ("Shipped. 7 tasks done, board's green.") so Claude can respond or help start the next one. Shipping is button only, so Claude cannot ship your board, but Claude can read what you shipped before.

## Context

Spec 0002 shipped the board with a footer button that is disabled until every task is done and then flips to "Ship it", but with no click handler. That was deliberate: 0002 AC-11 called the completion moment "visual only in v1", and its follow up deferred "a real ship / launch action (archive, snapshot, or reset with history)". Using the board for real raised the question, so it is time to settle it.

Two problems need solving. First, the control is dead: at 100 percent the button enables and then ignores you, which is worse than having no button. Second, the board has no idea a launch ever happened. Finishing everything and resetting throws the record away, and "launch readiness" is a product about launches, so the launches themselves are worth keeping.

The forces: this is a solo build at about 10 hours a week, so the slice must stay small. The board is the portfolio centerpiece, so a satisfying completion moment matters. Shipping is destructive (it empties the board), so it needs a guard rail and it must be safe against anything happening at the same time. And the widget has so far used only two MCP Apps capabilities, rendering and calling tools; the `ui/message` primitive (a widget posting a message to the agent) is a third one this action can genuinely use rather than bolt on.

## Requirements

**User stories**:
- As the builder, when every task is done I want to mark the launch shipped in one deliberate action, so the board clears for the next launch and the finished list is kept as a record.
- As the builder, I want Claude told when I ship, so it can respond or help me start the next launch.
- As the builder, I want to ask Claude what I shipped last time.

**Acceptance criteria**:
- **AC-1**: Below 100 percent the footer shows the remaining count and **no ship button at all** (today's dead control is gone).
- **AC-2**: At 100 percent the footer shows a **"Go for launch" badge** and an **active "Ship it" button**.
- **AC-3**: Clicking "Ship it" once asks to confirm in place (the button relabels to **"Confirm ship"**); clicking again ships. The confirming state clears on blur, after **5 seconds**, or if the board stops being complete (for example a task is un ticked between clicks), and clearing it never ships.
- **AC-4**: Shipping writes one `launch_runs` row (a snapshot of the items, `shipped_at`, `item_count`) and deletes **exactly those snapshotted items**, with the read, the completeness check, the insert, and the delete **all inside one transaction**. A task added or changed at the same time is either fully included or fully left on the board, never silently lost.
- **AC-5**: After a successful ship the widget shows a brief **"Shipped"** confirmation in the footer (about 4 seconds), then the empty board state and the below 100 percent footer.
- **AC-6**: After a successful ship the widget posts a message to Claude via `app.sendMessage`, including the count (for example "Shipped. 7 tasks done, board's green."), and degrades quietly if the host does not support messages or rejects it.
- **AC-7**: `launch_board_ship` is **app only**: it is not offered to the model, so Claude cannot ship the board.
- **AC-8**: `launch_history` is **model + app**: asking Claude "what did I ship last time?" returns recent launches (shipped date, item count, the task titles).
- **AC-9**: Shipping is refused if the board is empty or any task is not done, and the refusal is enforced **in the transaction**, not just by the button.
- **AC-10**: If the ship call fails or times out, the widget **reloads the board from `launch_status`** instead of trusting its local state, and shows the error. (The server may have committed before the response was lost, so stale items must never be left on screen.)

## Options considered

### Option 1: Archive to a `launch_runs` table, clear the board, button only (chosen)

Ship writes a snapshot row and deletes the snapshotted items in one transaction. The button is the only way to trigger it; a separate model visible tool lets Claude read past launches.

**Pros**:
- Ship becomes a real, recorded event, and the board is genuinely reusable for the next launch.
- The archive means shipping destroys nothing permanently, which is what makes clearing safe.
- Keeps a clean actor split: the human commits the launch, Claude can read the history.

**Cons**:
- A new table and migration, plus a destructive action with no restore path in this slice.

### Option 2: Reuse reset (no archive)

"Ship it" just calls the existing reset.

**Pros**:
- No schema change at all; smallest possible slice.

**Cons**:
- Throws away the launch record, so the product still has no idea a launch happened. It also makes ship and reset the same action wearing two labels, which is confusing rather than simpler.

### Option 3: Full launch history surface in the widget

Archive plus a history view (past launches, dates, counts) in the board UI.

**Pros**:
- The most product value; the archive is visible where you work.

**Cons**:
- A genuine extra UI slice with its own design and states, on top of the action itself. Better as a follow up once the archive exists and proves useful.

## Decision

**Chosen option**: Option 1, archive and clear, button only, with a Claude readable history.

`launch_board_ship` (**app only**) opens one transaction, reads and validates the board inside it, writes one `launch_runs` snapshot row, and deletes exactly the snapshotted items. The widget confirms in place before calling it, briefly confirms after, and posts a short message to Claude with `app.sendMessage`. A separate `launch_history` tool (**model + app**) lets Claude answer "what did I ship last time?" without any history UI.

Making ship app only is a deliberate reversal of the usual pattern here (foundation §7 #10 makes writes model + app). Shipping is a commitment that empties the board, so it stays a human act. It becomes the **second** app only tool, after `launch_item_reorder`.

## Rationale

Option 2 fails the second problem in Context outright. Reusing reset leaves the product with no idea a launch ever happened, and it collapses two different intentions ("run this list again" and "this launch is done") into one action with two labels. The whole reason the question came up is that finishing the board should *mean* something.

Option 3 is the right eventual shape, but not this slice. At about 10 hours a week, a history surface is its own design and build job with its own states. Archiving plus a small model visible tool captures most of the value for a fraction of the work: you can already ask "what did I ship last time?" and get a real answer, and the archive earns its keep before anyone spends a day designing a screen for it. If it turns out you never ask, that is useful information too.

Three choices deserve their reasoning stated. **App only ship** was the engineer's call and it holds up: shipping empties the board, so it is the one board action where a wrong model call costs real work, and while the archive means nothing is truly lost, recovering is manual. A guard rail is worth the small inconsistency of Claude being able to do everything except this. **The two step confirm** over a proper dialog is about cost: `Dialog` is still unported, and an in place relabel costs nothing while stopping the only failure that actually matters, a stray click on an enabled button. **Everything inside one transaction, deleting only the snapshotted ids**, is not ceremony: a blanket delete by user after a check done outside the transaction would silently destroy any task added while the ship was in flight, which is exactly the kind of quiet data loss a personal tool never recovers from.

The message to Claude is not decoration, and it is worth being clear why: because ship is app only, Claude never sees the tool call at all, so `sendMessage` is the only channel that tells it a launch happened. Carrying the count in the message means Claude can say something concrete without a follow up call.

## Feature design

**Data model sketch**:

- **`launch_runs`** (new): `id` uuid PK · `user_id` uuid FK to `users.id`, indexed · `shipped_at` timestamptz not null default now · `item_count` integer not null · `items` jsonb not null (the snapshot: an array of `{ title, status, position }`).
- Scoped by `user_id` like every other table (`code-standards.md` §5). Rows are **immutable**: the app never updates or deletes a `launch_runs` row.
- Snapshot as jsonb rather than normalized archive rows: this is written once and read as a short recent list, so a second table and a join would buy nothing. `status` is always `done` at write time, but it is stored anyway so the shape still works if the "must be 100 percent" rule is ever relaxed.
- No change to `users`, `modules`, or `launch_items`.

**State transitions**: the board goes `has items (some done)` → *(ship, only when every item is done)* → `empty`, and one immutable `launch_runs` row appears. Ship is distinct from reset, which keeps the items and sets them all back to `todo` (foundation §5).

**API surface** (MCP tools; "error" is a tool error):

| Tool | Inputs | Outputs | Visibility | Error conditions |
|---|---|---|---|---|
| `launch_board_ship` | none | `{ run: { id, shippedAt, itemCount }, items: [], readiness: 0 }` | **app** only | board is empty; any item is not `done` |
| `launch_history` | `{ limit }` optional (default 5, max 20) | `{ runs: [ { id, shippedAt, itemCount, titles } ] }` | model + app | none |

**Key invariants**:
- **One transaction covers everything**: the read of the items, the completeness check, the snapshot insert, and the delete all happen inside a single transaction, using the transaction handle for every query (the pattern `reorder()` and `moveItem()` already use).
- **Delete exactly the snapshotted ids** (`where id in (…)`), never a blanket delete by `user_id`. A task added while the ship is in flight is either inside the snapshot and cleared, or untouched and still on the board, never silently lost.
- Ship is refused unless the board has at least one item and **every** item is `done`, checked inside the transaction so the rule holds even if the UI is wrong or stale.
- Every `launch_runs` and `launch_items` query filters by `user_id` from `resolveUserId()` (foundation §7 #6).
- `launch_runs` rows are never mutated or deleted by the app.
- The message to Claude is **best effort**: it is sent only after the ship has committed, and a failure to send never undoes or blocks the ship.
- `visibility` stays explicit on both new tools.

**Security model**: unchanged. Single tenant, no auth, `user_id` from `resolveUserId()`. `launch_runs` holds the same low sensitivity personal data as the board. No new secrets, no new external calls. `launch_history` exposes nothing new to the model: it resurfaces items Claude can already read live through `launch_status`, so the app only split here is about who may *act*, not who may *see*.

**Configuration required**: none.

**Widget behaviour** (the footer):
- Below 100 percent: the remaining count text only, **no button**.
- At 100 percent: a **"Go for launch" badge** (port `Badge` from the design system, `ui-registry.md`) plus an active **"Ship it"** button.
- First click sets a local `confirming` state and relabels the button **"Confirm ship"**; a second click ships. `confirming` clears on blur, after a **5 second** timer, or if the board stops being complete. Pointer leave is deliberately **not** a trigger: the cursor naturally drifts off the button between clicks.
- On success: apply the returned board (empty), clear `confirming`, show a transient **"Shipped"** footer confirmation for about 4 seconds, then fall back to the normal below 100 percent footer. The existing `call()` and `readBoard()` helpers already parse this response correctly (the extra `run` key is ignored by `BoardState.safeParse`), and the widget reads `run.itemCount` separately for the message.
- On failure or timeout of the ship call: show the error and **force a reload via `launch_status`** rather than trusting local state, because the server may have committed before the response was lost.
- Then (best effort, after commit): `app.sendMessage({ role: "user", content: [{ type: "text", text: "Shipped. N tasks done, board's green." }] })`, guarded by `app.getHostCapabilities()?.message?.text`, wrapped so a throw or an `isError` result is ignored silently.

**Critical test scenarios** (each maps to an acceptance criterion):
- Below 100 percent: the footer shows the count and no button exists in the DOM. Verifies **AC-1**.
- At 100 percent: the badge and an enabled "Ship it" appear. Verifies **AC-2**.
- Confirm through: one click shows "Confirm ship" and does not ship; the second click ships. Verifies **AC-3**.
- Confirm cancel: after one click, blurring, waiting past 5 seconds, and un ticking a task each return the button to "Ship it" without shipping. Verifies **AC-3**.
- Ship: a `launch_runs` row appears with the right `item_count` and snapshot, `launch_items` for that user is empty, and the board reads empty afterwards. Verifies **AC-4**, **AC-5**.
- Concurrency: add a task through a second client between the snapshot and the commit; that task is either archived with the rest or still on the board afterwards, and is never missing from both. Verifies **AC-4**.
- Shipped confirmation: the footer shows "Shipped" briefly, then the empty state. Verifies **AC-5**.
- Message: after shipping, a "Shipped. N tasks done, board's green." user message appears in the conversation; with host message support absent, the ship still succeeds and nothing breaks. Verifies **AC-6**.
- Visibility: Claude is not offered `launch_board_ship` and cannot ship; Claude *is* offered `launch_history` and can answer "what did I ship last time?". Verifies **AC-7**, **AC-8**.
- Refusal: calling ship on an empty board, and on a board with an unfinished task, both return a tool error and change nothing. Verifies **AC-9**.
- Lost response: simulate the ship call failing after the server commits; the widget reloads and shows the empty board plus an error, never stale items. Verifies **AC-10**.

## Build plan

Tracer Bullet: the data layer first, then the thin server thread, then the widget, then the message.

1. **Migration.** Add `launch_runs` to the Drizzle schema (with the `user_id` index), generate and run the migration, and confirm the table is live by querying the database. Enables **AC-4**, **AC-8**.
2. **Shared schemas + repo.** Add the new Zod schemas to `src/shared/launch.ts` (the `run` shape, `launch_history`'s `{ limit }` input and `{ runs }` output), then `shipBoard()`: open one transaction and, **inside it**, read the user's items with the transaction handle, refuse unless there is at least one and all are `done`, insert the snapshot row, and delete **exactly those snapshotted ids**; return the run plus the now empty board. Add `listRuns(limit)`, scoped. Satisfies **AC-4**, **AC-9**.
3. **Tools.** Register `launch_board_ship` (`visibility: ["app"]`) and `launch_history` (model + app) in the launch module. Satisfies **AC-7**, **AC-8**, **AC-9**.
4. **Widget footer.** Port `Badge` from the design system into `src/widget/launch/kit-ui.tsx`; render the below 100 form (count, no button) and the at 100 form (badge plus button). Satisfies **AC-1**, **AC-2**.
5. **Ship flow.** Wire the two step confirm (with the 5 second timer, blur, and the "no longer complete" reset), call `launch_board_ship`, apply the returned empty board, show the transient "Shipped" confirmation, and on failure force a `launch_status` reload and surface the error. Satisfies **AC-3**, **AC-5**, **AC-10**.
6. **Tell Claude.** After a committed ship, call `app.sendMessage` with the ContentBlock array shape and the item count, guarded by `getHostCapabilities()?.message?.text` and swallowing failures. Satisfies **AC-6**.
7. **Verify.** Typecheck, build the widget, exercise ship and history against Postgres (including both refusal cases and the concurrency case), then the in Claude checks (badge, two step, the shipped confirmation, the message appearing, Claude unable to ship, Claude reading history).

## Consequences

**Positive**:
- The dead control is gone, and the completion moment becomes a real action instead of a tease.
- Launches become records, so the product finally knows a launch happened, and Claude can answer questions about past ones.
- Demonstrates a third MCP Apps capability (`ui/message`), on top of rendering and tool calls, and it is a genuine use: because ship is app only, it is the only way Claude learns a launch happened.
- A second honest app only tool (after drag reorder), which sharpens the app and model split rather than diluting it.

**Negative / tradeoffs**:
- A new table and migration, and shipping is destructive: the items leave the board, recoverable only by reading the archive, with no restore path in this slice.
- Claude cannot ship. That is deliberate, but it is now the one board action Claude cannot perform, which may feel inconsistent the first time you ask it to.
- The two step confirm adds a click, and its cancel behaviour (blur, timer, completeness change) is the fiddliest part of this slice.
- Requiring 100 percent means you cannot ship a partial board even if you want to call it done.

**Neutral**:
- `launch_runs` is write mostly; only `launch_history` reads it.
- The message posts as a **user** message in the transcript (that is how the primitive works), and the host may deliver it on the next turn rather than immediately, which is why the widget also confirms the ship on its own.

## Follow-up

- [ ] Restore a past launch's items as a starting template for a new launch (deferred; the natural next step now that snapshots exist).
- [ ] A launch history surface in the widget (deferred; Claude readable is the v1 answer).
- [ ] Consider relaxing the "must be 100 percent" rule if shipping a partial board ever becomes a real need.
- [ ] On acceptance, record the two new tools in `foundation.md` §6 and the app only ship decision in §7 (it reverses the usual model + app writes rule of §7 #10 for this one action).
- [ ] Mark `Badge` as built in `ui-registry.md` when build task 4 lands.

## References

**Project sources** (verifiable, in this repo):
- `foundation.md` §5 (item lifecycle and how reset differs), §6 (tool surface), §7 #6 (single tenant scoping), §7 #10 (writes are model + app, which this action deliberately departs from), §7 #11 (the app and model split).
- `docs/specs/0002-launch-board/index.md` (the board, its data model and tools, and the AC-11 deferral this spec closes).
- `context/code-standards.md` §4 (explicit visibility, thin handlers), §5 (scoping as a security boundary); `context/ui-registry.md` (the `Badge` component and the port contract); `design/readme.md` (brand voice: "Shipped, we're go", no confetti speak).
- The existing transaction pattern in `src/server/modules/launch/repo.ts` (`reorder()` and `moveItem()` already read with the transaction handle), which this action follows.
- The installed extension types, read during design: `node_modules/@modelcontextprotocol/ext-apps/dist/src/app.d.ts` (the `sendMessage({ role, content }, options)` signature and its promise result) and `dist/src/spec.types.d.ts` (`McpUiMessageResult`, and the host capability `message.text`).

**Practices & standards**:
- Read, check, and write inside one transaction: a destructive action must not validate against state it read outside the transaction (a time of check to time of use gap).
- Delete by the exact ids you snapshotted, never a blanket predicate, so concurrent inserts cannot be swallowed.
- Validate destructive preconditions on the server, not only in the UI.
- A best effort notification must never roll back or block the committed action it is reporting.
- After a failed call to a committing operation, refetch rather than trust local state.
