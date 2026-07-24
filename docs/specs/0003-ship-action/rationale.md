# 0003. Ship action — rationale

The decision record for `index.md`. Reasoning, options, and references; `/develop` builds from `index.md`, not this file.

## Context

Spec 0002 shipped the board with a footer button that is disabled until every task is done and then flips to "Ship it", but with no click handler. That was deliberate: 0002 AC-11 called the completion moment "visual only in v1", and its follow up deferred "a real ship / launch action (archive, snapshot, or reset with history)". Using the board for real raised the question, so it is time to settle it.

Two problems need solving. First, the control is dead: at 100 percent the button enables and then ignores you, which is worse than having no button. Second, the board has no idea a launch ever happened. Finishing everything and resetting throws the record away, and "launch readiness" is a product about launches, so the launches themselves are worth keeping.

The forces: this is a solo build at about 10 hours a week, so the slice must stay small. The board is the portfolio centerpiece, so a satisfying completion moment matters. Shipping is destructive (it empties the board), so it needs a guard rail and it must be safe against anything happening at the same time. And the widget has so far used only two MCP Apps capabilities, rendering and calling tools; the `ui/message` primitive (a widget posting a message to the agent) is a third one this action can genuinely use rather than bolt on.

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

## Rationale

Option 2 fails the second problem in Context outright. Reusing reset leaves the product with no idea a launch ever happened, and it collapses two different intentions ("run this list again" and "this launch is done") into one action with two labels. The whole reason the question came up is that finishing the board should *mean* something.

Option 3 is the right eventual shape, but not this slice. At about 10 hours a week, a history surface is its own design and build job with its own states. Archiving plus a small model visible tool captures most of the value for a fraction of the work: you can already ask "what did I ship last time?" and get a real answer, and the archive earns its keep before anyone spends a day designing a screen for it. If it turns out you never ask, that is useful information too.

Three choices deserve their reasoning stated. **App only ship** was the engineer's call and it holds up: shipping empties the board, so it is the one board action where a wrong model call costs real work, and while the archive means nothing is truly lost, recovering is manual. A guard rail is worth the small inconsistency of Claude being able to do everything except this. **The two step confirm** over a proper dialog is about cost: `Dialog` is still unported, and an in place relabel costs nothing while stopping the only failure that actually matters, a stray click on an enabled button. **Everything inside one transaction, deleting only the snapshotted ids**, is not ceremony: a blanket delete by user after a check done outside the transaction would silently destroy any task added while the ship was in flight, which is exactly the kind of quiet data loss a personal tool never recovers from.

The message to Claude is not decoration, and it is worth being clear why: because ship is app only, Claude never sees the tool call at all, so `sendMessage` is the only channel that tells it a launch happened. Carrying the count in the message means Claude can say something concrete without a follow up call.

## References

**Project sources** (verifiable, in this repo):
- `foundation.md` §5 (item lifecycle and how reset differs), §6 (tool surface), §7 #6 (single tenant scoping), §7 #10 (writes are model + app, which this action deliberately departs from), §7 #11 (the app and model split), §7 #17 (the app only ship decision this spec drove).
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
