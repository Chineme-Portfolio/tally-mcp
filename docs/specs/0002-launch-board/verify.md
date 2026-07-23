# Verify: launch board · spec 0002 · updated 2026-07-23

_Steps derived from spec 0002 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones. Server side steps are already passing (see `progress-log.md`); the UI steps need Claude Desktop (the host bridge)._

## Commands
- [ ] `npm run typecheck` → no errors → supports all
- [ ] `npm run db:migrate && npm run db:seed` → the three tables are live and the default user + launch module are seeded → AC-7 (setup)
- [ ] `npm run build:widget` → `dist/widget/index.html` is one self contained file (no external `script`/`link` asset refs) → AC-1 (setup)
- [ ] Code review: every query function in `src/server/modules/launch/repo.ts` filters by `resolveUserId()`; there is no unscoped `launch_items` query → AC-8

## UI / manual
_Start `npm run dev`, expose it with a tunnel (for example `cloudflared tunnel --url http://localhost:3001`), and add `<tunnel-url>/mcp` as a custom connector in Claude Desktop._

- [ ] Pick the `/launch-board` prompt (or ask "show my launch readiness board") → the board renders inline with the tasks and a readiness meter → AC-1
- [ ] Add a task in the widget input; then ask Claude to add one → both appear and persist → AC-2
- [ ] Check a task's box → it marks done and the meter moves; row menu → Mark blocked / Mark active → the status pill changes → AC-3
- [ ] Row menu → Edit a title, and row menu → Delete a task → both persist → AC-4
- [ ] Drag two tasks to reorder → the order holds after a reload → AC-5
- [ ] Board menu → Reset → every task returns to todo and the meter reads 0 → AC-6
- [ ] Reload the widget and restart the server → the tasks are still there → AC-7
- [ ] Ask Claude to call `launch_item_reorder` directly → it cannot (app only); it can call the others → AC-9
- [ ] Toggle the sun/moon control → light and dark are both legible, the brand fonts load; with reduced motion set, the springy check and complete motion calms → AC-10
- [ ] Mark every task done → the meter fills, the completion glow shows, and the footer flips to "Ship it" → AC-11

## Acceptance-criteria coverage
- AC-1 → manual 1 · AC-2 → manual 2 · AC-3 → manual 3 · AC-4 → manual 4 · AC-5 → manual 5 · AC-6 → manual 6 · AC-7 → command 2 + manual 7 · AC-8 → command 4 · AC-9 → manual 8 · AC-10 → manual 9 · AC-11 → manual 10
