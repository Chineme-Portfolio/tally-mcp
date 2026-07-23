# Helm — Design System

**Helm** is a personal *command surface* for Claude, built on the **MCP Apps** standard. Its tools return interactive widgets that render inline in the chat client (Claude Desktop / claude.ai). **Module one** is a **launch-readiness board**: a checklist you and Claude create, check off, edit, and reorder, backed by Postgres. It's built for the builder personally, and for other developers to self-host.

This system is a **portfolio piece as much as a tool** — bold, confident, design-forward, with real presence. The whole thing is theme-aware (light **and** dark), because the widget lives embedded inside Claude's chat, and every styling concern is self-contained (the widget is a sandboxed iframe — nothing leaks to or from the host).

Consumers link **one file** — `styles.css` — and read React components off the global namespace **`window.HelmDesignSystem_94b187`**.

---

## Sources

**No codebase, Figma, or brand assets were provided.** This system was built from the written brief (company description + art direction). Where a real source would normally anchor the system, note:

- **Component inventory** — no source defined one, so a standard primitive set was authored, sized to the product (a launch-readiness board). See *Intentional additions* below.
- **Logo** — none supplied. Per policy, **no mark was invented**: the brand name set in the display face (`Helm.`) stands in wherever a mark would go. Provide a real logo and it drops into `assets/` + the wordmark card.
- **Fonts** — chosen fresh (see *Fonts* below), not substitutes for provided files. Loaded via Google Fonts CDN.

If you have the real repo / Figma / brand kit, attach it and this system can be re-grounded against it.

---

## Signature at a glance

- **Color** — one saturated signature hue, **Helm Copper**, carries *every* action, all progress, and the completion moment. Copper is the one warm signal for go / launch / complete board. Graphite "ink" neutrals do the rest. Full, confident hues over pastels.
- **Type** — **Space Grotesk** (display: assured, geometric, command-console presence) · **Hanken Grotesk** (body/UI: legible workhorse) · **JetBrains Mono** (operator labels, counts, timestamps, code). Type does real work; hierarchy is strong.
- **Shape** — deliberate geometry, a confident **12–16px** radius (never timid), generous-but-purposeful spacing.
- **Motion** — springy, satisfying micro-interactions on the feedback moments (check / complete / reorder); crisp elsewhere. Respects `prefers-reduced-motion`.

---

## Content fundamentals

**Voice: a decisive operator's command surface. Confident, energetic, economical.** Making progress should feel satisfying — but never gamified-childish. Bold, but legible.

- **Person** — address the builder as **you**; Claude speaks as **I** ("*I'll keep the Postgres copy in sync*"). Warm, direct, collegial.
- **Casing** — sentence case everywhere (headings, buttons, labels). Reserve UPPERCASE for short mono eyebrows/labels only (`LAUNCH READINESS`, `MODULE ONE`), with wide tracking.
- **Verbs, not nouns** — label the *outcome*. "Mark ready", "Ship it", "Add task" — never "Submit", "OK", "Confirm".
- **Say what happens next, in the fewest confident words.** "3 to go before launch." not "You currently have 3 incomplete items." "Nothing here yet — add the first task and let's get moving." not "No data available."
- **Progress framing** — count *toward* the goal: `7 / 10`, "2 to go", "go for launch". The finish line is always in view.
- **No hype, no confetti-speak** — energetic ≠ exclamatory. "Shipped — we're go." beats "Congratulations!! 🎉".
- **Emoji** — **none** in product UI. (Iconography carries meaning; see below.)
- **Numbers & metadata** — set in mono, tabular (`font-variant-numeric: tabular-nums`): counts, percentages, timestamps ("edited 2m ago").

Example microcopy: empty state → *"Nothing here yet — add the first task and let's get moving."* · completion → *"All tasks complete — go for launch."* · toast → *"Task completed. 2 to go."*

---

## Visual foundations

**Palette & vibe.** One saturated copper signature (`--copper-*`, hero at `600` in light / `400` in dark) against slightly-cool graphite ink neutrals (`--ink-0…950`). Boldness is confined to **accents and the completion moment** — never full-bleed backgrounds that fight the host chrome (the one exception is the marketing landing, a separate surface where the brand goes loud: a dark hero and a full-bleed copper CTA band). Support hues (amber / red / steel) stay quiet; **copper always leads**. Semantic status vocabulary is fixed: `todo` (neutral), `active` (amber), `blocked` (red), `done` (copper).

**Theming.** Fully theme-aware. Light lives on `:root` and `[data-theme="light"]`; dark on `[data-theme="dark"]`; system preference is honored via `@media (prefers-color-scheme: dark)` unless a host forces light. Themes can be scoped to a **nested region** (both `[data-theme]` blocks are defined), so a dark widget can sit inside a light page. AA contrast is held in both themes — the primary button *flips* (deep copper + white text in light; bright copper + near-black text in dark) to stay legible and punchy.

