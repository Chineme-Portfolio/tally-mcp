# Tally — Foundation

> **Status:** v6 — converged. Last updated 2026-07-24. Changes from v5: the **product name is locked** — codename `Helm` → **Tally** (§7 #18); the mechanical find-and-replace across the rest of the repo rolls out with spec `0004` and the deploy. (v5: the ship action — `launch_board_ship` app-only, archives to `launch_runs`, `launch_history` model+app; v4: `launch_item_move`; v3: four-state `status` + readiness meter; v2: rendering verified on both surfaces.)
> Source of truth. Every other file references this; none restate it. If any file disagrees with this one, this one wins.
> **Name:** locked to **Tally** on 2026-07-24 (§7 #18). Internal design tokens still carry the `helm-` prefix (and components the `H*` prefix) until the design rename pass — a deliberate, documented lag, not drift.

**Status key:** ✅ locked · 🕗 TBD (decide later) · ⬜ planned · 🟡 in progress · **[LOCKED]** settled decision · ⏳ external lead time

---

## §0 Build constraints
<!-- The forcing function. Scope discipline follows from these. -->

- **Solo builder.** No collaboration layer (no `CLAUDE.md`/`COLLAB.md`, single `progress-log.md`).
- **~10 hours/week.** The dominant constraint.
- **Budget:** no hard ceiling, but effectively near-zero — deploys onto an existing Railway PAYG account (small Node service + managed Postgres ≈ a few $/month, no new signups).
- **Skills:** comfortable *reading* TypeScript; **not** fluent in TS-specific idioms/standards. → **Implication:** `code-standards.md` must *teach* its rules (why strict mode, why no `any`, why one source of truth for types), not assume them.

**The forcing function:** 10 hrs/week + first MCP server → **v1 is exactly one module** (the launch-readiness board), done well, on a proven client surface. Everything else is designed-for, not built.

## §1 What it is

**Tally is a personal MCP server, built on the MCP Apps standard, that returns interactive widgets which render inline in the chat client — not just text.** Module one is a **launch-readiness board**: a checklist you (and Claude) can create, check off, edit, delete, and reorder, rendered as a widget you click, with state persisted in a real backend.

**The wedge / why it wins:** it's simultaneously (a) a genuinely useful *personal tool* and (b) a *portfolio proof* on the **first official MCP extension** (SEP-1865, shipped 2026-01-26) — being early on a standard with few polished examples is the whole value — and (c) architected as **module one of a multi-module "command surface,"** so it demonstrates system design, not just a toy.

## §2 Who it's for

- **Primarily: the builder**, personally — as the operator of their own launch/prep checklists, and as the author proving MCP Apps fluency.
- **Secondarily: other developers**, who **self-host** the server from the public repo (this is how "others can use it" is honored in v1 — see §7 #6).
- **As a portfolio artifact:** peers / hiring managers evaluating whether the builder can ship on the MCP Apps standard.

## §3 Success & stage

- **Stage:** greenfield, day 0. Empty repo.
- **Portfolio-ready (the v1 milestone) means:** a short recorded demo of the launch-readiness board **rendering in Claude** (Desktop is the primary bar; claude.ai now verified to render MCP Apps widgets too), items being created / checked / edited / deleted / reordered **from both the widget and from Claude in conversation**, and state **surviving a reload** — plus a clean, public, self-hostable repo.

## §4 Guiding principles
<!-- The handful of principles that settle later arguments. -->

1. **Explicit over magic.** Per-module tables and conventions, never a generic god-schema. *Why:* false extensibility (an EAV "items" table with a `type` column) is harder to extend than honest per-module schema.
2. **One module in v1; design for many.** Leave clean seams for module two; do not build them. *Why:* §0 — 10 hrs/week dies on scope creep.
3. **Prove the render surface first.** A "hello-world widget renders in a real client" spike gates all feature work. *Why:* §11 — rendering is the deepest risk and it's external to our code.
4. **Standard-first, idiomatically.** Use MCP Apps primitives (`ui://` resources, `_meta.ui.visibility`, prompts) the way the spec intends — that fidelity *is* the portfolio.
5. **Teach-forward standards.** Code standards explain the *why* of each TS idiom. *Why:* §0 — the builder reads TS but isn't fluent in its conventions.

## §5 Core model
<!-- The central objects and the extensibility unit. -->

**Entities (v1):**
- **`user`** — a single row in v1 (no auth), but the table and a `user_id` foreign key exist from day one so multi-tenant scoping is a later addition, not a rewrite. (§7 #6)
- **`module`** — a registered capability. The launch board is module one. A lightweight **module registry** records what modules exist.
- **`item`** — belongs to a board/module: `title`, **`status`** (one of `todo` / `active` / `blocked` / `done`), `position` (ordering — drives reorder), timestamps. The launch board is a collection of items. **Readiness** = count(`done`) / count(all); an empty board reads 0%.

**Item lifecycle:** `created → status moves freely among todo / active / blocked / done ↔ edited ↔ reordered → deleted`. The checkbox toggles `done` ↔ `todo`; the status control sets `active` / `blocked`. A board can be **reset** (every item back to `todo`, keeping the items).

**The extensibility unit — a "module" = four things, always together:**
1. a **tool namespace prefix** (`launch_*` now, `pipeline_*` later),
2. its own **`ui://` widget** (one self-contained HTML bundle),
3. its own **Postgres tables**,
4. a **row in the module registry**.

This is the keystone (§9). Module two ships by adding these four, touching nothing in module one.

## §6 Core flows & surfaces

**Surface:** an MCP Apps widget rendered inline in the chat client. **Claude Desktop** is the primary demo bar (proven); **claude.ai** is now verified to render MCP Apps widgets as well (§7 #13).

- **Flow A — render / jump-back:** user picks the `/launch-board` **prompt** (or just asks) → Claude calls `launch_board_show` **tool** → widget renders with current items. The prompt is the discoverable trigger; the tool does the work.
- **Flow B — widget interaction:** user clicks / drags in the widget → widget calls the tools via `tools/call` (add / edit / set status / delete / reset are model+app; **reorder is app-only**) → server persists → widget re-renders.
- **Flow C — Claude operates the board:** user tells Claude "add X" / "mark Y done" / "move X to the top" → Claude calls the *same* model+app tools (including `launch_item_move` for reordering) → server persists.
- **Flow D — Claude reasons about state:** Claude calls `launch_status` → reads current state as text/structured → discusses it in conversation ("4 of 7 done; blockers left are DNS and billing").

**Module-one tool surface:**

| Tool | Visibility | Called by | Purpose |
|---|---|---|---|
| `launch_board_show` | model + app | user / Claude | render widget + current state (also the "jump-back" tool) |
| `launch_status` | model + app | Claude + widget | the board read: structured `{ items, readiness }` (what the widget fetches on mount) plus a short text summary Claude reasons from |
| `launch_item_add` | model + app | Claude + widget | add an item |
| `launch_item_edit` | model + app | Claude + widget | edit item text |
| `launch_item_set_status` | model + app | Claude + widget | set `todo` / `active` / `blocked` / `done` (the checkbox uses `done` ↔ `todo`) |
| `launch_item_delete` | model + app | Claude + widget | delete an item |
| `launch_board_reset` | model + app | Claude + widget | set every item back to `todo` |
| `launch_item_move` | model + app | Claude + widget | move one item to a position (Claude's conversational reorder: "move X to the top") |
| `launch_item_reorder` | **app** | widget only | persist a drag-reorder (the whole new order a drag produces) — the deliberate `visibility:["app"]` showcase (§7 #11) |
| `launch_board_ship` ⬜ | **app** | widget only | archive the finished board as a launch record, then clear it (§7 #17; spec 0003, planned) |
| `launch_history` ⬜ | model + app | Claude | read recent launches ("what did I ship last time?") (spec 0003, planned) |

**Prompt:** `launch-board` — canned instruction ("show my launch-readiness board") that triggers `launch_board_show`. Discoverable in the client; advertises the capability to anyone who connects.

## §7 Locked decisions
<!-- The heart of the file. Cite as "foundation.md §7 #N". -->

| # | Decision | Reasoning | Rejected alternative |
|---|---|---|---|
| 1 | Build on the **MCP Apps extension** (SEP-1865, spec `2026-01-26`) | It's *the* standard, and being early on it is the portfolio value | `mcp-ui` (predecessor); OpenAI Apps SDK (ChatGPT-only); plain text tools (no UI) |
| 2 | **TypeScript** | Types across the tool↔widget boundary; the richest MCP SDK | Python SDK; plain JS |
| 3 | **Remote streamable-HTTP** transport | Must be reachable by URL so it's deployed and others connect | stdio (local-only) |
| 4 | Deploy on **Railway** (service + managed Postgres) | Existing PAYG; service and DB in one place | Fly, Render |
| 5 | **Postgres + Drizzle + drizzle-kit**, latest versions | Durable relational state; typed, thin, SQL-first ORM the builder can learn from; migrations | Prisma (heavier, more magic); raw `pg` (untyped results); SQLite (weaker for a hosted server) |
| 6 | **Single-tenant, no auth — but `user_id` in the schema from day one** | Smallest v1 that still leaves a clean multi-tenant seam; "others use it" = self-host | Multi-tenant + auth in v1 (scope creep); no `user_id` (rework later) |
| 7 | Widget = **React + Vite + `vite-singlefile`** → one self-contained HTML `ui://` resource | Familiar default; `vite-singlefile` is purpose-built to inline everything into the single string a `ui://` resource must be | Multi-file build (can't be one `ui://` string); vanilla/Preact (lighter, but React chosen for familiarity) |
| 8 | **Zod** for validation (tool inputs, env, DB boundary) | Pairs naturally with MCP tool schemas; one source of truth for shapes | Hand-written validation |
| 9 | **A "module" = tool-prefix + `ui://` widget + own tables + registry row** (the keystone) | Honest per-module extensibility; module two adds four things and touches nothing in module one | Generic EAV `items` table with a `type` column (false extensibility) |
| 10 | **Reads and writes are both model+app** so Claude *and* the widget operate the board | The builder explicitly wants Claude to CRUD the board, not just read it | Writes app-only (would block Claude from mutating — the opposite of the goal) |
| 11 | **Reordering has two tools: `launch_item_reorder` (app-only, the drag's whole-order payload) and `launch_item_move` (model+app, one item to a position)** | Real use showed Claude should be able to reorder ("move X to the top"), but a drag naturally produces the *full* new order (so app-only fits) while Claude naturally moves *one* item (so model+app fits) — two actors, two inputs, and the `visibility:["app"]` showcase stays honest. (Refined from the original "reorder is the single app-only showcase" after shipping.) | Only app-only reorder (blocks Claude, forces ugly rebuilds); only model+app reorder (loses the app-only showcase) |
| 12 | Ship a **`launch-board` MCP prompt** as the discoverable render trigger | Reliable, discoverable "jump back," and advertises the capability to other users | Rely on natural-language phrasing only (undiscoverable) |
| 13 | **Both Claude Desktop and claude.ai render MCP Apps widgets** (observed); Desktop is the primary demo bar | Empirically verified — a third-party widget rendered on claude.ai, and widgets render on Desktop | Assume only Desktop works (out of date), or block on claude.ai as a dependency |
| 14 | **No standalone `security.md`** — security lives in `code-standards.md` | Low-sensitivity personal data; no third-party OAuth tokens, no health/financial data | Split out `security.md` (overkill for v1; revisit if multi-tenant) |
| 15 | **Prove render first:** a Layer-0 "hello-world widget renders in a real client" spike gates feature work | De-risks §11 before time goes into features; now specifically proves *our* pipeline renders (not just third-party widgets) | Build features, discover rendering problems late |
| 16 | Task state is a **four-state `status`** (todo / active / blocked / done) with a **readiness meter**, not a binary done | "Launch *readiness*" is the product's identity, and the design system already ships the `Status` pill and `ProgressBar` for exactly this; the cost is one enum column | Binary done/not-done (simpler, but drops the meter and the active/blocked vocabulary the design was built around) |
| 17 | **Shipping is app-only** (`launch_board_ship`): it archives the finished board as a `launch_runs` record, then clears it | Shipping is a commitment that empties the board — the one action where a wrong model call costs real work. The archive means nothing is destroyed, but recovery is manual, so the human commits it. Deliberately reverses #10 for this one action; Claude still *reads* past launches via `launch_history` (model+app) | Model+app ship (consistent with #10, but lets the model empty your board); reuse `reset` (loses the launch record entirely, and makes ship and reset the same action) |
| 18 | **Product name is `Tally`** (codename `Helm` retired 2026-07-24) | A checklist-vibe name that keeps the clash *out of developer space*: `Helm` collides head-on with Kubernetes Helm, a top CNCF tool — the wrong association for a portfolio piece whose audience is developers. `Tally`'s collisions are product-space (the `tally.so` form builder, Tally accounting), not dev libraries, so a developer won't take it for a tool they'd `npm install`. `tally-mcp` is unclaimed on npm (reserved as the publish name). Checks run 2026-07-24. | Keep `Helm` (the Kubernetes-Helm dev clash we're leaving); `Slate` (repeats the mistake — collides with Slate.js *and* the Slate API-docs generator); `Wheelhouse` (degrades to "wheely") |

## §8 Scope

### In (v1)
- The **launch-readiness board** module with **full CRUD + four-state status + reordering** — add / edit / set status (todo / active / blocked / done) / delete / reset (model+app) and drag-reorder (app-only) — operable from **both** the widget and Claude, with a **readiness meter** (percent done).
- `launch_board_show` render tool + `launch_status` read tool + the `launch-board` prompt.
- Single-tenant persistence in Postgres (with `user_id` present but unenforced).
- Deployed on Railway; a clean, public, **self-hostable** repo.
- A **Claude demo** (Desktop primary).

### Out / cut (the forcing function)
- Auth and multi-user hosting.
- Any additional module (prospect pipeline, project states).
- Theming beyond a clean default; real-time multi-client sync.

### Deferred
- Multi-tenancy + OAuth (the schema seam is in place; the mechanism is not).
- Module two (the pattern is proven by module one first).
- The `launch_prefs_set` display-prefs tool (app-only pattern already shown by reorder).

## §9 Architecture keystones
<!-- Decisions + reasoning here; mechanism detail lives in architecture.md. -->

- **Tenancy/isolation:** single-tenant; `user_id` present but unenforced (§7 #6). The seam exists; the wall is deferred.
- **The keystone unlock:** the **module pattern** (§5) — proven exactly once by the launch board. Once `launch_*` works end to end (tool → `ui://` widget → tables → registry), every later module is the same four moves. Building the *second* thing must require zero changes to the *first*.
- **Explicit over magic (§4 #1):** per-module tables; no generic god-schema.
- **Render-surface spike (§7 #15)** is Layer 0 — nothing else starts until a trivial widget from *our* pipeline renders in a real client.

## §10 Known scale seams
<!-- Accepted as not-scaling for now, and what replaces each when it breaks. -->

- **Single-tenant / no auth** → replaced by OAuth (MCP auth spec) + row-level `user_id` scoping when hosted multi-user is actually wanted.
- **One Postgres, no replicas / caching** → fine at personal scale; revisit only under real load.
- **`vite-singlefile` inlines the whole widget** → fine for a small checklist; revisit if a widget bundle grows large (code-split per module, since each module is its own bundle anyway).

## §11 The deepest risk
<!-- The bet the product dies on if wrong. -->

**The render surface — now observed working, but young.** Both Desktop and claude.ai have rendered third-party MCP Apps widgets, so "can it render at all" is answered — a real de-risk from v1. The **residual** risk: (a) the ecosystem is <6 months old and may churn (see [ext-apps #671](https://github.com/modelcontextprotocol/ext-apps/issues/671)), and (b) rendering *someone else's* widget doesn't prove *ours* will — a misconfigured `ui://` resource, `_meta` linkage, or single-file bundle can still fail to render. **Mitigation:** §7 #15 — the Layer-0 spike specifically proves *our* pipeline (tool → `ui://` → `vite-singlefile` bundle) renders in a real client before any feature work; keep Desktop as the primary bar (§7 #13).

## §12 Open questions
<!-- Convergence reached — no decisions are outstanding. Two items carried as build-time homework, neither blocking. -->

1. ~~Pin exact package names + versions for the core MCP SDK and `ext-apps`.~~ **Resolved** during the render spike: `ext-apps ^1.7.0`, `sdk ^1.29.0`, recorded in `library-docs.md`.
2. ~~The Layer-0 spike must confirm *our own* widget renders in a real client.~~ **Resolved** 2026-07-22: the gate passed in Claude Desktop (render, round trip, and app-only enforcement); see `progress-log.md`.

Nothing outstanding. Remaining **execution** items (not decisions) live in the specs: the Railway deploy (spec 0001 AC-5) and the launch board build (spec 0002).
