# Tabs

Horizontal view switcher. `line` (underline) for primary view-level navigation; `pill` (segmented control) for compact in-panel filters like All / Open / Done. Controlled — you own `value`.

```jsx
<Tabs
  variant="pill"
  value={view}
  onChange={setView}
  tabs={[
    { value: 'all', label: 'All', count: 10 },
    { value: 'open', label: 'Open', count: 3 },
    { value: 'done', label: 'Done', count: 7 },
  ]}
/>
```