**Type.** Display = Space Grotesk (700/600, tracking −0.02 to −0.03em, line-height ~1.05); body = Hanken Grotesk (400–800, 14px UI baseline, line-height 1.5); mono = JetBrains Mono. Fluid only on the marketing surface; fixed px in the widget for predictability inside an embed.

**Spacing & layout.** 4px base grid (`--space-*`). Widget max width `--widget-max: 720px`; content max `1200px`. Generous but purposeful — padding earns its place. Layout uses flex/grid + `gap`, not margins between siblings.

**Backgrounds & texture.** Mostly clean surfaces (no gradient-mesh slop). Two deliberate textures, both masked and low-opacity, only on the marketing surface: a fine **grid** (`--grid-line`) in the dark hero and copper CTA band, and a copper **radial glow** behind the hero. The widget canvas stays quiet.

**Corner radius.** Confident and consistent: `sm 8` · **`md 12`** (buttons, inputs, chips — the default) · `lg 16` (cards, list rows) · `xl 22` (dialogs, large containers) · `check 7` (the checkbox) · `pill 999`. Distinct, not timid.

**Cards.** Surface + 1px hairline border (`--border`) + soft `--shadow-sm`, `lg` radius. Variants: `raised` (bigger shadow, no border), `outline` (border-led, no shadow), `sunken` (inset well), `flat`. The **`complete`** card lights up with the completion glow. No colored-left-border card trope.

**Elevation.** Light mode = soft, layered, cool-tinted shadows (`xs → xl`). Dark mode = shadows go near-invisible and depth is **border-led** (stronger `--border` + surface steps). Plus two signature copper shadows: `--ring` (focus) and `--glow-complete` / `--glow-primary` (the payoff).

**Borders.** 1px hairlines by default; `--border-strong` for dividers and control outlines; `1.5–2px` for the checkbox/radio boxes so the check reads bold.

**Motion.** Easings: `standard` (most transitions), `out`, `spring` (overshoot — check/reorder), `spring-lg` (bigger pop — complete). Durations: `fast 140` · `base 220` · `slow 360`. The checkbox **springs** (scale pop) and the checkmark **draws itself in** (stroke-dashoffset). Progress fill springs to width; at 100% the meter/card lights up. All durations collapse to 0 under `prefers-reduced-motion`.

**Hover / press states.** Hover: primary darkens (`--primary-hover`); secondary/ghost fill with `--surface-hover`; borders step to `--text-faint`. Press: a springy **scale-down** (buttons `0.97`, icon buttons `0.92`) — the tactile beat the brand leans on. Focus-visible: the copper `--ring` (3px, 42% copper), red `--ring-danger` on invalid fields.

**Transparency & blur.** Sparingly: dialog backdrop is a dark 50% scrim with a 2px blur; the marketing nav is a `backdrop-filter` blur over a translucent canvas. Dark-theme tinted surfaces (`--primary-surface`, status surfaces) use translucent copper/amber/red over the dark base.

**Imagery.** None shipped (none provided, none invented). The brand leans on **type, color, geometry, and the one copper moment** rather than photography or illustration. If imagery is added later, keep it cool/graphite-toned so copper stays the hero.

---

## Iconography

