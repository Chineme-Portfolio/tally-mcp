# IconButton

Square, icon-only control for row actions (edit, delete, drag), toolbars, and dismiss buttons. `label` is required and becomes both `aria-label` and the tooltip title.

```jsx
<IconButton icon="pencil" label="Edit task" />
<IconButton icon="more-vertical" label="More actions" />
<IconButton icon="x" label="Dismiss" variant="ghost" size="sm" />
<IconButton icon="plus" label="Add" variant="primary" round />
```

Defaults to `ghost`. Same variants as Button. `round` swaps the confident square radius for a pill.
