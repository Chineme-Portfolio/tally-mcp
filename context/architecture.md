# Tally — Architecture

> How the pieces fit. For *why* any choice was made, see `foundation.md` (cite decision numbers) — it wins if this file ever disagrees. Conventions live in `code-standards.md`; dependencies in `library-docs.md`.

## Shape

```
   Claude client  (Desktop / claude.ai)
        │   MCP over streamable HTTP
        ▼
┌─────────────────────────────────────────────────────────┐
│  Tally MCP server       (Node + TypeScript, on Railway)  │
│                                                          │
│  MCP layer      @modelcontextprotocol/sdk + ext-apps     │
│   ├─ tools      launch_* handlers (Zod-validated)        │
│   ├─ prompt     launch-board                             │
│   ├─ resource   ui://helm/launch-board  (HTML string)    │
│   └─ registry   which modules exist                      │
│                                                          │
│  modules/launch  handlers → repo → Drizzle               │
│                                    │                     │
└────────────────────────────────────┼─────────────────────┘
                                     ▼
                          Postgres  (Railway managed)

   Widget  (React → Vite + vite-singlefile → ONE .html string)
     served as the ui:// resource; rendered in a sandboxed iframe;
     talks back only via the ext-apps app-bridge (tools/call + host notifications)
```

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Hosting | Railway | Service + managed Postgres on existing PAYG (`foundation.md` §7 #4) |
| Language | TypeScript (strict) | `foundation.md` §7 #2 |
| MCP core | `@modelcontextprotocol/sdk` | Protocol, tools, prompts, streamable-HTTP transport |
| MCP Apps | `@modelcontextprotocol/ext-apps` (v1.1.2) | `/server` register helpers · `/react` hooks · `/app-bridge` host channel (`foundation.md` §7 #1) |
| Transport | Streamable HTTP | Remote, URL-reachable (`foundation.md` §7 #3) |
| Widget UI | React + Vite + `vite-plugin-singlefile` | Builds to one self-contained HTML string (`foundation.md` §7 #7) |
| Database | Postgres | `foundation.md` §7 #5 |
| ORM | Drizzle + drizzle-kit | Typed, SQL-first, migrations |
| Validation | Zod | Tool inputs, env, DB boundary; one source of truth for shapes (`foundation.md` §7 #8) |
| Runtime tooling | `tsx` (dev) / `tsup` or `tsc` (build) | Bare Node HTTP via the SDK transport; add Hono only if middleware is needed |

## Repo layout

Single package (`foundation.md` §0 forcing function — solo, first server). Two build steps: the widget (Vite→singlefile) and the server (tsc/tsup).

```
helm/
  package.json            # scripts: dev, build:widget, build:server, db:generate, db:migrate
  tsconfig.json
  drizzle.config.ts
  vite.widget.config.ts   # vite + vite-plugin-singlefile → dist/widget/launch-board.html
  src/
    server/
      index.ts            # streamable-HTTP bootstrap
      mcp.ts              # McpServer instance; registers each module
      registry.ts         # the module registry
      env.ts              # Zod-validated environment
      db/
        client.ts         # Drizzle client
        schema.ts         # users, modules, items
        migrations/       # drizzle-kit output
      modules/
        launch/
          index.ts        # registers tools + prompt + ui:// resource
          tools.ts        # launch_* handlers (thin; delegate to repo)
          resource.ts     # returns the ui://helm/launch-board HTML (imports built widget)
          repo.ts         # item DB access, always scoped by user_id
    widget/
      launch/
        index.html
        main.tsx          # React entry
        App.tsx           # the board UI
        bridge.ts         # ext-apps/react hooks; calls launch_* tools
    shared/
      schemas.ts          # Zod schemas for tool IO + entities (imported by BOTH sides)
      types.ts            # types inferred from schemas — one source of truth
  dist/                   # build output
```

## Boundaries / modules

- **`shared/`** — Zod schemas + inferred types. The only thing both server and widget import. No runtime server/widget code here.
- **`server/`** — all business logic + DB. Never imported by the widget.
- **`widget/`** — UI only. Never imports `server/`. Reaches the server *only* through the app-bridge.
- **`modules/<name>/`** — self-contained. **Modules never import each other** (`foundation.md` §9). The launch module is the reference implementation of the four-part module pattern.

## Data & tenancy model

- **Tables:** `users` (single seeded row in v1), `modules` (registry rows), `items` (`user_id` FK, `module`, `text`, `done`, `position`, timestamps).
- **Tenancy:** single-tenant, but **every item query is scoped by `user_id`** resolved from *one* place (`resolveUserId()` — a constant/env in v1). Making the scope explicit now means multi-tenant later is "change the resolver's source from a constant to the authenticated principal," not a schema rewrite (`foundation.md` §7 #6, §10).
- **Explicit over magic:** per-module tables, no generic EAV god-schema (`foundation.md` §4 #1). Module two brings its own tables.

## Keystone unlock

The **module pattern**, proven exactly once by the launch board: tool → `ui://` widget → own tables → registry row, working end to end. Once that round-trip works (including a widget button calling a tool and the state persisting), every later module is the same four moves with zero changes to module one. Gate in front of it: the **Layer-0 render spike** — a trivial `ui://` widget from *our* pipeline rendering in Claude Desktop (`foundation.md` §7 #15, §11).

## What lives where (quick rule)

- Business logic + persistence → `server/modules/<name>/` (handlers thin, repos own SQL).
- Tool/entity shapes (Zod) + types → `shared/`.
- Widget UI → `widget/<name>/`; server access only via the app-bridge.
- Env/secrets → `server/env.ts` (Zod-validated); never in the widget bundle.
- "What modules exist" → `server/registry.ts` + the `modules` table.

## Open build-time decisions

Record each in `progress-log.md` as a `decision` when made.

- Exact `@modelcontextprotocol/sdk` version to pin (latest 1.x at install).
- Postgres driver: `postgres` (postgres.js) vs `pg` under Drizzle — pick at scaffold (lean `postgres.js`).
- Dev loop for the widget: rebuild-on-change vs Vite dev server behind the resource (see `build-graph.md` → the one genuine tension).
- Whether `launch_status` is a separate tool or `launch_board_show` returning structured content covers it (lean: keep both — one renders, one is text-only).

## Open architectural questions

- Does the host deliver initial tool data to the widget via notification, or must the widget call a read tool on mount? Confirm against the ext-apps app-bridge API during the spike; it shapes `bridge.ts`.
