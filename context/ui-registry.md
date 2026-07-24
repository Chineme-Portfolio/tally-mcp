# Tally — UI Registry

> The components Tally's UI is built from, their build status **in our widget code**, and where each is designed. Check this registry before building any UI: reuse if built, port from the export if planned, and if it is not here it is not designed yet. For *how* each should look and behave see `ui-rules.md`; for tokens see `ui-tokens.md`. `foundation.md` wins on conflict.
> Designed components live in the Claude Design export at `design/` — each ships a `.jsx`, a `.d.ts` (props contract), and a `.prompt.md` (what/when + example).

**Status legend:** ⬜ planned (designed in `design/`, not yet in our widget) · 🟡 in progress · ✅ built (ported into `src/widget/…`)

**On "built path":** it stays `—` until a component is ported into our widget bundle. The export ships each component as a React primitive (read off the global `window.HelmDesignSystem_94b187`) plus a `helm-*` CSS class in `design/styles.css`. Porting means bringing the JSX and CSS we actually need into `src/widget/` so it inlines in the `vite-singlefile` bundle (the widget cannot load the external bundle or CDN — see `ui-tokens.md` adaptations).

## Board (the launch module's own components)
| Component | Status | Built path | Variants / key props | Purpose |
|---|---|---|---|---|
| `ChecklistItem` | ⬜ | — | `done`, `status`, `meta`, `onToggle/onEdit/onDelete`, `menuItems`, `dragging`, `showHandle`, `showStatus` | The signature board row: check + title + status pill + drag handle + actions menu. Composes the primitives; never re-implements them. `design/board/`. |
| `ProgressBar` | ⬜ | — | `value`, `max`, `size`, `showValue`, `valueFormat` | The launch-readiness meter. Fill springs to width; 100% triggers the completion glow (the payoff). `design/data/`. |
| `Status` | ⬜ | — | `status` (todo/active/blocked/done), `label`, `showIcon` | The fixed four-state task pill used across the board. `design/data/`. |

## Primitives
| Component | Status | Built path | Variants / key props | Purpose |
|---|---|---|---|---|
| `Button` | ⬜ | — | `variant` (primary/secondary/ghost/tinted/danger), `size`, `iconLeft/Right`, `loading`, `block`, `href` | The action control. One primary (copper) per view; the rest secondary/ghost/tinted; `danger` for destructive only. `design/actions/`. |
| `IconButton` | ⬜ | — | icon, `size`, `variant` (see `design/actions/IconButton.d.ts`) | Icon-only action; press scales to 0.92. |
| `Checkbox` | ⬜ | — | `label` (+ input attrs) | The signature control: springs on check, checkmark draws itself in — the core "completed" feedback. `design/forms/`. |
| `Input` | ⬜ | — | see `design/forms/Input.d.ts` | Text field. |
| `Textarea` | ⬜ | — | see d.ts | Multiline field. |
| `Select` | ⬜ | — | see d.ts | Select field. |
| `Radio` | ⬜ | — | see d.ts | Radio control. |
| `Switch` | ⬜ | — | see d.ts | Toggle switch. |
| `Card` | ⬜ | — | `variant` (default/raised/outline/sunken/flat), `padding`, `interactive`, `complete` | The surface primitive; everything that reads as a panel sits on a Card. `complete` lights the completion glow. `design/surfaces/`. |
| `Badge` | ⬜ | — | see d.ts | Small count / label. |
| `Tag` | ⬜ | — | see d.ts | Removable label / chip. |
| `Icon` | ⬜ | — | `name` (curated Lucide-derived set), size | The icon set; inherits `currentColor`. `anchor`/`rocket`/`flag` are the brand nods. `design/icon/`. |
| `Tabs` | ⬜ | — | see d.ts | Filter / section tabs (the board filters). `design/navigation/`. |
| `Dialog` | ⬜ | — | see d.ts | Modal (dark scrim + blur). `design/overlays/`. |
| `Menu` | ⬜ | — | `items: MenuItem[]` | Row / board action dropdown (edit, duplicate, reorder, delete). `design/overlays/`. |
| `Toast` | ⬜ | — | see d.ts | Transient feedback ("Task completed. 2 to go."). |
| `Tooltip` | ⬜ | — | see d.ts | Hover hint. |

## Our widget today
| Component | Status | Built path | Notes |
|---|---|---|---|
| Render-spike widget | 🟡 throwaway | `src/widget/spike/App.tsx` | Neutral placeholder styling, **not** the design system. Deleted when the launch board lands (spec 0001 follow-up). Do not build the real board on top of it. |

## Reference kits (the closest thing to a build spec for the widget)
- `design/ui_kits/board/` — the **launch-readiness board widget**, fully recreated and interactive (check items with the springy meter update, add inline, drag to reorder, per-row menu, filter tabs, a live light/dark toggle, and the 100% "Ship it" completion moment). Study this when building the launch board.
- `design/ui_kits/site/` — the self-host landing (the loud marketing surface).
- `design/templates/board/` — a board layout template.

## The rule
Before building any component, **check this table.**
- ✅ built → reuse it (its built path).
- ⬜ planned → port it from `design/<category>/<Name>.jsx` (plus its `helm-*` CSS) into `src/widget/`, match `ui-rules.md`, then flip the row to ✅ with its built path.
- Not listed → it is not designed yet; that is an `/architect` question, not something to invent.
