# Helm — Library Docs

> Each dependency and how *this project* uses it. Conventions live in `code-standards.md`; the reasoning behind each stack choice lives in `foundation.md` §7.
>
> **Version policy (`foundation.md` §12):** the MCP-Apps ecosystem is <6 months old. Pin the exact version in `package.json` at install time; the versions below are the current/target line. Re-verify against npm before scaffolding.

**Status key:** ✅ Locked · 🕗 TBD (decide later)

## `@modelcontextprotocol/sdk` — ✅
- Version: **^1.29.0** (confirmed against the live example during the render spike, spec 0001; pin at install).
- Why it's here: `foundation.md` §7 #1–2, the core MCP protocol (tools, prompts, resources, transport).
- How it's used: `new McpServer({ name, version })` in `server/mcp.ts`; the transport is mounted in `server/index.ts` with `createMcpExpressApp` (`@modelcontextprotocol/sdk/server/express.js`) plus `StreamableHTTPServerTransport` (`@modelcontextprotocol/sdk/server/streamableHttp.js`) on endpoint **`/mcp`**, stateless (`sessionIdGenerator: undefined`, a fresh server per request).
- Gotchas: it is the base layer; the Apps UI features come from `ext-apps` on top. Stateless mode builds a new server per request, so keep per request state at module scope (see the spike counter). Binding `0.0.0.0` **without DNS rebinding protection** logs a warning; for the deployed server, set `allowedHosts` / `allowedOrigins` or add auth (production hardening, spec 0001 follow-up).

## `@modelcontextprotocol/ext-apps` — ✅
- Version: **^1.7.0** (the 1.1.2 assumed at design time was stale; confirmed current during the render spike; pin at install).
- Why it's here: `foundation.md` §7 #1, the MCP Apps extension (`ui://` resources, tool to UI linkage via `_meta`, the widget bridge). Being on this standard *is* the portfolio.
- How it's used, two entry points in this project:
  - **`@modelcontextprotocol/ext-apps/server`**: `registerAppTool(server, name, config, handler)` and `registerAppResource(...)`. **Every app tool's `config._meta.ui` is required** (shape `McpUiToolMeta`: optional `resourceUri`, optional `visibility`). `RESOURCE_MIME_TYPE` is exported and equals **`text/html;profile=mcp-app`**.
  - **`@modelcontextprotocol/ext-apps/react`**: `useApp({ appInfo, capabilities })` returns `{ app, error }`; the widget calls a tool with `app.callServerTool({ name, arguments })` (returns the result, and also fires an `ontoolresult` handler).
