# 0004. Board model — rationale

The decision record for `index.md`. Reasoning, options, and references; `/develop` builds from `index.md`, not this file.

## Context

Module one today has no idea what a "board" is. "The board" is simply *all of this user's `launch_items`*, so there is exactly one, and every "show my board" in every chat shows the same list. Reading the code back: `launch_items` is scoped by `user_id` and nothing else; the widget renders that one set; `launch_runs` archives that one set. That was right for a single launch board and it shipped clean (specs 0002, 0003).

Using it for real surfaced two gaps. First, a checklist made in one chat bleeds into the next: the user asked Claude for "a checklist for an apple pie" and it built onto the one board, mixing a recipe into the launch list, because there is nowhere else to put it. Second, the user wants boards to be named, durable things (a launch board, an apple pie board) that survive sessions, and later an account that owns many of them. The root cause of both is the same: there is no `board` entity. "The board" is a filter, not a thing, so it cannot be named, listed, emptied and kept, or owned.

Two constraints shape the fix. It lands **before** the Railway deploy, deliberately: migrating a handful of local rows now is trivial, and reshaping the core model after a deployed database is in real use is not, so this is the cheap moment to do it. And it folds in a second deferred question the engineer logged (launch specific vs a general checklist): the answer is **general, launch flavored**, so a board is any checklist wearing Tally's completion treatment (a readiness meter, "ship / go for launch").

## Options considered

### Option 1: Fix in place — a board name column, no boards table

Add a `board_name` string to `launch_items`; "a board" is the set of items sharing a name; switching filters by name.

**Pros**:
- No new table; the smallest possible diff.

**Cons**:
- A board has no identity. An empty board (no items) simply vanishes, so there is no board to switch to, rename, or ready for the next launch. Renaming means rewriting every item row. The account seam has nothing to own (you cannot point an owner at a string smeared across item rows). A run cannot reference the board it came from. It fakes the entity with a string, and breaks the moment you want the three things the engineer actually asked for: a durable named board, a rename, and an owner.

### Option 2: Strangler to a first class `boards` table (chosen)

A `boards` entity owned by `user_id`; `board_items` and `board_runs` gain a `board_id`; a migration seeds a default board and moves the existing rows into it, then the code cuts over to the `board_*` surface.

