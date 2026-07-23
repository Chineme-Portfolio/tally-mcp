# Helm — UI Rules

> How Helm's tokens compose into UI. Read alongside `ui-tokens.md` (the values) and `ui-registry.md` (the components). For *why* the product is bold and copper-led, see `foundation.md`; for code conventions, see `code-standards.md` §7. If this file and `foundation.md` disagree, `foundation.md` wins.
> Source: the Claude Design export at `design/` (`design/readme.md` and `design/guidelines/`).

## §0 Prime directive
**Every screen is a decisive operator's command surface: confident, energetic, economical — and making progress must feel satisfying without ever being gamified.** Bold, but legible. If a choice does not serve that sentence, it is wrong.

## §1 Voice & copy
- **Person:** the builder is **you**; Claude is **I** ("I'll keep the Postgres copy in sync"). Warm, direct, collegial.
- **Casing:** sentence case everywhere (headings, buttons, labels). UPPERCASE only for short **mono eyebrows** (`LAUNCH READINESS`, `MODULE ONE`) with `--tracking-wider`.
- **Verbs, not nouns:** label the outcome — "Mark ready", "Ship it", "Add task". Never "Submit", "OK", "Confirm".
- **Fewest confident words; say what happens next.** "3 to go before launch." not "You currently have 3 incomplete items." Empty state: "Nothing here yet — add the first task and let's get moving."
- **Progress counts toward the goal:** `7 / 10`, "2 to go", "go for launch". The finish line is always in view.
- **No hype, no confetti-speak.** "Shipped — we're go." not "Congratulations!! 🎉". **No emoji in product UI.**
- **Numbers and metadata in mono, tabular** (`font-variant-numeric: tabular-nums`): counts, percentages, timestamps.

## §2 Colour discipline
- **Copper leads, always.** The one saturated signature (`--primary`; hero copper-600 in light, copper-400 in dark) carries **every action, all progress, and the completion moment**. Support hues (amber/red/steel) stay quiet.
- **Boldness is confined to accents and the completion moment** — never full-bleed backgrounds that fight Claude's chrome. (The marketing landing is the one loud surface; the widget canvas stays quiet.)
- **Fixed status vocabulary:** `todo` neutral · `active` amber · `blocked` red · `done` copper. Reserve `--danger` for destructive actions only.
- Tokens only (the `ui-tokens.md` invariant). One primary button per view; everything else secondary / ghost / tinted.

## §3 Type & hierarchy
- **Display (Space Grotesk)** for headings: weight 600/700, tracking −0.02 to −0.03em, tight line-height (~1.05). Type does real work; hierarchy is strong.
- **Body (Hanken Grotesk):** 14px baseline, line-height 1.5.
- **Mono (JetBrains Mono):** operator labels, counts, timestamps, code — and the uppercase eyebrows.
- Fixed px sizes in the widget (predictable in an embed); fluid type only on the marketing surface.

## §4 Layout & density
- 4px grid (`--space-*`). **Flex/grid + `gap`, never margins between siblings.**
- Widget max `--widget-max 720px`, padding `--widget-pad 20px`. Generous but purposeful; padding earns its place.
- Radius: `md 12` default, `lg 16` cards/rows, `xl 22` dialogs, `check 7` the checkbox.
- Surfaces stay mostly clean (no gradient-mesh slop). Cards are surface + 1px `--border` + `--shadow-sm` + `lg` radius; the **`complete`** card lights up with `--glow-complete`.

## §5 Motion
- **Springy on the feedback moments, crisp everywhere else.** `--ease-spring` for check/reorder; `--ease-spring-lg` for complete; `--ease-standard` for the rest. Durations `fast 140 / base 220 / slow 360`.
- The **checkbox springs** (scale pop) and the **checkmark draws itself in** (stroke-dashoffset). The **progress fill springs** to its width; at 100% the meter and card light up — the payoff.
- **Everything collapses to 0 under `prefers-reduced-motion`** (already in the tokens; never override it).

## §6 Interaction states (required on every control)
- **Hover:** primary darkens (`--primary-hover`); secondary/ghost fill with `--surface-hover`; borders step to `--text-faint`.
- **Press:** a springy **scale-down** — buttons `0.97`, icon buttons `0.92`. This tactile beat is the one the brand leans on.
- **Focus-visible:** the copper `--ring` (3px, 42%); `--ring-danger` on invalid fields. Never remove focus outlines; use the ring.
- **Disabled / loading:** reduced emphasis; buttons support a `loading` spinner.
- **Empty / error / done** are first-class states (see §1 microcopy and the `complete` surfaces), not afterthoughts.

## §7 Per-surface rules
- **The launch-board widget (the product):** quiet canvas; copper only on actions, progress, and done. The `ProgressBar` is the launch-readiness meter and owns the completion glow. `ChecklistItem` is the signature row (check + title + status + drag handle + menu). Include a live light/dark toggle; hitting 100% flips the footer to an active "Ship it". Reference kit: `design/ui_kits/board/`.
- **The self-host landing (marketing, later):** the one loud surface — dark hero with copper glow, feature grid, self-host terminal, full-bleed copper CTA band. Reference: `design/ui_kits/site/`.
- **Iconography:** the Lucide-derived line set (`design/icon/`), 2px stroke, 24px grid, rounded caps, `currentColor` inherited from the parent. `anchor` / `rocket` / `flag` are the nautical/launch brand nods. Never emoji as UI.

---
For exact token values see `ui-tokens.md`; for the component list and build status see `ui-registry.md`.
