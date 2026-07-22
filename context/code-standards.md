# Helm — Code Standards

> Implementation law: how the code is written, read top-to-bottom every session. For *what* is being built see `project-overview.md`; for *why* see `foundation.md` — which wins if this file ever disagrees. Libraries live in `library-docs.md`.
>
> **Teaching note (`foundation.md` §0):** the builder reads TypeScript but isn't yet fluent in its idioms. So each rule below says *why*, not just *what*. Read the reasons — they're the point.

## §1 Engineering mindset

- **Read the context system first.** Before writing code: `foundation.md` (the decisions), this file, and the relevant `architecture.md`/`library-docs.md` sections. This isn't ceremony — it's how the project stays consistent across sessions.
- **Scope is sacred.** v1 is *one module* (`foundation.md` §8). If a change isn't the launch board, it's out of scope — note it, don't build it.
- **One thing at a time.** Small, complete steps. Build the render spike before tools; tools before the widget's polish.
- **Simplest thing that works.** You have ~10 hrs/week. Prefer the boring, obvious solution; you can always make it fancier once it works.

## §2 Language & style

- **TypeScript `strict` mode, always.** *Why:* strict turns "this might be undefined" from a 2am production crash into a compile error you see now. It's the whole reason to use TS.
- **No `any`.** *Why:* `any` switches the type-checker *off* for that value — one `any` quietly infects everything it touches. When a type is genuinely unknown, use `unknown` and *narrow* it (check the shape before using it). Zod does this narrowing for you at the edges (see §4).
- **One source of truth for every shape.** *Why:* if the widget and server each define their own "Item" type, they *will* drift. Define it once as a **Zod schema in `shared/schemas.ts`**, then `z.infer` the TypeScript type from it. The runtime validator and the compile-time type can never disagree because they're the same object.
- **Prefer `const`; avoid mutation.** *Why:* code you don't have to trace mutations through is code you can reason about. Return new values instead of editing in place.
- **Name things fully.** `resolveUserId`, not `getUid`. Reads-like-prose beats clever-and-short.

## §3 Repo & boundaries

Single package, but the internal seams are real and enforced by discipline (`architecture.md` → Boundaries):

- **`widget/` must never import from `server/`,** and vice versa. *Why:* the widget is shipped to the client as HTML — if it imports server code, it could drag secrets or DB access into the browser. The only shared code is `shared/` (Zod schemas + types), which is pure data shapes, no secrets, no I/O.
- **Modules never import each other.** *Why:* the whole extensibility bet (`foundation.md` §9) is that module two touches nothing in module one. An import between modules breaks that on day one.
- **The widget reaches the server only through the ext-apps app-bridge** — never `fetch()` to your own API. *Why:* the widget runs in a sandboxed iframe; the bridge (`tools/call`) is the sanctioned, auditable, permission-checked channel. A raw fetch bypasses the host's security model (and won't be allowed by the sandbox anyway).

## §4 MCP Apps conventions (the framework's structure is yours to impose)

The MCP SDK is unopinionated about *your* structure — so these are the rules that give Helm its shape:

- **Every tool validates its input with a Zod schema from `shared/`.** *Why:* tool arguments arrive from the model or the widget — untrusted. Validate at the boundary; inside the handler you then have a fully-typed, trusted object.
- **Handlers are thin.** A tool handler validates input, calls a `repo`/service function, and shapes the result. No SQL, no business logic inline. *Why:* thin handlers are testable and the logic is reusable across tools.
- **Set `visibility` explicitly on every tool** — never rely on the default. Reads/writes for the board are `model+app`; `launch_item_reorder` is `["app"]` (`foundation.md` §7 #10–11). *Why:* visibility is a security/UX boundary (who may trigger this — the AI or only a human click); leaving it implicit hides that decision.
- **Render tools return the `ui://` resource *and* structured content.** *Why:* the widget needs the resource to render; the model needs the structured/text content to reason about state (`foundation.md` §6, Flow D).
- **The `ui://` resource is one self-contained HTML string** (built by `vite-singlefile`). No external `<script src>`/`<link>` — everything inlined. *Why:* the host renders it in an isolated iframe with no network; anything not inlined simply won't load.
- **A module registers itself** — its tools, prompt, and resource — in its own `modules/<name>/index.ts`, and adds a registry row. Adding a module never edits another module.

## §5 Multi-tenancy (a security boundary, even at one tenant)

Single-tenant in v1, but treat `user_id` scoping as a boundary, not a formality:

- **Every query against `items` filters by `user_id`.** An unscoped query on a per-user table is a **bug**, not a style issue — even now, with one user.
- **`user_id` comes from one resolver** (`resolveUserId()`), never from tool arguments or the widget. *Why:* the day this goes multi-tenant, you change *one* function to read the authenticated principal and every query is correct. If scope leaked in from arguments, you'd be auditing the whole codebase (`foundation.md` §10).

## §6 Patterns to prefer / anti-patterns to avoid

- **Explicit over magic** (`foundation.md` §4 #1): per-module tables; no generic `items` table with a `type` column pretending to be extensible.
- **Small pure functions** over big stateful ones; pass data in, return data out.
- **No premature abstraction.** Build the launch module concretely first. The *pattern* for module two emerges from a working example, not from a framework you guess at up front.

## §7 Styling

**PENDING** the UI trio (`ui-tokens.md`, `ui-rules.md`, `ui-registry.md`), which awaits the Claude Design export (Phase 3). Until then: minimal, neutral inline styles in the widget, written to be ripped out and replaced by tokens. **When the trio lands: tokens only — no raw hex, no off-palette values in components.**

## §8 Error handling

- **No empty `catch` blocks.** *Why:* a swallowed error is a bug you'll debug twice. Handle it or let it propagate.
- **Prefix errors with context:** `throw new Error('launch_item_toggle: item not found')`. *Why:* the prefix tells you *where* without a stack dive.
- **Safe messages to the client.** Return a clean "couldn't update the item" to the widget/model; keep stack details in server logs.
- **Never log secrets** — no `DATABASE_URL`, no tokens, no full request bodies.

## §9 Security & secrets

- **All secrets come from env, validated once in `server/env.ts` (Zod).** Never hardcode; never read `process.env` scattered around. *Why:* one validated, typed source means a missing var fails loudly at startup, not mysteriously at runtime.
- **Nothing secret in the widget bundle — ever.** *Why:* the widget HTML is sent to the client. Treat it like public source. API keys, the DB URL, internal URLs: none of it goes near `widget/`.
- **The DB URL and any future tokens live only server-side.** (No `security.md` in v1 — `foundation.md` §7 #14 — so this section is the authority; revisit if the project goes multi-tenant.)

## §10 Testing posture

Pragmatic at 10 hrs/week: **unit-test the `repo` functions and tool handlers** (they hold the logic worth protecting), using a test Postgres or a thin fake. The **render spike is verified manually** in the client (`foundation.md` §7 #15) — automated iframe rendering isn't worth it for v1. Don't chase coverage; test the things that would silently corrupt state.

## §11 Naming, imports, comments

- **Tools:** `snake_case`, module-prefixed — `launch_item_toggle`.
- **Files:** `kebab-case.ts`; React components `PascalCase.tsx`.
- **Imports:** from `shared/` for shapes; never reach across a boundary (§3).
- **Comments say *why*, not *what*.** The code says what. A comment explains a non-obvious reason.
- **No `TODO` comments in committed code** — if it matters, it's a `progress-log.md` note or an issue.

---

These standards are comprehensive by design — read them top to bottom each session. When a rule and a shortcut conflict, the rule wins.
