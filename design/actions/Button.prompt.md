# Button

The action control. Reach for `primary` (signature green) for the single most important move on a view; use `secondary`, `ghost`, or `tinted` for everything supporting, and `danger` only for destructive actions.

```jsx
<Button iconLeft="plus">Add task</Button>
<Button variant="secondary">Edit board</Button>
<Button variant="ghost" size="sm" iconRight="chevron-down">Filter</Button>
<Button variant="danger" iconLeft="trash">Delete</Button>
<Button loading>Saving…</Button>
```

Sizes `sm | md | lg`. `block` stretches full width (mobile / card footers). Pass `href` to render an anchor. Presses use a springy scale-down — the tactile feedback the brand leans on.
