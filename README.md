# Helm — Context System

<!-- Lives at the REPO ROOT — the front door. The context files themselves live in context/. -->

Read the context system before writing any code. `context/foundation.md` is the source of truth; everything else references it.

**Helm** is a personal MCP server on the MCP Apps standard: its tools return an interactive widget that renders inline in the chat client. Module one is a launch-readiness board. See `context/project-overview.md` for the plain-English tour.

## Files
- `context/foundation.md` — every locked decision, with reasoning (start here)
- `context/project-overview.md` — plain-English digest; summarizes, never decides
- `context/architecture.md` — how the pieces fit; the keystone unlock
- `context/code-standards.md` — implementation law; read top-to-bottom every session (security lives here in §8–9 — no separate `security.md` in v1)
- `context/library-docs.md` — the stack as used here + approved dependencies
- `context/build-graph.md` — dependency map (what depends on what)
- `context/progress-log.md` — living build record; add an entry after any work
- `context/ui-tokens.md` — design tokens **(PENDING: awaits Claude Design export)**
- `context/ui-rules.md` — how tokens compose **(PENDING: awaits Claude Design export)**
- `context/ui-registry.md` — component registry **(PENDING: awaits Claude Design export)**

## Reading order
foundation → project-overview → architecture → code-standards → library-docs → build-graph → progress-log, then the UI trio once it exists.

## If you're here to…
| Need | Read |
|---|---|
| Understand what this is | `project-overview.md`, then `foundation.md` for the why |
| Write any code | `code-standards.md` (every session) |
| Build UI | the UI trio — check `ui-registry.md` before building any component **(PENDING)** |
| Add a dependency | `library-docs.md` (and add it to the approved list first) |
| Decide what to build next | `build-graph.md` |
| See what exists already | `progress-log.md` |

## The golden rule
When a decision changes, update `foundation.md` first, then ripple the change into every file that references it. Never let two files disagree.

## Non-negotiables
The things that must never happen:

1. **No unscoped query on a per-user table.** Every `items` query filters by `user_id` from the single `resolveUserId()` source — even at one tenant (`code-standards.md` §5).
2. **No secret in the widget bundle.** The widget HTML ships to the client; treat it as public (`code-standards.md` §9).
3. **No implicit tool visibility.** Every tool sets `visibility` explicitly (`foundation.md` §7 #10–11).
4. **No module importing another module.** A module = tool-prefix + `ui://` widget + own tables + registry row (`foundation.md` §9).
5. **No feature work before the render spike passes** (`foundation.md` §7 #15).
6. **`foundation.md` wins** every conflict.
