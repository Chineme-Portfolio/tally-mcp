# Helm — UI Registry

> **Status: PENDING.** Awaits the Claude Design export (Phase 3). Do not hand-invent components.

This file will be the component registry with a status legend (⬜ planned · 🟡 in progress · ✅ built) and per-component rows: name, status, built path (`—` until ported), variants, purpose. It carries the rule: **check this registry before building any component** — reuse if built, port from the export if planned, and if it's not in the export it hasn't been designed.

**Anticipated launch-board components** (to be confirmed by the design export, not binding yet): board container, item row (checkbox + text + delete), add-item input, drag handle / reorder affordance, empty state, error/toast. Generated alongside `ui-tokens.md` and `ui-rules.md`.