**Pros**:
- Boards are real: create, rename, delete, list, and an empty board that persists. The account seam is a real foreign key (`boards.user_id`, later an account), not a convention. History is durable (a run keeps its board's name). The widget can show tabs because there is a set of board rows to show.
- Classic strangler shape: stand the new model up beside the old data, move the data into it, retire the old names, all in one controlled step because the data is tiny and local.

**Cons**:
- A real migration, a broad rename (`launch_*` to `board_*`, the module, the resource), and the widget grows tabs. The live connector must reconnect once.

### Option 3: Replace directly — build accounts and auth, or a generic "collections" abstraction, now

Go further: introduce real accounts with auth in the same slice, or a generic container abstraction meant to serve future modules, not just boards.

**Pros**:
- Fewer migrations later if the guesses are right.

**Cons**:
- Over builds. Auth is its own epic (a provider, sessions, a security pass) the engineer consciously deferred (`foundation.md` §10). A generic "collection" abstraction for a hypothetical module two is speculation before module two is even designed, the classic you are not going to need it trap. It buys imagined future flexibility with real present complexity and risk.

## Rationale

Option 1 fails the actual requirements, not a stylistic preference. The engineer wants named boards that survive, that can be renamed, listed, emptied and kept, and that an account will own. A `board_name` string on item rows cannot hold an empty board, cannot be renamed without touching every row, and gives the ownership seam nothing to attach to. It is the kind of shortcut that reads as simpler and then blocks the next two things you ask of it, so it is a false economy here.

Option 3 over builds in the opposite direction. Auth is a genuine epic the engineer chose to defer, and a generic container abstraction is speculation before the second module exists. The strangler builds exactly the seam that is needed, an owner foreign key on `boards`, and nothing beyond it. When accounts arrive, they slot onto that seam with no reshape; until then, no speculative surface is carried.

Three finer calls deserve their reasoning on the record.

**Current board by `last_active_at`, not a `users.current_board_id` pointer.** A pointer from `users` to `boards` is a circular foreign key (users to boards to users) that the ORM can express but that adds forward reference friction and a two step seed. The requirement is only "which board is current for this owner", which a single timestamp answers without the cycle: the current board is the one most recently switched to or created. The widget always shows the tabs and highlights the current one, so this derived state is never hidden from the human, which is what makes deriving it (rather than storing a pointer) safe.

**Ship keeps the board (archive then clear); `board_delete` is a separate action.** Shipping and deleting are different intentions: "this launch is done" versus "I do not want this board". Keeping ship's spec 0003 meaning (archive the items to a run, clear them, the board stays, now empty) and adding an explicit `board_delete` keeps the two orthogonal. A finished one off board (the apple pie) can be deleted; a recurring launch board can be shipped and kept empty for the next run. Collapsing them would force one behaviour on both intentions.

**The full rename, not a half rename.** The engineer chose clean `board_*` names, and this is the one cheap moment to take them: before the deploy, at the cost of a single reconnect. Renaming the tools but leaving `launch_` tables, module folder, and resource uri behind would leave a permanent seam mismatch inside a portfolio piece, the exact kind of inconsistency a reviewer notices. Rename all of it once.

**Right sizing the migration.** The enhancement discipline's production migration sequence (add nullable, dual write, backfill, add constraint, across several deploys) exists for a live system with many clients that cannot go offline. This is one owner, a handful of rows, and one client (the engineer) briefly offline during the reconnect. A single migration that adds `board_id` nullable, backfills to the seeded default board, then sets the constraint, all at once, is both safe and honest here. Performing the multi phase production dance on a four row local database would be cargo culting the ceremony, not applying the judgment behind it.

## References

**Project sources** (verifiable, in this repo):
- `foundation.md` §5 (the current single board core model this reshapes), §6 (the `launch_*` tool surface being renamed), §7 #6 (single tenant scoping, preserved, now `user_id` + `board_id`), §7 #9 (the module keystone: a module is a tool prefix + a `ui://` widget + its own tables + a registry row; boards live inside module one, they are not a new module), §7 #16 (four state status, unchanged), §7 #17 (app only ship, preserved), §10 (multi tenancy and accounts deferred; this builds the seam they will use).
- `docs/specs/0002-launch-board/index.md` (the board this enhances, its data model and tools) and `docs/specs/0003-ship-action/` (the ship action this preserves and refines to be board aware).
- `context/code-standards.md` §4 (explicit visibility, thin handlers), §5 (scoping as the security boundary, now `user_id` plus the current `board_id` for item ops).
- `context/ui-registry.md` (the `Tabs` component to port for the widget's board switcher, and the port contract).
- `design/readme.md` (brand voice: the launch flavour, "Shipped, we're go", stays as the completion treatment for any board).
- The existing transaction pattern in `src/server/modules/launch/repo.ts` (`shipBoard()`, `reorder()`, `moveItem()` all read and write inside one `db.transaction`), which the board aware ship and delete follow.

**Practices & standards**:
- The strangler pattern for a live model change: stand the new shape up beside the existing data, migrate the data into it, then retire the old names, rather than a big bang rewrite.
- Right size the migration to the real blast radius: the full production add nullable, dual write, backfill, constrain sequence is for many client live systems, not a single owner local database.
- Keep destructive actions (`board_ship`, `board_delete`) inside one transaction and scoped by owner, deleting only the exact rows intended (spec 0003's lesson, carried forward).
- Prefer a derived current board (a timestamp) over a stored pointer when the derivation is cheap and visible, to avoid a circular foreign key and hidden state.
- Defer the account and auth epic; build only the ownership seam now (you are not going to need the rest yet).
