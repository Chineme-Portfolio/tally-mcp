# Forms

Field controls share one contract: `label`, `hint`, and `error` wrap the raw control in a labelled group; omit all three and you get the bare control for custom layouts. Focus is always the green ring; `error` turns the field and ring red.

```jsx
<Input label="Board name" placeholder="Launch readiness" iconLeft="flag" />
<Input label="Slug" error="Already taken" defaultValue="launch" />
<Textarea label="Notes" hint="Optional" rows={4} />
<Select label="Owner" options={['You', 'Claude', 'Unassigned']} />
```

`Input` sizes: `sm | md | lg`. `Select` takes an `options` array (strings or `{value,label}`) or `<option>` children.
