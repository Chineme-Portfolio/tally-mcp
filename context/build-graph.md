# Tally — Build Graph

> A dependency map, not a plan. What depends on what. For *why*, see `foundation.md`; for *how the pieces fit*, `architecture.md`; for *what's been built*, `progress-log.md`.

## How to read this file

This is a map of *what-requires-what* — **NOT** a timeline or a prescribed order. **Hard requirement** = cannot build without it. **Soft benefit** = easier with it, possible without. Because this is *module one of many* (`foundation.md` §9), the graph is deliberately open at the bottom — module two attaches here without disturbing module one.

## Layer 0 — foundational prerequisites

Almost everything needs these:

- **Repo scaffold** — single package, `tsconfig` (strict), scripts, folder skeleton (`architecture.md` → Repo layout).
- **Zod schemas + inferred types** in `shared/` — the shapes both sides use (buildable cold; see below).
- **Env validation** (`server/env.ts`).
- **Postgres provisioned** on Railway + **Drizzle client** + **initial schema** (`users`, `modules`, `items`) + first migration.
- **⭐ The render spike** — a trivial `ui://` widget from *our* pipeline (tool → `vite-singlefile` HTML → resource) rendering in Claude Desktop. **This is the gate: no feature work starts until it passes** (`foundation.md` §7 #15, §11).

## The keystone unlock

**The launch module wired end-to-end** — `launch_board_show` returns the `ui://` widget + state → widget renders → a widget button calls a tool (`tools/call`) → `repo` persists to Postgres → widget re-renders. Once this single round-trip works, the **module pattern** is proven and every later module is the same four moves (`foundation.md` §9; `architecture.md` → Keystone unlock). It unblocks: all remaining `launch_*` tools, the prompt, and (structurally) module two.

## Dependencies (X needs Y)

- **`launch_board_show`** — hard: `ui://` resource + built widget bundle + `items` repo (read) · soft: `launch_status` sharing the same read.
- **Widget CRUD (`add`/`edit`/`toggle`/`delete`/`reset`)** — hard: app-bridge wired in the widget + the model+app tools + `items` repo (write) · soft: the render spike's learnings.
- **`launch_item_reorder`** (app-only) — hard: `position` column + drag UI in the widget + the app-only tool · soft: CRUD already working.
- **`launch_status`** — hard: `items` repo (read) — text-only, no UI.
- **Claude-operates-the-board (Flow C)** — hard: the same model+app tools already exist; no extra build (just don't restrict their visibility).
- **`launch-board` prompt** — hard: server prompt registration + `launch_board_show` existing.
- **Deploy to Railway** — hard: server build + `DATABASE_URL` env + migrations run on deploy.

## Buildable from a cold start

No prerequisites — safe to build first, in any order:

- `shared/schemas.ts` (Zod) + inferred types.
- `server/env.ts` validation.
- The `modules` registry mechanism (`server/registry.ts`).
- The Drizzle schema definition (before data exists).

## External dependencies with lead time ⏳

None blocking — Railway PAYG already exists, all packages are public npm. The only "external unknown" is render behavior, and that's retired by the Layer-0 spike, not by waiting on anyone.

## The one genuine tension

**The widget bundle is an input to the server's `ui://` resource, but you want to iterate on the widget UI fast.** In production the server serves the inlined `vite-singlefile` HTML; but rebuilding the widget on every CSS tweak to see it in the client is slow. Stated honestly, not resolved by fiat — pick during the spike: (a) a watch/rebuild loop that regenerates the HTML the resource reads, or (b) point the resource at a Vite dev build while developing. Either is fine; just decide and record it in `progress-log.md`.

## Explicitly out of scope

Auth / multi-user · module two (pipeline, project states) · the `launch_prefs_set` tool · theming beyond default · real-time sync (`foundation.md` §8).
