# 0002. Launch board — rationale

The decision record for `index.md`. Reasoning, options, and references; `/develop` builds from `index.md`, not this file.

## Context

Module one has to become real. The render spike (spec 0001) proved that our own MCP Apps widget renders and round trips inside Claude, but it holds a throwaway in memory counter, not a product. The design system has now landed (`design/`, the "Bold product" direction), with the board's own components (`ChecklistItem`, `ProgressBar`, `Status`) and a working board UI kit. So the pieces are in place to build the launch readiness board: persist it in Postgres, expose the real `launch_*` tools, and render the designed widget.

The forces at play: this is the builder's first database in the project, on about 10 hours a week, so the data and migration work must stay simple and boring. The board is also the portfolio centerpiece, so the widget must actually look like the design (brand fonts and all), inside a sandboxed iframe that cannot reach a font CDN. And this is the slice that must prove the module keystone (`foundation.md` §9) exactly once, so module two costs no rework. The consequence of getting the data shape wrong is the one foundation warns about: a generic god table that looks extensible and is not.

## Options considered

### Option 1: One slice, per module tables (chosen)

Build the whole launch module in one Tracer Bullet slice: `users` + a thin `modules` registry + the launch module's own `launch_items` table, the full tool surface, the prompt, and the designed widget.

**Pros**:
- The module is genuinely done and demoable at the end, and the keystone is proven end to end.
- Per module tables are honest extensibility: module two brings its own table and touches nothing here.

**Cons**:
- It is the largest slice so far, spanning the database, tools, and a real UI port.

### Option 2: Split into two specs (persistence, then UI)

One spec for the schema and repos, a later spec for the tools and widget.

**Pros**:
- Two smaller slices, each easier to review.

**Cons**:
- The persistence half has little standalone value (nothing to see), and it doubles the design and review cycles for one coherent feature. The Tracer Bullet build plan already gives a safe internal order without splitting the decision.

### Option 3: Generic `items` god table with a `module` column

One `items` table for every future module, discriminated by a `type` or `module` column.

**Pros**:
- A single table serves all modules; module two adds no table.

**Cons**:
- This is the false extensibility `foundation.md` §4 #1 and §9 explicitly reject: mixed concerns in one table, per module columns that only apply to some rows, and queries that must always filter by type. Harder to extend, not easier.

## Rationale

Option 1 wins because the point of this slice, per Context, is to prove the module keystone once, and the keystone is defined (foundation §9) as a module owning its own table plus a registry row plus a tool prefix plus a widget. A per module `launch_items` table is that keystone; the god table (Option 3) is the exact anti pattern foundation locked against, so it is out regardless of its surface convenience. Splitting the work (Option 2) trades a coherent, demoable module for two thinner cycles, and the persistence half cannot be verified against anything a user sees; the Tracer Bullet ordering inside one spec gives the same safety (a thin database to tool to widget thread before the heavy UI port) without fragmenting the decision.

The four state status (todo, active, blocked, done) over a binary done was the engineer's call, and it fits: the product's identity is "launch readiness", the design system already ships the `Status` pill and the `ProgressBar` meter for exactly this, and the cost is a single enum column. It does extend foundation's original binary item, so foundation gets a small update (noted in the follow up) rather than being left to drift.

Self hosting the brand fonts was chosen because this widget is a portfolio piece and the distinctive type is part of the "Bold product" direction; the sandboxed iframe cannot reach the Google Fonts CDN, so the only way to keep the real type is to bundle the used weights. The bundle cost is bounded by shipping only the weights the widget uses.

The `modules` registry table is thin in v1 (one row) and does little functional work yet, but it is kept because it is the seam foundation §9 names as part of the keystone, and adding it now (cheap) is what lets module two attach without a schema change later.

## References

**Project sources** (verifiable, in this repo):
- `foundation.md` §5 (core model), §6 (flows and tool surface), §7 #6 (single tenant scoping), §7 #9 to #11 (the module keystone and visibility), §9 (keystone unlock), §4 #1 (explicit over magic).
- `context/architecture.md` (repo layout, data and tenancy, the module pattern); `context/code-standards.md` §4 to §5 and §9 (tool conventions, scoping, secrets); `context/library-docs.md` (Postgres, Drizzle, ext-apps); the UI trio (`ui-tokens.md`, `ui-rules.md`, `ui-registry.md`) and the design export at `design/` (the board components and `design/ui_kits/board/`).
- `docs/specs/0001-render-spike/` (the scaffold, the pull model, the visibility pattern) — note: 0001 is a single file, `docs/specs/0001-render-spike.md`.

**Practices & standards**:
- Tracer Bullet: a thin end to end thread through every layer before thickening it.
- Per module tables over a generic entity table for honest extensibility (the anti pattern being an EAV god table).
- Least privilege scoping: tenant scope resolved in one place, never from client input.
