# Helm — Progress Log

> Living build record. Newest first — prepend. Current settled state lives in `foundation.md`, not here.

## Standing instruction for the AI agent (do this every time)

After completing any work in this project, before ending your response, add a progress entry at the TOP of the Entries section. This is mandatory, the same way reading the context files first is mandatory. If a single prompt produced several distinct pieces of work, put them in one entry as clearly itemized parts. If you made a `decision` that changes anything in `foundation.md` or another context file, **update that file too** and add a `docs` entry noting the update — context files must never drift from what was decided.

## Entry template

Category one of: `feature` · `fix` · `refactor` · `chore` · `decision` · `docs`

```
### [category] Short title
- **Date:** YYYY-MM-DD
- **Area:** backend / widget / shared / db / infra / context
- **What:** one line; itemized parts below if several
- **Notes:** gotchas, limitations, follow-ups
```

## Entries

### [feature] Launch board built (spec 0002), server side and build verified
- **Date:** 2026-07-23
- **Area:** server, widget, shared, db, infra
- **What:** Built module one, the launch readiness board, per spec 0002 (Tracer Bullet). (1) **Data layer:** Postgres + Drizzle (`users`, `modules` registry, `launch_items` with the four state status enum), a module scope singleton client (`db/client.ts`), a `drizzle-kit` migration, a seed for the default user + launch module. (2) **Repo:** `launch_items` access, every query scoped by `resolveUserId()`; shared Zod schemas in `src/shared/launch.ts`. (3 to 5) **The eight `launch_*` tools** (`launch_board_show` renders; `launch_status` is the structured mount fetch + a text summary; add / edit / set_status / delete / reset are model+app; `launch_item_reorder` is app only and runs in one transaction), plus the `launch-board` prompt. (6) **The widget:** ported the design components (`ChecklistItem` / `ProgressBar` / `Status` / `Button` / `Checkbox` / `Input` / `Icon`) into `src/widget/launch/` as `.tsx` using the `helm-*` CSS, inlined the tokens, self hosted 8 brand font weights as base64, wired the app bridge to the tools, drag reorder, a light/dark toggle, graceful degradation when the host is unreachable. (7) **Deleted the render spike** (server module, widget, shared schemas).
- **Verified (code + runtime):** `tsc --noEmit` clean; migration applied and all three tables live; seed row present; full end to end tool test against Postgres (add / set_status / reorder / reset / delete, readiness 33% after 1 of 3 done, reorder holds, reset keeps items, edit of a missing id returns a tool error); `tools/list` shows correct visibility (`launch_item_reorder` app only); `resources/read` serves the 895 KB widget (mime `text/html;profile=mcp-app`) with tokens + fonts inlined; the `launch-board` prompt is registered; data persists in Postgres; and the widget renders correctly in the browser pane (dark theme, copper accents, brand fonts, the full board chrome, graceful "could not reach the host").
- **Pending (human in the loop, Claude Desktop):** the board with real data and its interactions (checkbox, status, drag reorder, add / edit / delete, the light/dark toggle, the 100% completion moment) = AC-1, AC-3, AC-5, AC-10, AC-11 on the widget side; and Task 8, the Railway deploy (which also closes spec 0001 AC-5). Spec 0002 status stays `In Progress`; it is not `done` until `/check verify` plus the Claude Desktop checks plus deploy.
- **Notes:** local dev database is a dedicated `helm-postgres` Docker container on port 5433 (see `.env`, which is gitignored; `.env.example` documents the vars). `DEFAULT_USER_ID` must be a valid v4 uuid (Zod v4 is strict): using `00000000-0000-4000-8000-000000000001`. Font self host adds ~240 KB of woff2 (widget bundle ~914 KB). The design's `window.HelmDesignSystem_94b187` global and compiled bundle were NOT used (ported the JSX + `helm-*` CSS per `ui-registry.md`).

