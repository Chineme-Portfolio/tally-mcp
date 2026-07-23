# Helm — UI Tokens

> The design tokens Helm's UI is built from, and the layered system they follow. Generated from the Claude Design export committed at `design/`. For *why* the product is bold and copper-led, see `foundation.md`; for how tokens compose into UI, see `ui-rules.md`; for coding conventions, see `code-standards.md` §7. If this file and `foundation.md` disagree, `foundation.md` wins.
>
> **Source of truth for exact values: `design/tokens/*.css` + `design/base.css`** (the compiled export). This doc explains the architecture and the contract and captures the key values; if a value here ever differs from that CSS, the CSS wins.

**The invariant:** components reference **semantic tokens only** — `var(--primary)`, `var(--text-body)`, `var(--radius-md)`. No raw hex, no raw ramp step (`--copper-600`) in a component, no off-palette value. You change the look by changing a token, never by hardcoding one.

## Layered architecture

Three layers; each depends only on the one above it.

1. **Raw palette (private).** The colour ramps. Components must not use these directly.
2. **Semantic aliases (the contract).** What components code against. These flip per theme.
3. **Framework binding.** Plain CSS custom properties on `:root`, delivered by linking `design/styles.css` (which `@import`s base + tokens + the component CSS). No Tailwind here; it is CSS variables.

### Layer 1 — raw palette (`design/tokens/colors.css`)
- **Signature: Helm Copper** — the one warm signal for go / launch / complete. `--copper-50 #fbebe3` … `--copper-500 #cf6e45` · `--copper-600 #b85c3e` (light hero) · `--copper-400 #e08a63` (dark hero) … `--copper-900 #4e2416`.
- **Ink / graphite neutrals** (slight cool cast) — `--ink-0 #ffffff` · `--ink-25 #fbfbfc` · … · `--ink-500 #697180` · … · `--ink-900 #12151a` · `--ink-950 #0c0e12`.
- **Quiet support hues** — `--amber-500/600/700` (active), `--red-400…700` (blocked), `--steel-400/600` (info). Copper always leads; these stay quiet.

> **Naming note:** several export comments say "green" (a stale generator label). The real signature ramp is **copper** — trust the token names (`--copper-*`) and `design/readme.md`, which say "Helm Copper" and "copper always leads."

### Layer 2 — semantic aliases (the contract components use)
These are what you reference; they resolve differently per theme (exact values in `colors.css`).
- **Surfaces:** `--canvas` (page), `--surface`, `--surface-raised`, `--surface-sunken`, `--surface-hover`, `--surface-active`.
- **Borders:** `--border`, `--border-strong`, `--border-subtle`.
- **Text:** `--text-strong`, `--text-body`, `--text-muted`, `--text-faint`.
- **Primary (copper):** `--primary`, `--primary-hover`, `--primary-active`, `--primary-text`, `--primary-surface`, `--primary-surface-hover`, `--primary-border`, `--on-primary`, `--focus-ring`.
- **Status:** `--success` (equals copper — the "done" cue), `--warning` (amber), `--danger` (red), `--info` (steel); each with `-text` / `-surface` / `on-` partners.
- **Signature effects:** `--glow-primary`, `--glow-complete` (the completion moment), `--gradient-brand`, `--gradient-brand-soft`, `--grid-line`.

## Theming (light + dark, host-aware)
Helm is theme-aware because the widget lives inside Claude's chat.
- **Light** is the default on `:root` and `[data-theme="light"]`.
- **Dark** applies on `[data-theme="dark"]` and via `@media (prefers-color-scheme: dark)` — unless a host forces `[data-theme="light"]` (defined after the media query, equal specificity, later wins).
- Themes can be scoped to a **nested region**, so a dark widget can sit inside a light page.
- **AA contrast is held in both.** The primary button flips: deep copper + white text (light) ↔ bright copper + near-black text (dark).
- `color-scheme` is set per theme so any native controls match.

## Type (`design/tokens/typography.css`)
- **Fonts:** `--font-display` Space Grotesk (headings, command-console presence) · `--font-sans` Hanken Grotesk (body/UI, 14px baseline) · `--font-mono` JetBrains Mono (counts, labels, timestamps, code). Role aliases: `--font-heading` / `--font-body` / `--font-code`.
- **Scale (px, fixed for embed predictability):** `--text-2xs 11` · `--text-xs 12` · `--text-sm 13` · `--text-base 14` · … · `--text-4xl 38` · … · `--text-7xl 84`.
- **Weights** 400–800 (`--weight-regular`…`--weight-extrabold`); **line-height** `--leading-none`…`--leading-relaxed`; **tracking** `--tracking-tighter`…`--tracking-widest` (`--tracking-wider 0.08em` for uppercase mono eyebrows).

## Spacing / layout (`design/tokens/spacing.css`)
- 4px base: `--space-0` … `--space-32` (128px). Use flex/grid + `gap`, not margins between siblings.
- **Embed layout:** `--widget-max 720px`, `--widget-pad 20px`. (`--content-max 1200px` is the marketing surface.)

## Radius (`design/tokens/radius.css`)
`--radius-sm 8` · **`--radius-md 12`** (default: buttons, inputs, chips) · `--radius-lg 16` (cards, list rows) · `--radius-xl 22` (dialogs) · `--radius-check 7` (the hero checkbox) · `--radius-pill 999`. Border widths: `--border-width 1`, `--border-width-strong 1.5`, `--border-width-heavy 2` (checkbox/radio boxes, so the check reads bold).

## Elevation (`design/tokens/shadows.css`)
- Light: soft, cool-tinted `--shadow-xs`…`--shadow-xl`. Dark: shadows go near-invisible and depth is **border-led** (stronger borders + surface steps).
- Signature copper shadows: `--ring` (focus, 3px at 42% copper), `--ring-danger`, `--glow-complete` (the payoff: copper border + halo).

## Motion (`design/tokens/motion.css`)
- Durations: `--dur-instant 80` · `--dur-fast 140` · `--dur 220` · `--dur-slow 360` · `--dur-slower 520`.
- Eases: `--ease-standard` (most transitions), `--ease-out`, `--ease-in`, `--ease-spring` (overshoot: check/reorder), `--ease-spring-lg` (bigger pop: complete).
- **All durations collapse to 0 and springs fall back to standard under `prefers-reduced-motion`** (in both `motion.css` and `base.css`). Never override that.

## Consuming tokens in the Helm widget (required adaptations)
The widget is a `vite-singlefile` bundle inside a sandboxed iframe with a strict CSP and no external network. So:
1. **Inline the token CSS.** Import `design/styles.css` (or just the token files) into the widget so `vite-singlefile` inlines it, then reference `var(--token)` everywhere.
2. **Fonts will NOT load from the CDN.** `design/tokens/fonts.css` is a Google Fonts `@import`, which is blocked in the iframe. Either **self-host** the `.woff2` files (add `@font-face` rules and bundle the fonts) to keep Space Grotesk / Hanken Grotesk / JetBrains Mono, or **accept the system fallbacks** already in each font stack (`ui-sans-serif, system-ui, …`). Decide this when building the launch board widget and record it in `progress-log.md`. Do not let the brand type silently fall back if it matters for the portfolio.
3. **No emoji, no external images.** Icons come from the Lucide-derived set in `design/icon/`, inlined as SVG paths.

---

For how these tokens *compose* into UI (voice, hierarchy, colour discipline, interaction states), see `ui-rules.md`. For which components exist and their build status, see `ui-registry.md`.
