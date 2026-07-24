# Verify: board model · spec 0004 · updated 2026-07-24

_Steps derived from spec 0004 acceptance criteria. `/check verify` runs these; `/test` locks the durable server side ones. The command steps already pass (see `progress-log.md`); the UI steps need Claude Desktop (the host bridge)._

## Commands
- [ ] `npm run typecheck` → no errors → supports all
- [ ] `npm run db:migrate` → the board tables are live: `boards`, `board_items` (with `board_id` NOT NULL, cascade), `board_runs` (with nullable `board_id` set-null + `board_name`), enum `board_item_status`, and the `modules` row key is `board` → AC-1, AC-5 (setup)
- [ ] `npm run build:widget` → `dist/widget/index.html` is one self contained file → AC-7 (setup)
- [ ] Server tool test against Postgres (drive `/mcp` with curl JSON-RPC + psql): `tools/list` shows only `board_*` (no `launch_*`), app-only = `board_item_reorder` + `board_ship`; board create → current, list with a current flag, switch by name; items on one board never appear on another; item add/edit/set_status/move/reorder/delete/reset on the current board; ship refuses an empty board and an undone board (both `isError`), a complete board ships (one `board_runs` row with `board_id` + `board_name`, the board emptied but kept); `board_history` carries `boardName`; `board_create`/`board_switch`/`board_delete` on a bad name are `isError`; deleting the current board makes the next board current → AC-2, AC-3, AC-4, AC-6, AC-9, AC-10, AC-11. **Capture the real board + runs first, and remove every test board/run afterward, and switch back to the real board.**
- [ ] Code review: `resolveCurrentBoard()` creates the default with `ON CONFLICT (user_id, name) DO NOTHING` then re-reads (race safe, never returns nothing) → AC-11 (delete-your-last-board). `shipBoard()` does the read, the all-done check, the snapshot insert, and the delete of ONLY the snapshotted ids inside ONE transaction, scoped by `board_id`, never a blanket delete → AC-9. Every `boards`/`board_items`/`board_runs` query filters by `user_id` from `resolveUserId()`, and item/status/ship also by the current `board_id` → AC-10.

## UI / manual
_Reconnect the Claude Desktop connector first: **remove and re-add it**, since the tool names and the resource uri changed (`launch_*` → `board_*`, `ui://board/app.html`)._

- [ ] The widget shows a **tab per board** with the current one highlighted → AC-7
- [ ] Click another board's tab → it switches (`board_switch`); the items, meter, and footer update to that board → AC-7
- [ ] Click **"New board"**, type a name, press Enter → a new board is created and becomes current → AC-7
- [ ] Ask Claude "create a board called X" / "switch to X" → the board is created / the current board changes → AC-2
- [ ] In a **fresh chat**, ask Claude "give me a checklist for an apple pie" → Claude creates an "Apple pie" board and adds the steps (not onto another board) → AC-8
- [ ] Add items to two different boards in conversation → each board keeps only its own items → AC-3
- [ ] Complete every item on a board → the footer shows the **"Go for launch"** badge + an active **"Ship it"** button (two step confirm) → ship archives + clears; the board stays (now empty) → AC-9
- [ ] Ask Claude "what did I ship last time?" → it lists recent ships with the **board name**, date, and count → AC-4 / history
- [ ] Ask Claude to "ship the board" → it cannot (no such tool for the model) → AC-9 (app-only ship)

## Acceptance-criteria coverage
- AC-1 → migration + command 2 · AC-2 → command 4 + manual 4 · AC-3 → command 4 + manual 6 · AC-4 → command 4 + manual 8 · AC-5 → migration (data moved, counts match) · AC-6 → command 4 · AC-7 → manual 1-3 · AC-8 → manual 5 · AC-9 → command 4 + manual 7, 9 · AC-10 → command 4 + code review · AC-11 → command 4 (dup / unknown name) + code review (delete-last-board)
