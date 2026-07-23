# Overlays — Dialog, Toast, Tooltip, Menu

- **Dialog** — modal decisions. Springs in over a dimmed, blurred backdrop; wire `onClose` (backdrop, Esc, ✕ all call it) and pass right-aligned `Button`s as `footer`. `contained` embeds it inside a bounded surface instead of the viewport.
- **Toast** — transient confirmation ("Task completed", "Board saved"). Presentational; you own placement/timing.
- **Tooltip** — terse hover/focus hint around any trigger.
- **Menu** — the row/action dropdown (edit, duplicate, delete, reorder). Closes on select, outside-click, and Esc.

```jsx
<Dialog open={open} onClose={close} title="Delete board?"
  description="This removes all 10 tasks. This can't be undone."
  footer={<><Button variant="ghost" onClick={close}>Cancel</Button><Button variant="danger">Delete</Button></>} />

<Toast variant="success" title="Task completed" onClose={dismiss}>2 left before launch.</Toast>
<Tooltip label="Reorder"><IconButton icon="grip-vertical" label="Reorder" /></Tooltip>
<Menu items={[{ label: 'Edit', icon: 'pencil' }, { divider: true }, { label: 'Delete', icon: 'trash', danger: true }]} />
```
