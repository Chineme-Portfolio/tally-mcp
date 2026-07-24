# Tally — Claude Design handoff

Two outputs. **Part 1** feeds Claude Design's "Set up your design system" screen (paste it in now). **Part 2** runs in this repo *after* you've committed the export, to generate the UI trio (`ui-tokens.md`, `ui-rules.md`, `ui-registry.md`) from it.

Aesthetic direction chosen: **Bold product** (2026-07-22). Brand voice + clash-mitigations are baked into Part 1's notes.

---

## Part 1 — Claude Design intake

Paste these into the matching fields on Claude Design's **"Set up your design system"** screen.

**Company name and blurb (or name of design system)**
> **Tally** — a personal *command surface* for Claude, built on the MCP Apps standard. Its tools return interactive widgets that render inline in the chat client (Claude Desktop / claude.ai). Module one is a launch-readiness board: a checklist you and Claude create, check off, edit, and reorder, backed by Postgres. Built for the builder personally, and for other developers to self-host.

**Examples of your design system and products (all optional — attach if you have them):**
- None yet — greenfield. No code, `.fig`, fonts, or logos to attach at this stage.
- (Attach a reference subfolder or `.fig` later if one is created; not required to generate a first system.)

**Any other notes?**
> **Direction: bold, confident, design-forward** — this is a portfolio piece as much as a tool, so it should have presence.
> - **Voice:** confident, decisive, energetic — an operator's command surface where making progress *feels satisfying*. Not gamified-childish; bold-but-legible.
> - **Color:** one saturated **signature brand color** as the hero accent (actions, progress, the "completed" moment). Full, confident hues over pastels.
> - **Type:** a strong hierarchy — large, assured headings; clear, legible body. Type does real work.
> - **Shape & density:** strong, deliberate geometric shapes; generous-but-purposeful spacing; a confident corner radius. Distinct, not timid.
> - **Motion:** springy, satisfying micro-interactions on check / complete / reorder — the feedback moments. Subtle enough to feel crafted, not gimmicky.
> - **Because it renders EMBEDDED inside Claude's chat (light AND dark):** must be **theme-aware** (respect `prefers-color-scheme` / a `data-theme` switch); keep **AA contrast** in both themes; **confine the boldness to accents and the completion moment** rather than full-bleed backgrounds that fight the host chrome; **respect `prefers-reduced-motion`**; all styling **self-contained** (the widget is a sandboxed iframe — nothing leaks to or from the host).

---

## Part 2 — In-repo prompt (run AFTER the export is committed)

Once the Claude Design export is committed to this repo, run this in Claude Code so the agent reads the actual export instead of guessing. The export is committed at `design/`.

> ✓ **Done (2026-07-22):** this prompt was executed — the UI trio (`context/ui-tokens.md`, `ui-rules.md`, `ui-registry.md`) is generated from the export and the README PENDING markers are dropped.

> Read the Claude Design export in this repo (at `design/`) and the context system in `context/`. Generate three files, each referencing `foundation.md` for the *why* and never restating it:
>
> - `context/ui-tokens.md` — the raw tokens from the export: color, type scale, spacing, radius, and any others present. Values come from the export, not from assumption. Document the layered architecture: raw palette (private) → semantic aliases (the contract components code against) → framework binding. State the theming switches (e.g. `data-theme` for dark mode) and the invariant: **tokens only — no raw hex or off-palette values in components.**
> - `context/ui-rules.md` — how those tokens compose into UI. Open with a §0 prime directive derived from Tally's brand voice in `foundation.md` (the one sentence every screen must serve), then usage rules, layout/spacing patterns, hierarchy, color discipline, do/don't, and required interaction states (checked/unchecked, dragging/reorder, empty, error). Note the embedded-in-Claude constraints: theme-aware, AA contrast, reduced-motion, self-contained.
> - `context/ui-registry.md` — the component registry with a status legend (⬜ planned · 🟡 in progress · ✅ built) and per-component rows: name, status, built path (`—` until ported into the codebase), variants, purpose. Include the rule: check this registry before building any component — reuse if built, port from the export if planned; if it's not in the export it hasn't been designed. Anticipated launch-board components: board container, item row (checkbox + text + delete), add-item input, drag handle, empty state, error/toast.
>
> Anything the export doesn't cover, mark TBD — do not invent it. When done, update `README.md` to drop the PENDING markers on these three files, and check that every cross-reference across the system still resolves.
