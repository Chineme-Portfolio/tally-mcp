# Verify: ship action · spec 0003 · updated 2026-07-24

_Steps derived from spec 0003 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones. The server side steps are already passing (see `progress-log.md`); the UI steps need Claude Desktop (the host bridge)._

## Commands
- [ ] `npm run typecheck` → no errors → supports all
- [ ] `npm run db:migrate` → the `launch_runs` table is live → AC-4 (setup)
- [ ] `npm run build:widget` → `dist/widget/index.html` is one self contained file → AC-2 (setup)
- [ ] Server tool test against Postgres: ship refuses an empty board and an undone board (both return a tool error), a complete board ships (one `launch_runs` row with the right `item_count`, `launch_items` emptied), and `launch_history` returns the run → AC-4, AC-8, AC-9. Restore the board and delete the test run afterward.
- [ ] Code review: `shipBoard()` in `repo.ts` does the read, the check, the insert, and the delete inside one `db.transaction`, and the delete uses `inArray(launchItems.id, ...)` (the snapshotted ids), never a blanket `where user_id` → AC-4

## UI / manual
_Reconnect the Claude Desktop connector first (to pick up the new widget and `launch_history`)._

- [ ] Below 100 percent (add a task so the board is incomplete): the footer shows the remaining count and **no button** → AC-1
- [ ] At 100 percent (every task done): the footer shows a **"Go for launch" badge** and an active **"Ship it"** button → AC-2
- [ ] Click "Ship it" once → it relabels to **"Confirm ship"** and does not ship; click again → it ships → AC-3
- [ ] After one click, click elsewhere, or wait 5 seconds, or un tick a task → the button returns to "Ship it" without shipping → AC-3
- [ ] After shipping → a brief **"Shipped"** footer, then the empty board → AC-5
- [ ] After shipping → a **"Shipped. N tasks done, board's green."** message from you appears in the conversation (and if the host does not support messages, the ship still works) → AC-6
- [ ] Ask Claude to "ship the board" → it cannot (no such tool for the model) → AC-7
- [ ] Ask Claude "what did I ship last time?" → it lists recent launches (date, count, titles) → AC-8

## Acceptance-criteria coverage
- AC-1 → manual 1 · AC-2 → manual 2 + command 3 · AC-3 → manual 3, 4 · AC-4 → command 4, 5 · AC-5 → manual 5 · AC-6 → manual 6 · AC-7 → manual 7 · AC-8 → command 4 + manual 8 · AC-9 → command 4 · AC-10 → (failure path; exercise by killing the server mid ship, or trust the code review of the catch branch)
