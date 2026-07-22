# Helm — UI Tokens

> **Status: PENDING.** Awaits the Claude Design export (Phase 3). Do not hand-invent tokens.

This file will hold the design tokens generated **from** Helm's Claude Design export, in the layered architecture: raw palette (private) → semantic aliases (the contract components code against) → framework binding. It will state the theming switches (e.g. `data-theme` for dark mode) and the invariant: **tokens only — no raw hex, no off-palette values in components.**

**Until it exists:** the widget uses minimal neutral inline styles, written to be replaced wholesale (`code-standards.md` §7). To generate this file, follow the Phase 3 Claude Design intake and the in-repo prompt (pending an agreed aesthetic direction — `foundation.md` open item). See `README.md` → files.