**Curated, Lucide-derived line set** (ISC-licensed). Icons are **2px-stroke, 24px-grid, rounded-cap outlines** — clean and geometric, matching the shape language. The `Icon` component ships a hand-picked subset (only the glyphs Helm's UI uses); `currentColor` inherits from the parent, so you color the parent, not the icon.

- **Style** — outline (stroke) for everything, except **handle/menu glyphs** (`grip-vertical`, `more-vertical`, `more-horizontal`) which render as **filled dots** so they read as affordances at small sizes.
- **Set** — `check, plus, minus, x, chevron-*, arrow-right, arrow-up-right, search, pencil, trash, copy, circle, circle-dot, check-circle, alert-circle, alert-triangle, target, flag, anchor, rocket, clock, calendar, terminal, database, external-link, settings, sun, moon, grip-vertical, more-vertical, more-horizontal`. `anchor` and `rocket`/`flag` double as light nautical/launch brand nods.
- **Emoji** — never used as UI. **Unicode** — avoided as icons (the glyph set covers it).
- **Substitution flag** — since no icon source was provided, **Lucide** was chosen as the closest match to the intended aesthetic. Need a glyph that isn't in the set? Pull it from Lucide (same grid + stroke) and add its path to `icon/Icon.jsx`, or link Lucide from CDN in a kit.

---

## Components

React primitives (`export function <Name>`), read from `window.HelmDesignSystem_94b187`. Styling ships as `helm-*` CSS classes in `styles.css`, so the classes also work in plain HTML without React. **20 components:**

- **icon/** — `Icon`
- **actions/** — `Button`, `IconButton`
- **forms/** — `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`
- **data/** — `Badge`, `Tag`, `Status`, `ProgressBar`
- **surfaces/** — `Card`
- **navigation/** — `Tabs`
- **overlays/** — `Dialog`, `Toast`, `Tooltip`, `Menu`
- **board/** — `ChecklistItem`

Each directory has a `@dsCard` HTML (Design System tab thumbnail), and each component a `.d.ts` (props contract) + `.prompt.md` (what/when + example).

**Intentional additions** (beyond the generic primitive set, because the product needs them):
- **`ProgressBar`** — the launch-readiness meter *is* the product; it owns the completion-glow moment.
- **`Status`** — the fixed four-state task vocabulary (`todo/active/blocked/done`) used across the board.
- **`Menu`** — row/board action dropdown (edit, duplicate, reorder, delete).
- **`ChecklistItem`** — the board's signature composite row (check + title + status + drag handle + menu). Composes the primitives; never re-implements them.

**Starting points** (seed a new design): `Button`, `Input`, `Checkbox`, `ProgressBar`, `ChecklistItem` (tagged in their `.d.ts`).

---

## UI kits

Full-surface recreations. Kits are **self-contained** — they render from the shipped `helm-*` CSS classes via a thin local wrapper (`kit-ui.jsx`) that mirrors the components, so they run offline without the compiled bundle.

- **`ui_kits/board/`** — **the launch-readiness board widget**, the hero product. Shown embedded in a *generic* chat host (not a clone of any real client). Interactive: check items (springy, updates the meter), add inline, drag to reorder, per-row actions menu, filter tabs, board menu, and a **live light/dark theme toggle**. Hitting 100% flips the footer to an active "Ship it" and lights the meter — the completion moment.
- **`ui_kits/site/`** — the **self-host landing** (bold expression): dark hero with copper glow + the board card, feature grid, self-host terminal (Docker/Postgres), and a full-bleed copper CTA band. Theme-aware with a nav toggle.

---

## Fonts

Loaded from **Google Fonts CDN** via an `@import` in `tokens/fonts.css` (reached through `styles.css`):

- **Space Grotesk** (400–700) — display / headings
- **Hanken Grotesk** (400–800) — body / UI
- **JetBrains Mono** (400/500/700) — mono / operator labels

> ⚠️ **Flag:** these are fresh picks (no fonts were provided), delivered over CDN rather than self-hosted binaries — so the compiler reports **0 webfonts** (there are no local `@font-face` rules; the fonts arrive via the Google stylesheet import). To self-host / ship offline, drop the `.woff2` files into `assets/fonts/` and add `@font-face` rules to `tokens/fonts.css`. Want a different pairing? That's a one-file change — see *Iterate* at the end.

---

## File index

```
styles.css                 ← global entry (consumers link this; @import list only)
base.css                   ← reset + document defaults + link colors
tokens/
  fonts.css                ← Google Fonts import
  colors.css               ← copper + ink ramps, semantic aliases, light/dark scopes
  typography.css           ← font stacks, type scale, weights, tracking
  spacing.css  radius.css  shadows.css  motion.css
css/                       ← component styles (helm-*), imported by styles.css
  components.css icon.css buttons.css forms.css data.css
  overlays.css surfaces.css navigation.css board.css
icon/ actions/ forms/ data/ surfaces/ navigation/ overlays/ board/
                           ← components: <Name>.jsx + .d.ts + .prompt.md + one @dsCard .html
guidelines/                ← foundation specimen cards (Colors, Type, Spacing, Shape, Motion, Brand)
ui_kits/board/             ← launch-readiness board widget (index.html + kit-ui.jsx + board-app.jsx)
ui_kits/site/              ← self-host landing (index.html)
thumbnail.html             ← homepage tile
SKILL.md                   ← Agent Skills entry
_ds_bundle.js / _ds_manifest.json / _adherence.oxlintrc.json  ← generated (do not edit)
```

**Namespace:** `window.HelmDesignSystem_94b187`

---

## Caveats & assumptions

- Built entirely from the written brief — **no repo/Figma/assets**. Colors, fonts, and the component inventory are principled choices, not recreations.
- **Signature copper is the single biggest lever** and was a judgement call. Swapping it is a token-level change.
- **No logo** — wordmark stands in.
- Fonts are CDN-loaded fresh picks (see *Fonts* flag).
- UI kits mirror the components through the shared CSS-class layer (identical visuals) so they render standalone.
