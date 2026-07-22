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