- How initial data reaches the widget (was open, now resolved): **pull model**, the widget calls a read tool on mount via `callServerTool`; the host does not auto push. (Resolves `architecture.md` → Open architectural questions.)
- Gotchas:
  - The `ui://` resource must be **one self contained HTML string**, pair with `vite-singlefile` (`code-standards.md` §4).
  - Visibility is `McpUiToolVisibility` = **`"model" | "app"`**, default `["model","app"]`; set it explicitly per tool. A model call to an `["app"]` only tool is refused by the host.
  - The `App` sets Zod to **`jitless`** by default so Zod parsing works under the widget's strict CSP (no `unsafe-eval`), so parsing tool results with Zod in the widget is fine.
  - Authoritative docs: [apps.extensions.modelcontextprotocol.io/api](https://apps.extensions.modelcontextprotocol.io/api/) · starter: `examples/basic-server-react`.

## `express` + `cors` — ✅
- Version: `express` **^5.1.0**, `cors` **^2.8.5** (confirmed during the render spike; pin at install).
- Why it's here: the MCP streamable HTTP transport runs on an Express app via the SDK's `createMcpExpressApp`; `cors` opens the endpoint so the client can reach it.
- How it's used: `server/index.ts` only, `app.use(cors())` and `app.all("/mcp", ...)`. No other routes this slice.
- Gotchas: `createMcpExpressApp` already wires body parsing and host binding; do not add a second JSON body parser. Revisit CORS breadth when auth arrives (do not stay wide open for a multi user server).

## `drizzle-orm` + `drizzle-kit` — ✅
- Version: latest (pin at install)
- Why it's here: `foundation.md` §7 #5 — typed, thin, SQL-first ORM; `drizzle-kit` generates/runs migrations.
- How it's used: schema in `server/db/schema.ts` (`users`, `modules`, `items`); typed queries in each module's `repo.ts`, always scoped by `user_id`; `drizzle-kit generate`/`migrate` via `db:*` scripts.
- Gotchas: migrations are files you commit and run — don't hand-edit the DB. Keep the schema as the one source of truth and regenerate.

## `postgres` (postgres.js) — 🕗
- Version: latest (pin at install)
- Why it's here: the Postgres driver Drizzle runs on (`architecture.md` → Open build-time decisions; `pg` is the alternative).
- How it's used: one client in `server/db/client.ts`, connection string from validated env.
- Gotchas: use a single pooled client; close cleanly on shutdown. Never log the connection string.

## `vite` + `vite-plugin-singlefile` — ✅
- Version: latest (pin at install)
- Why it's here: `foundation.md` §7 #7 — builds the React widget into one inlined HTML file that becomes the `ui://` resource.
- How it's used: `vite.widget.config.ts` builds `src/widget/launch/` → `dist/widget/launch-board.html`; `resource.ts` reads that string.
- Gotchas: everything inlines, including images as base64 — watch bundle size (`foundation.md` §10). No external `<script src>` will load in the sandbox.

## `react` + `react-dom` — ✅
- Version: latest 18/19 (pin at install)
- Why it's here: `foundation.md` §7 #7 — the widget UI framework.
- How it's used: the board UI in `widget/launch/`; state from the app-bridge, mutations via `launch_*` tool calls.
- Gotchas: keep it lean — it's a small widget in an iframe. No router, no heavy state library for v1.

## `zod` — ✅
- Version: latest (pin at install)
- Why it's here: `foundation.md` §7 #8 — validation triple-duty: tool inputs, env, DB boundary; the single source of truth for shapes.
- How it's used: schemas in `shared/schemas.ts`, types via `z.infer`; `server/env.ts` validates environment at startup.
- Gotchas: keep schemas in `shared/` (imported by both sides) — don't redefine shapes locally (`code-standards.md` §2).

## Tooling: `tsx`, `tsup`/`tsc`, `dotenv` — ✅
- `tsx` for the dev server; `tsup` or `tsc` to build `server/`; `dotenv` for local env (Railway injects env in prod).
- Gotcha: prod reads real env vars — `.env` is local-only and git-ignored.

---

## Approved dependencies

| Package | Purpose | Status |
|---|---|---|
| `@modelcontextprotocol/sdk` | Core MCP protocol + transport | ✅ |
| `@modelcontextprotocol/ext-apps` | MCP Apps: `ui://` resources, visibility, bridge | ✅ |
| `drizzle-orm` | Typed SQL-first ORM | ✅ |
| `drizzle-kit` | Migrations | ✅ |
| `postgres` | Postgres driver | 🕗 (vs `pg`) |
| `vite` | Widget bundler | ✅ |
| `vite-plugin-singlefile` | Inline widget → one HTML | ✅ |
| `react` / `react-dom` | Widget UI | ✅ |
| `zod` | Validation + type source of truth | ✅ |
| `tsx` | Dev runner | ✅ |
| `tsup` / `tsc` | Server build | ✅ |
| `dotenv` | Local env | ✅ |
| `express` | HTTP app the MCP transport runs on (via `createMcpExpressApp`) | ✅ |
| `cors` | Opens the `/mcp` endpoint to the client | ✅ |
| `concurrently` | Runs the widget watch and the server together in `npm run dev` | ✅ |

Do not install anything outside this list without adding it here first.
