# Tally — Agent context

> Front door for AI agents. Durable decisions live in `context/` (built by context-system).
> This file routes you there and states the rules that never bend.

## Authority
`context/foundation.md` is the top source of truth. When anything here or in the code
disagrees with it, **foundation wins**. Never re-decide a decision the foundation already
locked — cite it (`foundation.md §N`) instead.

## Context files (read before you build)
- `context/foundation.md` — locked decisions + reasoning (authority)
- `context/architecture.md` — stack, shape, boundaries, what-lives-where
- `context/code-standards.md` — how code is written here (read top-to-bottom)
- `context/library-docs.md` — approved dependencies; do not install outside this list
- `context/build-graph.md` — what depends on what (the plan)
- `context/progress-log.md` — what's been built (newest first)

## Standing instructions
1. Before writing code: read `code-standards.md` and the relevant `context/` files.
2. After completing any work: append an entry to `context/progress-log.md`
   (category · area · what · notes · date). Mandatory — like reading context first.
3. A decision made mid-work updates the affected `context/` file immediately —
   and `foundation.md` first if it changes a locked decision.