### [decision] Launch board designed, spec 0002 accepted; foundation to v3
- **Date:** 2026-07-23
- **Area:** context, docs/specs
- **What:** Ran /architect on module one. Wrote and accepted `docs/specs/0002-launch-board/` (`index.md` + `rationale.md`). Decision: build the launch readiness board as **one Tracer Bullet slice** — Postgres (`users` + a thin `modules` registry + the module's own `launch_items` table with a four state status enum), the full `launch_*` tool surface (model+app, with `launch_item_reorder` app only), the `launch-board` prompt, and the widget ported from the design system with self hosted brand fonts — deleting the render spike. Engineer decisions this round: **four states + readiness meter**, **title and state only** (no due dates or labels in v1), **self host the fonts**.
- **Notes:** Cross checked on a second model (Sonnet); **two blockers fixed before acceptance**: (1) the Postgres client must be a module scope singleton, because the transport is stateless and a per request client would leak connection pools; (2) the widget's on mount data fetch is `launch_status` (structured `{items, readiness}`), mirroring `spike_state`, not the render tool. Plus six fixes: reorder runs in one transaction and appends items missing from the list, `updated_at` on every write, empty board readiness guard (no NaN), components ported as `.tsx` copying the JSX + `helm-*` CSS (never the `window.HelmDesignSystem_94b187` global or compiled bundle), AC-8 verified by a scoping code review rather than a behavioural test, and `DEFAULT_USER_ID` seeding clarified. **`foundation.md` advanced to v3** the same cycle (four state `status` in §5, refined tool surface in §6, new locked decision §7 #16, scope §8, and the two §12 build time items marked resolved). Spec status `Proposed`; nothing built yet.

### [docs] UI trio generated from the Claude Design export (Phase 3 complete)
- **Date:** 2026-07-22
- **Area:** context, design
- **What:** Ingested the Claude Design export (the "Bold product" direction) and committed it to `design/` (109 files: tokens, the `helm-*` component library, guidelines, and the launch-board UI kit). Generated the UI trio from the real values: `ui-tokens.md` (copper + ink ramps, semantic aliases, type/spacing/radius/shadow/motion, theming), `ui-rules.md` (§0 prime directive + voice, colour discipline, motion, interaction states), `ui-registry.md` (20 components: `ChecklistItem`, `ProgressBar`, `Status`, `Button`, `Card`, and the primitives, all ⬜ planned until ported into `src/widget/`). Dropped the PENDING markers in `README.md` and rewrote `code-standards.md` §7 to point at the tokens.
- **Notes:** Signature colour is **Helm Copper** (`#cf6e45`), not green — some export comments mislabel it "green"; the token names (`--copper-*`) and `design/readme.md` are authoritative. **Critical adaptation for our sandboxed widget:** the design ships fonts via a Google Fonts `@import` that will NOT load in the iframe, so the launch board build must self-host the `.woff2` or accept the system fallback (recorded in `ui-tokens.md`). `design/ui_kits/board/` is effectively the build reference for the launch board widget. Phase 3 of the context system is complete; the UI trio is no longer PENDING.

### [feature] Render spike gate PASSED in Claude Desktop (spec 0001)
- **Date:** 2026-07-22
- **Area:** server, widget
- **What:** Verified the render spike end to end in Claude Desktop, via a `cloudflared` tunnel to the local server. AC-1 (widget renders inline), AC-2 (count shown on mount), AC-3 (button increments), AC-4 (server observed the calls: `spike_state` reports `count=5` after five clicks), and AC-6 (`spike_ping` is app only, not offered to the model; independently confirmed by the connector exposing only `spike_show` + `spike_state`) all pass.
- **Notes:** **The deepest risk (`foundation.md` §11) is retired** — our own MCP Apps pipeline renders and round trips inside Claude. AC-5 (Railway deploy) is the only remaining criterion; the local tunnel already proves the remote streamable HTTP path works, so AC-5 is the deploy specific proof. Spec 0001 stays `In Progress` until AC-5 is done or consciously deferred. (The backgrounded `dev.log` did not capture the ping `console.log` lines due to pipe buffering; the server state `count=5` is the authoritative confirmation.)

### [feature] Render spike built (spec 0001), server side verified
- **Date:** 2026-07-22
- **Area:** server, widget, shared, infra
- **What:** Built the render spike per spec 0001. (1) Single package TS scaffold: `package.json`, strict `tsconfig.json`, `vite.widget.config.ts`, `.gitignore`, `.env.example`. (2) MCP server on streamable HTTP (Express via `createMcpExpressApp` + `StreamableHTTPServerTransport`, endpoint `/mcp`, stateless) in `src/server/`, with the spike module under `src/server/modules/spike/`: `spike_show` (render, model+app), `spike_state` (read, model+app), `spike_ping` (write, app only), and the `ui://spike/app.html` resource. (3) React widget in `src/widget/spike/` bundled by `vite-singlefile` into one self contained HTML; reads `spike_state` on mount, button calls `spike_ping`. (4) Shared Zod schemas in `src/shared/schemas.ts`, validated env in `src/server/env.ts`.
- **Verified (code + runtime):** `npm install` (207 pkgs); `tsc --noEmit` clean; `vite build` produced one 539 KB self contained HTML (no external asset refs); server boots and answers MCP `initialize` over streamable HTTP; `tools/list` shows the three tools with correct visibility (`spike_ping` = `["app"]`); `resources/read` serves the widget with mime `text/html;profile=mcp-app`; two `spike_ping` calls returned `count` 1 then 2 (round trip works, module state persists across the stateless per request servers).
- **Pending (human in the loop, needs Claude Desktop):** AC-1 widget visibly renders inline, AC-2 mount fetch shows the count, AC-3 the button increments in the UI, AC-6 Claude cannot call `spike_ping` directly; plus AC-5 the Railway deploy. Spec 0001 status advanced `Proposed` → `In Progress`; not `done` until these pass.
- **Reconciled to context:** updated `library-docs.md`: `ext-apps` `^1.7.0` (the design time `1.1.2` was stale), `sdk` `^1.29.0`, `RESOURCE_MIME_TYPE = text/html;profile=mcp-app` confirmed, added `express` / `cors` / `concurrently`, recorded the pull model resolution and the DNS rebinding production note. Follow ups: set `allowedHosts` or auth before a real multi reachable deploy; mark `architecture.md`'s open push vs pull question resolved (it is pull).

### [decision] Render spike designed, spec 0001 accepted
- **Date:** 2026-07-22
- **Area:** context (docs/specs)
- **What:** Ran /architect on the first slice (the Layer 0 render spike). Wrote and accepted `docs/specs/0001-render-spike.md`. Decision: build the thinnest end to end thread (MCP server over streamable HTTP, a `ui://` widget via `vite-singlefile`, a `spike_state` read tool called on mount, an app only `spike_ping` write tool for the button), iterate via a local tunnel, deploy once to Railway. Resolved the two open build time questions: pull model for widget data (widget calls `callServerTool` on mount), and watch-and-rebuild the single file for the widget dev loop.
- **Notes:** Cross checked on a second model (Sonnet); five fixes applied (build-order bug, remote connection details, AC-3 increment, new AC-6 app-only enforcement, split into `spike_state`/`spike_ping`). Four values UNCONFIRMED to verify at build: `RESOURCE_MIME_TYPE`, the streamable HTTP transport class, the `callServerTool` signature, and remote connection details (endpoint path + allowed origins). Not built yet; spec status `Proposed`. Build tasks live in the spec's `## Build plan`. Next: `/develop` the render spike.

### [decision] Design track set up — aesthetic direction chosen
- **Date:** 2026-07-22
- **Area:** context
- **What:** Kicked off Phase 3 (Claude Design). Two parts: (1) chose the widget **aesthetic direction = "Bold product"** (saturated signature accent, strong type/shape, springy completion motion) with brand voice "confident, decisive, energetic operator's surface"; (2) wrote the ready-to-use handoff to `docs/design/claude-design-handoff.md` — the Claude Design intake to paste in, plus the in-repo prompt to generate the UI trio from the export.
- **Notes:** "Bold product" carries the highest host-clash risk (widget renders embedded in Claude), so the intake notes require theme-awareness, AA contrast, boldness confined to accents + the completion moment, reduced-motion, and self-contained styling. UI trio (`ui-tokens/rules/registry`) stays PENDING until the export is committed and the Part-2 prompt is run. Does not change `foundation.md` (UI-layer decision; the trio will own it).

### [docs] Context system established
- **Date:** 2026-07-22
- **Area:** context
- **What:** Bootstrapped the Helm context system from a converged foundation. Created `foundation.md` (v2, converged), `project-overview.md`, `architecture.md`, `code-standards.md`, `library-docs.md`, `build-graph.md`, this log, the root `README.md`, the root `AGENTS.md` router (thin — points at `context/`), and PENDING stubs for the UI trio (`ui-tokens.md`, `ui-rules.md`, `ui-registry.md`).
- **Notes:** No code yet. Next buildable work is Layer 0 in `build-graph.md`, gated by the render spike (`foundation.md` §7 #15). UI trio awaits a Claude Design export (Phase 3). Build-time homework carried in `foundation.md` §12: pin exact MCP package versions; confirm our own widget renders.
